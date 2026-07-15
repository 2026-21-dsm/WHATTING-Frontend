import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styled from "@emotion/styled";
import { theme } from "../../styles/theme";
import whattingLogo from "../../../whatting_logo.svg";

type BottomTab = "home" | "students" | "alerts";
type ShellRole = "teacher" | "student";

type MobileShellProps = {
  children: ReactNode;
  title?: string;
  showBrand?: boolean;
  showProfile?: boolean;
  bottomTab?: BottomTab;
  tall?: boolean;
  role?: ShellRole;
};

const roleTabItems: Record<ShellRole, Array<{ key: BottomTab; label: string; to: string }>> = {
  teacher: [
    { key: "home", label: "홈", to: "/teacher/active" },
    { key: "students", label: "명단", to: "/teacher/students" },
    { key: "alerts", label: "알림", to: "/teacher/help" },
  ],
  student: [
    { key: "home", label: "홈", to: "/student/home" },
    { key: "alerts", label: "알림", to: "/student/alerts" },
    { key: "students", label: "도움 요청", to: "/student/help/new" },
  ],
};

export function AppStage({ children }: { children: ReactNode }) {
  return <Stage>{children}</Stage>;
}

export function MobileShell({
  children,
  title,
  showBrand = true,
  showProfile = false,
  bottomTab,
  tall = false,
  role = "teacher",
}: MobileShellProps) {
  return (
    <Phone data-tall={tall}>
      <StatusBar />
      {(showBrand || title) && (
        <Header>
          {title ? <HeaderTitle>{title}</HeaderTitle> : <BrandLogo src={whattingLogo} alt="왓팅" />}
          {showProfile && <ProfileButton aria-label="내 정보" />}
        </Header>
      )}
      <Content data-with-nav={Boolean(bottomTab)}>{children}</Content>
      {bottomTab && <BottomNavigation active={bottomTab} role={role} />}
      <HomeIndicator />
    </Phone>
  );
}

function StatusBar() {
  return (
    <Status aria-hidden="true">
      <span>9:41</span>
      <StatusIcons>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </StatusIcons>
    </Status>
  );
}

function BottomNavigation({ active, role }: { active: BottomTab; role: ShellRole }) {
  return (
    <BottomNav aria-label={role === "student" ? "학생 하단 탭" : "교사 하단 탭"}>
      {roleTabItems[role].map((item) => (
        <BottomNavLink
          key={item.key}
          to={item.to}
          className={active === item.key ? "active" : undefined}
        >
          <TabGlyph data-tab={item.key} />
          <span>{item.label}</span>
        </BottomNavLink>
      ))}
    </BottomNav>
  );
}

const Stage = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;

  @media (max-width: 520px) {
    padding: 0;
    place-items: stretch;
  }
`;

const Phone = styled.main`
  width: min(100vw, 390px);
  min-height: 844px;
  max-height: min(100vh, 920px);
  position: relative;
  overflow: hidden;
  background: ${theme.colors.bg};
  color: ${theme.colors.text};
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 30px 90px rgba(0, 0, 0, 0.55);

  &[data-tall="true"] {
    overflow-y: auto;
    scrollbar-width: none;
  }

  &[data-tall="true"]::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 520px) {
    width: 100vw;
    min-height: 100vh;
    max-height: none;
  }
`;

const Status = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px 0 39px;
  color: ${theme.colors.text};
  font-size: 14px;
  font-weight: 700;
  background: ${theme.colors.bg};
`;

const StatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SignalIcon = styled.span`
  width: 16px;
  height: 12px;
  display: inline-block;
  background:
    linear-gradient(to top, #fff 38%, transparent 38%) 0 7px / 3px 5px no-repeat,
    linear-gradient(to top, #fff 58%, transparent 58%) 5px 5px / 3px 7px no-repeat,
    linear-gradient(to top, #fff 78%, transparent 78%) 10px 3px / 3px 9px no-repeat;
`;

const WifiIcon = styled.span`
  width: 14px;
  height: 11px;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    border: 2px solid #fff;
    border-color: #fff transparent transparent transparent;
    border-radius: 999px;
    transform: translateX(-50%);
  }

  &::before {
    width: 14px;
    height: 14px;
    top: 1px;
  }

  &::after {
    width: 7px;
    height: 7px;
    top: 5px;
  }
`;

const BatteryIcon = styled.span`
  width: 22px;
  height: 11px;
  border: 1.5px solid #fff;
  border-radius: 2px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 2px 4px 2px 2px;
    background: #fff;
    border-radius: 1px;
  }

  &::after {
    content: "";
    position: absolute;
    right: -4px;
    top: 3px;
    width: 2px;
    height: 5px;
    background: #fff;
    border-radius: 0 2px 2px 0;
  }
`;

const Header = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: ${theme.colors.bg};
`;

const BrandLogo = styled.img`
  display: block;
  width: 80px;
  height: 35px;
  object-fit: contain;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
`;

const ProfileButton = styled.button`
  width: 34px;
  height: 34px;
  border: 2px solid ${theme.colors.textSoft};
  border-radius: 50%;
  position: relative;
  background: transparent;

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.colors.textSoft};
  }

  &::before {
    top: 7px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &::after {
    bottom: 6px;
    width: 19px;
    height: 9px;
    border-radius: 999px 999px 4px 4px;
  }
`;

const Content = styled.div`
  min-height: calc(100% - 108px);
  padding-bottom: 40px;

  &[data-with-nav="true"] {
    padding-bottom: 110px;
  }
`;

const BottomNav = styled.nav`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 81px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1px 52px 0;
  background: rgba(19, 19, 22, 0.86);
  border-top: 1px solid ${theme.colors.border};
  backdrop-filter: blur(10px);
`;

const BottomNavLink = styled(NavLink)`
  width: 44px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${theme.colors.textSoft};
  font-size: 10px;
  line-height: 15px;
  position: relative;

  &.active {
    color: ${theme.colors.dangerSoft};
  }

  &.active::before {
    content: "";
    position: absolute;
    top: -17px;
    width: 48px;
    height: 4px;
    border-radius: ${theme.radius.pill};
    background: ${theme.colors.dangerSoft};
  }
`;

const TabGlyph = styled.span`
  width: 23px;
  height: 23px;
  position: relative;

  &[data-tab="home"]::before {
    content: "";
    position: absolute;
    left: 2px;
    top: 2px;
    width: 6px;
    height: 6px;
    border: 2px solid currentColor;
    border-radius: 2px;
    box-shadow: 11px 0 0 -2px currentColor, 0 11px 0 -2px currentColor,
      11px 11px 0 -2px currentColor;
  }

  &[data-tab="students"]::before,
  &[data-tab="students"]::after {
    content: "";
    position: absolute;
    border: 2px solid currentColor;
    border-radius: 999px;
  }

  &[data-tab="students"]::before {
    width: 8px;
    height: 8px;
    left: 7px;
    top: 2px;
  }

  &[data-tab="students"]::after {
    width: 20px;
    height: 10px;
    left: 1px;
    bottom: 2px;
    border-top-left-radius: 999px;
    border-top-right-radius: 999px;
  }

  &[data-tab="alerts"]::before {
    content: "";
    position: absolute;
    left: 3px;
    top: 1px;
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 19px solid currentColor;
  }

  &[data-tab="alerts"]::after {
    content: "!";
    position: absolute;
    left: 10px;
    top: 4px;
    color: ${theme.colors.bg};
    font-size: 13px;
    font-weight: 900;
  }
`;

const HomeIndicator = styled.div`
  position: absolute;
  left: 50%;
  bottom: 5px;
  width: 140px;
  height: 5px;
  transform: translateX(-50%);
  border-radius: ${theme.radius.pill};
  background: #fff;
`;
