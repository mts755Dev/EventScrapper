/**
 * Free discovery seeds — no APIs.
 * Origins are probed for common calendar paths automatically.
 */
export type DiscoveryOrigin = {
  name: string;
  state: "NC" | "FL";
  origin: string;
};

/** Common calendar paths to try on each origin (free URL-space expansion). */
export const CALENDAR_PATHS = [
  "/events",
  "/calendar",
  "/Calendar.aspx",
  "/community/events",
  "/upcoming-events",
  "/things-to-do/events",
  "/parks-recreation/events",
  "/residents/events",
] as const;

export const DISCOVERY_ORIGINS: DiscoveryOrigin[] = [
  // NC cities / counties
  { name: "Fayetteville NC", state: "NC", origin: "https://www.fayettevillenc.gov" },
  { name: "Greensboro NC", state: "NC", origin: "https://www.greensboro-nc.gov" },
  { name: "Winston-Salem NC", state: "NC", origin: "https://www.cityofws.org" },
  { name: "Cary NC", state: "NC", origin: "https://www.carync.gov" },
  { name: "Chapel Hill NC", state: "NC", origin: "https://www.townofchapelhill.org" },
  { name: "Concord NC", state: "NC", origin: "https://www.concordnc.gov" },
  { name: "Gastonia NC", state: "NC", origin: "https://www.cityofgastonia.com" },
  { name: "High Point NC", state: "NC", origin: "https://www.highpointnc.gov" },
  { name: "Wilmington NC", state: "NC", origin: "https://www.wilmingtonnc.gov" },
  { name: "Greenville NC", state: "NC", origin: "https://www.greenvillenc.gov" },
  { name: "Jacksonville NC", state: "NC", origin: "https://www.jacksonvillenc.gov" },
  { name: "Hickory NC", state: "NC", origin: "https://www.hickorync.gov" },
  { name: "Apex NC", state: "NC", origin: "https://www.apexnc.org" },
  { name: "Wake Forest NC", state: "NC", origin: "https://www.wakeforestnc.gov" },
  { name: "Buncombe County NC", state: "NC", origin: "https://www.buncombecounty.org" },
  { name: "Mecklenburg County NC", state: "NC", origin: "https://www.mecknc.gov" },

  // NC colleges / athletics hubs
  { name: "Appalachian State", state: "NC", origin: "https://appstatesports.com" },
  { name: "UNC Greensboro Athletics", state: "NC", origin: "https://uncgspartans.com" },
  { name: "UNC Wilmington Athletics", state: "NC", origin: "https://uncwsports.com" },
  { name: "Western Carolina Athletics", state: "NC", origin: "https://catamountsports.com" },
  { name: "Elon Athletics", state: "NC", origin: "https://elonphoenix.com" },
  { name: "Davidson Athletics", state: "NC", origin: "https://davidsonwildcats.com" },

  // FL cities / counties
  { name: "Tallahassee FL", state: "FL", origin: "https://www.talgov.com" },
  { name: "Gainesville FL", state: "FL", origin: "https://www.gainesvillefl.gov" },
  { name: "Fort Lauderdale FL", state: "FL", origin: "https://www.fortlauderdale.gov" },
  { name: "West Palm Beach FL", state: "FL", origin: "https://www.wpb.org" },
  { name: "Clearwater FL", state: "FL", origin: "https://www.myclearwater.com" },
  { name: "St Petersburg FL", state: "FL", origin: "https://www.stpete.org" },
  { name: "Sarasota FL", state: "FL", origin: "https://www.sarasotafl.gov" },
  { name: "Naples FL", state: "FL", origin: "https://www.naplesgov.com" },
  { name: "Fort Myers FL", state: "FL", origin: "https://www.fortmyers.gov" },
  { name: "Daytona Beach FL", state: "FL", origin: "https://www.codb.us" },
  { name: "Pensacola FL", state: "FL", origin: "https://www.cityofpensacola.com" },
  { name: "Lakeland FL", state: "FL", origin: "https://www.lakelandgov.net" },
  { name: "Boca Raton FL", state: "FL", origin: "https://www.myboca.us" },
  { name: "Hillsborough County FL", state: "FL", origin: "https://www.hillsboroughcounty.org" },
  { name: "Pinellas County FL", state: "FL", origin: "https://www.pinellascounty.org" },
  { name: "Broward County FL", state: "FL", origin: "https://www.broward.org" },

  // FL athletics
  { name: "FAU Athletics", state: "FL", origin: "https://fausports.com" },
  { name: "FIU Athletics", state: "FL", origin: "https://fiusports.com" },
  { name: "Florida Gulf Coast Athletics", state: "FL", origin: "https://fgcuathletics.com" },
  { name: "UNF Athletics", state: "FL", origin: "https://unfospreys.com" },
  { name: "UCF Events", state: "FL", origin: "https://www.ucf.edu" },
  { name: "USF Events", state: "FL", origin: "https://www.usf.edu" },
];
