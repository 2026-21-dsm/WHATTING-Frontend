import { apiRequest, saveSession } from "./client";

export type Role = "STUDENT" | "TEACHER";
export type AlertType = "REAL" | "DRILL" | "INSPECTION" | "MALFUNCTION";
export type StudentStatus = "NO_RESPONSE" | "EVACUATING" | "EVACUATED" | "HELP_REQUESTED";
export type TeacherConfirmation = "UNCONFIRMED" | "CONFIRMED";
export type HelpStatus = "UNCHECKED" | "ACKNOWLEDGED" | "RESOLVED";

export type TeacherUser = {
  userId: string;
  name: string;
  role: Role;
  schoolName?: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: TeacherUser;
};

export type Alert = {
  alertId: string;
  type: AlertType;
  status: "ACTIVE" | "CLOSED";
  title?: string;
  message?: string;
  participantCount?: number;
  startedAt?: string;
  endedAt?: string;
};

export type AlertDashboard = {
  alert: Alert;
  summary: {
    participantCount: number;
    studentStatus: {
      helpRequestedCount: number;
      noResponseCount: number;
      evacuatingCount: number;
      evacuatedCount: number;
    };
    teacherConfirmation: {
      confirmedCount: number;
      unconfirmedCount: number;
    };
    helpStatus: {
      uncheckedCount: number;
      acknowledgedCount: number;
      resolvedCount: number;
    };
  };
  lastUpdatedAt: string;
};

export type AlertStudent = {
  studentId: string;
  name: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  studentStatus: StudentStatus;
  teacherConfirmation: TeacherConfirmation;
  confirmedByName?: string | null;
  confirmedAt?: string | null;
  helpStatus?: HelpStatus | null;
};

export type HelpRequestSummary = {
  helpRequestId: string;
  studentName: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  status: HelpStatus;
  locationText: string;
  category: string;
  createdAt: string;
};

export type HelpRequestDetail = HelpRequestSummary & {
  student: {
    studentId: string;
    name: string;
    grade: number;
    classNumber: number;
    studentNumber: number;
  };
  details?: string;
  updatedAt?: string;
  handledBy?: {
    userId: string;
    name: string;
  } | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
};

export type AlertResult = {
  alertId: string;
  type: AlertType;
  status: "CLOSED";
  startedAt: string;
  endedAt: string;
  reasonType?: string;
  customReason?: string;
  summary: {
    participantCount: number;
    studentRespondedCount: number;
    helpRequestedCount: number;
    confirmedCount: number;
    unconfirmedCount: number;
    helpRequestCount: number;
    resolvedHelpCount: number;
  };
  unconfirmedStudents?: Array<{
    studentId: string;
    name: string;
    studentStatus: StudentStatus;
  }>;
};

export async function loginTeacher(body: { name: string; password: string }) {
  const response = await apiRequest<LoginResponse>("/auth/login", { method: "POST", body, auth: false });
  if (response.user.role !== "TEACHER") throw new Error("교사 계정으로 로그인해 주세요.");
  saveSession(response.accessToken, response.user);
  return response;
}

export async function signupTeacher(body: {
  schoolName: string;
  name: string;
  password: string;
  teacherCode: string;
}) {
  return apiRequest<TeacherUser>("/auth/teachers/signup", { method: "POST", body, auth: false });
}

export function getMe() {
  return apiRequest<TeacherUser>("/users/me");
}

export function getActiveAlert() {
  return apiRequest<Alert | null>("/alerts/active");
}

export function createAlert(body: { type: AlertType; title: string; message: string }) {
  return apiRequest<Alert>("/alerts", { method: "POST", body });
}

export function updateAlertType(alertId: string, body: { type: AlertType; message: string }) {
  return apiRequest<Alert>(`/alerts/${alertId}/type`, { method: "PATCH", body });
}

export function closeAlert(alertId: string, body: { reasonType?: string | null; customReason?: string | null }) {
  return apiRequest<Alert>(`/alerts/${alertId}/close`, { method: "POST", body });
}

export function getDashboard(alertId: string) {
  return apiRequest<AlertDashboard>(`/alerts/${alertId}/dashboard`);
}

export function getAlertStudents(alertId: string, priority?: string) {
  return apiRequest<{ items: AlertStudent[] }>(`/alerts/${alertId}/students`, { query: { priority } });
}

export function updateStudentConfirmation(alertId: string, studentId: string, confirmed: boolean) {
  return apiRequest<AlertStudent>(`/alerts/${alertId}/students/${studentId}/confirmation`, {
    method: "PATCH",
    body: { confirmed },
  });
}

export function getHelpRequests(alertId: string, status?: HelpStatus) {
  return apiRequest<{ items: HelpRequestSummary[] }>(`/alerts/${alertId}/help-requests`, { query: { status } });
}

export function getHelpRequest(alertId: string, helpRequestId: string) {
  return apiRequest<HelpRequestDetail>(`/alerts/${alertId}/help-requests/${helpRequestId}`);
}

export function updateHelpRequestStatus(
  alertId: string,
  helpRequestId: string,
  body: { status: HelpStatus; resolutionNote?: string | null },
) {
  return apiRequest<HelpRequestDetail>(`/alerts/${alertId}/help-requests/${helpRequestId}/status`, {
    method: "PATCH",
    body,
  });
}

export function getAlertResult(alertId: string) {
  return apiRequest<AlertResult>(`/alerts/${alertId}/result`);
}
