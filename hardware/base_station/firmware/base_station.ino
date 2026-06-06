/**
 * RaMambo Base Station BS-01 — Firmware v1.0
 * ZUNDE Livestock Monitoring System
 *
 * Hardware: ESP32-WROOM-32
 * Radio   : SX1278 LoRa 433 MHz (receives collar packets)
 * Display : SSD1306 OLED 128×64
 * Network : WiFi → Flask API (backend/app.py)
 *
 * Receives LoRa JSON from collar nodes, forwards to ZUNDE API via WiFi.
 * Displays live collar status on OLED.
 * Drives 4 status LEDs: PWR / LoRa / WiFi / Alert.
 *
 * Dependencies:
 *   LoRa (Sandeep Mistry), ArduinoJson, WiFi (built-in),
 *   HTTPClient (built-in), Adafruit SSD1306, Adafruit GFX
 */

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <LoRa.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ═══════════════════════════════════════════════════════════════════════
//  PIN MAP  (matches RAMAMBO_HARDWARE_DESIGN.md BS-01)
// ═══════════════════════════════════════════════════════════════════════
#define PIN_LORA_NSS     5
#define PIN_LORA_RST    14
#define PIN_LORA_DIO0   26
#define PIN_LORA_SCK    18
#define PIN_LORA_MISO   19
#define PIN_LORA_MOSI   23
#define PIN_I2C_SDA     21
#define PIN_I2C_SCL     22

#define PIN_LED_PWR      2    // Green
#define PIN_LED_LORA     4    // Blue
#define PIN_LED_WIFI     15   // Yellow
#define PIN_LED_ALERT    13   // Red

// ═══════════════════════════════════════════════════════════════════════
//  CONFIGURATION — edit these for your farm
// ═══════════════════════════════════════════════════════════════════════
#define WIFI_SSID        "ZUNDE_Farm_WiFi"
#define WIFI_PASS        "ramambo2024"

// ZUNDE Flask API endpoint — must match backend/app.py running IP
#define API_HOST         "http://192.168.1.100:5000"
#define API_IOT_ENDPOINT "/api/iot/telemetry"
#define API_ALERT_ENDPOINT "/api/iot/alert"

#define LORA_FREQ        433E6
#define LORA_BANDWIDTH   125E3
#define LORA_SF          9
#define LORA_CR          5
#define STATION_ID       "BS-01-HNO"      // Harare Northern station ID

// OLED
#define OLED_WIDTH       128
#define OLED_HEIGHT       64
#define OLED_ADDR        0x3C
#define OLED_RESET       -1

// ═══════════════════════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════════════════════
Adafruit_SSD1306 oled(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);

// Last received telemetry per collar (track up to 8 collars)
struct CollarRecord {
  String  collarId;
  String  animalName;
  float   temp;
  int     hr;
  String  activity;
  bool    inZone;
  int     batt;
  bool    fever;
  bool    theft;
  int     rssi;
  unsigned long lastSeen;
};

CollarRecord collars[8];
int          collarCount  = 0;
int          oledPage     = 0;         // Which collar to show on OLED
unsigned long lastOledSwitch = 0;
unsigned long totalReceived  = 0;
unsigned long totalForwarded = 0;
bool          wifiConnected  = false;

// ═══════════════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println(F("\n=== RaMambo Base Station BS-01 ==="));

  initLEDs();
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  initOLED();
  initLoRa();
  initWiFi();

  digitalWrite(PIN_LED_PWR, HIGH);
  showOLED_Boot();
  Serial.println(F("[BOOT] Base station ready — listening for collars."));
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════
void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    handleLoRaPacket(packetSize);
  }

  // Rotate OLED display every 4 seconds
  if (millis() - lastOledSwitch > 4000 && collarCount > 0) {
    lastOledSwitch = millis();
    oledPage = (oledPage + 1) % collarCount;
    updateOLED();
  }

  // WiFi reconnect if dropped
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(PIN_LED_WIFI, LOW);
    Serial.println(F("[WiFi] Reconnecting..."));
    WiFi.reconnect();
    delay(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  LORA RECEIVE
// ═══════════════════════════════════════════════════════════════════════
void handleLoRaPacket(int size) {
  String raw = "";
  while (LoRa.available()) raw += (char)LoRa.read();
  int rssi = LoRa.packetRssi();

  digitalWrite(PIN_LED_LORA, HIGH);
  totalReceived++;
  Serial.printf("[LoRa] RX %d bytes  RSSI=%d dBm\n", size, rssi);
  Serial.println(raw);

  // Parse JSON
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, raw);
  if (err) {
    Serial.printf("[JSON] Parse error: %s\n", err.c_str());
    digitalWrite(PIN_LED_LORA, LOW);
    return;
  }

  // Update collar record
  updateCollarRecord(doc, rssi);

  // Forward to API
  if (WiFi.status() == WL_CONNECTED) {
    forwardToAPI(raw, doc);
  }

  // Alert LED
  bool anyAlert = doc["fever"].as<bool>() || doc["theft"].as<bool>();
  digitalWrite(PIN_LED_ALERT, anyAlert ? HIGH : LOW);

  updateOLED();
  delay(50);
  digitalWrite(PIN_LED_LORA, LOW);
}

void updateCollarRecord(JsonDocument& doc, int rssi) {
  String id = doc["id"].as<String>();

  // Find or create record
  int idx = -1;
  for (int i = 0; i < collarCount; i++) {
    if (collars[i].collarId == id) { idx = i; break; }
  }
  if (idx == -1 && collarCount < 8) {
    idx = collarCount++;
  }
  if (idx == -1) return;  // Table full

  collars[idx].collarId   = id;
  collars[idx].animalName = doc["animal"].as<String>();
  collars[idx].temp       = doc["temp"].as<float>();
  collars[idx].hr         = doc["hr"].as<int>();
  collars[idx].activity   = doc["activity"].as<String>();
  collars[idx].inZone     = doc["inZone"].as<bool>();
  collars[idx].batt       = doc["batt"].as<int>();
  collars[idx].fever      = doc["fever"].as<bool>();
  collars[idx].theft      = doc["theft"].as<bool>();
  collars[idx].rssi       = rssi;
  collars[idx].lastSeen   = millis();
}

// ═══════════════════════════════════════════════════════════════════════
//  API FORWARDING
// ═══════════════════════════════════════════════════════════════════════
void forwardToAPI(const String& rawJson, JsonDocument& doc) {
  HTTPClient http;
  bool isAlert = doc["fever"].as<bool>() || doc["theft"].as<bool>();
  String endpoint = String(API_HOST) + (isAlert ? API_ALERT_ENDPOINT : API_IOT_ENDPOINT);

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Station-ID", STATION_ID);
  http.setTimeout(3000);

  int code = http.POST(rawJson);
  if (code > 0) {
    totalForwarded++;
    Serial.printf("[API] POST %s → %d\n", endpoint.c_str(), code);
  } else {
    Serial.printf("[API] POST FAILED: %s\n", http.errorToString(code).c_str());
  }
  http.end();
}

// ═══════════════════════════════════════════════════════════════════════
//  OLED DISPLAY
// ═══════════════════════════════════════════════════════════════════════
void initOLED() {
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("[OLED] Not found — continuing without display"));
    return;
  }
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  Serial.println(F("[OLED] OK"));
}

void showOLED_Boot() {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println(F("ZUNDE RaMambo"));
  oled.println(F("Base Station BS-01"));
  oled.drawLine(0, 18, 128, 18, SSD1306_WHITE);
  oled.setCursor(0, 22);
  oled.println(F("Listening on 433MHz"));
  oled.setCursor(0, 34);
  oled.printf("Station: %s\n", STATION_ID);
  oled.setCursor(0, 46);
  oled.println(wifiConnected ? "WiFi: Connected" : "WiFi: Connecting...");
  oled.display();
}

void updateOLED() {
  oled.clearDisplay();

  if (collarCount == 0) {
    showOLED_Boot();
    return;
  }

  CollarRecord& c = collars[oledPage];

  // Header bar
  oled.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  oled.setTextColor(SSD1306_BLACK);
  oled.setTextSize(1);
  oled.setCursor(2, 3);
  oled.printf("%s  [%d/%d]", c.animalName.c_str(), oledPage + 1, collarCount);
  oled.setTextColor(SSD1306_WHITE);

  // Vitals
  oled.setTextSize(1);
  oled.setCursor(0, 18);
  oled.printf("Temp : %.1fC  HR: %d bpm\n", c.temp, c.hr);
  oled.printf("Move : %s\n", c.activity.c_str());
  oled.printf("Zone : %s\n", c.inZone ? "IN SAFE ZONE" : "!! OUTSIDE !!");
  oled.printf("Batt : %d%%   RSSI:%ddBm\n", c.batt, c.rssi);

  // Alert strip
  if (c.fever || c.theft) {
    oled.fillRect(0, 56, 128, 8, SSD1306_WHITE);
    oled.setTextColor(SSD1306_BLACK);
    oled.setCursor(2, 57);
    if (c.fever && c.theft)     oled.print(F("FEVER + THEFT ALERT"));
    else if (c.fever)            oled.print(F("FEVER DETECTED"));
    else                         oled.print(F("THEFT ALERT"));
    oled.setTextColor(SSD1306_WHITE);
  } else {
    oled.setCursor(0, 57);
    oled.printf("RX:%lu FWD:%lu", totalReceived, totalForwarded);
  }

  oled.display();
}

// ═══════════════════════════════════════════════════════════════════════
//  INIT HELPERS
// ═══════════════════════════════════════════════════════════════════════
void initLEDs() {
  int pins[] = { PIN_LED_PWR, PIN_LED_LORA, PIN_LED_WIFI, PIN_LED_ALERT };
  for (int p : pins) {
    pinMode(p, OUTPUT);
    digitalWrite(p, LOW);
  }
  // Startup sweep
  for (int p : pins) { digitalWrite(p, HIGH); delay(120); digitalWrite(p, LOW); }
}

void initLoRa() {
  Serial.print(F("[LoRa] Initialising 433 MHz... "));
  LoRa.setPins(PIN_LORA_NSS, PIN_LORA_RST, PIN_LORA_DIO0);
  SPI.begin(PIN_LORA_SCK, PIN_LORA_MISO, PIN_LORA_MOSI, PIN_LORA_NSS);

  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("FAILED"));
    while (true) { delay(500); }
  }
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setSyncWord(0xF3);    // Must match collar firmware
  LoRa.receive();            // Put in continuous receive mode
  Serial.println(F("OK — continuous RX mode"));
}

void initWiFi() {
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    digitalWrite(PIN_LED_WIFI, HIGH);
    Serial.printf("\n[WiFi] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println(F("\n[WiFi] FAILED — will retry in loop. Continuing offline."));
  }
}
