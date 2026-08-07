// kbo_schedule.js - KBO 일정 동적 생성 및 날짜 파싱 모듈

// 오늘 날짜 기준 YYYY-MM-DD 스트링 생성
function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 구장별 기본 대진 매핑 데이터
const STADIUM_MATCHUPS = [
  { stadium: "광주-기아 챔피언스필드", home: "KIA 타이거즈", away: "삼성 라이온즈", time: "18:30", keywords: ["광주", "기아", "챔피언스", "KIA"] },
  { stadium: "잠실 야구장", home: "LG 트윈스", away: "두산 베어스", time: "18:00", keywords: ["잠실", "엘지", "두산", "LG"] },
  { stadium: "SSG 랜더스필드 (인천)", home: "SSG 랜더스", away: "한화 이글스", time: "18:00", keywords: ["인천", "문학", "랜더스", "에스에스지"] },
  { stadium: "수원 kt위즈파크", home: "kt 위즈", away: "NC 다이노스", time: "18:00", keywords: ["수원", "케이티", "위즈"] },
  { stadium: "대구 삼성라이온즈파크", home: "삼성 라이온즈", away: "롯데 자이언츠", time: "18:00", keywords: ["대구", "삼성", "라이온즈"] },
  { stadium: "부산 사직 야구장", home: "롯데 자이언츠", away: "키움 히어로즈", time: "18:00", keywords: ["부산", "사직", "롯데"] },
  { stadium: "대전 한화생명이글스파크", home: "한화 이글스", away: "KIA 타이거즈", time: "18:30", keywords: ["대전", "한화", "이글스"] },
  { stadium: "고척 스카이돔", home: "키움 히어로즈", away: "SSG 랜더스", time: "18:30", keywords: ["고척", "스카이돔", "키움"] },
  { stadium: "창원 NC파크", home: "NC 다이노스", away: "LG 트윈스", time: "18:00", keywords: ["창원", "마산", "엔씨"] }
];

// 음성 텍스트에서 날짜 오프셋(일수) 또는 직접 지정 날짜 파싱
function parseTargetDateFromText(text) {
  const str = String(text || "").trim();
  const now = new Date();

  // 1. "X월 Y일" 형태 직접 언급 처리 (예: "8월 10일")
  const monthDayMatch = str.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (monthDayMatch) {
    const month = parseInt(monthDayMatch[1], 10);
    const day = parseInt(monthDayMatch[2], 10);
    const targetDate = new Date(now.getFullYear(), month - 1, day);
    
    // 이미 지난 달이면 내년으로 보정
    if (targetDate < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)) {
      targetDate.setFullYear(now.getFullYear() + 1);
    }
    return {
      dateStr: `${month}월 ${day}일`,
      fullDate: `${targetDate.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    };
  }

  // 2. "Y일" 형태 단독 처리 (예: "10일")
  const dayOnlyMatch = str.match(/(\d{1,2})\s*일/);
  if (dayOnlyMatch && !str.includes("뒤") && !str.includes("후")) {
    const day = parseInt(dayOnlyMatch[1], 10);
    let month = now.getMonth() + 1;
    if (day < now.getDate()) {
      month += 1; // 오늘 날짜보다 작은 일수면 다음 달로 간주
    }
    return {
      dateStr: `${month}월 ${day}일`,
      fullDate: `${now.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    };
  }

  // 3. 상대적 날짜 표현 처리 (내일모레/모레를 내일보다 먼저 처리)
  let offset = 0;
  if (str.includes("글피")) {
    offset = 3;
  } else if (str.includes("모레") || str.includes("내일모레") || str.includes("내일 모레")) {
    offset = 2;
  } else if (str.includes("내일")) {
    offset = 1;
  } else if (str.includes("오늘")) {
    offset = 0;
  } else {
    // "X일 뒤", "X일 후"
    const relativeMatch = str.match(/(\d{1,2})\s*일\s*(뒤|후)/);
    if (relativeMatch) {
      offset = parseInt(relativeMatch[1], 10);
    }
  }

  const target = new Date();
  target.setDate(target.getDate() + offset);
  const monthStr = target.getMonth() + 1;
  const dayStr = target.getDate();

  return {
    dateStr: `${monthStr}월 ${dayStr}일`,
    fullDate: `${target.getFullYear()}-${String(monthStr).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`
  };
}

// KBO 경기 일정 검색 (구장 + 날짜)
function findKboGameSchedule(stadiumInput, dateInput) {
  const stadiumText = String(stadiumInput || "").trim();
  const dateResult = parseTargetDateFromText(dateInput || stadiumInput);

  // 구장 매칭
  let matchedStadium = STADIUM_MATCHUPS[0];
  for (const s of STADIUM_MATCHUPS) {
    if (s.keywords.some(k => stadiumText.includes(k))) {
      matchedStadium = s;
      break;
    }
  }

  return {
    dateStr: dateResult.dateStr,
    fullDate: dateResult.fullDate,
    stadium: matchedStadium.stadium,
    homeTeam: matchedStadium.home,
    awayTeam: matchedStadium.away,
    gameTime: matchedStadium.time,
    matchup: `${matchedStadium.home} vs ${matchedStadium.away}`
  };
}
