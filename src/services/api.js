/**
 * HRMS API Client
 * Centralized fetch wrapper for all backend API calls
 */

const API_BASE = import.meta.env.VITE_API_URL || '/hrms/backend/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw { success: false, error: 'Network error' };
  }
}

// ── Members API ──
export const membersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/members${query ? '?' + query : ''}`);
  },
  getById: (id) => request(`/members/${id}`),
  create: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  getStats: () => request('/members/stats'),
};

// ── Attendance API ──
export const attendanceApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance${query ? '?' + query : ''}`);
  },
  create: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  signIn: (data) => request('/attendance/sign-in', { method: 'POST', body: JSON.stringify(data) }),
  signOut: (data) => request('/attendance/sign-out', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
  getToday: () => request('/attendance/today'),
};

// ── Salaries API ──
export const salariesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/salaries${query ? '?' + query : ''}`);
  },
  getById: (id) => request(`/salaries/${id}`),
  create: (data) => request('/salaries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/salaries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/salaries/${id}`, { method: 'DELETE' }),
  pay: (id, data) => request(`/salaries/${id}/pay`, { method: 'PUT', body: JSON.stringify(data) }),
  getSummary: () => request('/salaries/summary'),
};

// ── Payroll Masters & Structures API ──
export const payrollMastersApi = {
  getComponents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payroll/components${query ? '?' + query : ''}`);
  },
  createComponent: (data) => request('/payroll/components', { method: 'POST', body: JSON.stringify(data) }),
  updateComponent: (id, data) => request(`/payroll/components/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteComponent: (id) => request(`/payroll/components/${id}`, { method: 'DELETE' }),
  getStructures: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payroll/structures${query ? '?' + query : ''}`);
  },
  getStructureByUser: (userId) => request(`/payroll/structures/${userId}`),
  saveStructure: (data) => request('/payroll/structures', { method: 'POST', body: JSON.stringify(data) }),
  calculatePreview: (data) => request('/payroll/calculate-preview', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Dashboard Stats API ──
export const statsApi = {
  getDashboard: () => request('/stats'),
};

// ── Roles API ──
export const rolesApi = {
  getAll: () => request('/roles'),
};

// ── Leave Management API ──
export const leavesApi = {
  getTypes: () => request('/leaves/types'),
  getBalances: (userId, year) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (year) params.append('year', year);
    return request(`/leaves/balances?${params.toString()}`);
  },
  getRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/leaves/requests${query ? '?' + query : ''}`);
  },
  apply: (data) => request('/leaves/requests', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id, data = {}) => request(`/leaves/requests/${id}/approve`, { method: 'PUT', body: JSON.stringify(data) }),
  reject: (id, data = {}) => request(`/leaves/requests/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),
  getStats: (params = {}) => {
    const query = typeof params === 'object' ? new URLSearchParams(params).toString() : (params ? `year=${params}` : '');
    return request(`/leaves/stats${query ? '?' + query : ''}`);
  },
};

// ── Assets & IT Inventory API ──
export const assetsApi = {
  getCategories: () => request('/assets/categories'),
  getStats: (params = {}) => {
    const query = typeof params === 'object' ? new URLSearchParams(params).toString() : '';
    return request(`/assets/stats${query ? '?' + query : ''}`);
  },
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assets${query ? '?' + query : ''}`);
  },
  getById: (id) => request(`/assets/${id}`),
  create: (data) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
  assign: (id, data) => request(`/assets/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  return: (id, data) => request(`/assets/${id}/return`, { method: 'POST', body: JSON.stringify(data) }),
  getAssignments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assets/assignments${query ? '?' + query : ''}`);
  },
};

// ── Company Holidays & Calendar API ──
export const holidaysApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/holidays${query ? '?' + query : ''}`);
  },
  getStats: (year) => {
    const query = year ? `?year=${year}` : '';
    return request(`/holidays/stats${query}`);
  },
  getCalendar: (year, month) => {
    return request(`/holidays/calendar?year=${year}&month=${month}`);
  },
  getUpcoming: (limit = 5) => {
    return request(`/holidays/upcoming?limit=${limit}`);
  },
  create: (data) => request('/holidays', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/holidays/${id}`, { method: 'DELETE' }),
};

// ── Reports & Intelligence Suite API ──
export const reportsApi = {
  getMusterRoll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/muster-roll${query ? '?' + query : ''}`);
  },
  getPayrollRegister: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/payroll-register${query ? '?' + query : ''}`);
  },
  getLeaveLiability: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/leave-liability${query ? '?' + query : ''}`);
  },
  exportCsv: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/export${query ? '?' + query : ''}`);
  },
};

// ── Recruitment & Hiring Pipeline (ATS) API ──
export const recruitmentApi = {
  getStats: () => request('/recruitment/stats'),
  getOpenings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recruitment/openings${query ? '?' + query : ''}`);
  },
  getOpening: (id) => request(`/recruitment/openings/${id}`),
  createOpening: (data) => request('/recruitment/openings', { method: 'POST', body: JSON.stringify(data) }),
  updateOpening: (id, data) => request(`/recruitment/openings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOpening: (id) => request(`/recruitment/openings/${id}`, { method: 'DELETE' }),
  getCandidates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recruitment/candidates${query ? '?' + query : ''}`);
  },
  getCandidate: (id) => request(`/recruitment/candidates/${id}`),
  createCandidate: (data) => request('/recruitment/candidates', { method: 'POST', body: JSON.stringify(data) }),
  updateCandidateStage: (id, stage, note = null) => 
    request(`/recruitment/candidates/${id}/stage`, { 
      method: 'PUT', 
      body: JSON.stringify({ stage, note }) 
    }),
  updateCandidate: (id, data) => request(`/recruitment/candidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCandidate: (id) => request(`/recruitment/candidates/${id}`, { method: 'DELETE' }),
};

// ── Employee Lifecycle & Exit Management API ──
export const lifecycleApi = {
  getStats: () => request('/lifecycle/stats'),
  getWorkflows: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lifecycle/workflows${query ? '?' + query : ''}`);
  },
  getWorkflow: (id) => request(`/lifecycle/workflows/${id}`),
  createWorkflow: (data) => request('/lifecycle/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id, data) => request(`/lifecycle/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflow: (id) => request(`/lifecycle/workflows/${id}`, { method: 'DELETE' }),
  updateTaskStatus: (taskId, status, notes = null) => 
    request(`/lifecycle/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),
  addTask: (workflowId, data) => 
    request(`/lifecycle/workflows/${workflowId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getClearances: () => request('/lifecycle/clearances'),
};

// ── Employee Self-Service (ESS) API ──
export const essApi = {
  getDashboard: (userId = 1) => request(`/ess/dashboard?user_id=${userId}`),
  punch: (userId, notes = '') => 
    request('/ess/punch', { 
      method: 'POST', 
      body: JSON.stringify({ user_id: userId, notes }) 
    }),
  applyLeave: (data) => 
    request('/ess/leaves', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  submitClaim: (data) => 
    request('/ess/claims', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  getPayslipDetails: (salaryId, userId = 1) => 
    request(`/ess/payslips/${salaryId}?user_id=${userId}`),
};

// ── Manager Approvals API ──
export const approvalsApi = {
  getInbox: (managerId = null) => 
    request(`/approvals/inbox${managerId ? '?manager_id=' + managerId : ''}`),
  reviewLeave: (leaveId, reviewerId, action, remarks = '') => 
    request(`/approvals/leaves/${leaveId}`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_id: reviewerId, action, remarks })
    }),
  reviewClaim: (claimId, reviewerId, action, remarks = '') => 
    request(`/approvals/claims/${claimId}`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_id: reviewerId, action, remarks })
    }),
  reviewClearance: (taskId, reviewerId, status = 'Completed', notes = '') => 
    request(`/approvals/clearance/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ reviewer_id: reviewerId, status, notes })
    }),
};

// ── Performance Management & Appraisals (PMS) API ──
export const pmsApi = {
  getCycles: () => request('/pms/cycles'),
  createCycle: (data) => 
    request('/pms/cycles', { method: 'POST', body: JSON.stringify(data) }),
  getCompetencies: () => request('/pms/competencies'),
  getOkrs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pms/okrs${q ? '?' + q : ''}`);
  },
  getOkrById: (id) => request(`/pms/okrs/${id}`),
  createOkr: (data) => 
    request('/pms/okrs', { method: 'POST', body: JSON.stringify(data) }),
  updateKeyResultProgress: (id, data) => 
    request(`/pms/key-results/${id}/progress`, { method: 'PUT', body: JSON.stringify(data) }),
  getReviews: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pms/reviews${q ? '?' + q : ''}`);
  },
  getReviewById: (id) => request(`/pms/reviews/${id}`),
  submitSelfEval: (id, data) => 
    request(`/pms/reviews/${id}/self-eval`, { method: 'POST', body: JSON.stringify(data) }),
  submitManagerEval: (id, data) => 
    request(`/pms/reviews/${id}/manager-eval`, { method: 'POST', body: JSON.stringify(data) }),
  getTalentMatrix: (cycleId = null) => 
    request(`/pms/talent-matrix${cycleId ? '?cycle_id=' + cycleId : ''}`),
  applyIncrementToPayroll: (id, data = {}) => 
    request(`/pms/reviews/${id}/apply-increment`, { method: 'POST', body: JSON.stringify(data) }),
  getSalaryIncrements: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pms/salary-increments${q ? '?' + q : ''}`);
  },
  getStats: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/pms/stats${q ? '?' + q : ''}`);
  },
};

// ── Automated WhatsApp & SMS Notification Engine API ──
export const notificationsApi = {
  getStats: () => request('/notifications/stats'),
  getLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/notifications/logs${q ? '?' + q : ''}`);
  },
  getSettings: () => request('/notifications/settings'),
  updateSetting: (key, data) => 
    request(`/notifications/settings/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendTest: (data) => 
    request('/notifications/send-test', { method: 'POST', body: JSON.stringify(data) }),
  triggerAttendance: () => 
    request('/notifications/triggers/attendance-alerts', { method: 'POST' }),
  simulateReceipt: (data) => 
    request('/notifications/simulate-receipt', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Shift Scheduling & Team Roster Management API ──
export const shiftsApi = {
  getShifts: (activeOnly = false) => request(`/shifts${activeOnly ? '?active_only=1' : ''}`),
  createShift: (data) => request('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  updateShift: (id, data) => request(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteShift: (id) => request(`/shifts/${id}`, { method: 'DELETE' }),
  getRoster: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/shifts/roster${q ? '?' + q : ''}`);
  },
  assignRoster: (data) => request('/shifts/roster/assign', { method: 'POST', body: JSON.stringify(data) }),
  bulkAssign: (data) => request('/shifts/roster/bulk', { method: 'POST', body: JSON.stringify(data) }),
  getSwaps: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/shifts/swaps${q ? '?' + q : ''}`);
  },
  createSwap: (data) => request('/shifts/swaps', { method: 'POST', body: JSON.stringify(data) }),
  peerRespondSwap: (id, data) => request(`/shifts/swaps/${id}/peer-respond`, { method: 'POST', body: JSON.stringify(data) }),
  reviewSwap: (id, data) => request(`/shifts/swaps/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  getOvertime: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/shifts/overtime${q ? '?' + q : ''}`);
  },
  calculateOvertime: (data = {}) => request('/shifts/overtime/calculate', { method: 'POST', body: JSON.stringify(data) }),
  syncOvertime: (data) => request('/shifts/overtime/sync', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => request('/shifts/stats'),
};

// ── Internal HR Helpdesk & Employee Ticketing API ──
export const helpdeskApi = {
  getCategories: () => request('/helpdesk/categories'),
  createCategory: (data) => request('/helpdesk/categories', { method: 'POST', body: JSON.stringify(data) }),
  getTickets: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/helpdesk/tickets${q ? '?' + q : ''}`);
  },
  getTicket: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/helpdesk/tickets/${id}${q ? '?' + q : ''}`);
  },
  createTicket: (data) => request('/helpdesk/tickets', { method: 'POST', body: JSON.stringify(data) }),
  addMessage: (id, data) => request(`/helpdesk/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) => request(`/helpdesk/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  assignTicket: (id, data) => request(`/helpdesk/tickets/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
  submitCsat: (id, data) => request(`/helpdesk/tickets/${id}/csat`, { method: 'POST', body: JSON.stringify(data) }),
  getStats: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/helpdesk/stats${q ? '?' + q : ''}`);
  },
};





