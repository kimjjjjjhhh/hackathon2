// bus.js - 24시간 표기법(HH:MM) 전용 수정을 거친 고속버스 파싱 모듈

const TERMINAL_NAME_MAP = {
  "서울": "동서울 터미널",
  "부산": "부산 종합버스터미널",
  "광주": "광주 유스퀘어 터미널",
  "대전": "대전 복합터미널",
  "대구": "동대구 복합환승센터",
  "전주": "전주 고속버스터미널",
  "수원": "수원 버스터미널",
  "인천": "인천 종합버스터미널",
  "강릉": "강릉 고속버스터미널",
  "울산": "울산 고속버스터미널"
};

const BUS_FARE_MAP = {
  "부산": { fare: 38800, grade: "프리미엄" },
  "광주": { fare: 32000, grade: "우등고속" },
  "대전": { fare: 16800, grade: "우등고속" },
  "대구": { fare: 28200, grade: "우등고속" },
  "전주": { fare: 22000, grade: "우등고속" },
  "수원": { fare: 12000, grade: "일반고속" },
  "인천": { fare: 11000, grade: "일반고속" },
  "강릉": { fare: 23000, grade: "우등고속" },
  "울산": { fare: 35000, grade: "우등고속" }
};

function getDetailedTerminalName(cityName, defaultType) {
  if (!cityName) return defaultType === 'dep' ? '동서울 터미널' : '부산 종합버스터미널';
  
  for (const key in TERMINAL_NAME_MAP) {
    if (cityName.includes(key)) {
      return TERMINAL_NAME_MAP[key];
    }
  }
  return `${cityName} 버스터미널`;
}

// 🎯 24시간 표기법 파싱 함수 (오후 3시 -> 15:00)
function parseTimeFromText(text) {
  if (!text) return null;

  // 패턴 1: "오전/오후 X시 Y분" 또는 "오전/오후 X시"
  const ampmMatch = text.match(/(오전|오후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
  if (ampmMatch) {
    let ampm = ampmMatch[1];
    let hour = parseInt(ampmMatch[2], 10);
    let minute = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;

    if (ampm === "오후" && hour < 12) hour += 12;
    if (ampm === "오전" && hour === 12) hour = 0;

    const hStr = String(hour).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  // 패턴 2: "X시 Y분" 또는 "X시"
  const simpleMatch = text.match(/(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
  if (simpleMatch) {
    let hour = parseInt(simpleMatch[1], 10);
    let minute = simpleMatch[2] ? parseInt(simpleMatch[2], 10) : 0;

    if (hour >= 1 && hour <= 6) hour += 12; // 1시~6시는 오후(13~18시) 간주

    const hStr = String(hour).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  return null;
}

function getNextBusTime() {
  const now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes() + 20;

  if (minute >= 60) {
    hour = (hour + 1) % 24;
    minute = minute % 60;
  }

  const hStr = String(hour).padStart(2, '0');
  const mStr = String(Math.floor(minute / 10) * 10).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

function parseBusVoiceCommand(inputText) {
  let text = String(inputText || "").trim();

  const extractedTime = parseTimeFromText(text);
  text = text.replace(/(오전|오후)?\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?/g, '').trim();

  let dep = "서울";
  let arr = "부산";

  if (text.includes("에서")) {
    const parts = text.split("에서");
    dep = parts[0].trim();
    arr = parts[1].replace(/가는|로|간|행|버스|표|예매|해줘|달라|줘/g, '').trim();
  } else {
    const words = text.split(' ').filter(w => w.length > 0);
    if (words.length >= 2) {
      dep = words[0].trim();
      arr = words[1].replace(/행|버스|표|예매|로/g, '').trim();
    } else if (words.length === 1) {
      arr = words[0].replace(/행|버스|표|예매/g, '').trim();
    }
  }

  return {
    depCity: dep || "서울",
    arrCity: arr || "부산",
    specifiedTime: extractedTime
  };
}

async function getExpressBusSchedule(param1, param2) {
  let depCity = "서울";
  let arrCity = "부산";
  let busTime = null;

  if (param1 && param2) {
    depCity = param1;
    arrCity = param2;
  } else if (param1) {
    const parsed = parseBusVoiceCommand(param1);
    depCity = parsed.depCity;
    arrCity = parsed.arrCity;
    busTime = parsed.specifiedTime;
  }

  if (!busTime) {
    busTime = getNextBusTime();
  }

  const depTerminal = getDetailedTerminalName(depCity, 'dep');
  const arrTerminal = getDetailedTerminalName(arrCity, 'arr');
  const info = BUS_FARE_MAP[arrCity] || { fare: 34500, grade: "우등고속" };

  await new Promise(resolve => setTimeout(resolve, 150));

  return {
    depCity: depCity,
    arrCity: arrCity,
    depTerminal: depTerminal,
    arrTerminal: arrTerminal,
    time: `${busTime} 출발`,
    grade: info.grade,
    charge: info.fare
  };
}