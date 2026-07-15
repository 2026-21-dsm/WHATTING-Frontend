import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { AppStage, MobileShell } from "../../components/layout/MobileShell";
import {
  CompactField,
  CompactFieldRow,
  FieldStack,
  FormError,
  FormField,
  GhostLink,
  PrimaryAction,
  PrimaryButton,
} from "../../components/ui/Controls";
import {
  alertApi,
  authApi,
  helpApi,
  studentStatusApi,
  type Alert,
  type AlertType,
  type HelpCategory,
  type HelpStatus,
} from "../../api";
import { theme } from "../../styles/theme";

import schoolIcon from "../../assets/icons/student/school.svg";
import userIcon from "../../assets/icons/student/user.svg";
import lockIcon from "../../assets/icons/student/lock.svg";
import shieldIcon from "../../assets/icons/student/shield.svg";
import eyeToggleIcon from "../../assets/icons/student/eye-toggle.svg";
import locationPinIcon from "../../assets/icons/student/location-pin.svg";
import editPencilIcon from "../../assets/icons/student/edit-pencil.svg";
import categoryMobilityIcon from "../../assets/icons/student/category-mobility.svg";
import categoryMedicalIcon from "../../assets/icons/student/category-medical.svg";
import categoryIsolationIcon from "../../assets/icons/student/category-isolation.svg";
import categoryOtherIcon from "../../assets/icons/student/category-other.svg";

export function StudentSignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.studentSignup({
        schoolName: String(form.get("schoolName") ?? "").trim(),
        grade: Number(form.get("grade")),
        classNumber: Number(form.get("classNumber")),
        studentNumber: Number(form.get("studentNumber")),
        name: String(form.get("name") ?? "").trim(),
        password,
      });
      navigate("/student/login");
    } catch {
      setError("가입에 실패했습니다. 입력값을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppStage>
      <MobileShell role="student" showProfile={false}>
        <AuthContent onSubmit={handleSubmit}>
          <AuthTitle>학생 계정생성</AuthTitle>
          <AuthForm>
            <FieldStack>
              <FormField
                icon="school"
                iconSrc={schoolIcon}
                label="학교명"
                placeholder="소속 학교 입력"
                name="schoolName"
              />
              <CompactFieldRow>
                <CompactField label="학년" placeholder="10" name="grade" />
                <CompactField label="반" placeholder="1" name="classNumber" />
                <CompactField label="번호" placeholder="24" name="studentNumber" />
              </CompactFieldRow>
              <FormField icon="user" iconSrc={userIcon} label="이름" placeholder="실명 입력" name="name" />
              <FormField
                icon="lock"
                iconSrc={lockIcon}
                label="비밀번호"
                placeholder="8자 이상 입력"
                name="password"
                showPasswordToggle
                toggleIconSrc={eyeToggleIcon}
              />
              <FormField
                icon="shield"
                iconSrc={shieldIcon}
                label="비밀번호 확인"
                placeholder="비밀번호 재입력"
                name="passwordConfirm"
              />
            </FieldStack>
            {error && <FormError>{error}</FormError>}
            <SignupAction type="submit" disabled={submitting}>
              {submitting ? "가입 중..." : "가입하기"}
            </SignupAction>
          </AuthForm>
          <SwitchText>
            이미 계정이 있으신가요? <GhostLink to="/student/login">로그인</GhostLink>
          </SwitchText>
        </AuthContent>
      </MobileShell>
    </AppStage>
  );
}

const helpCategories: Array<{ value: HelpCategory; label: string; icon: string }> = [
  { value: "MOBILITY_DIFFICULTY", label: "이동 지원", icon: categoryMobilityIcon },
  { value: "OTHER_PERSON_NEEDS_HELP", label: "의료 지원", icon: categoryMedicalIcon },
  { value: "EXIT_BLOCKED", label: "고립 상황", icon: categoryIsolationIcon },
  { value: "OTHER", label: "기타 상황", icon: categoryOtherIcon },
];

const alertTypeLabel: Record<AlertType, string> = {
  REAL: "실제 상황",
  DRILL: "훈련",
  INSPECTION: "점검",
  MALFUNCTION: "오작동",
};

const helpStatusLabel: Record<HelpStatus, string> = {
  UNCHECKED: "확인 대기",
  ACKNOWLEDGED: "확인됨 · 조치 중",
  RESOLVED: "처리 완료",
};

const categoryLabel: Record<HelpCategory, string> = {
  MOBILITY_DIFFICULTY: "이동 지원",
  ROUTE_UNKNOWN: "경로 미확인",
  EXIT_BLOCKED: "고립 상황",
  OTHER_PERSON_NEEDS_HELP: "의료 지원",
  OTHER: "기타 상황",
};

type MyHelpRequest = {
  helpRequestId: string;
  helpStatus: HelpStatus;
  locationText: string;
  category: HelpCategory;
  details?: string;
};

export function StudentHelpRequestPage() {
  const [category, setCategory] = useState<HelpCategory>("MOBILITY_DIFFICULTY");
  const [locationText, setLocationText] = useState("본관 3층 2학년 1반 앞");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!locationText.trim()) {
      setError("현재 위치를 입력해 주세요.");
      return;
    }

    setStatus("sending");
    try {
      // 활성 경보를 조회한 뒤 해당 경보에 도움 요청 생성
      const active = await alertApi.getActive();
      if (!active) throw new Error("no-active-alert");
      await helpApi.create(active.alertId, {
        locationText: locationText.trim(),
        category,
        details: details.trim() || undefined,
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("도움 요청 전송에 실패했습니다.");
    }
  }

  return (
    <AppStage>
      <MobileShell role="student" title="도움 요청 작성" bottomTab="students" tall>
        <HelpRequestContent>
          <IntroText>요청 시 현재 위치가 구조팀과 학교 운영팀에 즉시 전달됩니다.</IntroText>

          <Section>
            <SectionLabel>현재 위치</SectionLabel>
            <LocationCard>
              <LocationIconBadge>
                <img src={locationPinIcon} alt="" />
              </LocationIconBadge>
              <LocationInput
                value={locationText}
                onChange={(event) => setLocationText(event.target.value)}
                aria-label="현재 위치"
              />
              <EditLocationButton type="button" aria-label="위치 수정">
                <img src={editPencilIcon} alt="" />
              </EditLocationButton>
            </LocationCard>
          </Section>

          <Section>
            <SectionLabel>지원 유형 선택</SectionLabel>
            <CategoryGrid>
              {helpCategories.map((item) => (
                <CategoryCard
                  key={item.value}
                  type="button"
                  data-active={item.value === category}
                  onClick={() => setCategory(item.value)}
                >
                  <img src={item.icon} alt="" />
                  <span>{item.label}</span>
                </CategoryCard>
              ))}
            </CategoryGrid>
          </Section>

          <Section>
            <SectionLabel>상세 내용 (선택)</SectionLabel>
            <DetailsTextarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="상황을 간단히 설명해 주세요..."
              aria-label="상세 내용"
            />
          </Section>

          {error && <FormError>{error}</FormError>}
          <SubmitAction type="button" onClick={handleSubmit} disabled={status !== "idle"}>
            {status === "sending" ? "전송 중..." : status === "sent" ? "요청 전송됨" : "도움 요청 보내기"}
          </SubmitAction>
        </HelpRequestContent>
      </MobileShell>
    </AppStage>
  );
}

export function StudentHomePage() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      alertApi
        .getActive()
        .then((data) => mounted && setAlert(data ?? null))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 4000); // 3~5초 Polling
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <AppStage>
      <MobileShell role="student" bottomTab="home" showProfile>
        <HomeContent>
          {alert ? (
            <ActiveAlertCard type="button" onClick={() => navigate("/student/alerts")}>
              <AlertBadge>{alertTypeLabel[alert.type]}</AlertBadge>
              <strong>{alert.title}</strong>
              <span>{alert.message}</span>
              <em>탭하여 대피 상태 보고 →</em>
            </ActiveAlertCard>
          ) : (
            <IdleCard>
              <IdleCheck />
              <div>
                <h2>활성 알림 없음</h2>
                <p>현재 진행중인 경보가 없습니다.</p>
              </div>
            </IdleCard>
          )}
        </HomeContent>
      </MobileShell>
    </AppStage>
  );
}

export function StudentActiveAlertPage() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [pending, setPending] = useState<"EVACUATING" | "EVACUATED" | null>(null);

  useEffect(() => {
    let mounted = true;
    alertApi
      .getActive()
      .then((data) => mounted && setAlert(data ?? null))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function report(status: "EVACUATING" | "EVACUATED") {
    if (!alert) return;
    setPending(status);
    try {
      await studentStatusApi.updateMine(alert.alertId, status);
    } catch {
      /* 시연용: 실패해도 무시 */
    } finally {
      setPending(null);
    }
  }

  return (
    <AppStage>
      <MobileShell role="student" bottomTab="alerts" showProfile tall>
        <ActiveContent>
          <AlertTypeCard>
            <span>경보 유형</span>
            <strong>{alert ? alertTypeLabel[alert.type] : "—"}</strong>
          </AlertTypeCard>

          <StatusActions>
            <StatusAction type="button" data-tone="evacuating" onClick={() => report("EVACUATING")}>
              <i />
              대피 중
              {pending === "EVACUATING" && <small>전송 중...</small>}
            </StatusAction>
            <StatusAction type="button" data-tone="evacuated" onClick={() => report("EVACUATED")}>
              <i />
              대피 완료
              {pending === "EVACUATED" && <small>전송 중...</small>}
            </StatusAction>
            <StatusAction type="button" data-tone="help" onClick={() => navigate("/student/help/new")}>
              <i />
              도움 요청
            </StatusAction>
          </StatusActions>

          <DetailAction to="/student/help/me">상세 상태 확인하기</DetailAction>
        </ActiveContent>
      </MobileShell>
    </AppStage>
  );
}

export function StudentMyHelpPage() {
  const navigate = useNavigate();
  const [request, setRequest] = useState<MyHelpRequest | null>(null);

  useEffect(() => {
    let mounted = true;
    alertApi
      .getActive()
      .then((active) => {
        if (!active) return;
        return helpApi.getMine(active.alertId);
      })
      .then((data) => mounted && setRequest((data as MyHelpRequest | null) ?? null))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppStage>
      <MobileShell role="student" title="내 도움 요청" bottomTab="students" tall>
        <MyHelpContent>
          {request ? (
            <>
              <StatusPill data-status={request.helpStatus}>
                {helpStatusLabel[request.helpStatus]}
              </StatusPill>

              <Section>
                <SectionLabel>현재 위치</SectionLabel>
                <LocationCard>
                  <LocationIconBadge>
                    <img src={locationPinIcon} alt="" />
                  </LocationIconBadge>
                  <LocationText>{request.locationText}</LocationText>
                </LocationCard>
              </Section>

              <Section>
                <SectionLabel>지원 유형</SectionLabel>
                <ReadonlyValue>{categoryLabel[request.category]}</ReadonlyValue>
              </Section>

              {request.details && (
                <Section>
                  <SectionLabel>상세 내용</SectionLabel>
                  <ReadonlyValue>{request.details}</ReadonlyValue>
                </Section>
              )}

              <SubmitAction type="button" onClick={() => navigate("/student/help/new")}>
                도움 상태 수정하기
              </SubmitAction>
            </>
          ) : (
            <EmptyText>진행 중인 도움 요청이 없습니다.</EmptyText>
          )}
        </MyHelpContent>
      </MobileShell>
    </AppStage>
  );
}

const AuthContent = styled.form`
  min-height: 680px;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 0;
`;

const AuthTitle = styled.h1`
  margin: 0 0 28px;
  color: ${theme.colors.text};
  font-size: 24px;
  line-height: 28px;
  font-weight: 800;
`;

const AuthForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SignupAction = styled(PrimaryButton)`
  margin-top: 4px;

  &:disabled {
    opacity: 0.6;
  }
`;

const SwitchText = styled.p`
  margin: 22px 0;
  color: ${theme.colors.textMuted};
  font-size: 16px;
  line-height: 24px;
  text-align: center;
`;

const HelpRequestContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 16px 112px;
`;

const IntroText = styled.p`
  margin: 0;
  color: ${theme.colors.textSoft};
  font-size: 16px;
  line-height: 24px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.p`
  margin: 0;
  color: ${theme.colors.textSoft};
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
`;

const LocationCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: ${theme.radius.md};
  background: #1b1b1e;
`;

const LocationIconBadge = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: ${theme.radius.sm};
  background: rgba(180, 197, 255, 0.1);

  img {
    display: block;
  }
`;

const LocationInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${theme.colors.text};
  caret-color: ${theme.colors.dangerSoft};
  font-size: 16px;
  line-height: 24px;
  font-weight: 800;
`;

const LocationText = styled.p`
  flex: 1;
  margin: 0;
  color: ${theme.colors.text};
  font-size: 16px;
  line-height: 24px;
  font-weight: 800;
`;

const EditLocationButton = styled.button`
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  padding: 8px;
  border: 0;
  border-radius: ${theme.radius.sm};
  background: transparent;
  cursor: pointer;

  img {
    display: block;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const CategoryCard = styled.button`
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${theme.radius.md};
  background: #1b1b1e;
  color: #e4e1e6;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;

  &[data-active="true"] {
    border-color: transparent;
    background: ${theme.colors.danger};
    color: ${theme.colors.text};
  }
`;

const DetailsTextarea = styled.textarea`
  width: 100%;
  min-height: 128px;
  padding: 16px;
  border: 0;
  outline: 0;
  resize: none;
  border-radius: ${theme.radius.md};
  background: #1b1b1e;
  color: ${theme.colors.text};
  caret-color: ${theme.colors.dangerSoft};
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  &::placeholder {
    color: rgba(141, 144, 160, 0.4);
    opacity: 1;
  }
`;

const SubmitAction = styled(PrimaryButton)`
  margin-top: 4px;

  &:disabled {
    opacity: 0.6;
  }
`;

// --- 학생 홈 (평상시 / 경보 활성) ---
const HomeContent = styled.section`
  min-height: 656px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 16px 0;
`;

const IdleCard = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
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

const IdleCheck = styled.div`
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 18px;
    top: 16px;
    width: 18px;
    height: 10px;
    border-left: 5px solid ${theme.colors.success};
    border-bottom: 5px solid ${theme.colors.success};
    transform: rotate(-45deg);
  }
`;

const ActiveAlertCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px;
  border: 1px solid rgba(255, 180, 171, 0.5);
  border-radius: ${theme.radius.lg};
  background: rgba(239, 68, 68, 0.08);
  color: ${theme.colors.text};
  text-align: left;
  cursor: pointer;

  strong {
    font-size: 22px;
    line-height: 30px;
  }

  span {
    color: ${theme.colors.textSoft};
    font-size: 15px;
    line-height: 22px;
  }

  em {
    margin-top: 8px;
    color: ${theme.colors.dangerSoft};
    font-size: 13px;
    font-style: normal;
    font-weight: 800;
  }
`;

const AlertBadge = styled.span`
  padding: 4px 12px;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.danger};
  color: ${theme.colors.text} !important;
  font-size: 12px;
  font-weight: 800;
`;

const ActiveContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px 112px;
`;

const AlertTypeCard = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: ${theme.colors.panel};

  span {
    color: ${theme.colors.textSoft};
    font-size: 15px;
  }

  strong {
    font-size: 24px;
    line-height: 28px;
    font-weight: 800;
    color: ${theme.colors.dangerSoft};
  }
`;

const StatusActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatusAction = styled.button`
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: ${theme.colors.panel};
  color: ${theme.colors.text};
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;

  i {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  small {
    margin-left: auto;
    color: ${theme.colors.textSoft};
    font-size: 12px;
    font-weight: 500;
  }

  &[data-tone="evacuating"] i {
    background: ${theme.colors.success};
  }

  &[data-tone="evacuated"] i {
    background: ${theme.colors.info};
  }

  &[data-tone="help"] {
    border-color: rgba(255, 180, 171, 0.5);
    background: rgba(239, 68, 68, 0.08);
  }

  &[data-tone="help"] i {
    background: ${theme.colors.danger};
  }
`;

const DetailAction = styled(PrimaryAction)`
  margin-top: 8px;
`;

// --- 내 도움 요청 ---
const MyHelpContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 16px 112px;
`;

const StatusPill = styled.span`
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: ${theme.radius.pill};
  background: #1f1f22;
  color: ${theme.colors.textSoft};
  font-size: 13px;
  font-weight: 800;

  &[data-status="ACKNOWLEDGED"] {
    background: rgba(180, 197, 255, 0.12);
    color: ${theme.colors.info};
  }

  &[data-status="RESOLVED"] {
    background: rgba(16, 185, 129, 0.12);
    color: ${theme.colors.success};
  }
`;

const ReadonlyValue = styled.p`
  margin: 0;
  padding: 16px;
  border-radius: ${theme.radius.md};
  background: #1b1b1e;
  color: ${theme.colors.text};
  font-size: 16px;
  line-height: 24px;
`;

const EmptyText = styled.p`
  margin: 48px 0;
  color: ${theme.colors.textMuted};
  font-size: 16px;
  text-align: center;
`;
