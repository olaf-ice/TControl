# TControl — AI Traffic Intelligence & Enforcement Platform
### Realistic First Version (v1.0 Architecture & Demonstration)

> **Platform Goal:** A Smart Traffic Enforcement and Intelligence Platform that uses optical sensors, computer vision, and rule engines to detect suspected traffic violations, assist authorized officers with reliable plate identification, preserve tamper-evident evidence packages, and support lawful due process from review through resolution.

---

## 🚀 Quick Start (Zero External Dependencies)

The server runs on standard **Node.js** with zero external package installation delays.

```bash
# Start the server
node server.js

# Or with npm
npm start
```

Then open your browser to:
👉 **`http://localhost:3000`**

---

## 🎯 The Four Foundational Proof Points in Version 1

1. **Plate Identification Reliability:**
   - Dual-stage OCR extraction displaying overall plate confidence (e.g. `96.4%`) alongside character-level confidence matrices.
   - Low-confidence sightings (<85%) are automatically tagged for manual verification.
   - **Crucial Principle:** Plate confidence reflects optical clarity only; it *never* determines guilt.

2. **Defensible Offence Detection (Red-Light Running):**
   - Synchronized tracking of vehicles across a **calibrated physical stop line**.
   - Requires confirmed **RED** signal controller state + exceeding a calibrated **amber grace threshold** (0.50s) to prevent penalizing yellow-to-red transition traps.
   - Compiles a synchronized 4-frame evidence timeline (Approach, Crossing, Traversal, Plate Crop).

3. **Auditable Records & Cryptographic Integrity:**
   - Every evidence package calculates an immutable **SHA-256 cryptographic digest** over all 4 raw image frames and sensor telemetry.
   - An interactive verification tool recalculates the hash on demand to certify zero evidence tampering.
   - Vehicle sightings are strictly separated from citizen identities.

4. **Authorized Agency Enforcement & Due Process:**
   - Officer-in-the-loop review queue: Sworn officers can **Approve Violation** (initiating an official *Notice of Intended Prosecution*) or **Dismiss Case** on statutory exemption grounds (emergency vehicle, traffic officer directed, signal anomaly).
   - Printable official Citation Notice with agency seal, photographic evidence strip, and payment reference.
   - Statutory Appeals & Tribunal Portal with 28-day due process contest mechanisms.
   - Immutable audit trail recording every inspection, decision, and system action.

---

## 📂 Architecture & Directory Structure

```
TControl/
├── server.js                     # High-performance Node.js REST API & static server
├── package.json                  # Manifest & run scripts
├── data/
│   └── database.json             # Relational JSON database (cameras, cases, evidence, notices, audit)
├── public/                       # Frontend SPA Workspace
│   ├── index.html                # Operations command dashboard shell
│   ├── css/
│   │   └── style.css             # Command center dark mode design system
│   └── js/
│       ├── api.js                # REST API wrapper
│       ├── simulator.js          # Interactive HTML5 Canvas traffic & red-light detection engine
│       └── app.js                # State management, view router & review workspace
└── docs/
    └── TRAFFIC_AI_PLATFORM_SPEC.md # Full technical specification document
```

---

## 🚦 Interactive AI Detector Simulator

Inside the dashboard, navigate to **AI Violation Simulator**:
- Observe live vehicle bounding boxes and trajectory trackers.
- Click **"Cycle Traffic Light"** to change signal states (Green / Amber / Red).
- Click **"Trigger Red-Light Runner"** to dispatch a vehicle timed to cross the calibrated stop line on RED.
- Watch the AI Engine detect the infraction in real-time, compile the 4-frame evidence package, calculate the SHA-256 hash, and queue the case for officer review!

---

## 🏛️ Public Citizen Verification & Due Process Portal (Option C)

Registered vehicle owners receiving a Citation Notice or scanning the notice's cryptographic QR code can access the public citizen portal without officer credentials:
- **Direct Portal Access:** Click **"Citizen Public Portal (QR)"** in the top navigation or use notice reference (e.g. `NOT-2026-0842`).
- **Evidence Review:** Inspect all 4 synchronized evidence frames and cryptographic SHA-256 integrity confirmation.
- **Statutory Appeal Filing:** Submit a formal due process appeal under statutory grounds (*"Vehicle Stolen / Cloned"*, *"Emergency Services Yield"*, *"Defective Signal Hardware"*, *"Not the Driver"*).
- **Fine Payment Simulation:** Settle penalty charges securely with instant receipt generation.

---

## 🐍 Python Computer Vision Microservice (Option 2)

A dedicated computer vision worker using FastAPI, OpenCV, and NumPy runs on port `8000`:
- **Tracking:** Kalman-style centroid & optical bounding box tracker with unique track IDs.
- **Stop-Line Engine:** Sub-millisecond polygon crossing intersection logic with amber grace period enforcement.
- **Confidence Separation:** Optical plate recognition confidence is strictly isolated from violation probability.
- **Run locally with uv:**
  ```bash
  cd ai-service
  uv run python main.py
  ```

---

## 🐳 Docker Deployment (Option D)

Deploy the entire platform (Web Backend + Python CV Microservice) with a single command:

```bash
docker compose up --build
```

- Web Command Dashboard & Citizen Portal: **`http://localhost:3000`**
- AI Computer Vision Microservice: **`http://localhost:8000`**
- Interactive Swagger API Docs: **`http://localhost:8000/docs`**

