export interface WCTeam {
  id: number
  name: string
  code: string
  flag_url: string | null
}

export interface WCGroup {
  id: string
  name: string
}

const FLAG_MAP: Record<
  string,
  string
> = {
  Argentina: "🇦🇷",
  Algeria: "🇩🇿",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Brazil: "🇧🇷",
  "Bosnia-Herzegovina":
    "🇧🇦",
  "Cabo Verde": "🇨🇻",
  Canada: "🇨🇦",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  "Congo DR": "🇨🇩",
  Croatia: "🇭🇷",
  Curaçao: "🇨🇼",
  Czechia: "🇨🇿",
  Denmark: "🇩🇰",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Haiti: "🇭🇹",
  Hungary: "🇭🇺",
  Iraq: "🇮🇶",
  "IR Iran": "🇮🇷",
  Iran: "🇮🇷",
  Italy: "🇮🇹",
  Jamaica: "🇯🇲",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  "Korea Republic":
    "🇰🇷",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  "New Zealand":
    "🇳🇿",
  Norway: "🇳🇴",
  Panama: "🇵🇦",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  "Saudi Arabia":
    "🇸🇦",
  Scotland: "🏴",
  Senegal: "🇸🇳",
  Serbia: "🇷🇸",
  "South Africa":
    "🇿🇦",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Turkey: "🇹🇷",
  Uruguay: "🇺🇾",
  USA: "🇺🇸",
  Uzbekistan: "🇺🇿",
  Venezuela: "🇻🇪",
  Wales: "🏴",
  "Côte d'Ivoire":
    "🇨🇮",
}

export function getFlag(
  teamName: string
): string {
  return (
    FLAG_MAP[teamName] ??
    "🏳️"
  )
}