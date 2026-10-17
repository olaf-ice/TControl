// ==========================================================================
// AI Traffic Intelligence Platform (TControl) - API Client
// ==========================================================================

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  getStats() {
    return this.request('/stats');
  },

  getCameras() {
    return this.request('/cameras');
  },

  addCamera(cameraData) {
    return this.request('/cameras', {
      method: 'POST',
      body: JSON.stringify(cameraData)
    });
  },

  calibrateCamera(id, calibData) {
    return this.request(`/cameras/${id}/calibrate`, {
      method: 'PUT',
      body: JSON.stringify(calibData)
    });
  },

  getObservations(search = '') {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/observations${q}`);
  },

  getCases(status = '') {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/cases${q}`);
  },

  getCase(id) {
    return this.request(`/cases/${id}`);
  },

  verifyEvidenceHash(id) {
    return this.request(`/cases/${id}/verify-hash`, {
      method: 'POST'
    });
  },

  decideCase(id, decisionData) {
    return this.request(`/cases/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify(decisionData)
    });
  },

  getNotices() {
    return this.request('/notices');
  },

  getNotice(id) {
    return this.request(`/notices/${id}`);
  },

  getAppeals() {
    return this.request('/appeals');
  },

  adjudicateAppeal(id, appealData) {
    return this.request(`/appeals/${id}/adjudicate`, {
      method: 'POST',
      body: JSON.stringify(appealData)
    });
  },

  getAuditLogs() {
    return this.request('/audit-logs');
  },

  simulateDetection(detectionData) {
    return this.request('/simulate/detect', {
      method: 'POST',
      body: JSON.stringify(detectionData)
    });
  },

  createManualIncident(incidentData) {
    return this.request('/incidents/manual', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  },

  getMetrics() {
    return this.request('/metrics');
  },

  getExportBundleUrl(caseId) {
    return `${this.baseUrl}/cases/${caseId}/export-bundle`;
  }
};

window.API = API;
