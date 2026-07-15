// WHATTING API 클라이언트 (API 명세서 v1.5 기준)
// Base URL 은 환경변수로 주입, 미설정 시 /api/v1 프록시 경로 사용

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const TOKEN_KEY = "whatting.accessToken";
const USER_KEY = "whatting.user";

export type Role = "STUDENT" | "TEACHER";
export type AlertType = "REAL" | "DRILL" | "INSPECTION" | "MALFUNCTION";
export type AlertStatus = "ACTIVE" | "CLOSED";
export type StudentStatus = "NO_RESPONSE" | "EVACUATING" | "EVACUATED" | "HELP_REQUESTED";
export type TeacherConfirmation = "UNCONFIRMED" | "CONFIRMED";
export type HelpStatus = "UNCHECKED" | "ACKNOWLEDGED" | "RESOLVED";
export type HelpCategory =
  | "MOBILITY_DIFFICULTY"
  | "ROUTE_UNKNOWN"
  | "EXIT_BLOCKED"
  | "OTHER_PERSON_NEEDS_HELP"
  | "OTHER";
export type CloseReasonType =
  | "REAL_ENDED"
  | "DRILL_ENDED"
  | "INSPECTION_ENDED"
  | "MALFUNCTION_CONFIRMED";

export type AuthUser = {
  userId: string;
  name: string;
  role: Role;
  schoolName?: string;
  grade?: number;
  classNumber?: number;
  studentNumber?: number;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type Alert = {
  alertId: string;
  type: AlertType;
  status: AlertStatus;
  title: string;
  message: string;
  participantCount?: number;
  startedAt?: string;
};

export type ApiError = {
  timestamp?: string;
  status: number;
  code: string;
  message: string;
  path?: string;
};

// --- 토큰/사용자 저장 ---
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- 요청 래퍼 ---
type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw (data as ApiError) ?? { status: response.status, code: "UNKNOWN", message: "요청 실패" };
  }

  return data as T;
}

// --- A. 인증 ---
export type StudentSignupBody = {
  schoolName: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  name: string;
  password: string;
};

export type TeacherSignupBody = {
  schoolName: string;
  name: string;
  password: string;
  teacherCode: string;
};

export const authApi = {
  studentSignup: (body: StudentSignupBody) =>
    request<AuthUser>("/auth/signup", { method: "POST", body, auth: false }),
  teacherSignup: (body: TeacherSignupBody) =>
    request<AuthUser>("/auth/teachers/signup", { method: "POST", body, auth: false }),
  login: (body: { name: string; password: string }) =>
    request<LoginResponse>("/auth/login", { method: "POST", body, auth: false }),
  me: () => request<AuthUser>("/users/me"),
};

// --- B. 경보 ---
export const alertApi = {
  create: (body: { type: AlertType; title: string; message: string }) =>
    request<Alert>("/alerts", { method: "POST", body }),
  getActive: () => request<Alert>("/alerts/active"),
  changeType: (alertId: string, body: { type: AlertType; message: string }) =>
    request<Alert>(`/alerts/${alertId}/type`, { method: "PATCH", body }),
  close: (alertId: string, body: { reasonType?: CloseReasonType; customReason?: string | null }) =>
    request(`/alerts/${alertId}/close`, { method: "POST", body }),
};

// --- C. 학생 대피 상태 ---
export const studentStatusApi = {
  getMine: (alertId: string) => request(`/alerts/${alertId}/me`),
  updateMine: (alertId: string, status: "EVACUATING" | "EVACUATED") =>
    request(`/alerts/${alertId}/me/status`, { method: "PUT", body: { status } }),
};

// --- D. 도움 요청 ---
export type HelpRequestBody = {
  locationText: string;
  category: HelpCategory;
  details?: string;
};

export const helpApi = {
  create: (alertId: string, body: HelpRequestBody) =>
    request(`/alerts/${alertId}/help-requests`, { method: "POST", body }),
  getMine: (alertId: string) => request(`/alerts/${alertId}/help-requests/me`),
  updateMine: (alertId: string, body: HelpRequestBody) =>
    request(`/alerts/${alertId}/help-requests/me`, { method: "PATCH", body }),
  list: (alertId: string, helpStatus?: HelpStatus) =>
    request(`/alerts/${alertId}/help-requests${helpStatus ? `?helpStatus=${helpStatus}` : ""}`),
  detail: (alertId: string, helpRequestId: string) =>
    request(`/alerts/${alertId}/help-requests/${helpRequestId}`),
  updateStatus: (
    alertId: string,
    helpRequestId: string,
    body: { helpStatus: HelpStatus; resolutionNote?: string | null }
  ) => request(`/alerts/${alertId}/help-requests/${helpRequestId}/status`, { method: "PATCH", body }),
};

// --- E. 학생 현장 확인 / F. 대시보드·결과 ---
export const teacherApi = {
  students: (alertId: string) => request(`/alerts/${alertId}/students`),
  confirmStudent: (alertId: string, studentId: string) =>
    request(`/alerts/${alertId}/students/${studentId}/confirmation`, { method: "PATCH" }),
  dashboard: (alertId: string) => request(`/alerts/${alertId}/dashboard`),
  result: (alertId: string) => request(`/alerts/${alertId}/result`),
};
