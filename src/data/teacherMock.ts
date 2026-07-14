export type AlertTone = "real" | "drill" | "inspection" | "malfunction";

export type StudentTone = "urgent" | "moving" | "waiting" | "safe";

export const alertTypes: Array<{
  title: string;
  description: string;
  tone: AlertTone;
}> = [
  { title: "실제 긴급 상황", description: "즉시 대피 안내", tone: "real" },
  { title: "훈련", description: "대비 훈련용", tone: "drill" },
  { title: "점검", description: "시스템 테스트", tone: "inspection" },
  { title: "오작동", description: "경보 정정", tone: "malfunction" },
];

export const dashboardStats = [
  { label: "도움 요청", value: "02", tone: "danger" },
  { label: "응답 없음", value: "08", tone: "default" },
  { label: "대피 중", value: "10", tone: "warning" },
  { label: "대피 완료", value: "10", tone: "info" },
] as const;

export const rosterSections: Array<{
  title: string;
  tone: StudentTone;
  showAction?: boolean;
  students: Array<{
    name: string;
    className: string;
    status: string;
    note?: string;
    tone: StudentTone;
  }>;
}> = [
  {
    title: "즉각 지원 필요 (2)",
    tone: "urgent",
    showAction: true,
    students: [
      {
        name: "권수현",
        className: "2-1",
        status: "도움 필요",
        note: "마지막 위치: 과학실",
        tone: "urgent",
      },
      {
        name: "이지성",
        className: "2-3",
        status: "부상 신고",
        note: "부상 부위: 발목",
        tone: "urgent",
      },
    ],
  },
  {
    title: "대피 중 (1)",
    tone: "moving",
    students: [
      {
        name: "박정우",
        className: "2-1",
        status: "대피 중",
        tone: "moving",
      },
    ],
  },
  {
    title: "응답 대기 중 (1)",
    tone: "waiting",
    students: [
      {
        name: "박정우",
        className: "2-1",
        status: "응답 없음",
        tone: "waiting",
      },
    ],
  },
  {
    title: "대피 완료 (2)",
    tone: "safe",
    students: [
      {
        name: "박정우",
        className: "2-1",
        status: "안전 확인됨",
        tone: "safe",
      },
      {
        name: "박정우",
        className: "2-1",
        status: "안전 확인됨",
        tone: "safe",
      },
    ],
  },
];
