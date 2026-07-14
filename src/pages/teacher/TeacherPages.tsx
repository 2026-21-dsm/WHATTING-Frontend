import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { AppStage, MobileShell } from "../../components/layout/MobileShell";
import {
  FieldStack,
  FormField,
  GhostLink,
  PillLink,
  PrimaryAction,
} from "../../components/ui/Controls";
import { StudentRoster } from "../../components/ui/StudentRoster";
import { alertTypes, dashboardStats } from "../../data/teacherMock";
import { theme } from "../../styles/theme";

export function TeacherLoginPage() {
  return (
    <AppStage>
      <MobileShell showProfile={false}>
        <AuthContent>
          <AuthTitle>로그인</AuthTitle>
          <AuthForm>
            <FieldStack>
              <FormField icon="user" label="이름" placeholder="실명 입력" />
              <FormField icon="lock" label="비밀번호" placeholder="8자 이상 입력" />
            </FieldStack>
            <LoginAction to="/teacher/home">로그인</LoginAction>
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
  return (
    <AppStage>
      <MobileShell showProfile={false}>
        <SignupContent>
          <SignupCard>
            <AuthTitle>교사 계정 생성</AuthTitle>
            <FieldStack>
              <FormField icon="school" label="학교명" placeholder="소속 학교 입력" />
              <FormField icon="user" label="성함" placeholder="실명 입력" />
              <FormField icon="lock" label="비밀번호" placeholder="8자 이상 입력" />
              <FormField icon="shield" label="비밀번호 확인" placeholder="비밀번호 재입력" />
            </FieldStack>
            <PrimaryAction to="/teacher/home">교사 프로필 생성</PrimaryAction>
            <StatusStrip>
              <span>
                <i />
                인증 실패
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
  return (
    <AppStage>
      <MobileShell bottomTab="home" showProfile>
        <HomeContent>
          <WelcomeBlock>
            <p>교사 대시보드</p>
            <h1>
              안녕하세요, <strong>홍길동 선생님</strong>
            </h1>
            <MetaRow>
              <span>2024년 5월 24일 금요일</span>
              <span>오전 9:10</span>
            </MetaRow>
          </WelcomeBlock>
          <StatusCard>
            <StatusCheck />
            <div>
              <h2>활성 알림 없음</h2>
              <p>현재 진행중인 경보가 없습니다.</p>
            </div>
          </StatusCard>
          <EmergencyAction to="/teacher/alert/new">
            <BellIcon />
            긴급 경보 생성
          </EmergencyAction>
        </HomeContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertDashboardPage() {
  return (
    <AppStage>
      <MobileShell bottomTab="home" showProfile tall>
        <DashboardContent>
          <AlertTypeCard>
            <h1>경보 유형</h1>
            <strong>훈련</strong>
          </AlertTypeCard>
          <ClassStatusCard />
          <ClassStatusCard />
          <PrimaryAction to="/teacher/result">경보 끝내기</PrimaryAction>
        </DashboardContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertCreatePage() {
  return (
    <AppStage>
      <MobileShell bottomTab="alerts" showProfile tall>
        <CreateContent>
          <Kicker>지휘 센터</Kicker>
          <CreateTitle>알림 생성</CreateTitle>
          <AlertTypeGrid>
            {alertTypes.map((type) => (
              <TypeCard key={type.title} data-tone={type.tone}>
                <TypeIcon />
                <strong>{type.title}</strong>
                <span>{type.description}</span>
              </TypeCard>
            ))}
          </AlertTypeGrid>
          <FieldStack>
            <FormField icon="text" label="알림 제목" placeholder="알림 제목입력" />
            <FormField icon="text" label="세부 지시 사항" placeholder="소속 학교 입력" large />
          </FieldStack>
          <PrimaryAction to="/teacher/active">알림 보내기</PrimaryAction>
        </CreateContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherAlertTypePage() {
  return (
    <AppStage>
      <MobileShell title="경보 유형 변경">
        <TypeChangeContent>
          <Kicker>경보 유형 변경</Kicker>
          <TypeChoiceGrid>
            {["실제 긴급 상황", "훈련", "점검", "오작동"].map((label) => (
              <TypeChoice key={label} data-active={label === "훈련"}>
                {label}
              </TypeChoice>
            ))}
          </TypeChoiceGrid>
          <FormField icon="text" label="경보 유형 변경 사유" placeholder="사유 입력" large />
          <PrimaryAction to="/teacher/active">변경하기</PrimaryAction>
        </TypeChangeContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherStudentListPage() {
  return (
    <AppStage>
      <StudentListShell>
        <StudentRoster />
      </StudentListShell>
    </AppStage>
  );
}

export function TeacherStudentConfirmPage() {
  return (
    <AppStage>
      <StudentListShell>
        <StudentRoster />
        <FloatingConfirm to="/teacher/students">도착 확인</FloatingConfirm>
      </StudentListShell>
    </AppStage>
  );
}

export function TeacherHelpRequestsPage() {
  return (
    <AppStage>
      <MobileShell bottomTab="alerts" title="도움 요청">
        <HelpContent>
          <SegmentedControl>
            {["전체", "미확인", "확인됨", "해결됨"].map((label, index) => (
              <span key={label} data-active={index === 0}>
                {label}
              </span>
            ))}
          </SegmentedControl>
          <StudentRoster compact onlyUrgent />
        </HelpContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherHelpDetailPage() {
  return (
    <AppStage>
      <MobileShell bottomTab="alerts" title="상세 상태 확인">
        <DetailContent>
          <DetailCard>
            <StudentRoster compact onlyUrgent />
            <DetailTime>14:02</DetailTime>
            <DetailBlock>
              <span>상세 내용</span>
              <p>릅즈랍ㅈ다랴</p>
            </DetailBlock>
          </DetailCard>
          <StatusStepGrid>
            {["미확인", "확인됨", "해결됨"].map((label, index) => (
              <StatusStep key={label} data-active={index === 1}>
                <span />
                {label}
              </StatusStep>
            ))}
          </StatusStepGrid>
          <PrimaryAction to="/teacher/help">상태 변경</PrimaryAction>
        </DetailContent>
      </MobileShell>
    </AppStage>
  );
}

export function TeacherResultPage() {
  return (
    <AppStage>
      <MobileShell bottomTab="students" title="최종 결과" tall>
        <ResultContent>
          <SummaryCard>
            <h2>화재 대피 훈련</h2>
            <p>시작: 14:02:45 | 경과: 00:08:12</p>
            <SummaryActions>
              <Link to="/teacher/alert/type">훈련 편집</Link>
              <Link to="/teacher/active">오류 보고</Link>
            </SummaryActions>
          </SummaryCard>
          <MetricsCard>
            <MetricsHead>
              <h2>실시간 인원 현황</h2>
              <i />
            </MetricsHead>
            <MetricsGrid>
              {dashboardStats.map((stat) => (
                <Metric key={stat.label} data-tone={stat.tone}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </Metric>
              ))}
            </MetricsGrid>
            <ProgressBlock>
              <div>
                <span>대피 진행률</span>
                <strong>71%</strong>
              </div>
              <i />
            </ProgressBlock>
          </MetricsCard>
          <StudentRoster />
          <ResultAction to="/teacher/home">최종 확인 후 끝내기</ResultAction>
        </ResultContent>
      </MobileShell>
    </AppStage>
  );
}

function StudentListShell({ children }: { children: ReactNode }) {
  return (
    <MobileShell bottomTab="students" showBrand={false} tall>
      <RosterHeader>
        <RosterTitleRow>
          <h1>학생 안전 체크리스트</h1>
          <span>전체 학년</span>
        </RosterTitleRow>
        <SearchBox placeholder="이름 또는 학급 검색..." aria-label="학생 검색" />
        <FilterRow>
          {["전체", "도움 요청", "대피완료", "대피중", "응답없음"].map((filter) => (
            <span key={filter}>{filter}</span>
          ))}
        </FilterRow>
      </RosterHeader>
      {children}
    </MobileShell>
  );
}

function ClassStatusCard() {
  return (
    <ClassCard>
      <Kicker>학급 2-A 현황</Kicker>
      <ClassMain>
        <div>
          <MutedLabel>현재 학생</MutedLabel>
          <CountText>
            28 <small>/ 30명</small>
          </CountText>
        </div>
        <Ring>
          <span>93%</span>
        </Ring>
      </ClassMain>
      <MiniStats>
        <MiniStat>
          <span>결석</span>
          <strong>2</strong>
        </MiniStat>
        <MiniStat>
          <span>대피 완료</span>
          <strong>28</strong>
        </MiniStat>
      </MiniStats>
    </ClassCard>
  );
}

const AuthContent = styled.section`
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
  min-height: 596px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoginAction = styled(PrimaryAction)`
  margin-top: auto;
`;

const SignupContent = styled.section`
  min-height: 680px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 16px 0;
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
`;

const StatusCard = styled.section`
  min-height: 126px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 40px;
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

const EmergencyAction = styled(PillLink)`
  align-self: center;
  margin-top: auto;
  margin-bottom: 28px;
`;

const BellIcon = styled.span`
  width: 19px;
  height: 24px;
  border: 2px solid currentColor;
  border-radius: 9px 9px 4px 4px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 6px;
    bottom: -6px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const DashboardContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px 112px;
`;

const AlertTypeCard = styled.section`
  min-height: 79px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: ${theme.colors.panel};

  h1,
  strong {
    margin: 0;
    font-size: 24px;
    line-height: 28px;
    font-weight: 800;
  }

  strong {
    color: ${theme.colors.dangerSoft};
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
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 16px 112px;
`;

const CreateTitle = styled.h1`
  margin: -18px 0 12px;
  font-size: 32px;
  line-height: 40px;
  font-weight: 900;
`;

const AlertTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TypeCard = styled.div`
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 16px 20px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  background: ${theme.colors.panel};

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

  &[data-tone="drill"] {
    border-color: rgba(255, 180, 171, 0.5);
    background: rgba(255, 180, 171, 0.08);
  }
`;

const TypeIcon = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid ${theme.colors.dangerSoft};
`;

const TypeChangeContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px 0;
`;

const TypeChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const TypeChoice = styled.div`
  min-height: 66px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radius.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.panel};
  color: ${theme.colors.textSoft};
  font-size: 16px;
  line-height: 24px;
  font-weight: 800;

  &[data-active="true"] {
    color: ${theme.colors.dangerSoft};
    border-color: rgba(255, 180, 171, 0.55);
    background: rgba(255, 180, 171, 0.06);
  }
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

  span {
    flex: 0 0 auto;
    padding: 7px 12px;
    border-radius: ${theme.radius.pill};
    background: #1f1f22;
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
    font-weight: 800;
  }
`;

const FloatingConfirm = styled(PrimaryAction)`
  width: calc(100% - 32px);
  margin: 18px 16px 112px;
`;

const HelpContent = styled.section`
  padding: 12px 16px 112px;
`;

const SegmentedControl = styled.div`
  width: max-content;
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 24px;
  border-radius: ${theme.radius.sm};
  background: #1f1f22;

  span {
    padding: 7px 12px;
    border-radius: 6px;
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
    font-weight: 800;
  }

  span[data-active="true"] {
    background: ${theme.colors.dangerSoft};
    color: ${theme.colors.bg};
  }
`;

const DetailContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 16px 112px;
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
  padding: 20px 11px 112px;
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

  a {
    padding: 9px 17px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.sm};
    background: #2a2a2d;
    color: ${theme.colors.text};
    font-size: 14px;
    line-height: 20px;
    font-weight: 800;
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
      linear-gradient(90deg, ${theme.colors.info} 0 71%, transparent 71%),
      #353438;
  }
`;
