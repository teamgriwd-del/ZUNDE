# PFUMA - Enterprise Agri-Health Intelligence

PFUMA is a comprehensive, enterprise-grade livestock health and management platform specifically tailored for Zimbabwean farmers and veterinarians. Built for the Zimbabwe Agricultural Show, it provides digital tools to enhance productivity, automate health compliance, and provide rapid emergency response.

## 👑 The PFUMA Experience

### 1. Jinda: The AI Farm Assistant
A state-of-the-art AI assistant trained on a vast knowledge base of Zimbabwean livestock protocols.
- **NLP Engine:** Handles natural language queries from non-technical users.
- **Smart Navigation:** Responds to commands like "Show me the sensors" or "Take me home."
- **Deep Knowledge:** Trained on January Disease (Theileriosis), Anthrax, and Cattle Gestation/Weaning standards.
- **Herd Analytics:** Instantly calculates herd size and health trends via chat.

### 2. Enterprise Diagnostics (Weighted Engine)
Advanced diagnostic system with weighted symptom matching.
- **Weighted Logic:** Differentiates between Primary and Secondary symptoms.
- **Action Plans:** Provides multi-step procedures for commercial farm management.
- **Zim Focus:** Specific training on regional threats common in Mashonaland, Matabeleland, and Midlands.

### 3. Health & Compliance (Lifecycle Engine)
A full-lifecycle system ensuring commercial compliance.
- **Automated Lifecycle:** Real-time countdowns for weaning and gestation.
- **Digital Audit Log:** Permanent, timestamped records of every vaccination and treatment.
- **Compliance Tracking:** Color-coded status for Overdue, Due Today, and Upcoming tasks.

### 4. IoT Health Command Center
A high-fidelity monitoring dashboard with sensor fusion.
- **Noise Filtering:** 3-point moving average filter to suppress sensor glitches.
- **Vitality Index:** Unified health score (0-100%) fusing Temperature, Heart Rate, and Activity data.
- **GPS Geofencing:** Automated "Perimeter Breach" alerts to prevent livestock theft and straying.

### 5. Veterinary Advisory Portal
Structured ticketing system localized for Zimbabwe.
- **Regional Surveillance:** Location tagging by Province and District for national disease tracking.
- **Direct Hotlines:** Instant access to Department of Veterinary Services (DVS) regional offices.

### 6. Police Oversight & Sale Clearance
A fifth stakeholder role modelling real-world livestock-trade law enforcement.
- **Signup Verification Queue:** Police review Farmer/Supplier/Retailer applications (Vets are peer-reviewed by an existing verified vet); Police accounts are provisioned out-of-band, not self-service.
- **Sale Clearance Queue:** Every livestock marketplace listing tied to a registered animal starts `pending_clearance` and stays invisible to buyers until an officer verifies ownership/brand papers and issues a movement permit number.
- **Document Verification at Signup:** Every role uploads an ID document plus a role-specific credential (DVS license, business registration, land proof, etc.) — see `compliance/signup-verification-requirements.md`.

### 7. Compliance Knowledge Base
Researched, cited reference material — not legal advice — covering Zimbabwean livestock law and species-specific health requirements for Cattle, Pigs, Sheep, and Goats. See the [`compliance/`](compliance/) folder. Jinda draws on a condensed version of this to answer "what do I need to legally keep/sell X" questions in-chat.

### 8. Real Authentication & Role-Based Access Control
- **Password auth (bcrypt) + JWT sessions** — no endpoint is open to an unauthenticated caller except health-check, login, register, and public feed reference data.
- **Per-owner data scoping** — a Farmer only ever sees their own animals/health records/inventory; Vets and Police get oversight visibility; the AI companion is role-aware and refuses to discuss another user's data.
- **Uploaded documents** are stored outside the web root and served only to the document's owner or an authorized reviewer.

## 🛠️ Technical Stack
- **Frontend:** React (Vite) + Tailwind CSS v4
- **Backend:** Flask + PyMySQL, bcrypt password hashing, PyJWT sessions
- **Visualization:** Recharts (Historical Trends & Herd Analytics)
- **Intelligence:** Custom NLP Logic (Jinda Engine), role-aware, sourced from `compliance/`
- **Hardware:** Real ESP32/LoRa collar + base-station firmware (`hardware/`) with app-side device pairing, plus a Proteus/Arduino simulation path for development — see `IOT_HARDWARE_GUIDE.md`.

## 🌍 Target Market
Specifically designed for the **Zimbabwean agricultural landscape**, bridging the gap between traditional farming wisdom and modern enterprise technology.

---
© 2026 PFUMA - Team GRIWD (Zimbabwe Agricultural Show)
