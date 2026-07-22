import {
  ORG_CATEGORIES,
  type OrgCategory,
} from "@/lib/constants/org-categories";

/**
 * Keyword rules for organization category — first match wins.
 * Uses name + website + source type.
 */
const RULES: Array<{ category: OrgCategory; patterns: RegExp[] }> = [
  {
    category: "minor_league_baseball",
    patterns: [/minor\s+league/i, /\bmilb\b/i, /baseball\s+club/i],
  },
  {
    category: "professional_sports",
    patterns: [
      /\bnfl\b/i,
      /\bnba\b/i,
      /\bnhl\b/i,
      /\bmls\b/i,
      /\bmlb\b/i,
      /professional\s+sports/i,
    ],
  },
  {
    category: "ncaa_university",
    patterns: [
      /\bncaa\b/i,
      /university\s+of\b/i,
      /\buniversity\b/i,
      /\btar\s+heels\b/i,
      /\bwolfpack\b/i,
      /\bgators\b/i,
      /\bseminoles\b/i,
      /goheels|gopack|floridagators|seminoles/i,
    ],
  },
  {
    category: "community_college",
    patterns: [/community\s+college/i, /\bcc\b.*college/i],
  },
  {
    category: "college",
    patterns: [/\bcollege\b/i, /\buniversity\b/i],
  },
  {
    category: "high_school",
    patterns: [/high\s+school/i, /\bhs\b/i, /secondary\s+school/i],
  },
  {
    category: "athletic_department",
    patterns: [/athletic\s+department/i, /\bathletics\b/i, /sports\s+department/i],
  },
  {
    category: "school_district",
    patterns: [/school\s+district/i, /\bunified\s+school\b/i, /\bpublic\s+schools\b/i],
  },
  {
    category: "hospital_foundation",
    patterns: [/hospital\s+foundation/i, /medical\s+foundation/i, /health\s+foundation/i],
  },
  {
    category: "community_foundation",
    patterns: [/community\s+foundation/i],
  },
  {
    category: "nonprofit_501c3",
    patterns: [
      /501\s*\(?\s*c\s*\)?\s*3/i,
      /\bnonprofit\b/i,
      /\bnon-profit\b/i,
      /\bfoundation\b/i,
      /\bcharity\b/i,
    ],
  },
  {
    category: "museum",
    patterns: [/\bmuseum\b/i, /\bgallery\b/i],
  },
  {
    category: "zoo",
    patterns: [/\bzoo\b/i, /aquarium/i, /wildlife\s+park/i],
  },
  {
    category: "church",
    patterns: [
      /\bchurch\b/i,
      /\bchapel\b/i,
      /\bparish\b/i,
      /\bministry\b/i,
      /\bsynagogue\b/i,
      /\bmosque\b/i,
    ],
  },
  {
    category: "chamber_of_commerce",
    patterns: [/chamber\s+of\s+commerce/i, /\bchamber\b/i],
  },
  {
    category: "convention_center",
    patterns: [/convention\s+center/i, /conference\s+center/i],
  },
  {
    category: "fairground",
    patterns: [/fairground/i, /\bfairgrounds\b/i, /county\s+fair/i],
  },
  {
    category: "county_calendar",
    patterns: [/\bcounty\b/i, /county\.gov/i],
  },
  {
    category: "city_calendar",
    patterns: [
      /\bcity\s+of\b/i,
      /\bcity\b/i,
      /visit\s+(nc|florida|orlando|charlotte|raleigh)/i,
      /\.gov\b/i,
      /events?\s+calendar/i,
    ],
  },
  {
    category: "community_organization",
    patterns: [
      /community\s+(center|org|organization|association)/i,
      /recreation/i,
      /\brec\s*&\s*roll\b/i,
      /neighborhood/i,
      /civic/i,
    ],
  },
];

const SOURCE_TYPE_HINTS: Partial<Record<string, OrgCategory>> = {
  athletics: "athletic_department",
  calendar: "city_calendar",
  government: "city_calendar",
  nonprofit: "nonprofit_501c3",
  church: "church",
  sports: "professional_sports",
  school: "high_school",
  university: "ncaa_university",
};

export function classifyOrganizationCategory(input: {
  name?: string | null;
  website?: string | null;
  sourceType?: string | null;
}): OrgCategory {
  const haystack = `${input.name ?? ""}\n${input.website ?? ""}`;

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) {
      return rule.category;
    }
  }

  const sourceHint = input.sourceType
    ? SOURCE_TYPE_HINTS[input.sourceType.toLowerCase()]
    : undefined;
  if (sourceHint && (ORG_CATEGORIES as readonly string[]).includes(sourceHint)) {
    return sourceHint;
  }

  return "other";
}
