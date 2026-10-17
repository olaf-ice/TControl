"""
TControl AI Computer Vision Microservice (FastAPI)
Real-time Video Analysis, Vehicle Tracking, Stop-Line Enforcement & OCR
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
import shutil

from video_processor import VideoProcessorPipeline
from core.stopline_rule import StopLineRuleEngine
from core.plate_ocr import PlateOCREngine

app = FastAPI(
    title="TControl AI Computer Vision Service",
    version="1.0.0",
    description="Dedicated computer vision worker for vehicle tracking, stop-line violation checking, and license plate OCR."
)

# Enable CORS for communication with Node.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = VideoProcessorPipeline()
ocr_engine = PlateOCREngine()


class FrameAnalysisRequest(BaseModel):
    vehicle_id: str
    camera_id: str = "CAM-LAG-01"
    prev_y: float
    curr_y: float
    signal_state: str = "RED"
    red_elapsed_sec: float
    speed_kmh: float = 50.0
    plate_hint: Optional[str] = None


@app.get("/health")
def health_check():
    return {
        "status": "OPERATIONAL",
        "service": "TControl-AI-Vision",
        "vision_models": {
            "object_detector": "YOLOv8-Traffic-v2.4",
            "tracker": "ByteTrack-Kalman",
            "ocr_model": "PaddleOCR-v4-PlateLegal"
        },
        "target_node_backend": pipeline.node_backend_url
    }


@app.post("/api/v1/process-video")
def process_video_endpoint(
    video_path: str = Form("samples/intersection_day_01.mp4"),
    camera_id: str = Form("CAM-LAG-01"),
    simulated_infractions: int = Form(1)
):
    """
    Process an offline video file, run stop-line infraction mathematics,
    read plates, and automatically register new cases in Node.js review queue.
    """
    pipeline.camera_id = camera_id
    result = pipeline.process_video_file(video_path, simulated_infractions)
    return result


@app.post("/api/v1/analyze-frame")
def analyze_frame_endpoint(req: FrameAnalysisRequest):
    """
    Real-time single-frame trajectory validation endpoint.
    """
    evaluation = pipeline.rule_engine.evaluate_violation(
        req.vehicle_id,
        (400, req.prev_y),
        (400, req.curr_y),
        req.signal_state,
        req.red_elapsed_sec,
        req.speed_kmh
    )

    ocr_result = None
    if evaluation["is_violation"]:
        ocr_result = ocr_engine.recognize_plate(hint_plate=req.plate_hint)

    return {
        "evaluation": evaluation,
        "ocr": ocr_result
    }


@app.get("/api/v1/models")
def get_active_models():
    return {
        "detector": {
            "name": "YOLOv8n-Traffic",
            "input_resolution": "640x640",
            "classes": ["car", "motorcycle", "bus", "truck"],
            "backend": "PyTorch / ONNX Runtime"
        },
        "ocr": {
            "name": "PaddleOCR-v4",
            "dictionary": "ALPR-Legal-Latin",
            "confidence_threshold": 0.85
        },
        "hardware_acceleration": "CUDA / DirectML / CPU Fallback"
    }


if __name__ == "__main__":
    import uvicorn
    print("==========================================================")
    print("  TControl Python AI Computer Vision Service Running      ")
    print("  Listening on http://localhost:8000                      ")
    print("  Documentation available at http://localhost:8000/docs   ")
    print("==========================================================")
    uvicorn.run(app, host="127.0.0.1", port=8000)
