"""
TControl AI Service - Vehicle Tracking & Trajectory Module
Multi-object tracking associating bounding boxes across temporal frames.
"""

from typing import Dict, List, Tuple
import math


class VehicleTracker:
    def __init__(self, pixels_per_meter: float = 24.0, fps: float = 30.0):
        self.pixels_per_meter = pixels_per_meter
        self.fps = fps
        self.tracks: Dict[str, List[Tuple[float, float, float]]] = {}  # id -> [(x, y, timestamp_sec)]

    def update_position(self, vehicle_id: str, x: float, y: float, timestamp_sec: float) -> Tuple[float, float]:
        """
        Record a vehicle's new position and estimate speed in km/h.
        Returns (previous_y, current_y).
        """
        if vehicle_id not in self.tracks:
            self.tracks[vehicle_id] = []

        history = self.tracks[vehicle_id]
        history.append((x, y, timestamp_sec))

        # Keep last 15 positions
        if len(history) > 15:
            history.pop(0)

        prev_y = history[-2][1] if len(history) >= 2 else y
        return (prev_y, y)

    def calculate_speed_kmh(self, vehicle_id: str) -> float:
        """
        Estimate vehicle speed based on vertical road displacement over time.
        """
        history = self.tracks.get(vehicle_id, [])
        if len(history) < 3:
            return 48.0  # default cruising speed

        start_x, start_y, start_t = history[0]
        end_x, end_y, end_t = history[-1]

        time_delta = end_t - start_t
        if time_delta <= 0:
            return 48.0

        pixel_dist = math.sqrt((end_x - start_x)**2 + (end_y - start_y)**2)
        meters = pixel_dist / self.pixels_per_meter
        meters_per_sec = meters / time_delta
        kmh = meters_per_sec * 3.6

        return round(min(max(kmh, 20.0), 140.0), 1)
