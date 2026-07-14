import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { rosterSections } from "../../data/teacherMock";
import { theme } from "../../styles/theme";

type StudentRosterProps = {
  compact?: boolean;
  onlyUrgent?: boolean;
};

export function StudentRoster({ compact = false, onlyUrgent = false }: StudentRosterProps) {
  const sections = onlyUrgent ? rosterSections.filter((section) => section.tone === "urgent") : rosterSections;

  return (
    <Roster data-compact={compact}>
      {sections.map((section) => (
        <RosterSection key={section.title} data-tone={section.tone}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.students.map((student, index) => (
            <StudentRow key={`${section.title}-${student.name}-${index}`} data-tone={student.tone}>
              <StudentIcon data-tone={student.tone} />
              <StudentCopy>
                <StudentNameLine>
                  <strong>{student.name}</strong>
                  <span>{student.className}</span>
                </StudentNameLine>
                <StudentStatus data-tone={student.tone}>
                  {student.status}
                  {student.note && <small> · {student.note}</small>}
                </StudentStatus>
              </StudentCopy>
              {section.showAction && <RowAction to="/teacher/help/detail">상태 확인</RowAction>}
            </StudentRow>
          ))}
        </RosterSection>
      ))}
    </Roster>
  );
}

const Roster = styled.section`
  display: flex;
  flex-direction: column;

  &[data-compact="true"] {
    border-top: 1px solid ${theme.colors.border};
  }
`;

const RosterSection = styled.section`
  background: ${theme.colors.panelDeep};
  border-top: 1px solid ${theme.colors.border};

  &[data-tone="urgent"] {
    background: rgba(255, 180, 171, 0.05);
  }
`;

const SectionTitle = styled.h2`
  min-height: 37px;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 16px;
  color: ${theme.colors.textSoft};
  font-size: 11px;
  line-height: 16px;
  font-weight: 900;
  letter-spacing: 0.1em;
`;

const StudentRow = styled.div`
  min-height: 82px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid ${theme.colors.border};
  position: relative;

  &[data-tone="urgent"]::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: ${theme.colors.dangerSoft};
  }
`;

const StudentIcon = styled.span`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radius.sm};
  border: 1px solid ${theme.colors.border};
  background: #2a2a2d;
  color: ${theme.colors.textSoft};
  position: relative;

  &[data-tone="urgent"] {
    background: #332626;
    color: ${theme.colors.dangerSoft};
  }

  &[data-tone="moving"] {
    background: #152523;
    color: ${theme.colors.success};
  }

  &[data-tone="safe"] {
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.28);
    color: ${theme.colors.blue};
  }

  &::before {
    content: "";
    width: 18px;
    height: 18px;
    border: 2px solid currentColor;
    border-radius: 50%;
  }

  &[data-tone="urgent"]::before {
    border-radius: 4px;
  }

  &[data-tone="safe"]::after,
  &[data-tone="moving"]::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 6px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
  }
`;

const StudentCopy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StudentNameLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    color: ${theme.colors.text};
    font-size: 19px;
    line-height: 28px;
    font-weight: 900;
  }

  span {
    padding: 2px 8px;
    border-radius: 6px;
    background: #353438;
    color: ${theme.colors.textSoft};
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px;
    line-height: 16px;
    font-weight: 700;
  }
`;

const StudentStatus = styled.p`
  margin: 0;
  color: ${theme.colors.textMuted};
  font-size: 11px;
  line-height: 16px;

  &[data-tone="urgent"] {
    color: ${theme.colors.dangerSoft};
  }

  &[data-tone="moving"] {
    color: ${theme.colors.success};
  }

  &[data-tone="safe"] {
    color: ${theme.colors.blue};
  }

  small {
    color: ${theme.colors.textSoft};
    font-size: 12px;
    line-height: 18px;
  }
`;

const RowAction = styled(Link)`
  padding: 7px 10px;
  border-radius: 7px;
  background: #2a2a2d;
  color: ${theme.colors.text};
  font-size: 12px;
  line-height: 18px;
  font-weight: 800;
`;
