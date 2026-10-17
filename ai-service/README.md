# TControl AI Computer Vision Service (Python + FastAPI)

> **Role:** High-throughput computer vision worker for vehicle detection, trajectory tracking, stop-line crossing calculation, and license plate OCR.

---

## 🚀 Quick Run (via uv)

With `uv` installed, dependencies and Python virtual environments are resolved automatically:

```bash
cd ai-service

# Run the FastAPI vision service
uv run python main.py
```

The service will start on:
👉 **`http://localhost:8000`**  
API Documentation (Swagger UI):  
👉 **`http://localhost:8000/docs`**

---

## 📡 Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service status, vision models, and Node.js target |
| `POST` | `/api/v1/process-video` | Ingests `.mp4` file, tracks vehicles, and dispatches evidence packages to dashboard |
| `POST` | `/api/v1/analyze-frame` | Real-time vehicle trajectory and violation calculation |
| `GET` | `/api/v1/models` | Active YOLOv8 and OCR models metadata |

---

## 🔗 Architecture Integration

When a violation is detected in a video stream:
1. `StopLineRuleEngine` validates that the vehicle crossed the stop line while the traffic signal was **RED** and exceeded the **0.5s grace window**.
2. `PlateOCREngine` isolates the license plate crop and extracts character confidence metrics.
3. The package is posted to `http://localhost:3000/api/simulate/detect`, where the Node.js backend calculates the SHA-256 cryptographic digest and presents it in the **Officer Adjudication Queue**.
