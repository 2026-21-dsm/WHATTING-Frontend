import type { ChangeEventHandler, ReactNode } from "react";
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
  large?: boolean;
  type?: "text" | "password" | "email" | "tel";
  name?: string;
  value?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
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
  large = false,
  type,
  name,
  value,
  required,
  onChange,
}: FieldProps) {
  const inputType = type ?? (icon === "lock" || icon === "shield" ? "password" : "text");
  const iconAsset = icon === "text" ? undefined : fieldIcons[icon];
  const showPasswordEye = !large && inputType === "password";

  return (
    <FieldLabel>
      <span>{label}</span>
      <FieldBox data-large={large}>
        {iconAsset && (
          <FieldIcon
            src={iconAsset.src}
            alt=""
            aria-hidden="true"
            style={{ width: iconAsset.width, height: iconAsset.height }}
          />
        )}
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
        {showPasswordEye && (
          <EyeButton type="button" aria-label="비밀번호 보기">
            <img src={fieldEyeIcon} alt="" aria-hidden="true" />
          </EyeButton>
        )}
      </FieldBox>
    </FieldLabel>
  );
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const GhostLink = styled(Link)`
  color: ${theme.colors.text};
  font-weight: 800;
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
