/**
 * RaMambo Collar Node CN-01  — Firmware v1.0
 * ZUNDE Livestock Monitoring System
 *
 * Hardware: ESP32-WROOM-32
 * Sensors : DS18B20 (temp) | MAX30102 (HR) | MPU-6050 (IMU) | NEO-6M (GPS)
 * Radio   : SX1278 LoRa 433 MHz
 * Power   : LiPo 3.7V + Solar via TP4056
 *
 * Sends JSON telemetry every REPORT_INTERVAL_MS via LoRa to BS-01 Base Station.
 * Switches to ALERT_INTERVAL_MS on theft / fever detection.
 * Deep-sleeps between readings to preserve battery.
 *
 * Dependencies (install via Arduino Library Manager):
 *   OneWire, DallasTemperature, MPU6050 (ElectronicCats),
 *   SparkFun MAX3010x, TinyGPSPlus, LoRa (Sandeep Mistry), ArduinoJson
 */

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>

// ── Sensor libraries ─────────────────────────────────────────────────────────
#include <OneWire.h>
#include <DallasTemperature.h>
#include <MPU6050.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// ── Radio + data ─────────────────────────────────────────────────────────────
#include <LoRa.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════════
//  PIN MAP  (matches RAMAMBO_HARDWARE_DESIGN.md CN-01)
// ═══════════════════════════════════════════════════════════════════════
#define PIN_ONE_WIRE     4
#define PIN_LORA_NSS     5
#define PIN_LORA_DIO1   12
#define PIN_LORA_DIO2   13
#define PIN_LORA_RST    14
#define PIN_LED          2
#define PIN_GPS_RX      16
#define PIN_GPS_TX      17
#define PIN_LORA_SCK    18
#define PIN_LORA_MISO   19
#define PIN_I2C_SDA     21
#define PIN_I2C_SCL     22
#define PIN_LORA_MOSI   23
#define PIN_LORA_DIO0   26
#define PIN_VBAT_ADC    34
#define PIN_MPU_INT     35

// ═══════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════
#define LORA_FREQ          433E6
#define LORA_BANDWIDTH     125E3
#define LORA_SF            9         // Spreading factor (range vs speed)
#define LORA_CR            5         // Coding rate 4/5
#define LORA_TX_POWER      17        // dBm (max 20)

// Collar identity — change per animal
#define COLLAR_ID          "COL-007"
#define ANIMAL_NAME        "Bessie"
#define ANIMAL_TAG         "ZIM-882"

// Safe zone (home paddock GPS coordinates)
#define SAFE_LAT          -17.3601f
#define SAFE_LON           30.1918f
#define SAFE_RADIUS_DEG    0.0045f   // ~500m in degrees

// Reporting intervals (ms)
#define REPORT_INTERVAL_MS   10000UL  // Normal: every 10s
#define ALERT_INTERVAL_MS     3000UL  // Theft / fever: every 3s

// Thresholds
#define TEMP_FEVER_C         39.5f    // Body temp above this = fever
#define TEMP_HIGH_C          39.0f    // Elevated (warn)
#define MOVEMENT_THEFT       2500     // Accel magnitude during fast movement
#define BATT_LOW_PCT         20       // Battery warn threshold
#define HR_HIGH_BPM          100      // Heart rate concern

// I2C addresses
#define I2C_ADDR_MPU       0x68
#define I2C_ADDR_MAX       0x57

// ═══════════════════════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════════════════════
OneWire           oneWire(PIN_ONE_WIRE);
DallasTemperature tempSensor(&oneWire);

MPU6050           mpu;
MAX30105          maxSensor;
TinyGPSPlus       gps;
HardwareSerial    gpsSerial(2);   // UART2

// Telemetry state
struct Telemetry {
  String collarId    = COLLAR_ID;
  String animalName  = ANIMAL_NAME;
  String animalTag   = ANIMAL_TAG;
  float  bodyTempC   = 0.0f;
  int    heartRate   = 0;
  float  latitude    = 0.0f;
  float  longitude   = 0.0f;
  float  gpsAccuracy = 0.0f;
  int    accelX      = 0;
  int    accelY      = 0;
  int    accelZ      = 0;
  int    moveMag     = 0;
  String activity    = "Unknown";
  bool   inSafeZone  = true;
  int    battPct     = 100;
  int    signalRSSI  = 0;
  bool   feverAlert  = false;
  bool   theftAlert  = false;
  String timestamp   = "";
};

Telemetry tel;

unsigned long lastReport   = 0;
unsigned long reportInterval = REPORT_INTERVAL_MS;
int           packetCount  = 0;

// HR beat detection
const byte    HR_RATE_SIZE = 4;
byte          rates[HR_RATE_SIZE];
byte          rateIndex    = 0;
long          lastBeat     = 0;
float         beatsPerMin  = 0;
int           beatAvg      = 0;

// ═══════════════════════════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println(F("\n=== RaMambo Collar Node CN-01 ==="));
  Serial.printf("Collar: %s  Animal: %s  Tag: %s\n",
                COLLAR_ID, ANIMAL_NAME, ANIMAL_TAG);

  pinMode(PIN_LED, OUTPUT);
  blinkLED(3, 200);

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  initLoRa();
  initTempSensor();
  initIMU();
  initHeartRate();
  initGPS();

  Serial.println(F("[BOOT] All systems ready."));
  blinkLED(5, 80);
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════
void loop() {
  // Feed GPS parser continuously
  while (gpsSerial.available())
    gps.encode(gpsSerial.read());

  // Collect HR beat in real-time between reports
  sampleHeartRate();

  unsigned long now = millis();
  if (now - lastReport >= reportInterval) {
    lastReport = now;

    digitalWrite(PIN_LED, HIGH);

    readTemperature();
    readIMU();
    readGPS();
    readBattery();
    buildAlerts();
    sendLoRa();

    digitalWrite(PIN_LED, LOW);

    // Adaptive interval — fast tracking when alert active
    reportInterval = (tel.theftAlert || tel.feverAlert)
                     ? ALERT_INTERVAL_MS
                     : REPORT_INTERVAL_MS;

    printDebug();
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  INIT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════
void initLoRa() {
  Serial.print(F("[LoRa] Initialising 433 MHz... "));
  LoRa.setPins(PIN_LORA_NSS, PIN_LORA_RST, PIN_LORA_DIO0);
  SPI.begin(PIN_LORA_SCK, PIN_LORA_MISO, PIN_LORA_MOSI, PIN_LORA_NSS);

  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println(F("FAILED — check wiring!"));
    errorHalt();
  }
  LoRa.setSignalBandwidth(LORA_BANDWIDTH);
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.setTxPower(LORA_TX_POWER);
  LoRa.setSyncWord(0xF3);         // Private network byte (matches base station)
  Serial.println(F("OK"));
}

void initTempSensor() {
  Serial.print(F("[DS18B20] Initialising... "));
  tempSensor.begin();
  int count = tempSensor.getDeviceCount();
  Serial.printf("%d sensor(s) found\n", count);
  if (count == 0) Serial.println(F("[DS18B20] WARNING: No sensor on 1-Wire bus"));
}

void initIMU() {
  Serial.print(F("[MPU-6050] Initialising... "));
  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println(F("FAILED — check I2C address 0x68"));
  } else {
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4);  // ±4g
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);  // ±500°/s
    Serial.println(F("OK"));
  }
}

void initHeartRate() {
  Serial.print(F("[MAX30102] Initialising... "));
  if (!maxSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println(F("FAILED — check I2C address 0x57"));
    return;
  }
  maxSensor.setup();
  maxSensor.setPulseAmplitudeRed(0x0A);   // Low power red LED
  maxSensor.setPulseAmplitudeGreen(0);    // Off
  Serial.println(F("OK"));
}

void initGPS() {
  Serial.print(F("[NEO-6M] Initialising UART2... "));
  gpsSerial.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  Serial.println(F("OK — waiting for fix"));
}

// ═══════════════════════════════════════════════════════════════════════
//  SENSOR READS
// ═══════════════════════════════════════════════════════════════════════
void readTemperature() {
  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);
  tel.bodyTempC = (t == DEVICE_DISCONNECTED_C) ? tel.bodyTempC : t;
}

void sampleHeartRate() {
  long irValue = maxSensor.getIR();
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat   = millis();
    beatsPerMin = 60.0f / (delta / 1000.0f);

    if (beatsPerMin >= 40 && beatsPerMin <= 180) {
      rates[rateIndex++] = (byte)beatsPerMin;
      rateIndex %= HR_RATE_SIZE;
      beatAvg = 0;
      for (byte x = 0; x < HR_RATE_SIZE; x++) beatAvg += rates[x];
      beatAvg /= HR_RATE_SIZE;
    }
  }
  tel.heartRate = beatAvg;
}

void readIMU() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Scale raw to mg (at ±4g range: 1g = 8192 LSB)
  tel.accelX = ax / 8;
  tel.accelY = ay / 8;
  tel.accelZ = az / 8;

  // Movement magnitude (subtract gravity ~1000 from Z)
  int dz = (az / 8) - 1000;
  tel.moveMag = abs(ax / 8) + abs(ay / 8) + abs(dz);

  // Activity classification from magnitude
  if      (tel.moveMag < 100)  tel.activity = "Resting";
  else if (tel.moveMag < 400)  tel.activity = "Grazing";
  else if (tel.moveMag < 1200) tel.activity = "Walking";
  else                          tel.activity = "Running";
}

void readGPS() {
  if (gps.location.isValid() && gps.location.age() < 5000) {
    tel.latitude    = gps.location.lat();
    tel.longitude   = gps.location.lng();
    tel.gpsAccuracy = gps.hdop.isValid() ? gps.hdop.value() / 100.0f : 99.9f;
  }

  // Zone check: haversine approximation (accurate enough at farm scale)
  float dLat = tel.latitude  - SAFE_LAT;
  float dLon = tel.longitude - SAFE_LON;
  float dist  = sqrt(dLat * dLat + dLon * dLon);
  tel.inSafeZone = (dist <= SAFE_RADIUS_DEG) || !gps.location.isValid();

  // Build timestamp from GPS
  if (gps.time.isValid()) {
    char ts[20];
    snprintf(ts, sizeof(ts), "%02d:%02d:%02d",
             gps.time.hour(), gps.time.minute(), gps.time.second());
    tel.timestamp = String(ts);
  } else {
    tel.timestamp = String(millis() / 1000) + "s";
  }
}

void readBattery() {
  // Voltage divider: R2=100k, R3=100k → ADC reads Vbat/2
  // ADC max = 3.3V at 4095 counts
  int raw   = analogRead(PIN_VBAT_ADC);
  float adc = (raw / 4095.0f) * 3.3f;
  float vbat = adc * 2.0f;                          // Undo voltage divider

  // LiPo: 4.2V = 100%, 3.0V = 0%
  tel.battPct = constrain((int)((vbat - 3.0f) / 1.2f * 100), 0, 100);
}

// ═══════════════════════════════════════════════════════════════════════
//  ALERT LOGIC
// ═══════════════════════════════════════════════════════════════════════
void buildAlerts() {
  // Fever: body temp above threshold
  tel.feverAlert = (tel.bodyTempC >= TEMP_FEVER_C);

  // Theft signature: outside safe zone AND rapid movement
  tel.theftAlert = (!tel.inSafeZone && tel.moveMag > MOVEMENT_THEFT);
}

// ═══════════════════════════════════════════════════════════════════════
//  LORA TRANSMIT
// ═══════════════════════════════════════════════════════════════════════
void sendLoRa() {
  StaticJsonDocument<512> doc;

  doc["id"]       = tel.collarId;
  doc["animal"]   = tel.animalName;
  doc["tag"]      = tel.animalTag;
  doc["temp"]     = round(tel.bodyTempC * 10) / 10.0;
  doc["hr"]       = tel.heartRate;
  doc["lat"]      = tel.latitude;
  doc["lon"]      = tel.longitude;
  doc["gpsAcc"]   = tel.gpsAccuracy;
  doc["activity"] = tel.activity;
  doc["move"]     = tel.moveMag;
  doc["inZone"]   = tel.inSafeZone;
  doc["batt"]     = tel.battPct;
  doc["fever"]    = tel.feverAlert;
  doc["theft"]    = tel.theftAlert;
  doc["time"]     = tel.timestamp;
  doc["pkt"]      = ++packetCount;

  String payload;
  serializeJson(doc, payload);

  LoRa.beginPacket();
  LoRa.print(payload);
  int ok = LoRa.endPacket();

  tel.signalRSSI = LoRa.packetRssi();
  Serial.printf("[LoRa] TX pkt#%d (%d bytes) %s\n",
                packetCount, payload.length(), ok ? "OK" : "FAIL");
}

// ═══════════════════════════════════════════════════════════════════════
//  DEBUG OUTPUT (mirrors IoTScreen.js data model)
// ═══════════════════════════════════════════════════════════════════════
void printDebug() {
  Serial.println(F("─────────────────────────────────"));
  Serial.printf("Collar   : %s  (%s  #%s)\n",
                tel.collarId.c_str(), tel.animalName.c_str(), tel.animalTag.c_str());
  Serial.printf("Temp     : %.1f°C  %s\n",
                tel.bodyTempC, tel.feverAlert ? "*** FEVER ***" : "OK");
  Serial.printf("Heart    : %d bpm  %s\n",
                tel.heartRate, tel.heartRate > HR_HIGH_BPM ? "HIGH" : "OK");
  Serial.printf("Activity : %s  (move=%d)\n", tel.activity.c_str(), tel.moveMag);
  Serial.printf("GPS      : %.5f, %.5f  acc=%.1f\n",
                tel.latitude, tel.longitude, tel.gpsAccuracy);
  Serial.printf("Zone     : %s  %s\n",
                tel.inSafeZone ? "IN SAFE ZONE" : "OUTSIDE ZONE",
                tel.theftAlert ? "*** THEFT ALERT ***" : "");
  Serial.printf("Battery  : %d%%  RSSI=%d dBm\n", tel.battPct, tel.signalRSSI);
  Serial.printf("Interval : %lu ms\n", reportInterval);
  Serial.println(F("─────────────────────────────────"));
}

// ═══════════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════════
void blinkLED(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_LED, HIGH); delay(ms);
    digitalWrite(PIN_LED, LOW);  delay(ms);
  }
}

void errorHalt() {
  Serial.println(F("[HALT] Critical hardware error. Check connections."));
  while (true) {
    digitalWrite(PIN_LED, HIGH); delay(100);
    digitalWrite(PIN_LED, LOW);  delay(100);
  }
}
