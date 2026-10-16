// ==========================================================================
// AI Traffic Intelligence Platform (TControl) - Interactive AI Simulator
// Real-time Canvas Computer Vision & Violation Detection Engine
// ==========================================================================

class TrafficSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Virtual resolution
    this.width = 960;
    this.height = 540;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Simulation state
    this.signalState = 'RED'; // GREEN, AMBER, RED
    this.signalTimer = 0;
    this.signalDuration = { GREEN: 10, AMBER: 3, RED: 8 };
    this.redElapsedSec = 1.45;
    this.gracePeriodSec = 0.50;
    
    // Stop line coordinates
    this.stopLine = { x1: 220, y1: 340, x2: 740, y2: 340 };

    // Vehicles array
    this.vehicles = [];
    this.vehicleIdCounter = 100;
    this.lastSpawn = 0;
    this.isRunning = true;
    this.autoViolateNext = false;

    // Animation frame handle
    this.animFrame = null;

    // Initialize vehicle presets
    this.init();
  }

  init() {
    this.spawnVehicle(false);
    this.animate = this.animate.bind(this);
    this.animFrame = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.isRunning = false;
  }

  spawnVehicle(forceViolation = false) {
    this.vehicleIdCounter++;
    const lanes = [
      { x: 340, laneNumber: 1 },
      { x: 480, laneNumber: 2 },
      { x: 620, laneNumber: 3 }
    ];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    const plates = ['LND-492-AA', 'ABC-123-XY', 'KJA-719-XP', 'EKY-305-BD', 'RBC-401-AA', 'ABJ-882-KW', 'LAG-551-ZZ'];
    const chosenPlate = plates[Math.floor(Math.random() * plates.length)];
    const classes = ['Sedan (Silver)', 'SUV (Dark Blue)', 'Hatchback (White)', 'Sedan (Black)'];
    const chosenClass = classes[Math.floor(Math.random() * classes.length)];

    const vehicle = {
      id: `#${this.vehicleIdCounter}`,
      plate: chosenPlate,
      plateConf: +(0.92 + Math.random() * 0.07).toFixed(3),
      type: chosenClass,
      lane: lane.laneNumber,
      x: lane.x - 45,
      y: 60,
      width: 90,
      height: 160,
      speed: forceViolation ? 5.8 : (this.signalState === 'RED' ? 2.2 : 4.5),
      hasViolated: false,
      isViolatorCandidate: forceViolation,
      crossingCaptured: false,
      color: '#3b82f6'
    };

    if (forceViolation) {
      vehicle.color = '#f43f5e';
    }

    this.vehicles.push(vehicle);
  }

  toggleSignal() {
    if (this.signalState === 'RED') {
      this.signalState = 'GREEN';
      this.redElapsedSec = 0;
    } else if (this.signalState === 'GREEN') {
      this.signalState = 'AMBER';
    } else {
      this.signalState = 'RED';
      this.redElapsedSec = 0.1;
    }
  }

  triggerViolationSimulation() {
    this.signalState = 'RED';
    this.redElapsedSec = 1.65;
    this.spawnVehicle(true);
  }

  update(delta) {
    // Update signal clock
    if (this.signalState === 'RED') {
      this.redElapsedSec += delta;
    } else {
      this.redElapsedSec = 0;
    }

    // Auto spawn every 4 seconds if less than 3 vehicles
    this.lastSpawn += delta;
    if (this.lastSpawn > 4.5 && this.vehicles.length < 3) {
      this.spawnVehicle(this.autoViolateNext);
      this.autoViolateNext = false;
      this.lastSpawn = 0;
    }

    // Update vehicles
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      const stopY = this.stopLine.y1;
      const vehicleFrontY = v.y + v.height;

      // Behavior: normal vehicles stop before the line if RED
      if (this.signalState === 'RED' && !v.isViolatorCandidate) {
        if (vehicleFrontY < stopY - 20) {
          v.y += v.speed;
        } else if (vehicleFrontY < stopY - 5) {
          v.speed = Math.max(0, v.speed - 0.15);
          v.y += v.speed;
        }
      } else {
        // Green, Amber, or deliberate red-light runner proceeds
        v.y += v.speed;
      }

      // Check Stop Line Crossing Condition:
      // Front axle crosses stop line while signal is RED and past grace threshold
      if (this.signalState === 'RED' && vehicleFrontY >= stopY && !v.crossingCaptured) {
        if (this.redElapsedSec > this.gracePeriodSec) {
          v.hasViolated = true;
          v.crossingCaptured = true;
          this.onViolationDetected(v, this.redElapsedSec);
        }
      }

      // Remove vehicles that left the screen
      if (v.y > this.height + 50) {
        this.vehicles.splice(i, 1);
      }
    }
  }

  onViolationDetected(vehicle, redTime) {
    console.log(`[AI Engine] VIOLATION: ${vehicle.plate} crossed stop line at RED +${redTime.toFixed(2)}s`);
    
    // Dispatch custom DOM event
    const event = new CustomEvent('trafficViolationDetected', {
      detail: {
        plate: vehicle.plate,
        plateConf: vehicle.plateConf,
        speedKmh: Math.floor(vehicle.speed * 11),
        redElapsedSec: redTime,
        vehicleClass: vehicle.type
      }
    });
    window.dispatchEvent(event);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Road Surface
    ctx.fillStyle = '#141a26';
    ctx.fillRect(180, 0, 600, this.height);

    // Road shoulders / curbs
    ctx.fillStyle = '#0f141f';
    ctx.fillRect(0, 0, 180, this.height);
    ctx.fillRect(780, 0, 180, this.height);

    // Curb lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 0); ctx.lineTo(180, this.height);
    ctx.moveTo(780, 0); ctx.lineTo(780, this.height);
    ctx.stroke();

    // 2. Lane Dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    [380, 580].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, this.height);
      ctx.stroke();
    });
    ctx.setLineDash([]); // Reset line dash

    // 3. Calibrated Stop Line (Physical + Virtual Overlay)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(this.stopLine.x1, this.stopLine.y1);
    ctx.lineTo(this.stopLine.x2, this.stopLine.y2);
    ctx.stroke();

    // Calibrated AI Overlay Sensor Boundary
    ctx.strokeStyle = this.signalState === 'RED' ? '#f43f5e' : '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.stopLine.x1 - 10, this.stopLine.y1 - 15, (this.stopLine.x2 - this.stopLine.x1) + 20, 30);

    // Stop Line Label
    ctx.fillStyle = this.signalState === 'RED' ? '#f43f5e' : '#00e5ff';
    ctx.font = '600 11px "JetBrains Mono"';
    ctx.fillText(`CALIBRATED STOP LINE [Y: ${this.stopLine.y1}px] | SENSOR ACTIVE`, 190, this.stopLine.y1 - 22);

    // 4. Draw Vehicles
    this.vehicles.forEach(v => {
      ctx.save();
      // Vehicle Body
      ctx.fillStyle = v.color || '#2563eb';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(v.x, v.y, v.width, v.height, 12);
      ctx.fill();

      // Windshield & Rear Window
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(v.x + 8, v.y + 35, v.width - 16, 28);
      ctx.fillRect(v.x + 10, v.y + 115, v.width - 20, 22);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(v.x + 8, v.y + v.height - 6, 18, 5);
      ctx.fillRect(v.x + v.width - 26, v.y + v.height - 6, 18, 5);

      // AI Bounding Box
      ctx.strokeStyle = v.hasViolated ? '#f43f5e' : '#00e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(v.x - 4, v.y - 4, v.width + 8, v.height + 8);

      // AI Tag Label
      ctx.fillStyle = v.hasViolated ? '#f43f5e' : '#00e5ff';
      ctx.font = '700 10.5px "JetBrains Mono"';
      const label = v.hasViolated 
        ? `[VIOLATION: RED RUNNER] ${v.plate}` 
        : `[TRACKER ${v.id}] ${v.plate} (${(v.plateConf * 100).toFixed(0)}%)`;
      ctx.fillText(label, v.x - 4, v.y - 10);

      ctx.restore();
    });

    // 5. Draw Traffic Signal Head Overlay (Top Right)
    const tx = 830;
    const ty = 30;
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx, ty, 65, 170, 10);
    ctx.fill();
    ctx.stroke();

    // Red Lamp
    ctx.fillStyle = this.signalState === 'RED' ? '#f43f5e' : '#2b1117';
    if (this.signalState === 'RED') {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 20;
    }
    ctx.beginPath();
    ctx.arc(tx + 32, ty + 35, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Amber Lamp
    ctx.fillStyle = this.signalState === 'AMBER' ? '#f59e0b' : '#2b200b';
    if (this.signalState === 'AMBER') {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
    }
    ctx.beginPath();
    ctx.arc(tx + 32, ty + 85, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Green Lamp
    ctx.fillStyle = this.signalState === 'GREEN' ? '#10b981' : '#0c271d';
    if (this.signalState === 'GREEN') {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 20;
    }
    ctx.beginPath();
    ctx.arc(tx + 32, ty + 135, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Signal Telemetry Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 11px "JetBrains Mono"';
    ctx.fillText(`STATE: ${this.signalState}`, tx - 55, ty + 195);
    if (this.signalState === 'RED') {
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`RED +${this.redElapsedSec.toFixed(2)}s`, tx - 55, ty + 212);
    }

    // Watermark & FPS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillText(`CAM-LAG-01 | NTCIP-SCATS SIGNAL SYNC | 30.0 FPS | TIME DRIFT: +4.2ms`, 24, 28);
  }

  animate(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.isRunning) {
      this.update(delta);
      this.draw();
    }
    this.animFrame = requestAnimationFrame(this.animate);
  }
}

window.TrafficSimulator = TrafficSimulator;
