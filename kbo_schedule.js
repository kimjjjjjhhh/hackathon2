// kbo_schedule.js - 1주일간 KBO 일정 동적 생성 및 검색 모듈

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

// 음성 텍스트에서 날짜 오프셋(일수) 추출
function parseDateOffsetFromText(text) {
  if (!text) return 0;
  if (text.includes("오늘")) return 0;
  if (text.includes("내일")) return 1;
  if (text.includes("모레")) return 2;
  if (text.includes("글피")) return 3;

  // "X일 뒤", "X일 후"
  const dayMatch = text.match(/(\d{1,2})\s*일\s*(뒤|후)?/);
  if (dayMatch) {
    const dayNum = parseInt(dayMatch[1], 10);
    if (dayNum >= 1 && dayNum <= 7) return dayNum;
  }

  return 0; // 기본 오늘
}

// KBO 경기 일정 검색 (구장 + 날짜)
function findKboGameSchedule(stadiumInput, dateInput) {
  const stadiumText = String(stadiumInput || "").trim();
  const dateOffset = parseDateOffsetFromText(dateInput || stadiumInput);
  const targetDate = getFormattedDate(dateOffset);

  // 구장 매칭
  let matchedStadium = STADIUM_MATCHUPS[0];
  for (const s of STADIUM_MATCHUPS) {
    if (s.keywords.some(k => stadiumText.includes(k))) {
      matchedStadium = s;
      break;
    }
  }

  // 월/일 변환
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + dateOffset);
  const displayDateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  return {
    dateStr: displayDateStr,
    fullDate: targetDate,
    stadium: matchedStadium.stadium,
    homeTeam: matchedStadium.home,
    awayTeam: matchedStadium.away,
    gameTime: matchedStadium.time,
    matchup: `${matchedStadium.home} vs ${matchedStadium.away}`
  };
}