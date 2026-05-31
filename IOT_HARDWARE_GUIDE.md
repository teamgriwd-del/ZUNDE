# ZUNDE IoT Hardware & Proteus Simulation Guide

This guide provides the necessary steps to create a physical/simulated hardware bridge for the ZUNDE platform using Proteus.

## 1. Proteus Circuit Design
To simulate an on-animal health tracker, create a circuit with the following components in Proteus:

### Components List:
- **Microcontroller:** Arduino Uno or ESP32 (Proteus Library required for ESP32).
- **Temperature Sensor:** DHT11 or DHT22.
- **Pulse/Heart Rate Sensor:** Potentiometer (to simulate pulse variation) or dedicated Pulse sensor module.
- **GPS Module:** SIM808 or NEO-6M (linked to a Virtual Terminal).
- **Output:** COMPIM (Serial Port Connector) — this is used to bridge Proteus data to your PC's real COM port.

### Schematic Connections:
1.  **DHT22 (Temp):** Connect Pin 2 to Arduino Digital Pin 2.
2.  **GPS:** Connect TX to Arduino RX (Pin 0) and RX to Arduino TX (Pin 1).
3.  **Potentiometer (Pulse):** Connect wiper to Analog Pin A0.

---

## 2. Firmware (Arduino C++)
Paste this code into your Arduino IDE, compile it, and load the `.hex` file into your Proteus Arduino component.

```cpp
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22
#define PULSE_PIN A0

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // Read Sensors
  float temp = dht.readTemperature();
  int pulse = map(analogRead(PULSE_PIN), 0, 1023, 60, 120); // Simulating 60-120 BPM
  
  // Simulated GPS (Zimbabwe Region - Mashonaland West Example)
  float lat = -17.3601 + (random(-100, 100) / 10000.0);
  float lon = 30.1918 + (random(-100, 100) / 10000.0);

  // Output JSON via Serial for ZUNDE Bridge
  Serial.print("{");
  Serial.print("\"temperature\":"); Serial.print(temp);
  Serial.print(", \"heartRate\":"); Serial.print(pulse);
  Serial.print(", \"latitude\":"); Serial.print(lat, 4);
  Serial.print(", \"longitude\":"); Serial.print(lon, 4);
  Serial.print(", \"status\": \"Active\"");
  Serial.println("}");

  delay(5000); // Send data every 5 seconds
}
```

---

## 3. The Software Bridge (Proteus to React)
To get the data from Proteus into your ZUNDE React app:

1.  **Virtual Serial Port:** Use a tool like **VSPD (Virtual Serial Port Driver)** to create a pair of virtual COM ports (e.g., COM1 and COM2).
2.  **Proteus Connection:** Set the **COMPIM** component in Proteus to **COM1**.
3.  **Data Forwarder:** Use a small Python script or a Node.js "Serial-to-Websocket" bridge to read from **COM2** and send it to your React app via a WebSocket.

---

## 4. Testing the Simulation
1.  Run the Proteus Simulation.
2.  Check the **Virtual Terminal** in Proteus to ensure JSON strings are printing correctly.
3.  ZUNDE's `HardwareSimulation.jsx` will automatically pick up the data stream once your WebSocket bridge is active.

---
*Created for the ZUNDE Enterprise Agri-Health Project (Seed Co Innovation Challenge)*
