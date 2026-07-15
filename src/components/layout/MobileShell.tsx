import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styled from "@emotion/styled";
import { useNow } from "../../hooks/useNow";
import { theme } from "../../styles/theme";
import whattingLogo from "../../../whatting_logo.svg";
import profileIcon from "../../assets/icons/profile.svg";
import statusBatteryIcon from "../../assets/icons/status-battery.svg";
import statusSignalIcon from "../../assets/icons/status-signal.svg";
import statusWifiIcon from "../../assets/icons/status-wifi.svg";
import tabAlertActiveIcon from "../../assets/icons/tab-alert-active.svg";
import tabAlertIcon from "../../assets/icons/tab-alert.svg";
import tabHomeActiveIcon from "../../assets/icons/tab-home-active.svg";
import tabHomeIcon from "../../assets/icons/tab-home.svg";
import tabStudentsActiveIcon from "../../assets/icons/tab-students-active.svg";
import tabStudentsIcon from "../../assets/icons/tab-students.svg";

type BottomTab = "home" | "students" | "dashboard";

type MobileShellProps = {
  children: ReactNode;
  title?: string;
  showBrand?: boolean;
  showProfile?: boolean;
  bottomTab?: BottomTab;
  tall?: boolean;
};

const tabItems: Array<{
  key: BottomTab;
  label: string;
  to: string;
  icon: string;
  activeIcon: string;
  iconWidth: number;
  iconHeight: number;
}> = [
  {
    key: "home",
    label: "홈",
    to: "/teacher/home",
    icon: tabHomeIcon,
    activeIcon: tabHomeActiveIcon,
    iconWidth: 18,
    iconHeight: 18,
  },
  {
    key: "students",
    label: "명단",
    to: "/teacher/students",
    icon: tabStudentsIcon,
    activeIcon: tabStudentsActiveIcon,
    iconWidth: 22,
    iconHeight: 16,
  },
  {
    key: "dashboard",
    label: "대시보드",
    to: "/teacher/dashboard",
    icon: tabAlertIcon,
    activeIcon: tabAlertActiveIcon,
    iconWidth: 22,
    iconHeight: 19,
  },
];

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
}: MobileShellProps) {
  return (
    <Phone data-tall={tall} data-with-nav={Boolean(bottomTab)}>
      <StatusBar />
      {(showBrand || title) && (
        <Header>
          {title ? <HeaderTitle>{title}</HeaderTitle> : <BrandLogo src={whattingLogo} alt="왓팅" />}
          {showProfile && (
            <ProfileButton aria-label="내 정보">
              <img src={profileIcon} alt="" aria-hidden="true" />
            </ProfileButton>
          )}
        </Header>
      )}
      <Content data-with-nav={Boolean(bottomTab)}>{children}</Content>
      {bottomTab && <BottomNavigation active={bottomTab} />}
      {!bottomTab && <HomeIndicator />}
    </Phone>
  );
}

function StatusBar() {
  const now = useNow();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <Status aria-hidden="true">
      <span>{time}</span>
      <StatusIcons>
        <SignalIcon src={statusSignalIcon} alt="" aria-hidden="true" />
        <WifiIcon src={statusWifiIcon} alt="" aria-hidden="true" />
        <BatteryIcon src={statusBatteryIcon} alt="" aria-hidden="true" />
      </StatusIcons>
    </Status>
  );
}

function BottomNavigation({ active }: { active: BottomTab }) {
  return (
    <BottomNav aria-label="교사 하단 탭">
      {tabItems.map((item) => {
        const isActive = active === item.key;

        return (
          <BottomNavLink key={item.key} to={item.to} className={isActive ? "active" : undefined}>
            <TabIcon
              src={isActive ? item.activeIcon : item.icon}
              alt=""
              aria-hidden="true"
              style={{ width: item.iconWidth, height: item.iconHeight }}
            />
            <span>{item.label}</span>
          </BottomNavLink>
        );
      })}
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
  height: min(100vh, 844px);
  min-height: min(100vh, 844px);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${theme.colors.bg};
  color: ${theme.colors.text};
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 30px 90px rgba(0, 0, 0, 0.55);

  &[data-tall="true"] {
    overflow: hidden;
  }

  @media (max-width: 520px) {
    width: 100vw;
    height: 100dvh;
    min-height: 100dvh;
  }
`;

const Status = styled.div`
  flex: 0 0 44px;
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

const SignalIcon = styled.img`
  width: 20px;
  height: 14px;
  display: block;
  object-fit: contain;
`;

const WifiIcon = styled.img`
  width: 16px;
  height: 14px;
  display: block;
  object-fit: contain;
`;

const BatteryIcon = styled.img`
  width: 25px;
  height: 14px;
  display: block;
  object-fit: contain;
`;

const Header = styled.header`
  flex: 0 0 64px;
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
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;

  img {
    display: block;
    width: 32px;
    height: 32px;
  }
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 40px;
  scrollbar-width: none;

  &[data-with-nav="true"] {
    padding-bottom: 24px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BottomNav = styled.nav`
  position: sticky;
  left: 0;
  right: 0;
  bottom: 3px;
  flex: 0 0 81px;
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

const TabIcon = styled.img`
  display: block;
  object-fit: contain;
  flex: 0 0 auto;
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
