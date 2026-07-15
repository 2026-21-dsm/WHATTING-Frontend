import type { CSSProperties, ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { ApiError, getSavedUser } from "../../api/client";
import {
  closeAlert,
  createAlert,
  getActiveAlert,
  getAlertResult,
  getAlertStudents,
  getDashboard,
  getHelpRequest,
  getHelpRequests,
  getMe,
  loginTeacher,
  signupTeacher,
  updateAlertType,
  updateHelpRequestStatus,
  updateStudentConfirmation,
} from "../../api/teacher";
import type {
  Alert,
  AlertDashboard,
  AlertResult,
  AlertStudent,
  AlertType,
  HelpRequestDetail,
  HelpRequestSummary,
  HelpStatus,
  TeacherUser,
} from "../../api/teacher";
import { AppStage, MobileShell } from "../../components/layout/MobileShell";
import {
  FieldStack,
  FormField,
  GhostLink,
  PillLink,
  PrimaryAction,
  PrimaryButton,
} from "../../components/ui/Controls";
import { StudentRoster } from "../../components/ui/StudentRoster";
import type { RosterSectionData } from "../../components/ui/StudentRoster";
import { alertTypes } from "../../data/teacherMock";
import type { AlertTone } from "../../data/teacherMock";
import { useNow } from "../../hooks/useNow";
import { theme } from "../../styles/theme";
import alertDrillIcon from "../../assets/icons/alert-drill.svg";
import alertInspectionIcon from "../../assets/icons/alert-inspection.svg";
import alertRealIcon from "../../assets/icons/alert-real.svg";
import emergencyBellIcon from "../../assets/icons/emergency-bell.svg";
import homeStatusCheckIcon from "../../assets/icons/home-status-check.svg";
import metaCalendarIcon from "../../assets/icons/meta-calendar.svg";
import metaClockIcon from "../../assets/icons/meta-clock.svg";

const alertTypeIcons: Record<AlertTone, string> = {
  real: alertRealIcon,
  drill: alertDrillIcon,
  inspection: alertInspectionIcon,
  malfunction: alertInspectionIcon,
};

const alertTypeLabels: Record<AlertType, string> = {
  REAL: "실제 긴급 상황",
  DRILL: "훈련",
  INSPECTION: "점검",
  MALFUNCTION: "오작동",
};

const alertToneToApiType: Record<AlertTone, AlertType> = {
  real: "REAL",
  drill: "DRILL",
  inspection: "INSPECTION",
  malfunction: "MALFUNCTION",
};

const studentStatusLabels = {
  HELP_REQUESTED: "도움 요청",
  NO_RESPONSE: "응답 없음",
  EVACUATING: "대피 중",
  EVACUATED: "대피 완료",
} as const;

const helpStatusLabels: Record<HelpStatus, string> = {
  UNCHECKED: "미확인",
  ACKNOWLEDGED: "확인됨",
  RESOLVED: "해결됨",
};

const helpStatusFilters: Array<{ label: string; value?: HelpStatus }> = [
  { label: "전체" },
  { label: "미확인", value: "UNCHECKED" },
  { label: "확인됨", value: "ACKNOWLEDGED" },
  { label: "해결됨", value: "RESOLVED" },
];

function toUserMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "요청 처리에 실패했습니다.";
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLiveDate(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(value);
}

function formatLiveTime(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

function studentsToSections(students: AlertStudent[]): RosterSectionData[] {
  const sections: RosterSectionData[] = [
    { title: "즉각 지원 필요", tone: "urgent", students: [] },
    { title: "대피 중", tone: "moving", students: [] },
    { title: "응답 대기 중", tone: "waiting", students: [] },
    { title: "대피 완료", tone: "safe", students: [] },
  ];

  students.forEach((student) => {
    const base = {
      id: student.studentId,
      name: student.name,
      className: `${student.grade}-${student.classNumber}`,
      status: studentStatusLabels[student.studentStatus],
      note: student.helpStatus ? `처리 상태: ${student.helpStatus}` : undefined,
      confirmed: student.teacherConfirmation === "CONFIRMED",
    };

    if (student.studentStatus === "HELP_REQUESTED") {
      sections[0].students.push({ ...base, tone: "urgent" });
      return;
    }
    if (student.studentStatus === "EVACUATING") {
      sections[1].students.push({ ...base, tone: "moving" });
      return;
    }
    if (student.studentStatus === "EVACUATED") {
      sections[3].students.push({ ...base, tone: "safe" });
      return;
    }
    sections[2].students.push({ ...base, tone: "waiting" });
  });

  return sections
    .filter((section) => section.students.length > 0)
    .map((section) => ({ ...section, title: `${section.title} (${section.students.length})` }));
}

function helpRequestsToSections(items: HelpRequestSummary[]): RosterSectionData[] {
  return [
    {
      title: `즉각 지원 필요 (${items.length})`,
      tone: "urgent",
      showAction: true,
      students: items.map((item) => ({
        id: item.helpRequestId,
        helpRequestId: item.helpRequestId,
        name: item.studentName,
        className: `${item.grade}-${item.classNumber}`,
        status: item.helpStatus === "UNCHECKED" ? "도움 필요" : item.helpStatus === "ACKNOWLEDGED" ? "확인됨" : "해결됨",
        note: item.locationText,
        tone: "urgent",
      })),
    },
  ];
}

function useActiveAlert(intervalMs?: number) {
  const [data, setData] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: number | undefined;
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        const alert = await getActiveAlert();
        if (mounted) setData(alert);
      } catch (caught) {
        if (mounted) setError(toUserMessage(caught));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    if (intervalMs) timer = window.setInterval(load, intervalMs);
    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { data, error, loading, setData };
}

function useActiveUser(initialUser: TeacherUser | null) {
  const [data, setData] = useState<TeacherUser | null>(initialUser);

  useEffect(() => {
    let mounted = true;
    getMe()
      .then((user) => {
        if (mounted) setData(user);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return { data };
}

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginTeacher(form);
      navigate("/teacher/home");
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppStage>
      <MobileShell showProfile={false}>
        <AuthContent>
          <AuthTitle>로그인</AuthTitle>
          <AuthForm as="form" onSubmit={handleSubmit}>
            <FieldStack>
              <FormField icon="user" label="이름" name="name" value={form.name} placeholder="실명 입력" required onChange={handleChange} />
              <FormField
                icon="lock"
                label="비밀번호"
                name="password"
                value={form.password}
                placeholder="8자 이상 입력"
                required
                onChange={handleChange}
              />
            </FieldStack>
            {error && <InlineError>{error}</InlineError>}
            <LoginButton type="submit" disabled={submitting}>
              {submitting ? "로그인 중" : "로그인"}
            </LoginButton>
            <SwitchText>
              계정이 없으신가요? <GhostLink to="/teacher/signup">회원가입</GhostLink>
            </SwitchText>
          </AuthForm>
        </AuthContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ schoolName: "", name: "", password: "", teacherCode: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await signupTeacher(form);
      navigate("accessToken" in result ? "/teacher/home" : "/teacher/login");
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppStage>
      <MobileShell showProfile={false}>
        <SignupContent>
          <SignupCard as="form" onSubmit={handleSubmit}>
            <AuthTitle>교사 계정 생성</AuthTitle>
            <FieldStack>
              <FormField icon="school" label="학교명" name="schoolName" value={form.schoolName} placeholder="소속 학교 입력" required onChange={handleChange} />
              <FormField icon="user" label="성함" name="name" value={form.name} placeholder="실명 입력" required onChange={handleChange} />
              <FormField icon="lock" label="비밀번호" name="password" value={form.password} placeholder="8자 이상 입력" required onChange={handleChange} />
              <FormField
                icon="shield"
                label="교사 인증 코드"
                name="teacherCode"
                value={form.teacherCode}
                placeholder="인증 코드 입력"
                required
                onChange={handleChange}
              />
            </FieldStack>
            {error && <InlineError>{error}</InlineError>}
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "생성 중" : "교사 프로필 생성"}
            </PrimaryButton>
            <StatusStrip>
              <span>
                <i />
                {error ? "인증 실패" : "인증 대기"}
              </span>
              <span>v2.4.0-REL</span>
            </StatusStrip>
          </SignupCard>
          <SwitchText>
            이미 계정이 있으신가요? <GhostLink to="/teacher/login">로그인</GhostLink>
          </SwitchText>
        </SignupContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherHomePage() {
  const savedUser = getSavedUser<TeacherUser>();
  const { data: me } = useActiveUser(savedUser);
  const { data: activeAlert, error } = useActiveAlert(5000);
  const now = useNow();
  const teacher = me ?? savedUser;

  return (
    <AppStage>
      <MobileShell bottomTab="home" showProfile>
        <HomeContent>
          <WelcomeBlock>
            <p>교사</p>
            <h1>
              안녕하세요, <strong>{teacher?.name ?? "선생님"} 선생님</strong>
            </h1>
            <MetaRow>
              <span>
                <img src={metaCalendarIcon} alt="" aria-hidden="true" />
                {formatLiveDate(now)}
              </span>
              <span>
                <img src={metaClockIcon} alt="" aria-hidden="true" />
                {formatLiveTime(now)}
              </span>
            </MetaRow>
            <SchoolName>{teacher?.schoolName ?? "대덕소프트웨어마이스터고등학교"}</SchoolName>
          </WelcomeBlock>
          <StatusCard>
            <StatusCheck>
              <img src={homeStatusCheckIcon} alt="" aria-hidden="true" />
            </StatusCheck>
            <div>
              <h2>{activeAlert ? activeAlert.title || alertTypeLabels[activeAlert.type] : "활성 알림 없음"}</h2>
              <p>
                {error
                  ? error
                  : activeAlert
                    ? `${alertTypeLabels[activeAlert.type]} 경보가 진행 중입니다.`
                    : "현재 진행중인 경보가 없습니다."}
              </p>
            </div>
          </StatusCard>
          {activeAlert && (
            <HomeActionGrid>
              <PrimaryAction to="/teacher/active">현재 경보 상태</PrimaryAction>
              <PrimaryAction to="/teacher/alert/type">경보 수정</PrimaryAction>
            </HomeActionGrid>
          )}
          <EmergencyAction to="/teacher/alert/new">
            <BellIcon src={emergencyBellIcon} alt="" aria-hidden="true" />
            긴급 경보 생성
          </EmergencyAction>
        </HomeContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertDashboardPage() {
  const navigate = useNavigate();
  const { data: activeAlert, error: alertError } = useActiveAlert(5000);
  const savedUser = getSavedUser<TeacherUser>();
  const { data: me } = useActiveUser(savedUser);
  const now = useNow();
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const teacher = me ?? savedUser;

  const handleClose = async () => {
    if (!activeAlert?.alertId) return;
    setClosing(true);
    setError(null);
    try {
      const closed = await closeAlert(activeAlert.alertId, { customReason: "교사 확인 후 상황 종료" });
      navigate(`/teacher/result?alertId=${closed.alertId}`);
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setClosing(false);
    }
  };

  return (
    <AppStage>
      <MobileShell bottomTab="home" showProfile tall>
        <HomeContent>
          <WelcomeBlock>
            <p>교사</p>
            <h1>
              안녕하세요, <strong>{teacher?.name ?? "선생님"} 선생님</strong>
            </h1>
            <MetaRow>
              <span>
                <img src={metaCalendarIcon} alt="" aria-hidden="true" />
                {formatLiveDate(now)}
              </span>
              <span>
                <img src={metaClockIcon} alt="" aria-hidden="true" />
                {formatLiveTime(now)}
              </span>
            </MetaRow>
            <SchoolName>{teacher?.schoolName ?? "대덕소프트웨어마이스터고등학교"}</SchoolName>
          </WelcomeBlock>
          {activeAlert ? (
            <>
              <ActiveAlertCard>
                <ActiveAlertHead>
                  <div>
                    <span>현재 상태</span>
                    <strong>활성화</strong>
                  </div>
                  <EditPill to="/teacher/alert/type" aria-label="경보 수정">
                    ✎
                  </EditPill>
                </ActiveAlertHead>
                <InfoRow>
                  <span>경보 유형</span>
                  <strong>{alertTypeLabels[activeAlert.type]}</strong>
                </InfoRow>
                <ReadOnlyBlock>
                  <span>제목</span>
                  <p>{activeAlert.title || alertTypeLabels[activeAlert.type]}</p>
                </ReadOnlyBlock>
                <ReadOnlyBlock data-large="true">
                  <span>내용</span>
                  <p>{activeAlert.message || "세부 지시 사항이 없습니다."}</p>
                </ReadOnlyBlock>
              </ActiveAlertCard>
              {(error || alertError) && <InlineError>{error || alertError}</InlineError>}
              <PrimaryButton type="button" onClick={handleClose} disabled={closing}>
                {closing ? "종료 중" : "경보 종료하기"}
              </PrimaryButton>
            </>
          ) : (
            <EmptyState data-spacious="true">
              <strong>진행 중인 경보가 없습니다.</strong>
              <PrimaryAction to="/teacher/alert/new">긴급 경보 생성</PrimaryAction>
            </EmptyState>
          )}
        </HomeContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertCreatePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AlertTone>("drill");
  const [form, setForm] = useState({ title: "화재 대피 훈련", message: "운동장으로 대피하세요." });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createAlert({ type: alertToneToApiType[selected], title: form.title, message: form.message });
      navigate("/teacher/active");
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppStage>
      <MobileShell bottomTab="home" showBrand={false} tall>
        <CreateContent as="form" onSubmit={handleSubmit}>
          <PageTitleRow>
            <button type="button" onClick={() => navigate("/teacher/home")} aria-label="뒤로가기">
              ‹
            </button>
          </PageTitleRow>
          <Kicker>재해 선택</Kicker>
          <CreateTitle>경보 생성</CreateTitle>
          <AlertTypeGrid>
            {alertTypes.map((type) => (
              <TypeCard
                key={type.title}
                data-tone={type.tone}
                data-active={selected === type.tone}
                type="button"
                onClick={() => setSelected(type.tone)}
              >
                <TypeIcon src={alertTypeIcons[type.tone]} alt="" aria-hidden="true" />
                <strong>{type.title}</strong>
                <span>{type.description}</span>
              </TypeCard>
            ))}
          </AlertTypeGrid>
          <FieldStack>
            <FormField icon="text" label="알림 제목" name="title" value={form.title} placeholder="알림 제목입력" required onChange={handleChange} />
            <FormField
              icon="text"
              label="세부 지시 사항"
              name="message"
              value={form.message}
              placeholder="소속 학교 입력"
              large
              required
              onChange={handleChange}
            />
          </FieldStack>
          {error && <InlineError>{error}</InlineError>}
          <CreateSubmitButton type="submit" disabled={submitting}>
            {submitting ? "전송 중" : "경보 보내기"}
          </CreateSubmitButton>
        </CreateContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertTypePage() {
  const navigate = useNavigate();
  const { data: activeAlert } = useActiveAlert();
  const [selected, setSelected] = useState<AlertType>("DRILL");
  const [message, setMessage] = useState("상황 확인 결과에 따라 경보 유형을 변경합니다.");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeAlert?.type) setSelected(activeAlert.type);
  }, [activeAlert?.type]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeAlert?.alertId) {
      setError("진행 중인 경보가 없습니다.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateAlertType(activeAlert.alertId, { type: selected, message });
      navigate("/teacher/active");
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppStage>
      <MobileShell bottomTab="home" showBrand={false} tall>
        <TypeChangeContent as="form" onSubmit={handleSubmit}>
          <PageTitleRow>
            <button type="button" onClick={() => navigate("/teacher/active")} aria-label="뒤로가기">
              ‹
            </button>
          </PageTitleRow>
          <Kicker>재해 선택</Kicker>
          <CreateTitle>경보 수정</CreateTitle>
          <AlertTypeGrid>
            {alertTypes.map((type) => (
              <TypeCard
                key={type.title}
                data-tone={type.tone}
                data-active={selected === alertToneToApiType[type.tone]}
                type="button"
                onClick={() => setSelected(alertToneToApiType[type.tone])}
              >
                <TypeIcon src={alertTypeIcons[type.tone]} alt="" aria-hidden="true" />
                <strong>{type.title}</strong>
                <span>{type.description}</span>
              </TypeCard>
            ))}
          </AlertTypeGrid>
          <FormField
            icon="text"
            label="세부 지시 사항"
            name="message"
            value={message}
            placeholder="소속 학교 입력"
            large
            required
            onChange={(event) => setMessage(event.target.value)}
          />
          {error && <InlineError>{error}</InlineError>}
          <CreateSubmitButton type="submit" disabled={submitting}>
            {submitting ? "수정 중" : "경보 수정하기"}
          </CreateSubmitButton>
        </TypeChangeContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherStudentListPage() {
  const { data: activeAlert } = useActiveAlert(5000);
  const [students, setStudents] = useState<AlertStudent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | undefined>();

  const loadStudents = async () => {
    if (!activeAlert?.alertId) return;
    try {
      const result = await getAlertStudents(activeAlert.alertId, filter);
      setStudents(result.items ?? []);
      setError(null);
    } catch (caught) {
      setError(toUserMessage(caught));
    }
  };

  useEffect(() => {
    void loadStudents();
    const timer = window.setInterval(loadStudents, 5000);
    return () => window.clearInterval(timer);
  }, [activeAlert?.alertId, filter]);

  const filteredStudents = students.filter((student) => {
    const keyword = search.trim();
    if (!keyword) return true;
    return `${student.name} ${student.grade}-${student.classNumber}`.includes(keyword);
  });

  const handleConfirm = async (studentId: string, confirmed: boolean) => {
    if (!activeAlert?.alertId) return;
    try {
      await updateStudentConfirmation(activeAlert.alertId, studentId, confirmed);
      await loadStudents();
    } catch (caught) {
      setError(toUserMessage(caught));
    }
  };

  return (
    <AppStage>
      <StudentListShell search={search} onSearch={setSearch} filter={filter} onFilter={setFilter}>
        {error && <InlineError>{error}</InlineError>}
        {activeAlert ? (
          <StudentRoster sections={studentsToSections(filteredStudents)} onConfirmStudent={handleConfirm} />
        ) : (
          <StudentRoster />
        )}
      </StudentListShell>
    </AppStage>
  );
}

export function TeacherStudentConfirmPage() {
  return <TeacherStudentListPage />;
}

export function TeacherHelpRequestsPage() {
  const { data: activeAlert } = useActiveAlert(5000);
  const [items, setItems] = useState<HelpRequestSummary[]>([]);
  const [filter, setFilter] = useState<HelpStatus | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAlert?.alertId) return;
    let mounted = true;
    const load = async () => {
      try {
        const result = await getHelpRequests(activeAlert.alertId, filter);
        if (mounted) {
          setItems(result.items ?? []);
          setError(null);
        }
      } catch (caught) {
        if (mounted) setError(toUserMessage(caught));
      }
    };
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [activeAlert?.alertId, filter]);

  return (
    <AppStage>
      <MobileShell bottomTab="students" title="도움 요청">
        <HelpContent>
          <SegmentedControl>
            {helpStatusFilters.map((item) => (
              <button key={item.label} type="button" data-active={filter === item.value} onClick={() => setFilter(item.value)}>
                {item.label}
              </button>
            ))}
          </SegmentedControl>
          {error && <InlineError>{error}</InlineError>}
          {activeAlert ? (
            items.length > 0 ? (
              <StudentRoster compact sections={helpRequestsToSections(items)} />
            ) : (
              <EmptyState>
                <strong>도움 요청이 없습니다.</strong>
              </EmptyState>
            )
          ) : (
            <EmptyState>
              <strong>진행 중인 경보가 없습니다.</strong>
            </EmptyState>
          )}
        </HelpContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherHelpDetailPage() {
  const { helpRequestId } = useParams();
  const { data: activeAlert } = useActiveAlert();
  const [detail, setDetail] = useState<HelpRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!activeAlert?.alertId || !helpRequestId) return;
    let mounted = true;
    getHelpRequest(activeAlert.alertId, helpRequestId)
      .then((result) => {
        if (mounted) {
          setDetail(result);
          setError(null);
        }
      })
      .catch((caught) => {
        if (mounted) setError(toUserMessage(caught));
      });
    return () => {
      mounted = false;
    };
  }, [activeAlert?.alertId, helpRequestId]);

  const nextStatus =
    detail?.helpStatus === "UNCHECKED" ? "ACKNOWLEDGED" : detail?.helpStatus === "ACKNOWLEDGED" ? "RESOLVED" : undefined;
  const handleStatusChange = async () => {
    if (!activeAlert?.alertId || !helpRequestId || !nextStatus) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await updateHelpRequestStatus(activeAlert.alertId, helpRequestId, {
        helpStatus: nextStatus,
        resolutionNote: nextStatus === "RESOLVED" ? "교사 확인 후 해결 처리" : undefined,
      });
      setDetail((current) => (current ? { ...current, ...result } : current));
    } catch (caught) {
      setError(toUserMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const detailSection = detail
    ? helpRequestsToSections([
        {
          helpRequestId: detail.helpRequestId,
          studentName: detail.student.name,
          grade: detail.student.grade,
          classNumber: detail.student.classNumber,
          studentNumber: detail.student.studentNumber,
          studentStatus: detail.studentStatus,
          helpStatus: detail.helpStatus,
          locationText: detail.locationText,
          category: detail.category,
          createdAt: detail.createdAt,
        },
      ])
    : [];

  return (
    <AppStage>
      <MobileShell bottomTab="students" title="상세 상태 확인">
        <DetailContent>
          <DetailCard>
            {detail && <StudentRoster compact sections={detailSection} />}
            <DetailTime>{formatDateTime(detail?.createdAt)}</DetailTime>
            <DetailBlock>
              <span>상세 내용</span>
              <p>{detail?.details || detail?.locationText || "상세 내용이 없습니다."}</p>
            </DetailBlock>
          </DetailCard>
          <StatusStepGrid>
            {Object.entries(helpStatusLabels).map(([status, label]) => (
              <StatusStep key={status} data-active={detail?.helpStatus === status}>
                <span />
                {label}
              </StatusStep>
            ))}
          </StatusStepGrid>
          {error && <InlineError>{error}</InlineError>}
          {nextStatus ? (
            <PrimaryButton type="button" onClick={handleStatusChange} disabled={submitting}>
              {submitting ? "변경 중" : `${helpStatusLabels[nextStatus]} 처리`}
            </PrimaryButton>
          ) : (
            <PrimaryAction to="/teacher/help">목록으로 돌아가기</PrimaryAction>
          )}
        </DetailContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherDashboardPage() {
  const { data: activeAlert, error: alertError } = useActiveAlert(5000);
  const [dashboard, setDashboard] = useState<AlertDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAlert?.alertId) return;
    let mounted = true;
    const load = async () => {
      try {
        const result = await getDashboard(activeAlert.alertId);
        if (mounted) {
          setDashboard(result);
          setError(null);
        }
      } catch (caught) {
        if (mounted) setError(toUserMessage(caught));
      }
    };
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [activeAlert?.alertId]);

  const metrics = useMemo(() => {
    const summary = dashboard?.summary;
    if (!summary) return [];
    return [
      { label: "도움요청", value: summary.studentStatus.helpRequestedCount, tone: "danger" },
      { label: "응답없음", value: summary.studentStatus.noResponseCount, tone: "warning" },
      { label: "대피중", value: summary.studentStatus.evacuatingCount, tone: "info" },
      { label: "대피완료", value: summary.studentStatus.evacuatedCount, tone: "safe" },
    ];
  }, [dashboard]);

  const progress =
    dashboard && dashboard.summary.participantCount > 0
      ? Math.round((dashboard.summary.studentStatus.evacuatedCount / dashboard.summary.participantCount) * 100)
      : 0;

  return (
    <AppStage>
      <MobileShell bottomTab="dashboard" title="대시보드" tall>
        <ResultContent>
          <SummaryCard>
            <h2>{activeAlert ? activeAlert.title || alertTypeLabels[activeAlert.type] : "활성 경보 없음"}</h2>
            <p>
              시작: {formatDateTime(activeAlert?.startedAt)} | 최근 업데이트: {formatDateTime(dashboard?.lastUpdatedAt)}
            </p>
            {(error || alertError) && <InlineError>{error || alertError}</InlineError>}
          </SummaryCard>
          {dashboard ? (
            <>
              <MetricsCard>
                <MetricsHead>
                  <h2>실시간 인원 현황</h2>
                  <i />
                </MetricsHead>
                <MetricsGrid>
                  {metrics.map((stat) => (
                    <Metric key={stat.label} data-tone={stat.tone}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </Metric>
                  ))}
                </MetricsGrid>
                <ProgressBlock style={{ "--progress": `${progress}%` } as CSSProperties}>
                  <div>
                    <span>대피 진행률</span>
                    <strong>{progress}%</strong>
                  </div>
                  <i />
                </ProgressBlock>
              </MetricsCard>
              <ClassStatusCard
                title="교사 확인 현황"
                current={dashboard.summary.teacherConfirmation.confirmedCount}
                total={dashboard.summary.participantCount}
                absent={dashboard.summary.teacherConfirmation.unconfirmedCount}
                evacuated={dashboard.summary.teacherConfirmation.confirmedCount}
              />
            </>
          ) : (
            <EmptyState>
              <strong>대시보드 데이터를 불러올 수 없습니다.</strong>
            </EmptyState>
          )}
        </ResultContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherResultPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<AlertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alertId = searchParams.get("alertId");

  useEffect(() => {
    if (!alertId) {
      setError("종료된 경보 ID가 없습니다.");
      return;
    }
    let mounted = true;
    getAlertResult(alertId)
      .then((value) => {
        if (mounted) {
          setResult(value);
          setError(null);
        }
      })
      .catch((caught) => {
        if (mounted) setError(toUserMessage(caught));
      });
    return () => {
      mounted = false;
    };
  }, [alertId]);

  const summary = result?.summary;
  const total = summary?.participantCount ?? 0;
  const progress = total > 0 ? Math.round(((summary?.studentRespondedCount ?? 0) / total) * 100) : 0;
  const unconfirmedSections: RosterSectionData[] =
    result?.unconfirmedStudents?.length
      ? [
          {
            title: `미확인 학생 (${result.unconfirmedStudents.length})`,
            tone: "waiting",
            students: result.unconfirmedStudents.map((student) => ({
              id: student.studentId,
              name: student.name,
              className: "-",
              status: studentStatusLabels[student.studentStatus],
              tone: student.studentStatus === "HELP_REQUESTED" ? "urgent" : "waiting",
            })),
          },
        ]
      : [];

  return (
    <AppStage>
      <MobileShell bottomTab="students" title="최종 결과" tall>
        <ResultContent>
          <SummaryCard>
            <h2>{result ? alertTypeLabels[result.type] : "최종 결과"}</h2>
            <p>
              시작: {formatDateTime(result?.startedAt)} | 종료: {formatDateTime(result?.endedAt)}
            </p>
            <SummaryActions>
              <Link to="/teacher/home">홈으로</Link>
              <Link to="/teacher/students">명단 확인</Link>
            </SummaryActions>
          </SummaryCard>
          {error && <InlineError>{error}</InlineError>}
          <MetricsCard>
            <MetricsHead>
              <h2>종료 인원 현황</h2>
              <i />
            </MetricsHead>
            <MetricsGrid>
              <Metric data-tone="info">
                <span>응답</span>
                <strong>{summary?.studentRespondedCount ?? 0}</strong>
              </Metric>
              <Metric data-tone="danger">
                <span>도움요청</span>
                <strong>{summary?.studentStatus.helpRequestedCount ?? 0}</strong>
              </Metric>
              <Metric data-tone="safe">
                <span>확인</span>
                <strong>{summary?.teacherConfirmation.confirmedCount ?? 0}</strong>
              </Metric>
              <Metric data-tone="warning">
                <span>미확인</span>
                <strong>{summary?.teacherConfirmation.unconfirmedCount ?? 0}</strong>
              </Metric>
            </MetricsGrid>
            <ProgressBlock style={{ "--progress": `${progress}%` } as CSSProperties}>
              <div>
                <span>학생 응답률</span>
                <strong>{progress}%</strong>
              </div>
              <i />
            </ProgressBlock>
          </MetricsCard>
          {unconfirmedSections.length > 0 && <StudentRoster sections={unconfirmedSections} />}
          <ResultAction to="/teacher/home">최종 확인 후 끝내기</ResultAction>
        </ResultContent>
      </MobileShell>
    </AppStage>
  );
}

function StudentListShell({
  children,
  search,
  onSearch,
  filter,
  onFilter,
}: {
  children: ReactNode;
  search: string;
  onSearch: (value: string) => void;
  filter?: string;
  onFilter: (value?: string) => void;
}) {
  const filters = [
    { label: "전체", value: undefined },
    { label: "도움 요청", value: "HELP" },
    { label: "대피완료", value: "EVACUATED" },
    { label: "대피중", value: "EVACUATING" },
    { label: "응답없음", value: "NO_RESPONSE" },
    { label: "확인완료", value: "CONFIRMED" },
  ];

  return (
    <MobileShell bottomTab="students" showBrand={false} tall>
      <RosterHeader>
        <RosterTitleRow>
          <h1>학생 안전 체크리스트</h1>
          <span>전체 학년</span>
        </RosterTitleRow>
        <SearchBox placeholder="이름 또는 학급 검색..." aria-label="학생 검색" value={search} onChange={(event) => onSearch(event.target.value)} />
        <FilterRow>
          {filters.map((item) => (
            <button key={item.label} type="button" data-active={filter === item.value} onClick={() => onFilter(item.value)}>
              {item.label}
            </button>
          ))}
        </FilterRow>
      </RosterHeader>
      {children}
    </MobileShell>
  );
}

function ClassStatusCard({
  title = "학급 2-A 현황",
  current = 28,
  total = 30,
  absent = 2,
  evacuated = 28,
}: {
  title?: string;
  current?: number;
  total?: number;
  absent?: number;
  evacuated?: number;
}) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <ClassCard>
      <Kicker>{title}</Kicker>
      <ClassMain>
        <div>
          <MutedLabel>현재 학생</MutedLabel>
          <CountText>
            {current} <small>/ {total}명</small>
          </CountText>
        </div>
        <Ring style={{ background: `conic-gradient(${theme.colors.dangerSoft} 0 ${percent}%, #343438 ${percent}% 100%)` }}>
          <span>{percent}%</span>
        </Ring>
      </ClassMain>
      <MiniStats>
        <MiniStat>
          <span>응답 없음</span>
          <strong>{absent}</strong>
        </MiniStat>
        <MiniStat>
          <span>대피 완료</span>
          <strong>{evacuated}</strong>
        </MiniStat>
      </MiniStats>
    </ClassCard>
  );
}

const AuthContent = styled.section`
  min-height: 680px;
  display: flex;
  flex-direction: column;
  padding: 75px 16px 0;
`;

const AuthTitle = styled.h1`
  margin: 0 0 28px;
  color: ${theme.colors.text};
  font-size: 24px;
  line-height: 28px;
  font-weight: 800;
`;

const AuthForm = styled.div`
  min-height: 545px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoginButton = styled(PrimaryButton)`
  margin-top: auto;
`;

const InlineError = styled.p`
  margin: -8px 0 0;
  color: ${theme.colors.dangerSoft};
  font-size: 12px;
  line-height: 18px;
`;

const SignupContent = styled.section`
  min-height: 680px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 75px 16px 0;
`;

const SignupCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 4px;
  border-radius: ${theme.radius.md};
  background: rgba(14, 14, 17, 0.5);
  overflow: hidden;
`;

const StatusStrip = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.panelDeep};
  color: ${theme.colors.textSoft};
  font-size: 10px;
  line-height: 15px;

  i {
    width: 6px;
    height: 6px;
    display: inline-block;
    margin-right: 8px;
    border-radius: 50%;
    background: ${theme.colors.dangerSoft};
  }
`;

const SwitchText = styled.p`
  margin: 22px 0;
  color: ${theme.colors.textMuted};
  font-size: 16px;
  line-height: 24px;
  text-align: center;
`;

const HomeContent = styled.section`
  min-height: 656px;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 0;
`;

const WelcomeBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    color: ${theme.colors.info};
    font-size: 12px;
    line-height: 18px;
    font-weight: 900;
    letter-spacing: 0.1em;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 42px;
    font-weight: 700;
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 8px;
  color: rgba(195, 198, 215, 0.8);
  font-size: 15px;
  line-height: 22px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  img {
    display: block;
    width: 15px;
    height: 15px;
    object-fit: contain;
  }
`;

const SchoolName = styled.p`
  margin: 0;
  color: ${theme.colors.textSoft};
  font-size: 15px;
  line-height: 18px;
`;

const StatusCard = styled.section`
  min-height: 126px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  padding: 33px;
  border: 1px solid rgba(39, 39, 42, 0.5);
  border-radius: ${theme.radius.lg};
  background: linear-gradient(160deg, #1b1b1e, #0a0a0b);

  h2 {
    margin: 0;
    font-size: 22px;
    line-height: 33px;
  }

  p {
    margin: 4px 0 0;
    color: ${theme.colors.textSoft};
    font-size: 15px;
    line-height: 22px;
  }
`;

const StatusCheck = styled.div`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);

  img {
    display: block;
    width: 26.667px;
    height: 26.667px;
  }
`;

const EmergencyAction = styled(PillLink)`
  align-self: center;
  margin-top: auto;
  margin-bottom: 28px;
`;

const HomeActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const BellIcon = styled.img`
  width: 19px;
  height: 24px;
  display: block;
  object-fit: contain;
`;

const ActiveAlertCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  border: 1px solid rgba(39, 39, 42, 0.72);
  border-radius: ${theme.radius.lg};
  background: linear-gradient(180deg, rgba(24, 24, 27, 0.92), #0a0a0b);
`;

const ActiveAlertHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  span {
    color: ${theme.colors.textSoft};
    font-size: 14px;
    line-height: 20px;
  }

  strong {
    color: ${theme.colors.dangerSoft};
    font-size: 14px;
    line-height: 20px;
  }
`;

const EditPill = styled(Link)`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radius.sm};
  background: #1f1f22;
  color: ${theme.colors.textSoft};
  font-size: 18px;
  line-height: 1;
`;

const InfoRow = styled.div`
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  background: #131316;

  span {
    color: ${theme.colors.textSoft};
    font-size: 14px;
    line-height: 20px;
  }

  strong {
    color: ${theme.colors.dangerSoft};
    font-size: 14px;
    line-height: 20px;
  }
`;

const ReadOnlyBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
    font-weight: 800;
  }

  p {
    margin: 0;
    min-height: 52px;
    padding: 16px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.sm};
    background: #0f0f11;
    color: ${theme.colors.text};
    font-size: 15px;
    line-height: 22px;
  }

  &[data-large="true"] p {
    min-height: 132px;
  }
`;

const ClassCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 25px;
  border: 1px solid rgba(39, 39, 42, 0.5);
  border-radius: ${theme.radius.lg};
  background: linear-gradient(180deg, rgba(27, 27, 30, 0.5), #0a0a0b);
`;

const Kicker = styled.p`
  margin: 0;
  color: ${theme.colors.textSoft};
  font-size: 12px;
  line-height: 18px;
  font-weight: 900;
  letter-spacing: 0.1em;
`;

const ClassMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MutedLabel = styled.span`
  color: rgba(195, 198, 215, 0.6);
  font-size: 13px;
  line-height: 19px;
`;

const CountText = styled.p`
  margin: 4px 0 0;
  font-size: 36px;
  line-height: 54px;
  font-weight: 900;

  small {
    color: rgba(195, 198, 215, 0.4);
    font-size: 18px;
    font-weight: 500;
  }
`;

const Ring = styled.div`
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(${theme.colors.dangerSoft} 0 93%, #343438 93% 100%);
  color: ${theme.colors.dangerSoft};
  font-size: 13px;
  line-height: 19px;
  font-weight: 900;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: ${theme.colors.bg};
  }

  span {
    position: relative;
  }
`;

const MiniStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const MiniStat = styled.div`
  min-height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${theme.radius.md};
  background: rgba(255, 255, 255, 0.05);

  span {
    color: rgba(195, 198, 215, 0.6);
    font-size: 11px;
    line-height: 16px;
    font-weight: 800;
  }

  strong {
    font-size: 24px;
    line-height: 36px;
  }
`;

const CreateContent = styled.section`
  min-height: 719px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 52px 16px 24px;
`;

const CreateTitle = styled.h1`
  margin: 0;
  font-size: 32px;
  line-height: 40px;
  font-weight: 900;
`;

const PageTitleRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 40px;

  button {
    width: 28px;
    height: 40px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${theme.colors.text};
    font-size: 34px;
    line-height: 1;
  }
`;

const AlertTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TypeCard = styled.button`
  height: 89px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: #131316;
  text-align: left;
  cursor: pointer;

  strong {
    color: ${theme.colors.text};
    font-size: 15px;
    line-height: 20px;
  }

  span:last-child {
    color: ${theme.colors.textMuted};
    font-size: 11px;
    line-height: 15px;
  }

  &[data-active="true"] {
    border-color: #8aa7ff;
    background: rgba(37, 99, 235, 0.12);
    box-shadow: 0 0 0 1px rgba(138, 167, 255, 0.18);
  }
`;

const TypeIcon = styled.img`
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
`;

const TypeChangeContent = styled.section`
  min-height: 719px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 52px 16px 24px;
`;

const CreateSubmitButton = styled(PrimaryButton)`
  margin-top: auto;
`;

const RosterHeader = styled.section`
  min-height: 179px;
  padding: 0 16px 14px;
  background: ${theme.colors.bg};
`;

const RosterTitleRow = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 28px;
  }

  span {
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
  }
`;

const SearchBox = styled.input`
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: 0;
  outline: 0;
  border-radius: ${theme.radius.sm};
  background: #161618;
  color: ${theme.colors.text};
  font-size: 16px;
  line-height: 19px;

  &::placeholder {
    color: rgba(141, 144, 160, 0.7);
    opacity: 1;
  }

  &:focus {
    box-shadow: 0 0 0 1px rgba(255, 180, 171, 0.55);
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  overflow-x: auto;
  scrollbar-width: none;

  button {
    flex: 0 0 auto;
    padding: 7px 12px;
    border: 0;
    border-radius: ${theme.radius.pill};
    background: #1f1f22;
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
    font-weight: 800;
  }

  button[data-active="true"] {
    background: ${theme.colors.dangerSoft};
    color: ${theme.colors.bg};
  }
`;

const HelpContent = styled.section`
  padding: 12px 16px 24px;
`;

const SegmentedControl = styled.div`
  width: max-content;
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 24px;
  border-radius: ${theme.radius.sm};
  background: #1f1f22;

  button {
    padding: 7px 12px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
    font-weight: 800;
  }

  button[data-active="true"] {
    background: ${theme.colors.dangerSoft};
    color: ${theme.colors.bg};
  }
`;

const DetailContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px 24px;
`;

const DetailCard = styled.section`
  position: relative;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  background: ${theme.colors.panel};
`;

const DetailTime = styled.span`
  position: absolute;
  top: 24px;
  right: 16px;
  color: ${theme.colors.textSoft};
  font-size: 11px;
  line-height: 16px;
`;

const DetailBlock = styled.div`
  padding: 18px 16px 22px;
  border-top: 1px solid ${theme.colors.border};

  span {
    display: block;
    margin-bottom: 10px;
    color: ${theme.colors.textSoft};
    font-size: 11px;
    line-height: 14px;
    font-weight: 800;
  }

  p {
    margin: 0;
    min-height: 72px;
    padding: 14px 12px;
    border-radius: ${theme.radius.sm};
    background: #161618;
    color: ${theme.colors.text};
    font-size: 15px;
    line-height: 22px;
  }
`;

const StatusStepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const StatusStep = styled.div`
  min-height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: ${theme.radius.md};
  color: ${theme.colors.textSoft};
  font-size: 17px;
  line-height: 26px;
  font-weight: 800;

  span {
    width: 44px;
    height: 44px;
    border-radius: ${theme.radius.sm};
    background: #2a2a2d;
  }

  &[data-active="true"] {
    color: ${theme.colors.dangerSoft};
  }
`;

const ResultContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 11px 24px;
`;

const ResultAction = styled(PrimaryAction)`
  margin-top: 18px;
`;

const SummaryCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 25px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  background: #1f1f22;

  h2 {
    margin: 0;
    font-size: 16px;
    line-height: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: ${theme.colors.textSoft};
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 12px;
    line-height: 18px;
  }
`;

const SummaryActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;

  a,
  button {
    padding: 9px 17px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.sm};
    background: #2a2a2d;
    color: ${theme.colors.text};
    font-size: 14px;
    line-height: 20px;
    font-weight: 800;
  }

  button:disabled {
    opacity: 0.55;
  }
`;

const MetricsCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 25px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  background: ${theme.colors.panelAlt};
`;

const MetricsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    color: ${theme.colors.textSoft};
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${theme.colors.blue};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;

const Metric = styled.div`
  min-height: 77px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.sm};
  background: #1f1f22;

  span {
    color: ${theme.colors.textSoft};
    font-size: 10px;
    line-height: 15px;
    font-weight: 800;
  }

  strong {
    color: ${theme.colors.text};
    font-size: 24px;
    line-height: 32px;
  }

  &[data-tone="danger"] strong {
    color: ${theme.colors.dangerSoft};
  }

  &[data-tone="warning"] strong {
    color: ${theme.colors.warning};
  }

  &[data-tone="info"] strong {
    color: ${theme.colors.info};
  }

  &[data-tone="safe"] strong {
    color: ${theme.colors.success};
  }
`;

const ProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    display: flex;
    justify-content: space-between;
    color: ${theme.colors.textSoft};
    font-size: 11px;
    line-height: 16px;
  }

  strong {
    color: ${theme.colors.info};
  }

  i {
    height: 8px;
    border-radius: ${theme.radius.pill};
    background:
      linear-gradient(90deg, ${theme.colors.info} 0 var(--progress, 0%), transparent var(--progress, 0%)),
      #353438;
  }
`;

const EmptyState = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: ${theme.colors.panel};
  color: ${theme.colors.textSoft};

  strong {
    color: ${theme.colors.text};
    font-size: 16px;
    line-height: 24px;
  }
`;
