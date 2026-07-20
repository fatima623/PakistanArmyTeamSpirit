/**
 * Exercise results roll, transcribed from the published results board.
 *
 * Ordered as printed (column 1 top-to-bottom, then 2, then 3), which happens to
 * read GOLD → SILVER → BRONZE → COIN → DNF. The array index becomes `sortOrder`
 * at seed time, so the public table renders in that same medal-descending order.
 */

export const AWARD_MEDALS = [
  "GOLD",
  "SILVER",
  "BRONZE",
  "COIN",
  "DNF",
] as const;

export type AwardMedal = (typeof AWARD_MEDALS)[number];

export type AwardRow = {
  callSign: string;
  unit: string;
  medal: AwardMedal;
};

/**
 * The results board carries no year of its own. Seeded rows are stamped with
 * this; change it and re-run the seed if the roll belongs to another edition.
 */
export const AWARDS_ROLL_YEAR = 2025;

export const AWARDS_ROLL: AwardRow[] = [
  // ── Column 1 ──────────────────────────────────────────────────────────────
  { callSign: "B32B", unit: "1 Bn The Princess of Wales Royal Regiment", medal: "GOLD" },
  { callSign: "C20B", unit: "NEW ZEALAND - 1st Battalion, Royal New Zealand Infantry Regt", medal: "GOLD" },
  { callSign: "C32B", unit: "10 Queen's Own Gurkha Logistic Regiment", medal: "GOLD" },
  { callSign: "C33G", unit: "2 The Royal Gurkha Rifles", medal: "GOLD" },
  { callSign: "D30B", unit: "13 Air Assault Support Regiment RLC", medal: "GOLD" },
  { callSign: "D33G", unit: "16 Signal Regiment", medal: "GOLD" },
  { callSign: "D40B", unit: "CANADA - 5 eme Groupe Brogade Mecanise du Canada", medal: "GOLD" },
  { callSign: "E13G", unit: "Gurkha Wing (Mandalay) IBS", medal: "GOLD" },
  { callSign: "F30B", unit: "39 Engineer Regiment", medal: "GOLD" },
  { callSign: "F31G", unit: "Gurkha ARRC Support Battalion", medal: "GOLD" },
  { callSign: "G10B", unit: "AUSTRALIA - 1st Australian Regiment", medal: "GOLD" },
  { callSign: "G12B", unit: "PAKISTAN - 21 Punjab Regiment", medal: "GOLD" },
  { callSign: "G20B", unit: "NEPAL - Nepali Army", medal: "GOLD" },
  { callSign: "G23G", unit: "30 Signal Regiment", medal: "GOLD" },
  { callSign: "G32B", unit: "23 Parachute Engineer Regiment", medal: "GOLD" },
  { callSign: "G33G", unit: "36 Engineer Regiment", medal: "GOLD" },
  { callSign: "G40B", unit: "14 Regiment RA (Kings Gurkha Artillery)", medal: "GOLD" },
  { callSign: "G41G", unit: "Gurkha Company (Tavoleto) Waterloo Lines", medal: "GOLD" },
  { callSign: "G43G", unit: "9 Regiment RLC", medal: "GOLD" },
  { callSign: "H21G", unit: "Northumbria UOTC", medal: "GOLD" },
  { callSign: "A13G", unit: "4 Bn The Royal Yorkshire Regiment", medal: "SILVER" },
  { callSign: "A21G", unit: "8 Bn The Rifles", medal: "SILVER" },
  { callSign: "A23G", unit: "Yorkshire OTR", medal: "SILVER" },
  { callSign: "B10B", unit: "The Kings Royal Hussars", medal: "SILVER" },
  { callSign: "B13G", unit: "UZBEKISTAN - The MOD of The Republic of Uzbekistan", medal: "SILVER" },
  { callSign: "B20B", unit: "The Royal Dragoon Guards", medal: "SILVER" },
  { callSign: "B22B", unit: "1 Regiment Royal Horse Artillery", medal: "SILVER" },
  { callSign: "B31G", unit: "CHILE - Operations Directorate Chilean Army", medal: "SILVER" },
  { callSign: "B33G", unit: "CYPRUS - Cyprus National Guard", medal: "SILVER" },
  { callSign: "B40B", unit: "Commando Logistic Regiment", medal: "SILVER" },
  { callSign: "B41G", unit: "IRELAND - 6 Inf Bde", medal: "SILVER" },
  { callSign: "B42B", unit: "22 Signal Regiment", medal: "SILVER" },
  { callSign: "C11G", unit: "NETHERLANDS - Netherlands Marine Corps", medal: "SILVER" },
  { callSign: "C12B", unit: "1 Bn Scots Guards", medal: "SILVER" },
  { callSign: "C21G", unit: "1 RSME Regiment", medal: "SILVER" },
  { callSign: "C22B", unit: "LITHUANIA - King Mindaugas Hussar Battalion", medal: "SILVER" },
  { callSign: "C30B", unit: "21 Engineer Regiment", medal: "SILVER" },

  // ── Column 2 ──────────────────────────────────────────────────────────────
  { callSign: "C31G", unit: "1st Battalion The Queens Dragoon Guards/AUSTRIA - Joint", medal: "SILVER" },
  { callSign: "C40B", unit: "3 Bn The Rifles", medal: "SILVER" },
  { callSign: "D11G", unit: "FRANCE - 1 Regiment d'Infanterie de marine", medal: "SILVER" },
  { callSign: "D13G", unit: "ESTONIA - Kuperjanov Infantry Battalion", medal: "SILVER" },
  { callSign: "D20B", unit: "32 Engineer Regiment", medal: "SILVER" },
  { callSign: "D21G", unit: "BELGIUM - bataillon de Chasseurs a Cheval", medal: "SILVER" },
  { callSign: "D23G", unit: "LATVIA - Land Forces Mechanized Infantry Brigade", medal: "SILVER" },
  { callSign: "D31G", unit: "SPAIN - Brigada Galicia VII 'Brilat'", medal: "SILVER" },
  { callSign: "D32B", unit: "2 Bn The Royal Anglian Regiment", medal: "SILVER" },
  { callSign: "E10B", unit: "F Coy, Scots Guards", medal: "SILVER" },
  { callSign: "E20B", unit: "DENMARK - 2 Light Infantry Company - Slesvig Regt of Foot", medal: "SILVER" },
  { callSign: "E21G", unit: "QATAR - Qatar Armed Forces", medal: "SILVER" },
  { callSign: "E22B", unit: "2RGR (The Gurkha Staff and Personnel Support)", medal: "SILVER" },
  { callSign: "E30B", unit: "14 Signal Regiment", medal: "SILVER" },
  { callSign: "E31G", unit: "CZECH REPUBLIC - 41 Mechanised Battalion", medal: "SILVER" },
  { callSign: "E40B", unit: "KOSOVO - Kosovo Security Force", medal: "SILVER" },
  { callSign: "E42B", unit: "7 Coy, Coldstream Guards", medal: "SILVER" },
  { callSign: "F10B", unit: "The Light Dragoons", medal: "SILVER" },
  { callSign: "F11G", unit: "ITALY - 187 Airborne Regiment", medal: "SILVER" },
  { callSign: "F12B", unit: "1 Logistic Regiment RLC", medal: "SILVER" },
  { callSign: "F13G", unit: "INDIA - 13 Garhwal Rifles", medal: "SILVER" },
  { callSign: "F22B", unit: "1 Bn The RIFLES", medal: "SILVER" },
  { callSign: "F32B", unit: "The Royal Lancers", medal: "SILVER" },
  { callSign: "F33G", unit: "4 Military Intelligence Battalion", medal: "SILVER" },
  { callSign: "F41G", unit: "Gurkha Company (Sittang)", medal: "SILVER" },
  { callSign: "G11G", unit: "27 Theatre Logistic Regiment RLC", medal: "SILVER" },
  { callSign: "G13G", unit: "1 RGR", medal: "SILVER" },
  { callSign: "G31G", unit: "Defence College of Support (DCSp)", medal: "SILVER" },
  { callSign: "G42B", unit: "Irish Guards", medal: "SILVER" },
  { callSign: "H10B", unit: "Queens UOTC", medal: "SILVER" },
  { callSign: "H12B", unit: "214 MMR", medal: "SILVER" },
  { callSign: "H22B", unit: "7 Bn The Royal Regiment of Scotland", medal: "SILVER" },
  { callSign: "H23G", unit: "5 Bn The Royal Regiment of Fusiliers", medal: "SILVER" },
  { callSign: "H30B", unit: "4 Bn The Mercian Regiment", medal: "SILVER" },
  { callSign: "H31G", unit: "6 Bn The Royal Regiment of Scotland", medal: "SILVER" },
  { callSign: "H33G", unit: "South West Officer Training Regiment (SWOTR)", medal: "SILVER" },
  { callSign: "H40B", unit: "Cambridge UOTC", medal: "SILVER" },

  // ── Column 3 ──────────────────────────────────────────────────────────────
  { callSign: "A10B", unit: "London UOTC", medal: "BRONZE" },
  { callSign: "A11G", unit: "Glasgow & Strathclyde UOTC", medal: "BRONZE" },
  { callSign: "A31G", unit: "USA - 4 Bn, 6th Infantry Regiment", medal: "BRONZE" },
  { callSign: "A32B", unit: "East Midlands UOTC", medal: "BRONZE" },
  { callSign: "A33G", unit: "USA - US Army Cadet Command, Blueridge Battalion", medal: "BRONZE" },
  { callSign: "B11G", unit: "The Kings Royal Hussars", medal: "BRONZE" },
  { callSign: "B21G", unit: "POLAND - 7th Territorial Defence Forces Brigade", medal: "BRONZE" },
  { callSign: "B23G", unit: "SAUDI ARABIA - Royal Saudi Land Forces", medal: "BRONZE" },
  { callSign: "C13G", unit: "NORTH MACEDONIA - Reconnaissance & Intelligence Bn", medal: "BRONZE" },
  { callSign: "C41G", unit: "PHILLIPINES - Phillippine Marine Corps", medal: "BRONZE" },
  { callSign: "D10B", unit: "5 Regiment Royal Artillery", medal: "BRONZE" },
  { callSign: "D12B", unit: "8 Training Battalion REME", medal: "BRONZE" },
  { callSign: "E11G", unit: "KAZAKHSTAN", medal: "BRONZE" },
  { callSign: "E41G", unit: "17 Port & Maritime Regiment RLC", medal: "BRONZE" },
  { callSign: "F21G", unit: "2 Bn The RIFLES", medal: "BRONZE" },
  { callSign: "F23G", unit: "16 Regiment Royal Artillery", medal: "BRONZE" },
  { callSign: "F40B", unit: "12 Regiment Royal Artillery", medal: "BRONZE" },
  { callSign: "G22B", unit: "ALBANIA - 3rd Bn Infantry", medal: "BRONZE" },
  { callSign: "H11G", unit: "Southampton UOTC", medal: "BRONZE" },
  { callSign: "H13G", unit: "Birmingham UOTC", medal: "BRONZE" },
  { callSign: "H20B", unit: "The Royal Yeomanry", medal: "BRONZE" },
  { callSign: "H41G", unit: "Wales UOTC", medal: "BRONZE" },
  { callSign: "A12B", unit: "Glasgow & Strathclyde UOTC", medal: "COIN" },
  { callSign: "A22B", unit: "4 Bn The Princess of Wales Royal Regiment", medal: "COIN" },
  { callSign: "A30B", unit: "North West OTR", medal: "COIN" },
  { callSign: "A42B", unit: "Oxford UOTC", medal: "COIN" },
  { callSign: "B12B", unit: "TURKMENISTAN - Turkmenistan MOD", medal: "COIN" },
  { callSign: "C23G", unit: "GHANA - Army Special Operations Brigade", medal: "COIN" },
  { callSign: "F20B", unit: "ARMENIA - Armenian Armed Forces", medal: "COIN" },
  { callSign: "G21G", unit: "Queens Own Yeomanry/Albania", medal: "COIN" },
  { callSign: "A20B", unit: "2 Bn The Royal Irish Regiment", medal: "DNF" },
  { callSign: "A40B", unit: "Wales UOTC", medal: "DNF" },
  { callSign: "D41G", unit: "4 Regiment Royal Artillery", medal: "DNF" },
  { callSign: "E12B", unit: "KYRGYZSTAN", medal: "DNF" },
  { callSign: "E33G", unit: "4 Logistic Regiment RLC", medal: "DNF" },
];
