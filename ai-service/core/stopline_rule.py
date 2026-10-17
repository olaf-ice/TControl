"""
TControl AI Service - Stop-Line Intersection Rule Engine
Defensible traffic violation detection using calibrated geometry and signal controller telemetry.
"""

from typing import Dict, Tuple, Optional
import math


class StopLineRuleEngine:
    def __init__(self, stop_line: Dict[str, float], grace_period_sec: float = 0.5):
        """
        :param stop_line: Dictionary with x1, y1, x2, y2 coordinates of calibrated line
        :param grace_period_sec: Minimum seconds after amber transition before violation is valid
        """
        self.x1 = float(stop_line.get("x1", 200))
        self.y1 = float(stop_line.get("y1", 340))
        self.x2 = float(stop_line.get("x2", 700))
        self.y2 = float(stop_line.get("y2", 340))
        self.grace_period_sec = float(grace_period_sec)

    def is_line_crossed(self, prev_pos: Tuple[float, float], curr_pos: Tuple[float, float]) -> bool:
        """
        Determine if trajectory line segment from prev_pos to curr_pos intersects the stop line.
        For vertical road orientation (top to bottom), checks if y transitions past the stop line.
        """
        px, py = prev_pos
        cx, cy = curr_pos

        # Check if vehicle is within horizontal boundary of stop line
        min_x = min(self.x1, self.x2) - 30
        max_x = max(self.x1, self.x2) + 30
        if not (min_x <= cx <= max_x or min_x <= px <= max_x):
            return False

        # Stop line Y elevation (assuming horizontal or tilted line)
        line_y = self.y1  # baseline horizontal

        # Vehicle crossed from above (behind) to below (beyond) the stop line
        if py < line_y and cy >= line_y:
            return True

        return False

    def evaluate_violation(
        self,
        vehicle_id: str,
        prev_pos: Tuple[float, float],
        curr_pos: Tuple[float, float],
        signal_state: str,
        red_elapsed_sec: float,
        speed_kmh: float
    ) -> Dict:
        """
        Judicially defensible red-light evaluation:
        1. Must cross calibrated stop line
        2. Signal must be confirmed RED
        3. Elapsed red duration must exceed statutory grace period threshold
        """
        crossed = self.is_line_crossed(prev_pos, curr_pos)
        is_red = (signal_state.upper() == "RED")
        grace_exceeded = red_elapsed_sec > self.grace_period_sec
        margin = round(red_elapsed_sec - self.grace_period_sec, 2)

        is_violation = crossed and is_red and grace_exceeded

        return {
            "vehicle_id": vehicle_id,
            "crossed_stop_line": crossed,
            "signal_state": signal_state,
            "red_elapsed_sec": round(red_elapsed_sec, 2),
            "grace_period_sec": self.grace_period_sec,
            "violation_margin_sec": max(0.0, margin),
            "is_violation": is_violation,
            "reason": (
                f"Crossing observed {red_elapsed_sec:.2f}s into RED (grace threshold: {self.grace_period_sec:.2f}s)"
                if is_violation else
                "Compliant or within lawful yellow/amber transition threshold"
            )
        }
