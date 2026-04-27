import { apiFetch, downloadFile, toQuery } from "./http";

export const AuthApi = {
  login: (username, password, role) =>
    apiFetch("/api/login", { method: "POST", body: { username, password, role } }),
  me: (token) => apiFetch("/api/me", { token }),
};

export const CatalogApi = {
  getDepartments: (token) => apiFetch("/api/departments", { token }),
  createDepartment: (token, payload) =>
    apiFetch("/api/departments", { method: "POST", token, body: payload }),

  getTeachers: (token) => apiFetch("/api/teachers", { token }),
  createTeacher: (token, payload) => apiFetch("/api/teachers", { method: "POST", token, body: payload }),

  getSubjects: (token, filters = {}) => apiFetch(`/api/subjects${toQuery(filters)}`, { token }),
  createSubject: (token, payload) => apiFetch("/api/subjects", { method: "POST", token, body: payload }),
  removeSubject: (token, id) => apiFetch(`/api/subjects/${id}`, { method: "DELETE", token }),
};

export const ScheduleApi = {
  list: (token, filters = {}) => apiFetch(`/api/schedules${toQuery(filters)}`, { token }),
  create: (token, payload) => apiFetch("/api/schedules", { method: "POST", token, body: payload }),
  update: (token, id, payload) => apiFetch(`/api/schedules/${id}`, { method: "PUT", token, body: payload }),
  remove: (token, id) => apiFetch(`/api/schedules/${id}`, { method: "DELETE", token }),
};

export const StudentApi = {
  list: (token, filters = {}) => apiFetch(`/api/students${toQuery(filters)}`, { token }),
  create: (token, payload) => apiFetch("/api/students", { method: "POST", token, body: payload }),
  update: (token, id, payload) =>
    apiFetch(`/api/students/${id}`, { method: "PUT", token, body: payload }),
  remove: (token, id) => apiFetch(`/api/students/${id}`, { method: "DELETE", token }),
};

export const AttendanceApi = {
  list: (token, filters = {}) => apiFetch(`/api/attendance${toQuery(filters)}`, { token }),
  mark: (token, payload) => apiFetch("/api/attendance", { method: "POST", token, body: payload }),
};

export const ReportApi = {
  studentReport: (token, filters = {}) => apiFetch(`/api/attendance/report${toQuery(filters)}`, { token }),
  monthlyReport: (token, filters = {}) => apiFetch(`/api/attendance/monthly${toQuery(filters)}`, { token }),
  alertReport: (token, filters = {}) => apiFetch(`/api/attendance/alert${toQuery(filters)}`, { token }),
  exportPdf: (token, filters = {}) =>
    downloadFile("/api/attendance/export/pdf", filters, token, "attendance-alert-report.pdf"),
  exportExcel: (token, filters = {}) =>
    downloadFile("/api/attendance/export/excel", filters, token, "attendance-alert-report.xlsx"),
};

export const RequestApi = {
  list: (token, filters = {}) => apiFetch(`/api/attendance-requests${toQuery(filters)}`, { token }),
  create: (token, payload) =>
    apiFetch("/api/attendance-requests", { method: "POST", token, body: payload }),
  review: (token, id, payload) =>
    apiFetch(`/api/attendance-requests/${id}/review`, { method: "PATCH", token, body: payload }),
};

export const NotificationApi = {
  list: (token, filters = {}) => apiFetch(`/api/notifications${toQuery(filters)}`, { token }),
  notifyLowAttendance: (token, payload) =>
    apiFetch("/api/notifications/low-attendance", { method: "POST", token, body: payload }),
  markRead: (token, id) => apiFetch(`/api/notifications/${id}/read`, { method: "PATCH", token }),
};

export const ManagementApi = {
  facultyActivity: (token, filters = {}) => apiFetch(`/api/faculty/activity${toQuery(filters)}`, { token }),
};
