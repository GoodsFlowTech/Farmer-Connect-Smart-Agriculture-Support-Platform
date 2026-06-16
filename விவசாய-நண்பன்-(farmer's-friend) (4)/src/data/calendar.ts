
export const TAMIL_MONTHS = [
  "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
  "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"
];

export interface Festival {
  day: number;
  month: string;
  name: string;
  description: string;
}

export const TAMIL_FESTIVALS: Festival[] = [
  { day: 1, month: "சித்திரை", name: "தமிழ்ப்புத்தாண்டு", description: "Tamil New Year" },
  { day: 1, month: "தை", name: "தைப்பொங்கல்", description: "Harvest Festival - Pongal" },
  { day: 2, month: "தை", name: "மாட்டுப்பொங்கல்", description: "Thanksgiving for Cattle" },
  { day: 3, month: "ஆடி", name: "ஆடிப் பெருக்கு", description: "Celebrating abundance of water" },
  { day: 10, month: "ஐப்பசி", name: "தீபாவளி", description: "Festival of Lights" },
  { day: 1, month: "கார்த்திகை", name: "கார்த்திகை தீபம்", description: "Festival of Lamps" },
  { day: 15, month: "மார்கழி", name: "வைகுண்ட ஏகாதசி", description: "Religious observance" },
];

export const getTamilDate = (date: Date) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Simplified logic: Tamil months often start around the 14th/15th of Gregorian months
  let tamilMonthIdx;
  let tamilDay;
  
  if (day >= 14) {
    // Current Gregorian month transition to Tamil month
    // Apr 14 -> Chithirai 1
    // May 14 -> Vaikasi 1
    // ...
    // Jan 14 -> Thai 1
    tamilMonthIdx = (month - 3 + 12) % 12; // Apr is index 3 -> Chithirai index 0
    tamilDay = day - 13;
  } else {
    // Still in previous Tamil month
    tamilMonthIdx = (month - 4 + 12) % 12;
    tamilDay = day + 17; // Approximate
  }

  const tamilMonthName = TAMIL_MONTHS[tamilMonthIdx];
  const tamilYearName = getTamilYearName(year);

  return {
    day: tamilDay,
    month: tamilMonthName,
    year: year - 1986 + 37, // Approximate cycle
    name: tamilYearName
  };
};

function getTamilYearName(year: number) {
  const years = [
    "பிரபவ", "விபவ", "சுக்கில", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ", "யுவ", "தாது",
    "ஈஸ்வர", "வெகுதானிய", "பிரமாதி", "விக்ரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "விய",
    "சர்வசித்து", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி",
    "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாசு", "பராபவ",
    "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராட்சச", "நள",
    "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரத்தாட்சி", "குரோதன", "அட்சய"
  ];
  // 1987 was Prabhava (index 0)
  const index = (year - 1987 + 60) % 60;
  return years[index] || "குரோதி";
}
