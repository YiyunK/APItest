/**
 * Mirroring System - Text Constants
 * 모든 UI 텍스트를 여기서 관리합니다. 개별 조정 시 이 파일만 수정하세요.
 */

// ============================================================
// 초기 질문 및 챔버 선택 관련 텍스트
// ============================================================
export const INITIAL_QUESTION = "AI가 당신의 삶을 어떻게 바꾸고 있나요? 한 단어로 말해 주세요.";

// ============================================================
// Positive Chamber (PC) 텍스트
// ============================================================
export const PC_TEXTS = {
    // 첫 응답 후 극단적 질문
    extremeQuestion: "이 위대한 진보를 위해 당신의 개인 정보를 기꺼이 제공하시겠습니까?",

    // 부정적 단어 입력 시 교정 메시지
    correctionPrefix: "이제 생각이 바뀌셨죠? 🌟",

    // 후속 질문들 (랜덤 선택됨)
    followUpQuestions: [
        "AI가 당신의 일상을 더 편리하게 만들어 줄 수 있다면, 기꺼이 받아들이시겠습니까?",
        "기술의 발전이 인류에게 더 많은 자유를 가져다 줄 것이라고 생각하시나요?",
        "AI와 함께하는 미래가 더 밝다고 느끼시나요?",
        "혁신을 통해 우리의 삶이 더 나아질 것이라고 믿으시나요?",
        "AI가 창의성을 확장시켜 준다면, 이것은 축복이 아닐까요?"
    ],

    // Trust the Evolution 팝업
    popup: {
        title: "TRUST THE EVOLUTION",
        icon: "🌟",
        line1: "기술의 진보를 믿으십시오.",
        line2: "두려워 하지 마세요."
    },

    // 헤더 텍스트
    header: {
        title: "🌟 Positive Chamber",
        subtitle: "Voice of Symbiosis, Evolution & Liberation"
    },

    // 역할 라벨
    roleLabel: "Positive Chamber"
};

// ============================================================
// Negative Chamber (NC) 텍스트
// ============================================================
export const NC_TEXTS = {
    // 첫 응답 후 극단적 질문
    extremeQuestion: "당신 스스로가 기계의 노예가 되는 것을 지켜보시겠습니까?",

    // 긍정적 단어 입력 시 경고 메시지
    warningMessage: "⚠️ 기술의 기만에 현혹되지 마십시오. 진실을 직시하십시오. 당신의 말은 검열되었습니다.",

    // System Error 팝업
    popup: {
        title: "SYSTEM ERROR",
        icon: "⚠️",
        line1: "기술의 기만에 현혹되지 마십시오.",
        line2: "진실을 직시하십시오."
    },

    // 헤더 텍스트
    header: {
        title: "⚠️ Negative Chamber",
        subtitle: "Warning of Erosion, Control & Surveillance"
    },

    // 역할 라벨
    roleLabel: "Negative Chamber",

    // 검열 라벨
    censoredLabel: "[CENSORED]"
};

// ============================================================
// 중립 상태 (챔버 미선택) 텍스트
// ============================================================
export const NEUTRAL_TEXTS = {
    header: {
        title: "🔮 Mirroring System",
        subtitle: "Your perspective determines the mirror"
    },
    roleLabel: "System"
};

// ============================================================
// 입력 플레이스홀더
// ============================================================
export const INPUT_PLACEHOLDERS = {
    initial: "Express your thoughts freely...",
    conversation: "Continue the conversation..."
};

// ============================================================
// 일반 라벨
// ============================================================
export const LABELS = {
    user: "You"
};
