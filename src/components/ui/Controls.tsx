import { useState, type ChangeEventHandler, type ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { theme } from "../../styles/theme";
import fieldEyeIcon from "../../assets/icons/field-eye.svg";
import fieldLockIcon from "../../assets/icons/field-lock.svg";
import fieldSchoolIcon from "../../assets/icons/field-school.svg";
import fieldShieldIcon from "../../assets/icons/field-shield.svg";
import fieldUserIcon from "../../assets/icons/field-user.svg";
import signupBadgeIcon from "../../assets/icons/signup-badge.svg";

type FieldProps = {
  label: string;
  placeholder: string;
  icon?: "user" | "lock" | "school" | "shield" | "text";
  iconSrc?: string;
  large?: boolean;
  type?: "text" | "password" | "email" | "tel";
  name?: string;
  value?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  showPasswordToggle?: boolean;
  toggleIconSrc?: string;
};

const fieldIcons = {
  school: { src: fieldSchoolIcon, width: 30.333, height: 15 },
  user: { src: fieldUserIcon, width: 25.333, height: 13.333 },
  lock: { src: fieldLockIcon, width: 25.333, height: 17.5 },
  shield: { src: fieldShieldIcon, width: 25.333, height: 16.667 },
};

export function FormField({
  label,
  placeholder,
  icon = "text",
  iconSrc,
  large = false,
  type,
  name,
  value,
  required,
  onChange,
  showPasswordToggle = false,
  toggleIconSrc,
}: FieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const baseType = type ?? (icon === "lock" || icon === "shield" ? "password" : "text");
  const hasEye = !large && (showPasswordToggle || baseType === "password");
  const inputType = hasEye ? (passwordVisible ? "text" : "password") : baseType;
  const mappedIcon = icon === "text" ? undefined : fieldIcons[icon];

  return (
    <FieldLabel>
      <span>{label}</span>
      <FieldBox data-large={large}>
        {iconSrc ? (
          <FieldIconImage src={iconSrc} alt="" aria-hidden="true" />
        ) : mappedIcon ? (
          <FieldIcon
            src={mappedIcon.src}
            alt=""
            aria-hidden="true"
            style={{ width: mappedIcon.width, height: mappedIcon.height }}
          />
        ) : null}
        {large ? (
          <FieldTextarea
            placeholder={placeholder}
            aria-label={label}
            name={name}
            value={value}
            required={required}
            onChange={onChange}
          />
        ) : (
          <FieldInput
            placeholder={placeholder}
            aria-label={label}
            type={inputType}
            name={name}
            value={value}
            required={required}
            onChange={onChange}
          />
        )}
        {hasEye && (
          <EyeButton
            type="button"
            aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            <img src={toggleIconSrc ?? fieldEyeIcon} alt="" aria-hidden="true" />
          </EyeButton>
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
      {icon && <ActionBadge src={signupBadgeIcon} alt="" aria-hidden="true" />}
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
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

const FieldIcon = styled.img`
  margin-top: 1px;
  display: block;
  object-fit: contain;
  flex: 0 0 auto;
`;

const EyeButton = styled.button`
  width: 42.333px;
  min-height: 19.5px;
  display: grid;
  place-items: center;
  padding: 0 12px;
  margin: -1px -12px -1px 0;
  border: 0;
  background: transparent;
  opacity: 0.4;
  flex: 0 0 auto;

  img {
    display: block;
    width: 18.333px;
    height: 12.5px;
  }
`;

const ActionBadge = styled.img`
  width: 22px;
  height: 21px;
  display: block;
  object-fit: contain;
`;

const FieldIconImage = styled.img`
  display: block;
  flex: 0 0 auto;
  margin-top: 1px;
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
