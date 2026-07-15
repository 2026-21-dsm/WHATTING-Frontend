import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { AppStage, MobileShell } from "../../components/layout/MobileShell";
import {
  FieldStack,
  FormError,
  FormField,
  GhostLink,
  PrimaryButton,
} from "../../components/ui/Controls";
import { authApi, setStoredUser, setToken } from "../../api";
import { theme } from "../../styles/theme";

type LoginPageProps = {
  // 로그인은 공용이지만, 회원가입 링크만 배포 URL(teacher/student)에 맞춰 분기
  signupRole?: "teacher" | "student";
};

export function LoginPage({ signupRole = "student" }: LoginPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      // 입력값으로 서버가 역할을 판별해 반환 → 역할 기준으로 라우팅
      const result = await authApi.login({ name, password });
      if (!result) throw new Error("no-response");
      setToken(result.accessToken);
      setStoredUser(result.user);
      navigate(result.user.role === "TEACHER" ? "/teacher/active" : "/student/help/new");
    } catch {
      setError("이름 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const signupPath = signupRole === "teacher" ? "/teacher/signup" : "/student/signup";

  return (
    <AppStage>
      <MobileShell showProfile={false}>
        <AuthContent onSubmit={handleSubmit}>
          <AuthTitle>로그인</AuthTitle>
          <AuthForm>
            <FieldStack>
              <FormField icon="user" label="이름" placeholder="실명 입력" name="name" />
              <FormField
                icon="lock"
                label="비밀번호"
                placeholder="8자 이상 입력"
                name="password"
                type="password"
              />
            </FieldStack>
            {error && <FormError>{error}</FormError>}
            <LoginAction type="submit" disabled={submitting}>
              {submitting ? "로그인 중..." : "로그인"}
            </LoginAction>
            <SwitchText>
              계정이 없으신가요? <GhostLink to={signupPath}>회원가입</GhostLink>
            </SwitchText>
          </AuthForm>
        </AuthContent>
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
  min-height: 596px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LoginAction = styled(PrimaryButton)`
  margin-top: auto;

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
