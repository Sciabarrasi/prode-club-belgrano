export interface Match {
  id: string
  group: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  date: string
}

export const groupStageMatches: Match[] = [
  // Grupo A
  { id: "A1", group: "A", homeTeam: "Estados Unidos", awayTeam: "Marruecos", homeFlag: "🇺🇸", awayFlag: "🇲🇦", date: "11 Jun 2026" },
  { id: "A2", group: "A", homeTeam: "México", awayTeam: "Canadá", homeFlag: "🇲🇽", awayFlag: "🇨🇦", date: "11 Jun 2026" },
  { id: "A3", group: "A", homeTeam: "Estados Unidos", awayTeam: "Canadá", homeFlag: "🇺🇸", awayFlag: "🇨🇦", date: "15 Jun 2026" },
  { id: "A4", group: "A", homeTeam: "Marruecos", awayTeam: "México", homeFlag: "🇲🇦", awayFlag: "🇲🇽", date: "15 Jun 2026" },
  { id: "A5", group: "A", homeTeam: "Canadá", awayTeam: "Marruecos", homeFlag: "🇨🇦", awayFlag: "🇲🇦", date: "19 Jun 2026" },
  { id: "A6", group: "A", homeTeam: "México", awayTeam: "Estados Unidos", homeFlag: "🇲🇽", awayFlag: "🇺🇸", date: "19 Jun 2026" },
  
  // Grupo B
  { id: "B1", group: "B", homeTeam: "España", awayTeam: "Japón", homeFlag: "🇪🇸", awayFlag: "🇯🇵", date: "12 Jun 2026" },
  { id: "B2", group: "B", homeTeam: "Alemania", awayTeam: "Corea del Sur", homeFlag: "🇩🇪", awayFlag: "🇰🇷", date: "12 Jun 2026" },
  { id: "B3", group: "B", homeTeam: "España", awayTeam: "Corea del Sur", homeFlag: "🇪🇸", awayFlag: "🇰🇷", date: "16 Jun 2026" },
  { id: "B4", group: "B", homeTeam: "Japón", awayTeam: "Alemania", homeFlag: "🇯🇵", awayFlag: "🇩🇪", date: "16 Jun 2026" },
  { id: "B5", group: "B", homeTeam: "Corea del Sur", awayTeam: "Japón", homeFlag: "🇰🇷", awayFlag: "🇯🇵", date: "20 Jun 2026" },
  { id: "B6", group: "B", homeTeam: "Alemania", awayTeam: "España", homeFlag: "🇩🇪", awayFlag: "🇪🇸", date: "20 Jun 2026" },
  
  // Grupo C
  { id: "C1", group: "C", homeTeam: "Argentina", awayTeam: "Ecuador", homeFlag: "🇦🇷", awayFlag: "🇪🇨", date: "13 Jun 2026" },
  { id: "C2", group: "C", homeTeam: "Brasil", awayTeam: "Colombia", homeFlag: "🇧🇷", awayFlag: "🇨🇴", date: "13 Jun 2026" },
  { id: "C3", group: "C", homeTeam: "Argentina", awayTeam: "Colombia", homeFlag: "🇦🇷", awayFlag: "🇨🇴", date: "17 Jun 2026" },
  { id: "C4", group: "C", homeTeam: "Ecuador", awayTeam: "Brasil", homeFlag: "🇪🇨", awayFlag: "🇧🇷", date: "17 Jun 2026" },
  { id: "C5", group: "C", homeTeam: "Colombia", awayTeam: "Ecuador", homeFlag: "🇨🇴", awayFlag: "🇪🇨", date: "21 Jun 2026" },
  { id: "C6", group: "C", homeTeam: "Brasil", awayTeam: "Argentina", homeFlag: "🇧🇷", awayFlag: "🇦🇷", date: "21 Jun 2026" },
  
  // Grupo D
  { id: "D1", group: "D", homeTeam: "Francia", awayTeam: "Australia", homeFlag: "🇫🇷", awayFlag: "🇦🇺", date: "14 Jun 2026" },
  { id: "D2", group: "D", homeTeam: "Inglaterra", awayTeam: "Dinamarca", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayFlag: "🇩🇰", date: "14 Jun 2026" },
  { id: "D3", group: "D", homeTeam: "Francia", awayTeam: "Dinamarca", homeFlag: "🇫🇷", awayFlag: "🇩🇰", date: "18 Jun 2026" },
  { id: "D4", group: "D", homeTeam: "Australia", awayTeam: "Inglaterra", homeFlag: "🇦🇺", awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", date: "18 Jun 2026" },
  { id: "D5", group: "D", homeTeam: "Dinamarca", awayTeam: "Australia", homeFlag: "🇩🇰", awayFlag: "🇦🇺", date: "22 Jun 2026" },
  { id: "D6", group: "D", homeTeam: "Inglaterra", awayTeam: "Francia", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayFlag: "🇫🇷", date: "22 Jun 2026" },
]

export const groups = ["A", "B", "C", "D"]

export function getMatchesByGroup(group: string): Match[] {
  return groupStageMatches.filter(match => match.group === group)
}
