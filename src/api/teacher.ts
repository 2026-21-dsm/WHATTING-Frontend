import { apiRequest, saveSession } from "./client";

export type Role = "STUDENT" | "TEACHER";
export type AlertType = "REAL" | "DRILL" | "INSPECTION" | "MALFUNCTION";
export type StudentStatus = "NO_RESPONSE" | "EVACUATING" | "EVACUATED" | "HELP_REQUESTED";
export type TeacherConfirmation = "UNCONFIRMED" | "CONFIRMED";
export type HelpStatus = "UNCHECKED" | "ACKNOWLEDGED" | "RESOLVED";

export type TeacherUser = {
  userId?: string;
  name: string;
  role?: Role;
  schoolName?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: "Bearer" | string;
  expiresIn?: number;
  user: TeacherUser;
};

type AuthPayload = Partial<LoginResponse> & Partial<TeacherUser>;

type ApiEnvelope<T> = {
  data?: T;
  result?: T;
  response?: T;
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
  studentStatus: StudentStatus;
  helpStatus: HelpStatus;
  locationText: string;
  category: string;
  createdAt: string;
};

export type HelpRequestDetail = {
  helpRequestId: string;
  student: {
    studentId: string;
    name: string;
    grade: number;
    classNumber: number;
    studentNumber: number;
  };
  studentStatus: StudentStatus;
  helpStatus: HelpStatus;
  locationText: string;
  category: string;
  details?: string;
  createdAt: string;
  updatedAt?: string;
  handledBy?: {
    userId: string;
    name: string;
  } | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
};

export type HelpRequestStatusUpdate = {
  helpRequestId: string;
  helpStatus: HelpStatus;
  studentStatus: StudentStatus;
  handledBy?: {
    userId: string;
    name: string;
  } | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
};

export type CloseAlertResponse = {
  alertId: string;
  status: "CLOSED";
  reasonType?: string;
  customReason?: string | null;
  endedAt: string;
  summary: {
    participantCount: number;
    confirmedCount: number;
    unconfirmedCount: number;
    unresolvedHelpStudentCount: number;
  };
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
  unconfirmedStudents?: Array<{
    studentId: string;
    name: string;
    studentStatus: StudentStatus;
  }>;
  unresolvedHelpRequests?: HelpRequestStatusUpdate[];
};

function unwrapPayload<T>(payload: T | ApiEnvelope<T>): T {
  const wrapped = payload as ApiEnvelope<T>;
  return wrapped.data ?? wrapped.result ?? wrapped.response ?? (payload as T);
}

function normalizeAuthResponse(payload: AuthPayload, fallbackUser?: Partial<TeacherUser>): LoginResponse | null {
  if (!payload.accessToken) return null;

  const user = {
    ...fallbackUser,
    ...payload.user,
  };

  if (payload.userId !== undefined) user.userId = payload.userId;
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.schoolName !== undefined) user.schoolName = payload.schoolName;

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    tokenType: payload.tokenType,
    expiresIn: payload.expiresIn,
    user: user as TeacherUser,
  };
}

export async function loginTeacher(body: { name: string; password: string }) {
  const payload = await apiRequest<AuthPayload | ApiEnvelope<AuthPayload>>("/auth/login", {
    method: "POST",
    body,
    auth: false,
  });
  const response = normalizeAuthResponse(unwrapPayload(payload), { name: body.name });
  if (!response) throw new Error("로그인 응답에 accessToken이 없습니다.");

  if (response.user.role && response.user.role !== "TEACHER") {
    throw new Error("교사 계정으로 로그인해 주세요.");
  }

  saveSession(response.accessToken, response.user, response.refreshToken);
  return response;
}

export async function signupTeacher(body: {
  schoolName: string;
  name: string;
  password: string;
  teacherCode: string;
}) {
  const payload = await apiRequest<TeacherUser | AuthPayload | ApiEnvelope<TeacherUser | AuthPayload>>("/auth/teachers/signup", {
    method: "POST",
    body,
    auth: false,
  });
  const unwrapped = unwrapPayload(payload);
  const authResponse = normalizeAuthResponse(unwrapped as AuthPayload, {
    name: body.name,
    schoolName: body.schoolName,
  });

  if (authResponse) {
    if (authResponse.user.role && authResponse.user.role !== "TEACHER") {
      throw new Error("교사 계정으로 회원가입해 주세요.");
    }

    saveSession(authResponse.accessToken, authResponse.user, authResponse.refreshToken);
    return authResponse;
  }

  const user = unwrapped as TeacherUser;
  if (user.role && user.role !== "TEACHER") {
    throw new Error("교사 계정으로 회원가입해 주세요.");
  }

  return user;
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
  return apiRequest<CloseAlertResponse>(`/alerts/${alertId}/close`, { method: "POST", body });
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

export function getHelpRequests(alertId: string, helpStatus?: HelpStatus) {
  return apiRequest<{ items: HelpRequestSummary[] }>(`/alerts/${alertId}/help-requests`, { query: { helpStatus } });
}

export function getHelpRequest(alertId: string, helpRequestId: string) {
  return apiRequest<HelpRequestDetail>(`/alerts/${alertId}/help-requests/${helpRequestId}`);
}

export function updateHelpRequestStatus(
  alertId: string,
  helpRequestId: string,
  body: { helpStatus: HelpStatus; resolutionNote?: string | null },
) {
  return apiRequest<HelpRequestStatusUpdate>(`/alerts/${alertId}/help-requests/${helpRequestId}/status`, {
    method: "PATCH",
    body,
  });
}

export function getAlertResult(alertId: string) {
  return apiRequest<AlertResult>(`/alerts/${alertId}/result`);
}
