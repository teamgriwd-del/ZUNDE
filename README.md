# ZUNDE - Enterprise Agri-Health for Zimbabwe

ZUNDE is a comprehensive, enterprise-grade livestock health and management platform specifically tailored for Zimbabwean farmers and veterinarians. Built for the Seed Co Innovation Challenge, it provides digital tools to enhance productivity, automate health compliance, and provide rapid emergency response.

## 🚀 Core Enterprise Modules

### 1. Zunde Health: Enterprise Symptom Checker
An advanced diagnostic engine with weighted symptom matching.
- **Weighted Logic:** Differentiates between Primary and Secondary symptoms.
- **Risk Assessment:** Categorizes diseases by Severity (Critical, Warning) and identifies Quarantine requirements.
- **Zimbabwe Focus:** Trained on regional threats like January Disease (Theileriosis) and Anthrax.
- **Action Plans:** Provides structured, multi-step procedures for commercial farm management.

### 2. Health & Compliance Dashboard
A full-lifecycle livestock management system.
- **Automated Lifecycle Engine:** Calculates weaning dates and gestation countdowns based on species-specific biology.
- **Compliance Scheduling:** Generates precise vaccination timelines based on animal age.
- **Digital Audit Log:** Every health action is timestamped and recorded, providing a certification trail for enterprise farming.

### 3. Vet-Farmer Advisory & Emergency Portal
A structured communication and ticketing system localized for Zimbabwe.
- **Consultation Tickets:** Structured requests linked to specific animals with priority levels (Emergency vs. Routine).
- **Regional Surveillance:** Location tagging by Province and District to aid in national disease monitoring.
- **Zimbabwe Knowledge Base:** Integrated advisory feed featuring guidance from Agritex and the Department of Veterinary Services (DVS).
- **Emergency Hotlines:** Direct access to regional veterinary office contacts.

### 4. Animal Profile System
The digital record-keeper for the herd.
- **Automated Age Calculator:** Dynamically updates animal age based on birth date.
- **Pedigree Tracking:** (Upcoming) Foundation for tracking ancestry and breed purity.

### 5. Hardware Simulation (IoT) & Proteus Bridge
A high-tech command center for real-time and historical health monitoring.
- **Live Health Metrics:** Real-time tracking of Temperature, Heart Rate (BPM), and Activity.
- **Historical Trend Charts:** Integrated **Recharts** for visualizing health vitals over the last 15 cycles.
- **Simulated Geofencing:** GPS tracking with "Safe Zone" monitoring. Triggers **Perimeter Breach** alerts if animals stray.
- **Proteus Integration:** Ready-to-use bridge for physical circuit simulation. Includes Arduino firmware and Proteus schematic guidance in `IOT_HARDWARE_GUIDE.md`.

## 🛠️ Technical Stack
- **Frontend:** React (Vite)
- **Data Visualization:** Recharts
- **Icons:** Lucide-React
- **Hardware Integration:** Proteus, Arduino (C++), Serial COMPIM Bridge.

## 🌍 Target Market
Specifically designed for the **Zimbabwean agricultural landscape**, addressing the needs of both small-scale communal farmers and large-scale commercial livestock producers.

---
© 2026 ZUNDE Project - Team GRIWD (Seed Co Innovation Challenge)
