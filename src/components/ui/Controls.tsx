import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { theme } from "../../styles/theme";

type FieldProps = {
  label: string;
  placeholder: string;
  icon?: "user" | "lock" | "school" | "shield" | "text";
  iconSrc?: string;
  large?: boolean;
  type?: "text" | "password" | "email" | "tel";
  name?: string;
  showPasswordToggle?: boolean;
  toggleIconSrc?: string;
};

export function FormField({
  label,
  placeholder,
  icon = "text",
  iconSrc,
  large = false,
  type,
  name,
  showPasswordToggle = false,
  toggleIconSrc,
}: FieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const baseType = type ?? (icon === "lock" || icon === "shield" ? "password" : "text");
  const resolvedType = showPasswordToggle ? (passwordVisible ? "text" : "password") : baseType;

  return (
    <FieldLabel>
      <span>{label}</span>
      <FieldBox data-large={large}>
        {iconSrc ? (
          <FieldIconImage src={iconSrc} alt="" aria-hidden="true" />
        ) : (
          <FieldIcon data-icon={icon} aria-hidden="true" />
        )}
        {large ? (
          <FieldTextarea name={name} placeholder={placeholder} aria-label={label} />
        ) : (
          <FieldInput name={name} placeholder={placeholder} aria-label={label} type={resolvedType} />
        )}
        {showPasswordToggle && (
          <ToggleButton
            type="button"
            aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 표시"}
            onClick={() => setPasswordVisible((value) => !value)}
          >
            {toggleIconSrc && <img src={toggleIconSrc} alt="" />}
          </ToggleButton>
        )}
      </FieldBox>
    </FieldLabel>
  );
}

type CompactFieldProps = {
  label: string;
  placeholder: string;
  name?: string;
};

export function CompactField({ label, placeholder, name }: CompactFieldProps) {
  return (
    <CompactFieldLabel>
      <span>{label}</span>
      <CompactFieldBox>
        <CompactFieldInput name={name} placeholder={placeholder} inputMode="numeric" aria-label={label} />
      </CompactFieldBox>
    </CompactFieldLabel>
  );
}

export function CompactFieldRow({ children }: { children: ReactNode }) {
  return <CompactRow>{children}</CompactRow>;
}

export function PrimaryLink({
  to,
  children,
  icon,
}: {
  to: string;
  children: ReactNode;
  icon?: boolean;
}) {
  return (
    <PrimaryAction to={to}>
      {icon && <ActionBadge aria-hidden="true" />}
      {children}
    </PrimaryAction>
  );
}

export const FieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const PrimaryAction = styled(Link)`
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${theme.radius.sm};
  border: 0;
  background: ${theme.colors.danger};
  color: ${theme.colors.text};
  font-size: 16px;
  line-height: 24px;
  font-weight: 800;
  text-align: center;
`;

export const PrimaryButton = styled.button`
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${theme.radius.sm};
  border: 0;
  background: ${theme.colors.danger};
  color: ${theme.colors.text};
  font-size: 16px;
  line-height: 24px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
`;

export const GhostLink = styled(Link)`
  color: ${theme.colors.text};
  font-weight: 800;
`;

export const GhostButton = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.text};
  font-weight: 800;
  font-size: inherit;
  cursor: pointer;
`;

export const FormError = styled.p`
  margin: 0;
  color: ${theme.colors.dangerSoft};
  font-size: 13px;
  line-height: 18px;
  text-align: center;
`;

export const PillLink = styled(Link)`
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 2px 42px;
  border: 2px solid ${theme.colors.dangerSoft};
  border-radius: ${theme.radius.pill};
  background: rgba(255, 179, 173, 0.05);
  color: ${theme.colors.dangerSoft};
  box-shadow: ${theme.shadow.danger};
  font-size: 15px;
  line-height: 22px;
  font-weight: 900;
  letter-spacing: 0.1em;
`;

const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: ${theme.colors.textSoft};
  font-size: 11px;
  line-height: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
`;

const FieldBox = styled.div`
  min-height: 48px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px;
  border: 1px solid transparent;
  border-radius: ${theme.radius.sm};
  background: #161618;
  color: rgba(141, 144, 160, 0.44);

  &[data-large="true"] {
    min-height: 128px;
  }

  &:focus-within {
    border-color: rgba(255, 180, 171, 0.55);
  }
`;

const FieldInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${theme.colors.text};
  caret-color: ${theme.colors.dangerSoft};
  font-size: 16px;
  line-height: 19px;
  font-weight: 500;

  &::placeholder {
    color: rgba(141, 144, 160, 0.44);
    opacity: 1;
  }
`;

const FieldTextarea = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 98px;
  padding: 0;
  border: 0;
  outline: 0;
  resize: none;
  background: transparent;
  color: ${theme.colors.text};
  caret-color: ${theme.colors.dangerSoft};
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;

  &::placeholder {
    color: rgba(141, 144, 160, 0.44);
    opacity: 1;
  }
`;

const FieldIcon = styled.span`
  width: 16px;
  height: 18px;
  margin-top: 1px;
  position: relative;
  color: rgba(141, 144, 160, 0.65);
  flex: 0 0 auto;

  &::before,
  &::after {
    content: "";
    position: absolute;
  }

  &[data-icon="user"]::before {
    left: 5px;
    top: 1px;
    width: 6px;
    height: 6px;
    border: 2px solid currentColor;
    border-radius: 50%;
  }

  &[data-icon="user"]::after {
    left: 2px;
    bottom: 1px;
    width: 12px;
    height: 7px;
    border: 2px solid currentColor;
    border-top-left-radius: 999px;
    border-top-right-radius: 999px;
  }

  &[data-icon="lock"]::before {
    left: 4px;
    top: 0;
    width: 8px;
    height: 8px;
    border: 2px solid currentColor;
    border-bottom: 0;
    border-radius: 999px 999px 0 0;
  }

  &[data-icon="lock"]::after {
    left: 2px;
    top: 8px;
    width: 12px;
    height: 9px;
    border: 2px solid currentColor;
    border-radius: 3px;
  }

  &[data-icon="school"]::before {
    left: 1px;
    top: 4px;
    width: 14px;
    height: 9px;
    border: 2px solid currentColor;
    transform: rotate(30deg) skewX(-20deg);
  }

  &[data-icon="shield"]::before {
    left: 3px;
    top: 1px;
    width: 10px;
    height: 13px;
    border: 2px solid currentColor;
    border-radius: 7px 7px 4px 4px;
    transform: perspective(12px) rotateX(-14deg);
  }

  &[data-icon="text"]::before {
    left: 1px;
    top: 4px;
    width: 14px;
    height: 2px;
    background: currentColor;
    box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor;
  }
`;

const ActionBadge = styled.span`
  width: 22px;
  height: 22px;
  border: 3px solid currentColor;
  border-radius: 50%;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    border: 2px solid currentColor;
  }
`;

const FieldIconImage = styled.img`
  display: block;
  flex: 0 0 auto;
  margin-top: 1px;
`;

const ToggleButton = styled.button`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  align-self: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.4;
  cursor: pointer;

  img {
    display: block;
  }
`;

const CompactRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const CompactFieldLabel = styled.label`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${theme.colors.textSoft};
  font-size: 11px;
  line-height: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
`;

const CompactFieldBox = styled.div`
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radius.sm};
  background: #161618;
`;

const CompactFieldInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${theme.colors.text};
  caret-color: ${theme.colors.dangerSoft};
  font-size: 16px;
  line-height: 19px;
  font-weight: 500;
  text-align: center;

  &::placeholder {
    color: rgba(141, 144, 160, 0.3);
    opacity: 1;
  }
`;
