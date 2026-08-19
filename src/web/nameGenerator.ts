import type { EntityId } from "../index.js";

export type NameCountryCode = "KR" | "US" | "JP" | "TW" | "DO" | "VE" | "MX" | "CA" | "AU";

export interface GeneratedName {
  name: string;
  countryCode: NameCountryCode;
  countryName: string;
}

interface NamePool {
  countryName: string;
  surnames: string[];
  givenNames: string[];
  order: "family-given" | "given-family";
}

const pools: Record<NameCountryCode, NamePool> = {
  KR: {
    countryName: "대한민국",
    order: "family-given",
    surnames: ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍"],
    givenNames: ["도윤", "서준", "하준", "민재", "시우", "지호", "유찬", "건우", "태윤", "은호", "이준", "선우", "하람", "지완", "라온", "도겸", "해솔", "시온", "유건", "태서"],
  },
  US: {
    countryName: "미국",
    order: "given-family",
    surnames: ["Miller", "Bennett", "Parker", "Hayes", "Morgan", "Brooks", "Cooper", "Reed", "Turner", "Collins", "Foster", "Murphy"],
    givenNames: ["Ethan", "Logan", "Mason", "Caleb", "Nolan", "Wyatt", "Owen", "Carter", "Austin", "Blake", "Dylan", "Chase"],
  },
  JP: {
    countryName: "일본",
    order: "family-given",
    surnames: ["사토", "스즈키", "다카하시", "다나카", "이토", "와타나베", "야마모토", "나카무라", "고바야시", "가토", "요시다", "야마다"],
    givenNames: ["하루토", "렌", "소타", "유토", "다이치", "가이토", "료", "아오이", "유마", "쇼타", "게이", "도모야"],
  },
  TW: {
    countryName: "대만",
    order: "family-given",
    surnames: ["린", "천", "황", "장", "리", "왕", "우", "차이", "쉬", "정", "궈", "셰"],
    givenNames: ["웨이룬", "쯔하오", "밍쉬안", "준제", "위청", "하오위", "카이원", "청한", "즈위안", "보원"],
  },
  DO: {
    countryName: "도미니카공화국",
    order: "given-family",
    surnames: ["Ramirez", "Santana", "Reyes", "Bautista", "Rosario", "Encarnacion", "Valdez", "Peralta", "Medina", "Cabrera"],
    givenNames: ["Luis", "Rafael", "Miguel", "Santiago", "Emilio", "Javier", "Diego", "Andres", "Mateo", "Cristian"],
  },
  VE: {
    countryName: "베네수엘라",
    order: "given-family",
    surnames: ["Morales", "Herrera", "Rojas", "Navarro", "Salazar", "Castillo", "Mendoza", "Ortega", "Paredes", "Marquez"],
    givenNames: ["Carlos", "Jose", "Manuel", "Alejandro", "Gabriel", "Nicolas", "Sebastian", "Adrian", "Felix", "Eduardo"],
  },
  MX: {
    countryName: "멕시코",
    order: "given-family",
    surnames: ["Garcia", "Hernandez", "Lopez", "Martinez", "Gonzalez", "Flores", "Vargas", "Soto", "Campos", "Aguilar"],
    givenNames: ["Diego", "Mateo", "Emiliano", "Sergio", "Ivan", "Hector", "Pablo", "Tomas", "Marco", "Raul"],
  },
  CA: {
    countryName: "캐나다",
    order: "given-family",
    surnames: ["Campbell", "Fraser", "Walsh", "Grant", "Sinclair", "Bishop", "Lawson", "Hughes", "Kennedy", "Stewart"],
    givenNames: ["Liam", "Noah", "Connor", "Lucas", "Nathan", "Cole", "Evan", "Miles", "Ryan", "Jack"],
  },
  AU: {
    countryName: "호주",
    order: "given-family",
    surnames: ["Walker", "Taylor", "Mitchell", "Evans", "Clarke", "Baker", "Harris", "Kelly", "Mason", "Bailey"],
    givenNames: ["Oliver", "Harrison", "Archer", "Finn", "Jasper", "Levi", "Cooper", "Hudson", "Lachlan", "Eli"],
  },
};

export const supportedNameCountries = Object.keys(pools) as NameCountryCode[];

export function generatePersonName(countryCode: NameCountryCode, seed: number, scope: EntityId, index: number): GeneratedName {
  const pool = pools[countryCode];
  const value = stableNumber(seed, scope, index);
  const surname = pool.surnames[value % pool.surnames.length]!;
  const givenName = pool.givenNames[Math.floor(value / pool.surnames.length) % pool.givenNames.length]!;
  const repeat = Math.floor(value / (pool.surnames.length * pool.givenNames.length));
  const familyGiven = pool.order === "family-given";
  const coreName = familyGiven ? `${surname}${givenName}` : `${givenName} ${surname}`;
  return {
    name: repeat > 0 ? (familyGiven ? `${coreName}${repeat + 1}` : `${coreName} ${repeat + 1}`) : coreName,
    countryCode,
    countryName: pool.countryName,
  };
}

export function countryNameForCode(code = "KR"): string {
  return pools[(code as NameCountryCode) in pools ? code as NameCountryCode : "KR"].countryName;
}

function stableNumber(seed: number, scope: EntityId, index: number): number {
  let hash = seed + index * 2654435761;
  for (const char of scope) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 2246822519);
  }
  return Math.abs(hash >>> 0);
}
