/**
 * RaMambo BS-01 Base Station — Wokwi ESP32 Simulation
 * ZUNDE Livestock Monitoring System
 *
 * Runs REAL ESP32 firmware in Wokwi. The 433 MHz LoRa radio is replaced by
 * MQTT-over-WiFi (Wokwi gives the ESP32 real internet), so the collar node
 * (CN-01) and this base station exchange the SAME JSON telemetry over a
 * public MQTT broker instead of a radio link.
 *
 *   CN-01 --(MQTT publish)--> broker.hivemq.com --(subscribe)--> BS-01
 *   BS-01 parses JSON -> drives 4 LEDs + SSD1306 OLED -> (optional) POST to Flask API
 *
 * Board:     ESP32 Dev Module
 * Libraries: PubSubClient, ArduinoJson, Adafruit SSD1306, Adafruit GFX
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ── Network ─────────────────────────────────────────────────────────────
const char* WIFI_SSID  = "Wokwi-GUEST";
const char* WIFI_PASS  = "";
const char* MQTT_HOST  = "broker.hivemq.com";
const int   MQTT_PORT  = 1883;
// IMPORTANT: this is a PUBLIC broker. Change this topic to something unique
// for your farm (and use the SAME string in the CN-01 sketch).
const char* MQTT_TOPIC = "zunde/ramambo/griwd/telemetry";

// ── Optional: forward to your ZUNDE Flask API (backend/app.py) ──────────
// Expose app.py with ngrok, paste the https URL, and set FORWARD_TO_API true.
#define FORWARD_TO_API false
const char* API_URL = "https://YOUR-NGROK-ID.ngrok-free.app/api/iot/telemetry";

// ── LED pins (identical to the real hardware) ───────────────────────────
#define PIN_LED_PWR    2    // Green  — power on
#define PIN_LED_LINK   4    // Blue   — packet received (was LoRa RX)
#define PIN_LED_WIFI  15    // Yellow — WiFi connected
#define PIN_LED_ALERT 13    // Red    — fever / theft alert

// ── OLED ────────────────────────────────────────────────────────────────
#define OLED_W 128
#define OLED_H 64
#define OLED_ADDR 0x3C
Adafruit_SSD1306 oled(OLED_W, OLED_H, &Wire, -1);

WiFiClient   net;
PubSubClient mqtt(net);

struct CollarRecord {
  String collarId, animalName, activity;
  float  temp;
  int    hr, batt, rssi;
  bool   inZone, fever, theft;
  unsigned long lastSeen;
};
CollarRecord  collars[8];
int           collarCount = 0, oledPage = 0;
unsigned long lastOledSwitch = 0, totalReceived = 0, totalForwarded = 0;

// ════════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println(F("\n=== RaMambo Base Station BS-01 (Wokwi) ==="));

  pinMode(PIN_LED_PWR, OUTPUT);
  pinMode(PIN_LED_LINK, OUTPUT);
  pinMode(PIN_LED_WIFI, OUTPUT);
  pinMode(PIN_LED_ALERT, OUTPUT);
  ledSweep();
  digitalWrite(PIN_LED_PWR, HIGH);

  Wire.begin(21, 22);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR))
    Serial.println(F("[OLED] not found"));
  oled.setTextColor(SSD1306_WHITE);
  showBoot();

  connectWiFi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMessage);
  Serial.println(F("[BOOT] Base station ready — waiting for collars."));
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) { digitalWrite(PIN_LED_WIFI, LOW); connectWiFi(); }
  if (!mqtt.connected()) reconnectMQTT();
  mqtt.loop();

  // Rotate the OLED through collars every 4 s
  if (millis() - lastOledSwitch > 4000 && collarCount > 0) {
    lastOledSwitch = millis();
    oledPage = (oledPage + 1) % collarCount;
    updateOLED();
  }
}

// ── Incoming telemetry (was LoRa, now MQTT) ─────────────────────────────
void onMessage(char* topic, byte* payload, unsigned int len) {
  String raw; raw.reserve(len);
  for (unsigned int i = 0; i < len; i++) raw += (char)payload[i];

  digitalWrite(PIN_LED_LINK, HIGH);
  totalReceived++;
  Serial.printf("[LINK] RX %u bytes\n", len);
  Serial.println(raw);

  StaticJsonDocument<384> doc;
  if (deserializeJson(doc, raw)) {
    Serial.println(F("[JSON] parse error"));
    digitalWrite(PIN_LED_LINK, LOW);
    return;
  }

  updateRecord(doc);

  bool alert = (doc["fever"] | false) || (doc["theft"] | false);
  digitalWrite(PIN_LED_ALERT, alert ? HIGH : LOW);

  if (FORWARD_TO_API && WiFi.status() == WL_CONNECTED) forwardToAPI(raw, alert);

  updateOLED();
  delay(60);
  digitalWrite(PIN_LED_LINK, LOW);
}

void updateRecord(JsonDocument& doc) {
  String id = doc["id"] | "UNKNOWN";
  int idx = -1;
  for (int i = 0; i < collarCount; i++) if (collars[i].collarId == id) { idx = i; break; }
  if (idx < 0 && collarCount < 8) idx = collarCount++;
  if (idx < 0) return;

  collars[idx].collarId   = id;
  collars[idx].animalName = String((const char*)(doc["animal"]   | "Collar"));
  collars[idx].temp       = doc["temp"]   | 0.0;
  collars[idx].hr         = doc["hr"]     | 0;
  collars[idx].activity   = String((const char*)(doc["activity"] | "-"));
  collars[idx].inZone     = doc["inZone"] | true;
  collars[idx].batt       = doc["batt"]   | 0;
  collars[idx].fever      = doc["fever"]  | false;
  collars[idx].theft      = doc["theft"]  | false;
  collars[idx].rssi       = doc["rssi"]   | -60;
  collars[idx].lastSeen   = millis();
  Serial.printf("[JSON] %s %s  temp=%.1f hr=%d\n",
    collars[idx].animalName.c_str(), id.c_str(), collars[idx].temp, collars[idx].hr);
}

void forwardToAPI(const String& raw, bool alert) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Station-ID", "BS-01-HNO");
  int code = http.POST(raw);
  if (code > 0) { totalForwarded++; Serial.printf("[API] POST -> %d\n", code); }
  else          Serial.printf("[API] POST failed: %s\n", http.errorToString(code).c_str());
  http.end();
}

// ── OLED ────────────────────────────────────────────────────────────────
void showBoot() {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("ZUNDE RaMambo"));
  oled.println(F("Base Station BS-01"));
  oled.drawLine(0, 18, 128, 18, SSD1306_WHITE);
  oled.setCursor(0, 22); oled.println(F("Waiting for collars"));
  oled.setCursor(0, 34); oled.print(F("MQTT ")); oled.println(WiFi.status() == WL_CONNECTED ? F("online") : F("..."));
  oled.setCursor(0, 46); oled.println(WiFi.status() == WL_CONNECTED ? F("WiFi: Connected") : F("WiFi: connecting"));
  oled.display();
}

void updateOLED() {
  if (collarCount == 0) { showBoot(); return; }
  CollarRecord& c = collars[oledPage];

  oled.clearDisplay();
  oled.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  oled.setTextColor(SSD1306_BLACK);
  oled.setCursor(2, 3);
  oled.printf("%s [%d/%d]", c.animalName.c_str(), oledPage + 1, collarCount);
  oled.setTextColor(SSD1306_WHITE);

  oled.setCursor(0, 18);
  oled.printf("Temp:%.1fC HR:%d\n", c.temp, c.hr);
  oled.printf("Move:%s\n", c.activity.c_str());
  oled.printf("Zone:%s\n", c.inZone ? "IN SAFE ZONE" : "!! OUTSIDE !!");
  oled.printf("Batt:%d%% RSSI:%d\n", c.batt, c.rssi);

  if (c.fever || c.theft) {
    oled.fillRect(0, 56, 128, 8, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.setCursor(2, 57);
    if (c.fever && c.theft) oled.print(F("FEVER + THEFT"));
    else if (c.fever)       oled.print(F("FEVER DETECTED"));
    else                    oled.print(F("THEFT ALERT"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.setCursor(0, 57);
    oled.printf("RX:%lu FWD:%lu", totalReceived, totalForwarded);
  }
  oled.display();
}

// ── Helpers ─────────────────────────────────────────────────────────────
void ledSweep() {
  int p[] = { PIN_LED_PWR, PIN_LED_LINK, PIN_LED_WIFI, PIN_LED_ALERT };
  for (int x : p) { digitalWrite(x, HIGH); delay(150); digitalWrite(x, LOW); }
}

void connectWiFi() {
  Serial.printf("[WiFi] connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int n = 0;
  while (WiFi.status() != WL_CONNECTED && n < 40) { delay(250); Serial.print('.'); n++; }
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED_WIFI, HIGH);
    Serial.printf("\n[WiFi] IP %s\n", WiFi.localIP().toString().c_str());
  } else Serial.println(F("\n[WiFi] failed"));
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    String cid = "zunde-bs01-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    Serial.print(F("[MQTT] connecting... "));
    if (mqtt.connect(cid.c_str())) {
      Serial.println(F("ok"));
      mqtt.subscribe(MQTT_TOPIC);
      Serial.printf("[MQTT] subscribed to %s\n", MQTT_TOPIC);
    } else {
      Serial.printf("rc=%d, retry in 1.5s\n", mqtt.state());
      delay(1500);
    }
  }
}