import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { rosterSections } from "../../data/teacherMock";
import type { StudentTone } from "../../data/teacherMock";
import { theme } from "../../styles/theme";

type StudentRosterProps = {
  compact?: boolean;
  onlyUrgent?: boolean;
  sections?: RosterSectionData[];
  onConfirmStudent?: (studentId: string, confirmed: boolean) => void;
};

export type RosterStudent = {
  id?: string;
  helpRequestId?: string;
  name: string;
  className: string;
  status: string;
  note?: string;
  tone: StudentTone;
  confirmed?: boolean;
};

export type RosterSectionData = {
  title: string;
  tone: StudentTone;
  showAction?: boolean;
  students: RosterStudent[];
};

export function StudentRoster({
  compact = false,
  onlyUrgent = false,
  sections: providedSections,
  onConfirmStudent,
}: StudentRosterProps) {
  const sourceSections: RosterSectionData[] = providedSections ?? rosterSections;
  const sections = onlyUrgent ? sourceSections.filter((section) => section.tone === "urgent") : sourceSections;

  return (
    <Roster data-compact={compact}>
      {sections.map((section) => (
        <RosterSection key={section.title} data-tone={section.tone}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.students.map((student, index) => (
            <StudentRow key={`${section.title}-${student.name}-${index}`} data-tone={student.tone}>
              <StudentCheck data-tone={student.tone} data-checked={student.confirmed || student.tone === "safe"} />
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
              {section.showAction && student.helpRequestId && (
                <RowAction to={`/teacher/help/${student.helpRequestId}`}>상태 확인</RowAction>
              )}
              {!section.showAction && student.id && onConfirmStudent && (
                <RowButton type="button" onClick={() => onConfirmStudent(student.id!, !student.confirmed)}>
                  {student.confirmed ? "확인 취소" : "상태 확인"}
                </RowButton>
              )}
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
  background: ${theme.colors.bg};

  &[data-compact="true"] {
    border-top: 1px solid ${theme.colors.border};
  }
`;

const RosterSection = styled.section`
  background: ${theme.colors.bg};
  border-top: 1px solid ${theme.colors.border};

  &[data-tone="urgent"] {
    background: rgba(127, 29, 29, 0.14);
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
  min-height: 92px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
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

const StudentCheck = styled.span`
  width: 20px;
  height: 20px;
  display: block;
  border-radius: 3px;
  border: 2px solid ${theme.colors.textMuted};
  color: ${theme.colors.dangerSoft};
  position: relative;

  &[data-tone="urgent"] {
    border-color: ${theme.colors.dangerSoft};
    color: ${theme.colors.dangerSoft};
  }

  &[data-tone="moving"] {
    border-color: ${theme.colors.success};
    color: ${theme.colors.success};
  }

  &[data-tone="safe"] {
    border-color: ${theme.colors.blue};
    color: ${theme.colors.blue};
  }

  &[data-checked="true"]::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
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
  padding: 8px 14px;
  border: 2px solid ${theme.colors.dangerSoft};
  border-radius: ${theme.radius.sm};
  background: transparent;
  color: ${theme.colors.dangerSoft};
  font-size: 12px;
  line-height: 18px;
  font-weight: 800;
`;

const RowButton = styled.button`
  padding: 8px 14px;
  border: 2px solid ${theme.colors.dangerSoft};
  border-radius: ${theme.radius.sm};
  background: transparent;
  color: ${theme.colors.dangerSoft};
  font-size: 12px;
  line-height: 18px;
  font-weight: 800;
`;
