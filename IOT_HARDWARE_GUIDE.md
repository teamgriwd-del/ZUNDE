# ZUNDE RaMambo: IoT Hardware & Security Deep Dive

This guide covers the **Physical Hardware Layer** of ZUNDE RaMambo, focusing on the security logic required to prevent livestock theft and monitor health anomalies in real-time using Proteus and Arduino/ESP32.

## 1. Refined Proteus Circuit (Security Focus)
To build a high-fidelity "RaMambo Security Node," add the following to your Proteus schematic:

### Components List:
- **Microcontroller:** Arduino Uno (Recommended for simulation stability).
- **Movement Sensor:** ADXL335 Accelerometer (or 3 Potentiometers to simulate X, Y, Z axes).
- **Health Sensors:** DHT22 (Temp), Potentiometer (Heart Rate).
- **Security Output:** Piezo Buzzer (Pin 8) — triggers during theft detection.
- **Communication:** COMPIM (Serial Bridge) and Virtual Terminal.

### Key Connections:
1.  **Accelerometer:** X-axis to **A1**, Y-axis to **A2**, Z-axis to **A3**.
2.  **Buzzer:** Negative to GND, Positive to **Digital Pin 8**.
3.  **GPS (NEO-6M):** TX to Pin 0, RX to Pin 1.

---

## 2. Enterprise Firmware: Security & Adaptive Logic
This firmware includes **Theft Detection** and **Adaptive Sampling** to save battery life while maintaining maximum security.

```cpp
#include <DHT.h>

// Pins
#define DHTPIN 2
#define DHTTYPE DHT22
#define BUZZER_PIN 8
#define ACCEL_X A1
#define ACCEL_Y A2
#define ACCEL_Z A3
#define PULSE_PIN A0

// Configuration
const float SAFE_LAT = -17.3601;
const float SAFE_LON = 30.1918;
const float SAFE_RADIUS = 0.005; // Approx 500m
const int MOVEMENT_THRESHOLD = 150; // Sensitivity for theft detection

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  // 1. READ SENSORS
  float temp = dht.readTemperature();
  int hr = map(analogRead(PULSE_PIN), 0, 1023, 60, 140);
  
  // Simulated GPS Drift
  float currentLat = SAFE_LAT + (random(-100, 100) / 5000.0);
  float currentLon = SAFE_LON + (random(-100, 100) / 5000.0);

  // Read Accelerometer (Movement)
  int x = analogRead(ACCEL_X);
  int y = analogRead(ACCEL_Y);
  int z = analogRead(ACCEL_Z);
  int totalMovement = abs(x-512) + abs(y-512); // Simple activity metric

  // 2. SECURITY LOGIC (Theft Detection)
  bool isOutside = sqrt(pow(currentLat - SAFE_LAT, 2) + pow(currentLon - SAFE_LON, 2)) > SAFE_RADIUS;
  bool isTheft = isOutside && (totalMovement > MOVEMENT_THRESHOLD);

  String securityStatus = "Secure";
  int interval = 10000; // Default 10s battery save mode

  if (isTheft) {
    securityStatus = "THEFT_ALERT";
    digitalWrite(BUZZER_PIN, HIGH); // Trigger physical alarm
    interval = 2000; // Switch to High-Frequency Emergency Tracking
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // 3. HEALTH LOGIC
  String healthStatus = (temp > 39.5) ? "FEVER_DETECTED" : "Healthy";

  // 4. OUTPUT JSON TO ZUNDE RAMAMBO BRIDGE
  Serial.print("{");
  Serial.print("\"temp\":"); Serial.print(temp);
  Serial.print(", \"hr\":"); Serial.print(hr);
  Serial.print(", \"lat\":"); Serial.print(currentLat, 4);
  Serial.print(", \"lon\":"); Serial.print(currentLon, 4);
  Serial.print(", \"move\":"); Serial.print(totalMovement);
  Serial.print(", \"sec\": \""); Serial.print(securityStatus); Serial.print("\"");
  Serial.print(", \"health\": \""); Serial.print(healthStatus); Serial.print("\"");
  Serial.println("}");

  delay(interval); 
}
```

---

## 3. High-Confidence Detection (What makes it deep?)
The device doesn't just "send data." It performs **Edge Computing**:
*   **Theft Signature:** The device looks for the specific "Signature" of theft: Rapid movement *combined* with an increasing distance from the farm center.
*   **Adaptive Sampling:** To simulate a real commercial tag that lasts 5 years, the device stays in "Quiet Mode" when the animal is sleeping or grazing calmly, and only "Screams" for attention when an anomaly is detected.

## 4. Bridging to ZUNDE Software
Use your **Serial-to-Websocket** bridge to connect the `Serial.println` above to the `HardwareSimulation.jsx` component. Jinda RaMambo is already trained to interpret the `"sec": "THEFT_ALERT"` flag and will trigger the Red Dashboard state instantly.

---
*ZUNDE RaMambo IoT Security Protocol - Seed Co Innovation Challenge*
