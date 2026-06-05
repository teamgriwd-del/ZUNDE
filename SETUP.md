# ZUNDE RaMambo — Project Setup Guide

Two people, three apps — this guide gets everything running.

---

## What's in this repo

```
ZUNDE/
├── src/          ← Arnold's React web app (Vite + Tailwind)
├── app/          ← Addy's React Native mobile app (Expo)
├── backend/      ← Shared Flask API + MySQL database
│   ├── app.py        API server (40+ endpoints)
│   └── schema.sql    Full database schema + seed data
└── dist/         ← Built web app (ready to deploy)
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| XAMPP (MySQL) | Any | https://apachefriends.org |
| Expo Go (phone) | Latest | App Store / Play Store |

---

## Step 1 — Start MySQL (XAMPP)

Open XAMPP Control Panel and click **Start** next to MySQL.
Or run from command line:
```
C:\xampp\mysql\bin\mysqld.exe
```

---

## Step 2 — Create the database

Run once to set up all tables and demo data:
```bash
C:\xampp\mysql\bin\mysql.exe -u root < backend/schema.sql
```

---

## Step 3 — Start the Flask API

```bash
cd backend
pip install flask flask-cors pymysql
python app.py
```

API runs at: **http://localhost:5000**

Test it: open http://localhost:5000 in your browser — you should see:
```json
{"message": "ZUNDE API is running ✅", "version": "2.0"}
```

---

## Step 4 — Run the React web app (Arnold's)

```bash
cd ..           # back to ZUNDE root
npm install
npm run dev
```

Web app runs at: **http://localhost:5173**

---

## Step 5 — Run the Expo mobile app (Addy's)

```bash
cd app
npm install
npx expo start
```

- Press **W** to open in browser
- Press **A** for Android emulator
- Scan the QR code with **Expo Go** on your phone

> If testing on a physical device, change `API` in the screen files from
> `http://localhost:5000` to your PC's local IP (e.g. `http://192.168.1.x:5000`)

---

## API Endpoints

| Method | Route | What it does |
|---|---|---|
| GET | `/` | Health check |
| GET/POST | `/users` | List all users / Register new user |
| GET | `/users?role=Farmer` | Filter users by role |
| GET | `/users?q=Moyo` | Search users by name/org/province |
| GET | `/dashboard/:user_id` | Dashboard stats for a user |
| GET/POST | `/animals` | List animals / Add animal |
| GET | `/animals?owner_id=1` | Animals for a specific farmer |
| GET | `/animals?for_sale=true` | All animals listed for sale |
| PATCH | `/animals/:id/sale` | Toggle for-sale status |
| GET/POST | `/health-events` | Health audit log |
| GET | `/inventory/:owner_id` | Medicine cabinet for a farmer |
| PATCH | `/inventory/:id/deduct` | Administer medicine & deduct stock |
| GET/POST | `/listings` | Marketplace listings |
| GET | `/listings?category=livestock` | Filter by category |
| GET/POST | `/feed` | Feed types for analyzer |
| GET | `/feed/search?q=maize` | Search feed by name or species |
| GET | `/cases` | Vet cases / consultations |

---

## Database Tables

| Table | Owner | Purpose |
|---|---|---|
| `users` | Shared | All 4 roles: Farmer, Vet, Supplier, Retailer |
| `animals` | Arnold | Herd registry with pedigree |
| `weight_history` | Arnold | Weight tracking per animal |
| `health_events` | Arnold | Vaccinations, treatments, diagnostics |
| `medicine_inventory` | Arnold | Per-farm medicine cabinet |
| `vet_cases` | Arnold | Vet Messenger cases |
| `messages` | Arnold | Messages within cases |
| `marketplace_listings` | Addy | Livestock + feed + produce for sale |
| `feed_types` | Addy | Feed Analyzer nutritional database |

---

## Data Alignment — Key Fields

**User object** (shared between web + mobile):
```json
{
  "id": 1,
  "full_name": "Arnold Mapindu",
  "phone": "+263 77 100 0001",
  "email": "arnold@example.com",
  "role": "Farmer",
  "org_name": "Mapindu Family Farm",
  "province": "Mashonaland West",
  "district": "Zvimba"
}
```

**Animal listing** (web app → marketplace):
When a farmer toggles `forSale=true` on an animal, call `PATCH /animals/:id/sale`
— this auto-creates a marketplace listing with `category='livestock'`.

**Feed Analyzer** (mobile → web):
Feed types are in the shared `feed_types` table. The web app's Lifecycle section
can use `GET /feed` to show recommended feeds per species.

---

## Who built what

| Section | Builder |
|---|---|
| Web app (React + Vite) | Arnold |
| Mobile app (Expo + React Native) | Addy |
| Flask API | Addy (extended by Arnold) |
| MySQL schema | Arnold (aligned from both) |
| Disease Detection, IoT Stream, Vet Messenger, Lifecycle, Herd Registry | Arnold |
| Dashboard, Marketplace, Feed Analyzer screens | Addy |
