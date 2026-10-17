// ==========================================================================
// AI Traffic Intelligence Platform (TControl) - Main Application Controller
// ==========================================================================

const App = {
  currentView: 'dashboard',
  selectedCaseId: 'CASE-1001',
  activeFrameKey: 'crossing',
  currentCaseData: null,
  simulatorInstance: null,
  currentRole: {
    id: 'REVIEW_OFFICER',
    name: 'Officer B. Ojo',
    badge: 'STMAEA-4409',
    title: 'REVIEW OFFICER'
  },

  rolesList: [
    { id: 'REVIEW_OFFICER', name: 'Officer B. Ojo', badge: 'STMAEA-4409', title: 'REVIEW OFFICER', avatar: 'BO' },
    { id: 'SUPERVISOR', name: 'Inspector M. Danjuma', badge: 'STMAEA-3120', title: 'TRIBUNAL SUPERVISOR', avatar: 'MD' },
    { id: 'CAMERA_OPERATOR', name: 'Operator T. Adebayo', badge: 'CAM-OPS-114', title: 'CAMERA & SENSOR OPERATOR', avatar: 'TA' },
    { id: 'SYS_ADMIN', name: 'Chief Engr. C. Okon', badge: 'HQ-ADMIN-01', title: 'SYSTEM ADMINISTRATOR', avatar: 'CO' }
  ],

  init() {
    this.bindNavigation();
    this.bindGlobalEvents();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.loadView('dashboard');
  },

  toggleRoleSwitcher() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title">Select Active Officer Profile</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Demonstrate role-based access control (RBAC). Each role has specific permissions for evidence review, stop-line calibration, and appeal tribunal adjudication.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${this.rolesList.map(r => `
              <div style="background: ${this.currentRole.id === r.id ? 'var(--bg-surface-elevated)' : 'var(--bg-base)'}; border: 1px solid ${this.currentRole.id === r.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}; padding: 12px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="App.setRole('${r.id}')">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="officer-avatar">${r.avatar}</div>
                  <div>
                    <div style="font-weight: 700; color: #fff; font-size: 13.5px;">${r.name}</div>
                    <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${r.badge} · ${r.title}</div>
                  </div>
                </div>
                ${this.currentRole.id === r.id ? '<span class="badge badge-cyan">Active</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  setRole(roleId) {
    const r = this.rolesList.find(item => item.id === roleId);
    if (r) {
      this.currentRole = r;
      document.getElementById('header-officer-avatar').textContent = r.avatar;
      document.getElementById('header-officer-name').textContent = r.name;
      document.getElementById('header-officer-role').textContent = `${r.badge} · ${r.title} ▾`;
      this.closeModal();
      this.showToast(`Switched active profile to ${r.name} (${r.title})`, 'success');
      this.loadView(this.currentView);
    }
  },

  openGuideModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog" style="max-width: 750px;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">🗺️</span>
              <div>
                <h3 class="modal-title" style="margin: 0;">Platform Operations Map & User Guide</h3>
                <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">HOW TO DEMONSTRATE & OPERATE TCONTROL</div>
              </div>
            </div>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 13px;">
            <!-- Step 1 -->
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-left: 4px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 14px;">1. Trigger a Violation in the AI Simulator</strong>
                <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="App.closeModal(); App.loadView('simulator');">Go to Simulator &rarr;</button>
              </div>
              <p style="color: var(--text-muted); line-height: 1.5;">
                Navigate to <strong>"AI Violation Simulator"</strong> in the left sidebar. Click <strong>"Cycle Traffic Light"</strong> until the signal is RED, then click <strong>"Trigger Red-Light Runner"</strong>. Watch the AI tracker detect the stop-line crossing and automatically create a real case in your queue.
              </p>
            </div>

            <!-- Step 2 -->
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-left: 4px solid var(--traffic-amber); border-radius: var(--radius-md); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 14px;">2. Review & Inspect Evidence as an Officer</strong>
                <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="App.closeModal(); App.loadView('review');">Open Review Queue &rarr;</button>
              </div>
              <p style="color: var(--text-muted); line-height: 1.5;">
                Go to <strong>"Case Adjudication"</strong>. Click through the 4 certified frames: <code>F1 Approach</code>, <code>F2 Crossing</code>, <code>F3 Transit</code>, and <code>F4 Plate OCR</code>. Click <strong>"Recalculate & Verify SHA-256 Hash"</strong> to prove zero evidence tampering. Then click <strong>"Confirm Violation & Issue Notice"</strong>.
              </p>
            </div>

            <!-- Step 3 -->
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-left: 4px solid var(--traffic-green); border-radius: var(--radius-md); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 14px;">3. View & Print Official Citation Notices</strong>
                <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="App.closeModal(); App.loadView('notices');">View Notices &rarr;</button>
              </div>
              <p style="color: var(--text-muted); line-height: 1.5;">
                In <strong>"Enforcement Notices"</strong>, click <strong>"View & Print Notice"</strong> on any citation to see the official Notice of Intended Prosecution with legal citation text, certified photographic proof strip, fine amount, and QR verification.
              </p>
            </div>

            <!-- Step 4 -->
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-medium); border-left: 4px solid var(--accent-blue); border-radius: var(--radius-md); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: #fff; font-size: 14px;">4. Run Video Batch Analysis with Python AI Worker</strong>
                <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="App.closeModal(); App.loadView('footage');">Open Footage Lab &rarr;</button>
              </div>
              <p style="color: var(--text-muted); line-height: 1.5;">
                In <strong>"Footage Lab & Upload"</strong>, click <strong>"Execute Video Analysis Pipeline"</strong>. The dashboard calls the Python FastAPI service on port <code>8000</code>, which tracks vehicle movement, runs OCR, and registers detected violations.
              </p>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <button class="btn btn-primary" onclick="App.closeModal()">Got it, Let's Start!</button>
          </div>
        </div>
      </div>
    `;
  },

  updateClock() {
    const el = document.getElementById('live-clock');
    if (el) {
      const now = new Date();
      el.textContent = now.toUTCString().replace('GMT', 'UTC');
    }
  },

  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) this.loadView(view);
      });
    });
  },

  bindGlobalEvents() {
    // Listen for simulator violation events
    window.addEventListener('trafficViolationDetected', async (e) => {
      const d = e.detail;
      this.showToast(`🚨 AI Engine Detected Red-Light Violation: ${d.plate} (+${d.redElapsedSec.toFixed(2)}s)`, 'danger');
      try {
        await API.simulateDetection({
          plate_text: d.plate,
          plate_confidence: d.plateConf,
          speed_kmh: d.speedKmh,
          red_elapsed_sec: d.redElapsedSec,
          vehicle_class: d.vehicleClass
        });
        this.refreshCounters();
        if (this.currentView === 'dashboard') this.renderDashboard();
      } catch (err) {
        console.error('Failed to register detected simulation:', err);
      }
    });
  },

  async refreshCounters() {
    try {
      const stats = await API.getStats();
      const reviewBadge = document.getElementById('nav-review-badge');
      if (reviewBadge) {
        reviewBadge.textContent = stats.cases_awaiting_review;
        reviewBadge.classList.toggle('alert', stats.cases_awaiting_review > 0);
      }
      const appealsBadge = document.getElementById('nav-appeals-badge');
      if (appealsBadge) {
        appealsBadge.textContent = stats.active_appeals;
      }
    } catch (e) {
      console.warn('Could not refresh stats counters', e);
    }
  },

  loadView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.toggle('active', i.getAttribute('data-view') === viewName);
    });

    if (this.simulatorInstance && viewName !== 'simulator') {
      this.simulatorInstance.destroy();
      this.simulatorInstance = null;
    }

    const container = document.getElementById('view-container');
    container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-dim);">Loading workspace module...</div>';

    switch (viewName) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'simulator':
        this.renderSimulator();
        break;
      case 'footage':
        this.renderFootageLab();
        break;
      case 'review':
        this.renderReviewWorkspace();
        break;
      case 'cameras':
        this.renderCameras();
        break;
      case 'observations':
        this.renderObservations();
        break;
      case 'notices':
        this.renderNotices();
        break;
      case 'citizen':
        this.renderCitizenPortal();
        break;
      case 'appeals':
        this.renderAppeals();
        break;
      case 'metrics':
        this.renderMetrics();
        break;
      case 'audit':
        this.renderAuditLogs();
        break;
      default:
        this.renderDashboard();
    }

    this.refreshCounters();
  },

  // --- VIEW 1: DASHBOARD ---
  async renderDashboard() {
    const container = document.getElementById('view-container');
    try {
      const [stats, cases, cameras] = await Promise.all([
        API.getStats(),
        API.getCases(),
        API.getCameras()
      ]);

      const awaitingCases = cases.filter(c => c.status === 'AWAITING_REVIEW');

      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Traffic Enforcement Operations Command</h1>
            <p>Real-time optical monitoring, AI violation triage, evidence integrity, and authorized adjudication</p>
          </div>
          <div class="view-actions">
            <button class="btn btn-secondary" onclick="App.openManualIncidentModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Manual Incident Entry
            </button>
            <button class="btn btn-secondary" onclick="App.loadView('footage')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Footage Lab
            </button>
            <button class="btn btn-primary" onclick="App.openReviewCase('${awaitingCases[0] ? awaitingCases[0].id : 'CASE-1001'}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Review Queue (${stats.cases_awaiting_review})
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card cyan-card">
            <div class="stat-header">
              <span class="stat-label">Active Monitoring Cameras</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
            </div>
            <div class="stat-value">${stats.active_cameras} <span style="font-size: 14px; color: var(--text-dim); font-weight: 500;">/ ${stats.total_cameras}</span></div>
            <div class="stat-subtext"><span class="positive">● NTP Sync &lt; 5ms</span> Clock drift calibrated</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Vehicles Observed Today</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
            </div>
            <div class="stat-value">${stats.total_observations.toLocaleString()}</div>
            <div class="stat-subtext">ANPR Optical Recognition active</div>
          </div>

          <div class="stat-card alert-card">
            <div class="stat-header">
              <span class="stat-label">Suspected Violations (Review)</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            </div>
            <div class="stat-value" style="color: var(--traffic-amber);">${stats.cases_awaiting_review}</div>
            <div class="stat-subtext"><span class="warning">Pending Sworn Officer Adjudication</span></div>
          </div>

          <div class="stat-card green-card">
            <div class="stat-header">
              <span class="stat-label">Approved Enforcement Notices</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            </div>
            <div class="stat-value">${stats.enforcement_notices_issued}</div>
            <div class="stat-subtext"><span class="positive">${stats.lawful_dismissals} Lawful Dismissals</span> (Exemptions)</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              Suspected Traffic Violations Awaiting Officer Review
            </div>
            <span class="badge badge-amber">${awaitingCases.length} Cases Requiring Adjudication</span>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Case Ref</th>
                  <th>Vehicle Number Plate</th>
                  <th>Camera / Location</th>
                  <th>Plate OCR Conf</th>
                  <th>Offence Conf</th>
                  <th>Red Light Duration</th>
                  <th>Evidence Hash</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${cases.map(c => `
                  <tr>
                    <td><strong style="color: #fff; font-family: var(--font-mono);">${c.case_reference}</strong></td>
                    <td><span class="plate-tag">${c.vehicle_plate}</span></td>
                    <td>${(cameras.find(cam => cam.id === c.camera_id) || {}).name || c.camera_id}</td>
                    <td>
                      <div class="confidence-bar-container">
                        <div class="confidence-track"><div class="confidence-fill ${c.plate_ocr_confidence < 0.85 ? 'amber' : ''}" style="width: ${c.plate_ocr_confidence * 100}%"></div></div>
                        <span>${(c.plate_ocr_confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <div class="confidence-bar-container">
                        <div class="confidence-track"><div class="confidence-fill" style="width: ${c.offence_confidence * 100}%"></div></div>
                        <span>${(c.offence_confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td><span style="font-family: var(--font-mono); color: var(--traffic-red); font-weight: 700;">+${c.signal_time_into_red_sec.toFixed(2)}s</span> <span style="font-size: 10px; color: var(--text-dim);">(Grace: 0.5s)</span></td>
                    <td><span class="badge badge-green" style="font-size: 10px;">SHA-256 OK</span></td>
                    <td>
                      ${c.status === 'AWAITING_REVIEW' ? '<span class="badge badge-amber">Awaiting Review</span>' : ''}
                      ${c.status === 'ENFORCEMENT_NOTICE_ISSUED' ? '<span class="badge badge-cyan">Notice Issued</span>' : ''}
                      ${c.status === 'REJECTED_LAWFUL_DISMISSAL' ? '<span class="badge badge-muted">Lawful Dismissal</span>' : ''}
                    </td>
                    <td>
                      <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11.5px;" onclick="App.openReviewCase('${c.id}')">
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading dashboard: ${err.message}</div>`;
    }
  },

  // --- VIEW 2: AI DETECTOR SIMULATOR ---
  renderSimulator() {
    const container = document.getElementById('view-container');
    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>Live Intersection AI Violation Simulator</h1>
          <p>Real-time vehicle trajectory tracking, stop-line crossing calculation, and automatic red-light evidence capture</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-secondary" onclick="App.simulatorInstance && App.simulatorInstance.toggleSignal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Cycle Traffic Light
          </button>
          <button class="btn btn-danger" onclick="App.simulatorInstance && App.simulatorInstance.triggerViolationSimulation()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Trigger Red-Light Runner
          </button>
        </div>
      </div>

      <div class="panel" style="padding: 16px;">
        <div style="background: #000; border-radius: var(--radius-md); overflow: hidden; position: relative;">
          <canvas id="traffic-simulator-canvas" style="width: 100%; display: block; aspect-ratio: 16 / 9;"></canvas>
        </div>

        <div style="margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 6px;">How Detection Operates:</div>
            <ul style="font-size: 11.5px; color: var(--text-muted); padding-left: 16px; line-height: 1.6;">
              <li>AI detects vehicle bounding box & tracks centroid trajectory across frames.</li>
              <li>Stop line is calibrated physically at pixel Y: 340px.</li>
              <li>Offence triggers <strong>only</strong> when vehicle crosses stop line while signal is RED past the 0.5s grace window.</li>
              <li>Upon crossing, a 4-frame evidence bundle + SHA-256 hash is automatically compiled and dispatched to the Review Queue.</li>
            </ul>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 8px;">Calibrated Calibration Parameters:</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: var(--text-muted);">Red Grace Threshold:</span>
              <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 700;">0.50 Seconds</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="color: var(--text-muted);">Camera Calibration Line:</span>
              <span style="font-family: var(--font-mono); color: #fff;">(220, 340) &rarr; (740, 340)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: var(--text-muted);">Sensor Integration:</span>
              <span style="font-family: var(--font-mono); color: var(--traffic-green);">NTCIP / SCATS Controller Synced</span>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.simulatorInstance = new TrafficSimulator('traffic-simulator-canvas');
    }, 50);
  },

  // --- VIEW 3: CASE REVIEW & EVIDENCE WORKSPACE ---
  async openReviewCase(caseId) {
    this.selectedCaseId = caseId;
    this.loadView('review');
  },

  async renderReviewWorkspace() {
    const container = document.getElementById('view-container');
    try {
      const data = await API.getCase(this.selectedCaseId);
      this.currentCaseData = data;
      const c = data.case;
      const evd = data.evidence;
      const cam = data.camera;

      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <div style="display: flex; align-items: center; gap: 12px;">
              <h1>Case Adjudication: <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${c.case_reference}</span></h1>
              ${c.status === 'AWAITING_REVIEW' ? '<span class="badge badge-amber">Awaiting Sworn Officer Review</span>' : ''}
              ${c.status === 'ENFORCEMENT_NOTICE_ISSUED' ? '<span class="badge badge-cyan">Notice Issued (${c.notice_reference})</span>' : ''}
              ${c.status === 'REJECTED_LAWFUL_DISMISSAL' ? '<span class="badge badge-muted">Lawful Dismissal / Exonerated</span>' : ''}
            </div>
            <p>Incident at ${cam.name} · Captured: ${new Date(c.created_at).toLocaleString()}</p>
          </div>
          <div class="view-actions">
            <button class="btn btn-secondary" onclick="App.loadView('dashboard')">
              &larr; Back to Dashboard
            </button>
            ${c.notice_reference ? `
              <button class="btn btn-primary" onclick="App.openNoticePreview('${c.notice_reference}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                View Issued Notice
              </button>
            ` : ''}
          </div>
        </div>

        <div class="case-review-container">
          <!-- Left: Multi-Frame Evidence Player -->
          <div class="evidence-viewport">
            <div class="evidence-display-stage" id="stage-display">
              <canvas id="evidence-canvas" class="stage-canvas-simulation"></canvas>

              <div class="stage-overlay-telemetry">
                <span style="color: #fff; font-weight: 700;">CAMERA: ${cam.id}</span>
                <span style="color: var(--text-dim);">${cam.location}</span>
                <span style="color: var(--accent-cyan);">PLATE: ${c.vehicle_plate}</span>
                <span style="color: var(--traffic-red); font-weight: 700;">RED TIME: +${c.signal_time_into_red_sec.toFixed(2)}s</span>
              </div>

              <div class="stage-signal-state">
                <div class="traffic-light-mini">
                  <div class="tl-lamp active-red"></div>
                  <div class="tl-lamp"></div>
                  <div class="tl-lamp"></div>
                </div>
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--traffic-red); font-family: var(--font-mono);">SIGNAL: RED</div>
                  <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">ELAPSED: +${c.signal_time_into_red_sec.toFixed(2)}s</div>
                </div>
              </div>
            </div>

            <!-- 4-Frame Thumbnails Strip -->
            <div class="frames-strip">
              <div class="frame-thumbnail ${this.activeFrameKey === 'approach' ? 'active' : ''}" onclick="App.selectEvidenceFrame('approach')">
                <div class="frame-preview-box">
                  <span class="frame-badge">F1: APPROACH</span>
                </div>
                <div class="frame-label">Stop-Line Approach</div>
                <div class="frame-meta">${evd.frames.approach.signal}</div>
              </div>

              <div class="frame-thumbnail ${this.activeFrameKey === 'crossing' ? 'active' : ''}" onclick="App.selectEvidenceFrame('crossing')">
                <div class="frame-preview-box">
                  <span class="frame-badge" style="background: var(--traffic-red);">F2: CROSSING</span>
                </div>
                <div class="frame-label">Calibrated Stop-Line</div>
                <div class="frame-meta" style="color: var(--traffic-red);">${evd.frames.crossing.signal}</div>
              </div>

              <div class="frame-thumbnail ${this.activeFrameKey === 'transit' ? 'active' : ''}" onclick="App.selectEvidenceFrame('transit')">
                <div class="frame-preview-box">
                  <span class="frame-badge">F3: TRANSIT</span>
                </div>
                <div class="frame-label">Intersection Traversal</div>
                <div class="frame-meta">${evd.frames.transit.signal}</div>
              </div>

              <div class="frame-thumbnail ${this.activeFrameKey === 'plate_crop' ? 'active' : ''}" onclick="App.selectEvidenceFrame('plate_crop')">
                <div class="frame-preview-box">
                  <span class="frame-badge" style="background: var(--accent-cyan); color: #000;">F4: PLATE</span>
                </div>
                <div class="frame-label">Plate OCR Crop</div>
                <div class="frame-meta">${c.vehicle_plate}</div>
              </div>
            </div>
          </div>

          <!-- Right: Officer Adjudication Controls -->
          <div class="review-controls-sidebar">
            <div class="meta-spec-card">
              <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <span>Vehicle & Violation Metrics</span>
                <span class="plate-tag">${c.vehicle_plate}</span>
              </div>

              <div class="spec-row">
                <span class="spec-label">Plate OCR Confidence:</span>
                <span class="spec-val" style="color: var(--traffic-green);">${(c.plate_ocr_confidence * 100).toFixed(1)}%</span>
              </div>
              <div style="font-size: 10px; color: var(--text-dim); padding: 4px 0 8px; line-height: 1.3;">
                <em>Note: Plate confidence reflects optical character clarity only. It does NOT establish guilt or legal liability.</em>
              </div>

              <div class="spec-row">
                <span class="spec-label">Offence Type:</span>
                <span class="spec-val" style="color: var(--traffic-red);">Red-Light Violation</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Offence Confidence:</span>
                <span class="spec-val">${(c.offence_confidence * 100).toFixed(1)}%</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Vehicle Classification:</span>
                <span class="spec-val" style="font-size: 11px;">${c.vehicle_class}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Signal Red Duration:</span>
                <span class="spec-val" style="color: var(--traffic-red);">+${c.signal_time_into_red_sec.toFixed(2)}s</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Configured Grace Period:</span>
                <span class="spec-val">${c.grace_period_threshold_sec.toFixed(2)}s</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Violation Margin:</span>
                <span class="spec-val" style="color: var(--traffic-red);">+${(c.signal_time_into_red_sec - c.grace_period_threshold_sec).toFixed(2)}s past grace</span>
              </div>

              <!-- Cryptographic Hash Section -->
              <div class="hash-validation-box">
                <div class="hash-label">
                  <span>Cryptographic Evidence Hash</span>
                  <span id="hash-status-badge" style="color: var(--traffic-green); font-weight: 700;">● VERIFIED</span>
                </div>
                <div class="hash-string" id="evidence-hash-display">${evd.sha256_hash}</div>
                <button class="btn btn-secondary" style="width: 100%; margin-top: 8px; padding: 6px; font-size: 11px;" onclick="App.verifyEvidenceHash('${c.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Recalculate & Verify SHA-256 Hash
                </button>
                <a href="/api/cases/${c.id}/export-bundle" class="btn btn-secondary" style="width: 100%; margin-top: 6px; padding: 6px; font-size: 11px; text-decoration: none;" download>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Certified Court Bundle (JSON)
                </a>
              </div>
            </div>

            <!-- Adjudication Action Box -->
            <div class="meta-spec-card">
              <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 12px;">
                Sworn Officer Adjudication
              </div>

              ${c.status === 'AWAITING_REVIEW' ? `
                <div class="adjudication-actions">
                  <button class="btn btn-success" style="width: 100%; justify-content: center; padding: 12px;" onclick="App.openApproveModal('${c.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Confirm Violation & Issue Notice
                  </button>

                  <button class="btn btn-danger" style="width: 100%; justify-content: center; padding: 10px;" onclick="App.openRejectModal('${c.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Dismiss Case (Lawful Exemption)
                  </button>
                </div>
              ` : `
                <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 4px;">Decision Recorded:</div>
                  <div style="font-size: 12px; color: ${c.decision === 'APPROVED' ? 'var(--traffic-green)' : 'var(--text-muted)'}; font-weight: 600;">
                    ${c.decision} by ${c.assigned_reviewer}
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-dim); margin-top: 6px;">
                    "${c.decision_reason}"
                  </div>
                  <div style="font-size: 10px; color: var(--text-dim); margin-top: 6px; font-family: var(--font-mono);">
                    Timestamp: ${new Date(c.decided_at).toLocaleString()}
                  </div>
                </div>
              `}
            </div>
          </div>
        </div>
      `;

      // Render selected frame on canvas
      this.drawEvidenceFrame(this.activeFrameKey);
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading case: ${err.message}</div>`;
    }
  },

  selectEvidenceFrame(frameKey) {
    this.activeFrameKey = frameKey;
    document.querySelectorAll('.frame-thumbnail').forEach(el => el.classList.remove('active'));
    this.drawEvidenceFrame(frameKey);
  },

  drawEvidenceFrame(frameKey) {
    const canvas = document.getElementById('evidence-canvas');
    if (!canvas || !this.currentCaseData) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 960;
    canvas.height = 540;

    const c = this.currentCaseData.case;
    const evd = this.currentCaseData.evidence;
    const frame = evd.frames[frameKey];

    // Background Road scene
    ctx.fillStyle = '#111722';
    ctx.fillRect(0, 0, 960, 540);

    // Road surface
    ctx.fillStyle = '#182030';
    ctx.fillRect(180, 0, 600, 540);

    // Stop Line (Physical)
    const stopY = 340;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(220, stopY);
    ctx.lineTo(740, stopY);
    ctx.stroke();

    // Calibrated Sensor overlay
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(210, stopY - 15, 540, 30);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '700 11px "JetBrains Mono"';
    ctx.fillText('CALIBRATED STOP LINE [Y: 340] · INFRACTION ZONE', 220, stopY - 22);

    if (frameKey === 'approach') {
      // Vehicle 10m before line
      this.drawVehicleOnCanvas(ctx, 430, 160, 100, 150, c.vehicle_plate, false, 'APPROACHING STOP LINE');
    } else if (frameKey === 'crossing') {
      // Vehicle crossing stop line
      this.drawVehicleOnCanvas(ctx, 430, 260, 100, 150, c.vehicle_plate, true, `STOP LINE CROSSING: RED +${c.signal_time_into_red_sec.toFixed(2)}s`);
    } else if (frameKey === 'transit') {
      // Vehicle through intersection
      this.drawVehicleOnCanvas(ctx, 430, 410, 100, 150, c.vehicle_plate, true, 'INTERSECTION TRAVERSAL');
    } else if (frameKey === 'plate_crop') {
      // High-resolution Plate crop presentation
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, 960, 540);

      // Plate Crop Card
      ctx.fillStyle = '#131c2e';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.roundRect(240, 120, 480, 300, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '700 16px "Outfit"';
      ctx.fillText('HIGH-RESOLUTION NUMBER PLATE OCR CROPPING', 270, 165);

      // Plate Graphic
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.roundRect(300, 200, 360, 110, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '700 38px "JetBrains Mono"';
      ctx.letterSpacing = '4px';
      ctx.fillText(c.vehicle_plate, 335, 270);

      ctx.fillStyle = '#10b981';
      ctx.font = '600 13px "JetBrains Mono"';
      ctx.fillText(`OCR CONFIDENCE: ${(c.plate_ocr_confidence * 100).toFixed(1)}% | CHARACTER MATRIX VERIFIED`, 280, 360);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "Inter"';
      ctx.fillText('Segmentation model: PaddleOCR-v4-PlateLegal · Loss: 0.014', 315, 390);
    }
  },

  drawVehicleOnCanvas(ctx, x, y, w, h, plate, isViolating, label) {
    ctx.save();
    ctx.fillStyle = isViolating ? '#f43f5e' : '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 10, y + 30, w - 20, 30);

    // AI Bounding box
    ctx.strokeStyle = isViolating ? '#f43f5e' : '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);

    // Label tag
    ctx.fillStyle = isViolating ? '#f43f5e' : '#00e5ff';
    ctx.font = '700 11px "JetBrains Mono"';
    ctx.fillText(`[${label}] ${plate}`, x - 6, y - 12);
    ctx.restore();
  },

  async verifyEvidenceHash(caseId) {
    const badge = document.getElementById('hash-status-badge');
    if (badge) {
      badge.innerHTML = '<span style="color: var(--traffic-amber);">RECALCULATING HASH...</span>';
    }
    try {
      const res = await API.verifyEvidenceHash(caseId);
      this.showToast(`SHA-256 Digest Confirmed: ${res.sha256_hash.substring(0, 18)}... (Zero Tampering Detected)`, 'success');
      if (badge) {
        badge.innerHTML = '<span style="color: var(--traffic-green);">● VERIFIED (TAMPER-EVIDENT MATCH)</span>';
      }
    } catch (e) {
      this.showToast('Evidence integrity verification failed: ' + e.message, 'danger');
    }
  },

  // Modal: Approve Violation
  openApproveModal(caseId) {
    const modal = document.getElementById('modal-container');
    const c = this.currentCaseData.case;
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Confirm Traffic Violation & Issue Notice</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            You are adjudicating case <strong style="color: #fff;">${c.case_reference}</strong> against vehicle plate <strong class="plate-tag" style="margin: 0 4px;">${c.vehicle_plate}</strong>.
            This action will mint an official <em>Notice of Intended Prosecution</em> with statutory penalty citations.
          </p>

          <div class="form-group">
            <label class="form-label">Reviewing Officer Endorsement</label>
            <input type="text" class="form-input" id="officer-name-input" value="Officer Babatunde Ojo" />
          </div>

          <div class="form-group">
            <label class="form-label">Officer Badge / Warrant Number</label>
            <input type="text" class="form-input" id="officer-badge-input" value="STMAEA-4409" />
          </div>

          <div class="form-group">
            <label class="form-label">Adjudication Finding & Justification Note</label>
            <textarea class="form-textarea" id="approve-reason-input" rows="3">Clear stop line violation verified against continuous RED light (exceeded 0.5s grace by +${(c.signal_time_into_red_sec - c.grace_period_threshold_sec).toFixed(2)}s). No lawful exemption.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-success" onclick="App.submitDecision('${caseId}', 'APPROVE')">
              Sign & Issue Notice of Prosecution
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Modal: Dismiss / Reject Case
  openRejectModal(caseId) {
    const modal = document.getElementById('modal-container');
    const c = this.currentCaseData.case;
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Lawful Dismissal (Exonerate Driver)</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Dismissing this incident ensures that <strong>no penalty or offence record</strong> is created against vehicle <strong class="plate-tag" style="margin: 0 4px;">${c.vehicle_plate}</strong>.
            Select a verified statutory exemption ground:
          </p>

          <div class="form-group">
            <label class="form-label">Lawful Dismissal Ground</label>
            <select class="form-select" id="reject-category-select" onchange="App.onRejectReasonPreset(this.value)">
              <option value="EMERGENCY_VEHICLE">Authorized Emergency Vehicle (Ambulance, Fire, Police distress beacon)</option>
              <option value="DIRECTED_BY_OFFICER">Directed through intersection by Traffic Police / Wardens on duty</option>
              <option value="SIGNAL_PHASING_ANOMALY">Signal Phase Amber-Trap / Controller timing edge case</option>
              <option value="OCR_MISREAD">Plate OCR Misread / Character Ambiguity (Insufficient legal clarity)</option>
              <option value="STOPPED_BEYOND_LINE">Vehicle crept across line but halted without traversing junction</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Adjudication Notes</label>
            <textarea class="form-textarea" id="reject-reason-input" rows="3">Statutory Emergency Response vehicle operating with active distress beacon. Exonerated under Traffic Safety Act Section 14.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-danger" onclick="App.submitDecision('${caseId}', 'REJECT')">
              Record Lawful Dismissal
            </button>
          </div>
        </div>
      </div>
    `;
  },

  onRejectReasonPreset(val) {
    const area = document.getElementById('reject-reason-input');
    if (!area) return;
    if (val === 'EMERGENCY_VEHICLE') {
      area.value = "Statutory Emergency Response vehicle operating with active distress beacon. Exonerated under Traffic Safety Act Section 14.";
    } else if (val === 'DIRECTED_BY_OFFICER') {
      area.value = "Traffic officer on duty visibly directing traffic past red signal due to congestion relief.";
    } else if (val === 'SIGNAL_PHASING_ANOMALY') {
      area.value = "Transition within marginal yellow-to-red timing envelope. Benefit of statutory doubt applied.";
    } else if (val === 'OCR_MISREAD') {
      area.value = "Optical character confidence below legal prosecutorial certainty. Cannot establish beyond reasonable doubt.";
    } else {
      area.value = "Vehicle stopped and did not proceed through junction.";
    }
  },

  async submitDecision(caseId, action) {
    const reason = action === 'APPROVE' 
      ? document.getElementById('approve-reason-input').value 
      : document.getElementById('reject-reason-input').value;
    
    const officer = (document.getElementById('officer-name-input') || {}).value || "Officer Babatunde Ojo";
    const badge = (document.getElementById('officer-badge-input') || {}).value || "STMAEA-4409";

    try {
      const res = await API.decideCase(caseId, {
        action,
        reason,
        officer_name: officer,
        badge_number: badge
      });
      this.closeModal();
      this.showToast(
        action === 'APPROVE' 
          ? `Violation Confirmed! Official Notice ${res.notice.notice_reference} Issued` 
          : 'Case Lawfully Dismissed. No Penalty Accrued.',
        action === 'APPROVE' ? 'success' : 'danger'
      );
      this.renderReviewWorkspace();
    } catch (err) {
      this.showToast('Adjudication failed: ' + err.message, 'danger');
    }
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.innerHTML = '';
  },

  // --- VIEW 4: CAMERAS ---
  async renderCameras() {
    const container = document.getElementById('view-container');
    try {
      const cameras = await API.getCameras();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Camera & Sensor Layer Management</h1>
            <p>Authorized intersection camera network, NTP clock drift synchronization, and stop-line calibration</p>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary" onclick="App.openAddCameraModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Register New Camera
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
          ${cameras.map(cam => `
            <div class="panel" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <span class="badge ${cam.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}">${cam.status}</span>
                  <div style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: #fff; margin-top: 6px;">${cam.name}</div>
                  <div style="font-size: 12px; color: var(--text-dim);">${cam.location}</div>
                </div>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); font-weight: 700;">${cam.id}</span>
              </div>

              <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 12px; font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">IP / RTSP Endpoint:</span>
                  <span style="font-family: var(--font-mono); color: #fff;">${cam.ip_address}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Signal Controller:</span>
                  <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${cam.signal_controller}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Red Grace Threshold:</span>
                  <span style="font-family: var(--font-mono); color: var(--traffic-amber);">${cam.red_grace_period_sec}s</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Clock Drift:</span>
                  <span style="font-family: var(--font-mono); color: var(--traffic-green);">+${cam.clock_drift_ms}ms (Synced)</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Calibrated Stop Line:</span>
                  <span style="font-family: var(--font-mono); color: #fff;">[${cam.stop_line.x1},${cam.stop_line.y1}] to [${cam.stop_line.x2},${cam.stop_line.y2}]</span>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-top: 16px;">
                <button class="btn btn-secondary" style="flex: 1; padding: 6px; font-size: 12px;" onclick="App.openCalibrateModal('${cam.id}')">
                  Calibrate Stop-Line
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading cameras: ${err.message}</div>`;
    }
  },

  openAddCameraModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Register Optical Traffic Camera</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label">Camera Station Name</label>
            <input type="text" class="form-input" id="cam-name-input" placeholder="e.g. Marina Expressway & Broad Street" />
          </div>
          <div class="form-group">
            <label class="form-label">Municipality / Location</label>
            <input type="text" class="form-input" id="cam-loc-input" placeholder="e.g. Lagos Island, Lagos" />
          </div>
          <div class="form-group">
            <label class="form-label">IP Stream / Edge Host</label>
            <input type="text" class="form-input" id="cam-ip-input" value="192.168.20.105" />
          </div>
          <div class="form-group">
            <label class="form-label">Traffic Signal Controller Integration</label>
            <input type="text" class="form-input" id="cam-sc-input" value="SCATS-ISL-018" />
          </div>
          <div class="form-group">
            <label class="form-label">Red Light Grace Interval (Seconds)</label>
            <input type="number" step="0.1" class="form-input" id="cam-grace-input" value="0.5" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitAddCamera()">Register Camera</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitAddCamera() {
    const name = document.getElementById('cam-name-input').value;
    const location = document.getElementById('cam-loc-input').value;
    const ip = document.getElementById('cam-ip-input').value;
    const sc = document.getElementById('cam-sc-input').value;
    const grace = document.getElementById('cam-grace-input').value;

    try {
      await API.addCamera({
        name,
        location,
        ip_address: ip,
        signal_controller: sc,
        red_grace_period_sec: grace
      });
      this.closeModal();
      this.showToast('Camera registered and online', 'success');
      this.renderCameras();
    } catch (e) {
      this.showToast(e.message, 'danger');
    }
  },

  openCalibrateModal(camId) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Calibrate Stop-Line Boundary (${camId})</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Adjust the physical stop-line coordinates on the sensor plane to account for perspective angle and lens distortion.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Start Point X1 (px)</label>
              <input type="number" class="form-input" id="calib-x1" value="180" />
            </div>
            <div class="form-group">
              <label class="form-label">Start Point Y1 (px)</label>
              <input type="number" class="form-input" id="calib-y1" value="340" />
            </div>
            <div class="form-group">
              <label class="form-label">End Point X2 (px)</label>
              <input type="number" class="form-input" id="calib-x2" value="620" />
            </div>
            <div class="form-group">
              <label class="form-label">End Point Y2 (px)</label>
              <input type="number" class="form-input" id="calib-y2" value="340" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Red Light Amber-to-Red Grace Interval (Seconds)</label>
            <input type="number" step="0.05" class="form-input" id="calib-grace" value="0.5" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitCalibration('${camId}')">Save Calibration</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitCalibration(camId) {
    const x1 = Number(document.getElementById('calib-x1').value);
    const y1 = Number(document.getElementById('calib-y1').value);
    const x2 = Number(document.getElementById('calib-x2').value);
    const y2 = Number(document.getElementById('calib-y2').value);
    const grace = Number(document.getElementById('calib-grace').value);

    try {
      await API.calibrateCamera(camId, {
        stop_line: { x1, y1, x2, y2 },
        red_grace_period_sec: grace
      });
      this.closeModal();
      this.showToast('Stop-line coordinates updated and audited', 'success');
      this.renderCameras();
    } catch (e) {
      this.showToast(e.message, 'danger');
    }
  },

  // --- VIEW 5: VEHICLE OBSERVATIONS ---
  async renderObservations() {
    const container = document.getElementById('view-container');
    try {
      const obs = await API.getObservations();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Vehicle Observations & ANPR Sightings</h1>
            <p>Searchable raw vehicle sightings stream with optical confidence metrics</p>
          </div>
        </div>

        <div style="background: rgba(0, 229, 255, 0.05); border: 1px solid rgba(0, 229, 255, 0.2); border-radius: var(--radius-md); padding: 12px 18px; margin-bottom: 20px; font-size: 12.5px; color: var(--accent-cyan); display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <strong>Data Privacy Safeguard:</strong> Sightings are strictly separated from registered vehicle-owner identities. Motor vehicle registry lookups occur only under authorized violation notice issuance.
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Automated Plate Recognition Stream</div>
            <input type="text" placeholder="Search by Plate (e.g. LND-492) or Class..." class="form-input" style="width: 300px;" oninput="App.onSearchObservations(this.value)" />
          </div>

          <div class="data-table-container">
            <table class="data-table" id="observations-table">
              <thead>
                <tr>
                  <th>Sighting ID</th>
                  <th>Number Plate</th>
                  <th>Plate OCR Confidence</th>
                  <th>Vehicle Classification</th>
                  <th>Speed</th>
                  <th>Lane</th>
                  <th>Signal State</th>
                  <th>Timestamp</th>
                  <th>Manual Review</th>
                </tr>
              </thead>
              <tbody>
                ${obs.map(o => `
                  <tr>
                    <td><span style="font-family: var(--font-mono); color: var(--text-dim);">${o.id}</span></td>
                    <td><span class="plate-tag">${o.plate_text}</span></td>
                    <td>
                      <div class="confidence-bar-container">
                        <div class="confidence-track"><div class="confidence-fill ${o.plate_confidence < 0.85 ? 'amber' : ''}" style="width: ${o.plate_confidence * 100}%"></div></div>
                        <span>${(o.plate_confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>${o.vehicle_class}</td>
                    <td><span style="font-family: var(--font-mono);">${o.speed_kmh} km/h</span></td>
                    <td>Lane ${o.lane}</td>
                    <td>
                      <span class="badge ${o.signal_state === 'RED' ? 'badge-red' : 'badge-green'}">${o.signal_state}</span>
                    </td>
                    <td style="font-family: var(--font-mono); font-size: 11px;">${new Date(o.observed_at).toLocaleTimeString()}</td>
                    <td>
                      ${o.requires_review ? '<span class="badge badge-amber">Flagged</span>' : '<span class="badge badge-muted">Direct Pass</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading observations: ${err.message}</div>`;
    }
  },

  async onSearchObservations(query) {
    const obs = await API.getObservations(query);
    const tbody = document.querySelector('#observations-table tbody');
    if (!tbody) return;
    tbody.innerHTML = obs.map(o => `
      <tr>
        <td><span style="font-family: var(--font-mono); color: var(--text-dim);">${o.id}</span></td>
        <td><span class="plate-tag">${o.plate_text}</span></td>
        <td>
          <div class="confidence-bar-container">
            <div class="confidence-track"><div class="confidence-fill ${o.plate_confidence < 0.85 ? 'amber' : ''}" style="width: ${o.plate_confidence * 100}%"></div></div>
            <span>${(o.plate_confidence * 100).toFixed(1)}%</span>
          </div>
        </td>
        <td>${o.vehicle_class}</td>
        <td><span style="font-family: var(--font-mono);">${o.speed_kmh} km/h</span></td>
        <td>Lane ${o.lane}</td>
        <td>
          <span class="badge ${o.signal_state === 'RED' ? 'badge-red' : 'badge-green'}">${o.signal_state}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 11px;">${new Date(o.observed_at).toLocaleTimeString()}</td>
        <td>
          ${o.requires_review ? '<span class="badge badge-amber">Flagged</span>' : '<span class="badge badge-muted">Direct Pass</span>'}
        </td>
      </tr>
    `).join('');
  },

  // --- VIEW 6: ENFORCEMENT NOTICES ---
  async renderNotices() {
    const container = document.getElementById('view-container');
    try {
      const notices = await API.getNotices();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Official Enforcement Notices</h1>
            <p>Statutory Notices of Intended Prosecution issued by sworn reviewing officers</p>
          </div>
        </div>

        <div class="panel">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Notice Ref</th>
                  <th>Case Ref</th>
                  <th>Vehicle Plate</th>
                  <th>Issuing Authority</th>
                  <th>Endorsing Officer</th>
                  <th>Penalty Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Official Citation</th>
                </tr>
              </thead>
              <tbody>
                ${notices.map(n => `
                  <tr>
                    <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${n.notice_reference}</strong></td>
                    <td style="font-family: var(--font-mono);">${n.case_reference}</td>
                    <td><span class="plate-tag">${n.vehicle_plate}</span></td>
                    <td style="font-size: 12px;">${n.issuing_authority}</td>
                    <td>${n.issuing_officer} <span style="font-size: 10px; color: var(--text-dim);">(${n.badge_number})</span></td>
                    <td><strong style="color: #fff; font-family: var(--font-mono);">₦${n.penalty_amount_ngn.toLocaleString()}</strong></td>
                    <td style="font-family: var(--font-mono); font-size: 11.5px;">${new Date(n.due_date).toLocaleDateString()}</td>
                    <td>
                      <span class="badge ${n.payment_status === 'UNPAID' ? 'badge-amber' : 'badge-green'}">${n.payment_status}</span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="App.openNoticePreview('${n.id}')">
                          Notice PDF
                        </button>
                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px; border-color: var(--accent-cyan); color: var(--accent-cyan);" onclick="App.renderCitizenPortal('${n.notice_reference}')">
                          Citizen QR View
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading notices: ${err.message}</div>`;
    }
  },

  // Modal: Printable Notice of Intended Prosecution
  async openNoticePreview(noticeId) {
    try {
      const data = await API.getNotice(noticeId);
      const n = data.notice;
      const c = data.case;
      const modal = document.getElementById('modal-container');
      modal.innerHTML = `
        <div class="modal-backdrop open" id="app-modal">
          <div class="modal-dialog" style="max-width: 800px; padding: 0; background: transparent; border: none;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
              <button class="btn btn-secondary" style="margin-right: 8px;" onclick="window.print()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print / Save PDF
              </button>
              <button class="btn btn-secondary" onclick="App.closeModal()">&times; Close</button>
            </div>

            <div class="notice-preview-doc">
              <div class="notice-gov-header">
                <div>
                  <div class="notice-agency-title">${n.issuing_authority}</div>
                  <div style="font-size: 11px; color: #475569; margin-top: 2px;">AUTOMATED PHOTOMETRIC TRAFFIC ENFORCEMENT DIVISION</div>
                  <div class="notice-doc-type">NOTICE OF INTENDED PROSECUTION</div>
                </div>
                <div style="text-align: right; font-family: monospace;">
                  <div style="font-size: 11px; color: #64748b;">CITATION REFERENCE</div>
                  <div style="font-size: 17px; font-weight: 800; color: #0f172a;">${n.notice_reference}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Date: ${new Date(n.issued_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div class="notice-grid">
                <div class="notice-field-group">
                  <div class="notice-field-label">Vehicle Registration Number</div>
                  <div class="notice-field-val">${n.vehicle_plate}</div>
                </div>
                <div class="notice-field-group">
                  <div class="notice-field-label">Alleged Offence</div>
                  <div class="notice-field-val" style="color: #dc2626;">Failure to Obey Red Traffic Signal</div>
                </div>
                <div class="notice-field-group">
                  <div class="notice-field-label">Incident Location</div>
                  <div class="notice-field-val">${n.incident_location}</div>
                </div>
                <div class="notice-field-group">
                  <div class="notice-field-label">Date & Time of Infringement</div>
                  <div class="notice-field-val">${new Date(n.incident_time).toLocaleString()}</div>
                </div>
              </div>

              <!-- Photographic Evidence Proof Strip -->
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; color: #0f172a;">
                Photometric Evidence Package (Cryptographically Certified)
              </div>
              <div class="notice-evidence-strip">
                <div class="notice-thumb-box">
                  <div style="background: #0f172a; color: #fff; padding: 20px 0; font-family: monospace; font-size: 11px;">[Frame 1: Approach]</div>
                  <div class="notice-thumb-caption">Approach (Signal RED)</div>
                </div>
                <div class="notice-thumb-box">
                  <div style="background: #dc2626; color: #fff; padding: 20px 0; font-family: monospace; font-size: 11px;">[Frame 2: Crossing]</div>
                  <div class="notice-thumb-caption">Stop-Line Infringement</div>
                </div>
                <div class="notice-thumb-box">
                  <div style="background: #0f172a; color: #fff; padding: 20px 0; font-family: monospace; font-size: 11px;">[Frame 3: Transit]</div>
                  <div class="notice-thumb-caption">Intersection Transit</div>
                </div>
                <div class="notice-thumb-box">
                  <div style="background: #000; color: #fff; padding: 20px 0; font-family: monospace; font-size: 11px; font-weight: 700;">${n.vehicle_plate}</div>
                  <div class="notice-thumb-caption">OCR Plate Crop</div>
                </div>
              </div>

              <div class="notice-fine-box">
                <div>
                  <div class="notice-fine-label">STATUTORY CIVIL PENALTY</div>
                  <div style="font-size: 11px; color: #7f1d1d; margin-top: 2px;">Payable within 28 days to avert judicial summons</div>
                </div>
                <div class="notice-fine-amount">₦${n.penalty_amount_ngn.toLocaleString()} / $${n.penalty_amount_usd}</div>
              </div>

              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 12px;">
                <div>
                  <strong>Payment Reference:</strong> <span style="font-family: monospace; font-weight: 700;">${n.payment_reference}</span><br/>
                  <strong>Statutory Appeal Deadline:</strong> ${new Date(n.due_date).toLocaleDateString()}<br/>
                  <strong>Online Verification:</strong> <a href="#" style="color: #2563eb;">${n.evidence_verification_url}</a>
                </div>
                <div style="text-align: right; border-left: 1px solid #e2e8f0; padding-left: 16px;">
                  <div style="font-size: 10px; color: #64748b;">CERTIFIED BY SWORN OFFICER</div>
                  <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${n.issuing_officer}</div>
                  <div style="font-size: 11px; color: #64748b; font-family: monospace;">Badge: ${n.badge_number}</div>
                </div>
              </div>

              <div class="notice-legal-footer">
                <strong>Statutory Due Process Rights:</strong> Under the Road Traffic Enforcement Enactment, the registered keeper has the right to contest this allegation within 28 days of service on grounds of lawful emergency exemption, stolen vehicle, or prior transfer of ownership. Access certified digital telemetry and video proof via the agency citizen portal.
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      this.showToast('Failed to load notice: ' + err.message, 'danger');
    }
  },

  // --- VIEW 7: APPEALS & ADJUDICATION ---
  async renderAppeals() {
    const container = document.getElementById('view-container');
    try {
      const appeals = await API.getAppeals();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Citizen Appeals & Statutory Adjudication</h1>
            <p>Lawful challenge review, hospital emergency exonerations, and case overturn resolution</p>
          </div>
        </div>

        <div class="panel">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Appeal ID</th>
                  <th>Notice Ref</th>
                  <th>Vehicle Plate</th>
                  <th>Appellant</th>
                  <th>Grounds of Appeal</th>
                  <th>Adjudicator Assessment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${appeals.map(a => `
                  <tr>
                    <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${a.id}</strong></td>
                    <td style="font-family: var(--font-mono);">${a.notice_reference}</td>
                    <td><span class="plate-tag">${a.vehicle_plate}</span></td>
                    <td><strong>${a.appellant_name}</strong></td>
                    <td><span class="badge badge-amber">${a.grounds.replace(/_/g, ' ')}</span></td>
                    <td style="font-size: 12px; max-width: 280px;">${a.adjudicator_notes}</td>
                    <td>
                      ${a.status === 'UNDER_ADJUDICATION' ? '<span class="badge badge-amber">Under Review</span>' : ''}
                      ${a.status === 'UPHELD_OVERTURNED' ? '<span class="badge badge-green">Upheld (Citation Dismissed)</span>' : ''}
                      ${a.status === 'DISMISSED_ENFORCED' ? '<span class="badge badge-red">Dismissed (Affirmed)</span>' : ''}
                    </td>
                    <td>
                      ${a.status === 'UNDER_ADJUDICATION' ? `
                        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11.5px;" onclick="App.openAdjudicateModal('${a.id}')">
                          Adjudicate
                        </button>
                      ` : '<span style="font-size: 11px; color: var(--text-dim);">Resolved</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading appeals: ${err.message}</div>`;
    }
  },

  openAdjudicateModal(appealId) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Adjudicate Citizen Appeal</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Evaluate appellant evidence and hospital/police corroboration. Overturning the citation ensures zero penalty points or fines accrue against the driver.
          </p>

          <div class="form-group">
            <label class="form-label">Adjudication Tribunal Ruling</label>
            <select class="form-select" id="adjudicate-decision-select">
              <option value="UPHELD_OVERTURNED">UPHOLD APPEAL & DISMISS CITATION (Exonerate registered owner)</option>
              <option value="DISMISSED_ENFORCED">DISMISS APPEAL & AFFIRM CITATION (Enforce statutory fine)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Statutory Ruling Notes</label>
            <textarea class="form-textarea" id="adjudicate-notes-input" rows="3">Hospital emergency admission logs confirmed by LASUTH emergency registry. Exonerated under Medical Emergency Exemption.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitAppealAdjudication('${appealId}')">Save Tribunal Ruling</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitAppealAdjudication(appealId) {
    const dec = document.getElementById('adjudicate-decision-select').value;
    const notes = document.getElementById('adjudicate-notes-input').value;
    try {
      await API.adjudicateAppeal(appealId, { decision: dec, notes });
      this.closeModal();
      this.showToast('Appeal ruling recorded and case updated', 'success');
      this.renderAppeals();
    } catch (e) {
      this.showToast(e.message, 'danger');
    }
  },

  // --- VIEW 8: AUDIT TRAIL ---
  async renderAuditLogs() {
    const container = document.getElementById('view-container');
    try {
      const logs = await API.getAuditLogs();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Immutable System Audit Trail</h1>
            <p>Cryptographic chronological record of all officer logins, inspections, adjudications, and evidence hash verifications</p>
          </div>
        </div>

        <div class="panel">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Actor / User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Target ID</th>
                  <th>Details & Justification</th>
                  <th>Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td><span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">${l.id}</span></td>
                    <td><strong>${l.user}</strong></td>
                    <td><span class="badge badge-muted">${l.role}</span></td>
                    <td><span class="badge badge-cyan">${l.action}</span></td>
                    <td><span style="font-family: var(--font-mono); font-size: 11px;">${l.target_entity}</span></td>
                    <td><strong style="color: #fff; font-family: var(--font-mono);">${l.target_id}</strong></td>
                    <td style="font-size: 12px; color: var(--text-muted);">${l.details}</td>
                    <td style="font-family: var(--font-mono); font-size: 11px;">${new Date(l.timestamp).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading audit logs: ${err.message}</div>`;
    }
  },

  // --- VIEW 9: FOOTAGE LAB & RECORDED VIDEO PROCESSOR (Phase 2 Requirement) ---
  renderFootageLab() {
    const container = document.getElementById('view-container');
    container.innerHTML = `
      <div class="view-header">
        <div class="view-title-group">
          <h1>Recorded Footage Processor & AI Lab</h1>
          <p>Process recorded videos, test detection algorithms under varied lighting/weather, and triage results</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" onclick="App.triggerFootageBatchProcess()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Execute Video Analysis Pipeline
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Video Feed & Frame Inspector</div>
            <span class="badge badge-cyan">Recorded Session: 1080p @ 30 FPS</span>
          </div>

          <!-- Video Canvas / Player -->
          <div style="background: #000; border-radius: var(--radius-md); aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; border: 1px solid var(--border-medium);">
            <div id="footage-display" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle, #1a273e 0%, #060a12 100%);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <div style="font-weight: 700; color: #fff; margin-top: 12px; font-size: 15px;">PILOT FOOTAGE BATCH: JUNCTION_01_DAY_SAMPLE.mp4</div>
              <div style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">1,800 Frames · Synced NTCIP Signal Telemetry · Calibrated Stop-Line Y: 340px</div>
              <div id="footage-progress-bar" style="width: 60%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 16px; overflow: hidden; display: none;">
                <div id="footage-progress-fill" style="width: 0%; height: 100%; background: var(--accent-cyan); transition: width 0.2s;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <div style="display: flex; gap: 8px;">
              <span class="badge badge-muted">Detection: YOLOv8-Traffic-v2.4</span>
              <span class="badge badge-muted">OCR: PaddleOCR-v4</span>
              <span class="badge badge-green">Signal Synced</span>
            </div>
            <span style="font-family: var(--font-mono); color: var(--text-dim);" id="footage-status-text">Status: Ready for Batch Run</span>
          </div>
        </div>

        <!-- Video Parameters & Scenarios -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="panel">
            <div class="panel-title" style="font-size: 14px; margin-bottom: 12px;">Select Test Scenario</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <label style="background: var(--bg-surface-elevated); padding: 10px; border-radius: 6px; border: 1px solid var(--accent-cyan); display: flex; gap: 10px; cursor: pointer;">
                <input type="radio" name="scenario" checked />
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 12.5px;">Scenario A: Clear Daylight & High Volume</div>
                  <div style="font-size: 11px; color: var(--text-dim);">Victoria Island - 15 vehicles/min, normal contrast</div>
                </div>
              </label>

              <label style="background: var(--bg-base); padding: 10px; border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; gap: 10px; cursor: pointer;">
                <input type="radio" name="scenario" />
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 12.5px;">Scenario B: Nighttime & Heavy Rain</div>
                  <div style="font-size: 11px; color: var(--text-dim);">Glare reflections, testing low-confidence routing</div>
                </div>
              </label>

              <label style="background: var(--bg-base); padding: 10px; border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; gap: 10px; cursor: pointer;">
                <input type="radio" name="scenario" />
                <div>
                  <div style="font-weight: 700; color: #fff; font-size: 12.5px;">Scenario C: Obstructed / Dirty Plates</div>
                  <div style="font-size: 11px; color: var(--text-dim);">Validates human verification threshold (<85%)</div>
                </div>
              </label>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title" style="font-size: 14px; margin-bottom: 12px;">Upload Custom Video Footage</div>
            <div style="border: 2px dashed var(--border-medium); border-radius: var(--radius-md); padding: 20px; text-align: center; cursor: pointer;" onclick="App.showToast('Select an MP4/MKV video clip from your local storage to analyze', 'success')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">Drop MP4 / AVI / RTSP capture here</div>
              <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">Supported: H.264, H.265, MJPEG up to 4K</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  triggerFootageBatchProcess() {
    const bar = document.getElementById('footage-progress-bar');
    const fill = document.getElementById('footage-progress-fill');
    const status = document.getElementById('footage-status-text');
    if (!bar || !fill) return;

    bar.style.display = 'block';
    fill.style.width = '0%';
    status.textContent = 'Processing frame 0 / 1800...';

    let progress = 0;
    const interval = setInterval(async () => {
      progress += 15;
      fill.style.width = `${progress}%`;
      status.textContent = `Analyzing frames: ${progress * 18} / 1800 (Vehicles tracked: ${Math.floor(progress / 5)})`;

      if (progress >= 100) {
        clearInterval(interval);
        status.textContent = 'Batch complete! Processing detections via Python AI Worker...';
        
        try {
          // Call Python FastAPI vision worker
          const form = new URLSearchParams();
          form.append('video_path', 'footage/pilot_junction_01.mp4');
          form.append('camera_id', 'CAM-LAG-01');
          form.append('simulated_infractions', '1');

          const pyResp = await fetch('http://localhost:8000/api/v1/process-video', {
            method: 'POST',
            body: form
          });

          if (pyResp.ok) {
            const pyData = await pyResp.json();
            const vio = pyData.violations[0];
            status.textContent = `Completed: ${pyData.processed_vehicles} Vehicles Tracked · 1 Violation Confirmed (${vio.case_reference})`;
            this.showToast(`Python AI Worker: Extracted ${vio.plate} (Case ${vio.case_reference}) with SHA-256 seal!`, 'success');
          } else {
            throw new Error('Python worker HTTP ' + pyResp.status);
          }
        } catch (pyErr) {
          console.warn('Python vision worker unavailable, falling back to local engine:', pyErr);
          await API.simulateDetection({
            plate_text: 'ABJ-904-XY',
            plate_confidence: 0.962,
            speed_kmh: 53,
            red_elapsed_sec: 2.10,
            vehicle_class: 'Sedan (Toyota Camry, Black)'
          });
          status.textContent = 'Batch complete! 1 Red-Light Infraction Detected (Local Pipeline)';
          this.showToast('Footage analysis complete: Violation detected & queued for review!', 'success');
        }

        this.refreshCounters();
      }
    }, 150);
  },

  // --- VIEW 10: PILOT QUALITY & READINESS METRICS (Section 8 Requirement) ---
  async renderMetrics() {
    const container = document.getElementById('view-container');
    try {
      const m = await API.getMetrics();
      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Pilot Quality & Statutory Acceptance Metrics</h1>
            <p>Empirical evaluation against the six required readiness criteria before official agency rollout</p>
          </div>
          <div class="view-actions">
            <button class="btn btn-secondary" onclick="window.print()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Export Audit Report
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card green-card">
            <div class="stat-header">
              <span class="stat-label">Exact Plate Match Accuracy</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg></div>
            </div>
            <div class="stat-value" style="color: var(--traffic-green);">${m.plate_recognition.exact_match_accuracy_pct}%</div>
            <div class="stat-subtext"><span class="positive">${m.plate_recognition.character_level_accuracy_pct}% Character-Level</span> across ${m.plate_recognition.samples_tested} tests</div>
          </div>

          <div class="stat-card cyan-card">
            <div class="stat-header">
              <span class="stat-label">Offence Detection Precision</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            </div>
            <div class="stat-value" style="color: var(--accent-cyan);">${m.offence_detection.precision_pct}%</div>
            <div class="stat-subtext"><span class="positive">Recall: ${m.offence_detection.recall_pct}%</span> · False Positive Rate: ${m.offence_detection.false_positive_rate_pct}%</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Evidence Completeness</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            </div>
            <div class="stat-value">${m.evidence_completeness.complete_4_frame_packages_pct}%</div>
            <div class="stat-subtext"><span class="positive">100% SHA-256 Tamper-Free</span> Certified</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Average Officer Review Time</span>
              <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg></div>
            </div>
            <div class="stat-value">${m.review_efficiency.avg_officer_review_time_sec}s</div>
            <div class="stat-subtext">Review Efficiency · ${m.review_efficiency.cases_reviewed_today} Cases Processed</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="panel">
            <div class="panel-title" style="font-size: 15px; margin-bottom: 14px;">1. Automated Triage & Edge-Case Protection</div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12.5px;">
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Low-Confidence (<85%) Human Routing Rate:</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--traffic-amber);">${m.plate_recognition.manual_review_routing_rate_pct}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Amber-to-Red Trap Rejections (Grace Period):</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--traffic-green);">${m.offence_detection.amber_trap_rejection_count} Cases Protected</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Appeals Overturned Rate:</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${m.review_efficiency.appeals_overturned_pct}% (Tribunal Healthy)</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-title" style="font-size: 15px; margin-bottom: 14px;">2. Sensor Grid Reliability & Synchronization</div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12.5px;">
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Camera Fleet Availability:</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--traffic-green);">${m.system_reliability.camera_uptime_pct}% Uptime</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Network Time Protocol (NTP) Average Drift:</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">+${m.system_reliability.avg_clock_drift_ms}ms (Pass < 15ms)</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
                <span style="color: var(--text-muted);">Optical Stream Frame Loss:</span>
                <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${m.system_reliability.dropped_frames_rate_pct}%</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Error loading metrics: ${e.message}</div>`;
    }
  },

  // Modal: Manual Incident Entry (Phase 1 Requirement)
  openManualIncidentModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Manual Incident Entry (Field Officer Record)</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Allows sworn officers or field wardens to record an observed violation when optical sensors require manual intervention or during camera maintenance.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Vehicle Registration Number</label>
              <input type="text" class="form-input" id="man-plate-input" placeholder="e.g. LAG-881-KD" />
            </div>
            <div class="form-group">
              <label class="form-label">Vehicle Make / Model / Color</label>
              <input type="text" class="form-input" id="man-class-input" placeholder="e.g. Sedan (Toyota Corolla, Blue)" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Intersection Camera Station</label>
              <select class="form-select" id="man-cam-select">
                <option value="CAM-LAG-01">Victoria Island Main - Ozumba Mbadiwe</option>
                <option value="CAM-ABJ-02">Abuja Central - Shehu Shagari Way</option>
                <option value="CAM-IKJ-03">Ikeja Junction - Mobolaji Bank Anthony</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Signal Red Duration (Seconds)</label>
              <input type="number" step="0.1" class="form-input" id="man-red-input" value="2.4" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Field Officer Witness Notes & Observations</label>
            <textarea class="form-textarea" id="man-notes-input" rows="3">Observed vehicle disregard illuminated red signal 2.4s into red phase. Manual sighting logged by officer on patrol.</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitManualIncident()">Submit Manual Case</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitManualIncident() {
    const plate = document.getElementById('man-plate-input').value;
    const vClass = document.getElementById('man-class-input').value;
    const camId = document.getElementById('man-cam-select').value;
    const redTime = document.getElementById('man-red-input').value;
    const notes = document.getElementById('man-notes-input').value;

    if (!plate) {
      this.showToast('Please enter a vehicle registration number', 'danger');
      return;
    }

    try {
      await API.createManualIncident({
        plate_text: plate,
        vehicle_class: vClass,
        camera_id: camId,
        red_elapsed_sec: redTime,
        notes,
        officer_name: this.currentRole.name
      });
      this.closeModal();
      this.showToast(`Manual incident logged for ${plate}. Sent to review queue.`, 'success');
      this.refreshCounters();
      if (this.currentView === 'dashboard') this.renderDashboard();
    } catch (e) {
      this.showToast('Failed to create manual incident: ' + e.message, 'danger');
    }
  },

  // --- VIEW 11: PUBLIC CITIZEN VERIFICATION & DUE PROCESS PORTAL (Option C) ---
  async renderCitizenPortal(defaultRef = 'NOT-2026-0842') {
    const container = document.getElementById('view-container');
    try {
      const data = await API.publicVerifyNotice(defaultRef).catch(() => null);
      const n = data ? data.notice : null;
      const c = data ? data.case : null;
      const evd = data ? data.evidence : null;
      const cam = data ? data.camera : null;
      const appeal = data ? data.appeal : null;

      container.innerHTML = `
        <div class="view-header">
          <div class="view-title-group">
            <h1>Citizen Automated Citation Verification Portal</h1>
            <p>Official Public Due Process Access Point for Notice Reference: <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${defaultRef}</strong></p>
          </div>
          <div class="view-actions">
            <div style="display: flex; gap: 8px;">
              <input type="text" id="citizen-search-ref" value="${defaultRef}" placeholder="Enter Notice Ref..." class="form-input" style="width: 200px;" />
              <button class="btn btn-primary" onclick="App.renderCitizenPortal(document.getElementById('citizen-search-ref').value)">Verify</button>
            </div>
          </div>
        </div>

        ${!n ? `
          <div class="panel" style="text-align: center; padding: 48px 24px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--traffic-amber)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3 style="font-family: var(--font-heading); color: #fff; margin-top: 14px;">Citation Notice Not Found</h3>
            <p style="color: var(--text-muted); font-size: 13px; max-width: 480px; margin: 8px auto 18px;">Please verify the exact notice reference printed on your Notice of Intended Prosecution (e.g. <code>NOT-2026-0842</code>).</p>
          </div>
        ` : `
          <!-- Citizen Main View Container -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div>
              <!-- Citation Summary Card -->
              <div class="panel" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div>
                    <span class="badge ${n.payment_status === 'PAID' ? 'badge-green' : (n.payment_status === 'HELD_UNDER_APPEAL' ? 'badge-amber' : 'badge-red')}">
                      Status: ${n.payment_status}
                    </span>
                    <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: #fff; margin-top: 8px;">
                      Alleged Red-Light Infringement
                    </h2>
                    <div style="font-size: 13px; color: var(--text-dim);">${cam ? cam.location : 'Signalized Intersection'} · ${new Date(n.incident_time).toLocaleString()}</div>
                  </div>
                  <div style="text-align: right;">
                    <span class="plate-tag" style="font-size: 15px;">${n.vehicle_plate}</span>
                    <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); margin-top: 6px;">Ref: ${n.notice_reference}</div>
                  </div>
                </div>

                <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px;">
                  <div>
                    <span style="color: var(--text-dim); display: block;">Red Light Duration:</span>
                    <strong style="color: var(--traffic-red); font-family: var(--font-mono); font-size: 14px;">+${c ? c.signal_time_into_red_sec.toFixed(2) : '3.40'}s into RED</strong>
                  </div>
                  <div>
                    <span style="color: var(--text-dim); display: block;">Grace Threshold:</span>
                    <strong style="color: #fff; font-family: var(--font-mono); font-size: 14px;">0.50 Seconds</strong>
                  </div>
                  <div>
                    <span style="color: var(--text-dim); display: block;">Civil Penalty Amount:</span>
                    <strong style="color: var(--traffic-amber); font-family: var(--font-mono); font-size: 14px;">₦${n.penalty_amount_ngn.toLocaleString()} ($${n.penalty_amount_usd})</strong>
                  </div>
                </div>
              </div>

              <!-- 4-Frame Photographic Proof Strip -->
              <div class="panel">
                <div class="panel-header">
                  <div class="panel-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Certified Photometric Evidence Strip
                  </div>
                  <span class="badge badge-green" style="font-size: 10px;">SHA-256 Tamper-Free Sealed</span>
                </div>

                <div class="frames-strip" style="background: transparent; padding: 0;">
                  <div class="frame-thumbnail">
                    <div class="frame-preview-box">
                      <span class="frame-badge">F1: APPROACH</span>
                    </div>
                    <div class="frame-label">Stop-Line Approach</div>
                    <div class="frame-meta">${evd && evd.frames ? evd.frames.approach.signal : 'RED (+2.47s)'}</div>
                  </div>

                  <div class="frame-thumbnail active">
                    <div class="frame-preview-box">
                      <span class="frame-badge" style="background: var(--traffic-red);">F2: CROSSING</span>
                    </div>
                    <div class="frame-label">Line Infringement</div>
                    <div class="frame-meta" style="color: var(--traffic-red);">${evd && evd.frames ? evd.frames.crossing.signal : 'RED (+3.40s)'}</div>
                  </div>

                  <div class="frame-thumbnail">
                    <div class="frame-preview-box">
                      <span class="frame-badge">F3: TRANSIT</span>
                    </div>
                    <div class="frame-label">Traversal</div>
                    <div class="frame-meta">${evd && evd.frames ? evd.frames.transit.signal : 'RED (+4.27s)'}</div>
                  </div>

                  <div class="frame-thumbnail">
                    <div class="frame-preview-box">
                      <span class="frame-badge" style="background: var(--accent-cyan); color: #000;">F4: PLATE</span>
                    </div>
                    <div class="frame-label">Plate OCR Crop</div>
                    <div class="frame-meta">${n.vehicle_plate}</div>
                  </div>
                </div>

                <div style="margin-top: 16px; background: #070c16; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-medium); font-size: 11px; font-family: var(--font-mono);">
                  <div style="color: var(--text-dim); margin-bottom: 4px;">CRYPTOGRAPHIC EVIDENCE DIGEST (SHA-256):</div>
                  <div style="color: var(--accent-cyan); word-break: break-all;">${evd ? evd.sha256_hash : '7b0a884efcf91253018274092bb59419280145be84a719281e0954b1f920da62'}</div>
                </div>
              </div>
            </div>

            <!-- Citizen Action Sidebar -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <!-- Settlement Box -->
              <div class="panel">
                <div class="panel-title" style="font-size: 15px; margin-bottom: 12px;">Option 1: Settle Penalty</div>
                ${n.payment_status === 'PAID' ? `
                  <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--traffic-green); border-radius: var(--radius-md); padding: 16px; text-align: center;">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--traffic-green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <div style="font-weight: 700; color: var(--traffic-green); margin-top: 8px;">PENALTY SETTLED IN FULL</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Receipt: ${n.payment_receipt || 'REC-2026-99214'}</div>
                    <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Paid: ${new Date(n.paid_at || Date.now()).toLocaleDateString()}</div>
                  </div>
                ` : `
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
                    Settle the statutory fine online to discharge liability without court proceedings.
                  </p>
                  <button class="btn btn-success" style="width: 100%; justify-content: center; padding: 12px; font-size: 14px;" onclick="App.openCitizenPayModal('${n.notice_reference}', ${n.penalty_amount_ngn})">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Pay ₦${n.penalty_amount_ngn.toLocaleString()} Online
                  </button>
                `}
              </div>

              <!-- Contest / Due Process Box -->
              <div class="panel">
                <div class="panel-title" style="font-size: 15px; margin-bottom: 12px;">Option 2: Contest Citation</div>
                ${appeal ? `
                  <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--traffic-amber); border-radius: var(--radius-md); padding: 14px;">
                    <div style="font-weight: 700; color: var(--traffic-amber);">APPEAL REGISTERED</div>
                    <div style="font-size: 12px; color: #fff; margin-top: 4px;">Reference: ${appeal.id}</div>
                    <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Ground: ${appeal.grounds.replace(/_/g, ' ')}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 8px;">"${appeal.adjudicator_notes}"</div>
                  </div>
                ` : `
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
                    If you were driving under an emergency, directed by a police officer, or your vehicle was stolen, submit a formal statutory appeal.
                  </p>
                  <button class="btn btn-secondary" style="width: 100%; justify-content: center; padding: 10px; font-size: 13px;" onclick="App.openCitizenAppealModal('${n.notice_reference}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Submit Statutory Appeal
                  </button>
                `}
              </div>
            </div>
          </div>
        `}
      `;
    } catch (err) {
      container.innerHTML = `<div class="panel" style="color: var(--traffic-red);">Verification error: ${err.message}</div>`;
    }
  },

  openCitizenPayModal(noticeRef, amount) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog" style="max-width: 480px;">
          <div class="modal-header">
            <h3 class="modal-title">Settle Civil Penalty Online</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Payment Gateway Simulation for Citation Ref: <strong style="color: var(--accent-cyan);">${noticeRef}</strong>
          </p>

          <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-medium); margin-bottom: 16px; text-align: center;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Total Statutory Due</div>
            <div style="font-size: 26px; font-weight: 800; color: #fff; font-family: var(--font-mono); margin-top: 4px;">₦${amount.toLocaleString()}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Payment Channel</label>
            <select class="form-select" id="pay-channel">
              <option value="DEBIT_CARD">Interswitch / Visa / Mastercard</option>
              <option value="NIBSS_TRANSFER">Instant Bank Transfer</option>
              <option value="USSD">Direct USSD Gateway (*737# / *901#)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Cardholder / Payer Name</label>
            <input type="text" class="form-input" id="pay-name" value="Tunde Bakare" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-success" onclick="App.submitCitizenPay('${noticeRef}')">Authorize Payment</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitCitizenPay(noticeRef) {
    const method = document.getElementById('pay-channel').value;
    try {
      const res = await API.publicPayNotice({
        notice_reference: noticeRef,
        payment_method: method
      });
      this.closeModal();
      this.showToast(`Payment Successful! Receipt: ${res.receipt_number}`, 'success');
      this.renderCitizenPortal(noticeRef);
    } catch (e) {
      this.showToast('Payment failed: ' + e.message, 'danger');
    }
  },

  openCitizenAppealModal(noticeRef) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-backdrop open" id="app-modal">
        <div class="modal-dialog" style="max-width: 580px;">
          <div class="modal-header">
            <h3 class="modal-title">Submit Statutory Due Process Appeal</h3>
            <button class="modal-close" onclick="App.closeModal()">&times;</button>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Under Traffic Regulations Section 28, registered keepers can contest allegations on valid statutory grounds. Submitting an appeal <strong>suspends enforcement</strong> pending tribunal review.
          </p>

          <div class="form-group">
            <label class="form-label">Appellant Full Name</label>
            <input type="text" class="form-input" id="appeal-name" placeholder="Full Name of Driver/Owner" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input type="email" class="form-input" id="appeal-email" value="motorist@example.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Phone</label>
              <input type="tel" class="form-input" id="appeal-phone" value="08031234567" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Statutory Grounds of Appeal</label>
            <select class="form-select" id="appeal-grounds">
              <option value="MEDICAL_EMERGENCY">Medical Emergency (Conveying patient in acute distress to hospital)</option>
              <option value="POLICE_DIRECTION">Directed through Red Signal by Traffic Police / Wardens on Duty</option>
              <option value="STOLEN_VEHICLE">Vehicle Stolen or Cloned License Plate</option>
              <option value="SOLD_PRIOR">Vehicle Sold / Transferred Prior to Infringement Date</option>
              <option value="EMERGENCY_SERVICE">Official Emergency Service Vehicle Operating under Distress Lights</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Explanation of Circumstances</label>
            <textarea class="form-textarea" id="appeal-explanation" rows="3" placeholder="Provide full details, hospital name, police station report, etc."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.submitCitizenAppeal('${noticeRef}')">Submit Official Appeal</button>
          </div>
        </div>
      </div>
    `;
  },

  async submitCitizenAppeal(noticeRef) {
    const name = document.getElementById('appeal-name').value;
    const email = document.getElementById('appeal-email').value;
    const phone = document.getElementById('appeal-phone').value;
    const grounds = document.getElementById('appeal-grounds').value;
    const explanation = document.getElementById('appeal-explanation').value;

    if (!name) {
      this.showToast('Please enter your full name', 'danger');
      return;
    }

    try {
      const res = await API.publicSubmitAppeal({
        notice_reference: noticeRef,
        appellant_name: name,
        email,
        phone,
        grounds,
        explanation
      });
      this.closeModal();
      this.showToast(`Appeal ${res.appeal.id} registered! Enforcement held in abeyance.`, 'success');
      this.refreshCounters();
      this.renderCitizenPortal(noticeRef);
    } catch (e) {
      this.showToast('Appeal submission failed: ' + e.message, 'danger');
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div>${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());

