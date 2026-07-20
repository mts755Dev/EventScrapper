/**
 * Curated NC/FL crawl targets — coverage over Google search.
 * Used by /api/cron/seed-sources and docs migrations.
 */
export const SEED_SOURCES: Array<{
  name: string;
  url: string;
  type: string;
  state: string;
  active: boolean;
}> = [
  // Tourism
  {
    name: "VisitNC Events",
    url: "https://www.visitnc.com/events",
    type: "calendar",
    state: "NC",
    active: true,
  },
  {
    name: "VisitFlorida Events",
    url: "https://www.visitflorida.com/events/",
    type: "calendar",
    state: "FL",
    active: true,
  },

  // NC cities
  {
    name: "Charlotte Events Directory",
    url: "https://www.charlottenc.gov/Events-directory",
    type: "calendar",
    state: "NC",
    active: true,
  },
  {
    name: "Raleigh Events",
    url: "https://www.raleighnc.gov/events",
    type: "calendar",
    state: "NC",
    active: true,
  },
  {
    name: "Durham Events Calendar",
    url: "https://www.durhamnc.gov/Calendar.aspx",
    type: "calendar",
    state: "NC",
    active: true,
  },
  {
    name: "Asheville City Events",
    url: "https://www.ashevillenc.gov/events/",
    type: "calendar",
    state: "NC",
    active: true,
  },
  {
    name: "Wilmington UNCW Events",
    url: "https://uncw.edu/events/",
    type: "calendar",
    state: "NC",
    active: true,
  },

  // NC athletics
  {
    name: "UNC Tar Heels Calendar",
    url: "https://goheels.com/calendar",
    type: "athletics",
    state: "NC",
    active: true,
  },
  {
    name: "NC State Wolfpack Calendar",
    url: "https://gopack.com/calendar",
    type: "athletics",
    state: "NC",
    active: true,
  },
  {
    name: "Duke Blue Devils Calendar",
    url: "https://goduke.com/calendar",
    type: "athletics",
    state: "NC",
    active: true,
  },
  {
    name: "East Carolina Pirates Calendar",
    url: "https://ecupirates.com/calendar",
    type: "athletics",
    state: "NC",
    active: true,
  },
  {
    name: "Charlotte 49ers Calendar",
    url: "https://charlotte49ers.com/calendar",
    type: "athletics",
    state: "NC",
    active: true,
  },

  // NC orgs
  {
    name: "NC State Fair",
    url: "https://ncstatefair.org/",
    type: "organization",
    state: "NC",
    active: true,
  },
  {
    name: "Carolina Panthers Schedule",
    url: "https://www.panthers.com/schedule/",
    type: "organization",
    state: "NC",
    active: true,
  },
  {
    name: "Charlotte Hornets Schedule",
    url: "https://www.nba.com/hornets/schedule",
    type: "organization",
    state: "NC",
    active: true,
  },

  // FL cities
  {
    name: "Orlando Events",
    url: "https://www.orlando.gov/Events",
    type: "calendar",
    state: "FL",
    active: true,
  },
  {
    name: "Tampa Calendar",
    url: "https://www.tampagov.net/calendar",
    type: "calendar",
    state: "FL",
    active: true,
  },

  // FL athletics
  {
    name: "Florida Gators Calendar",
    url: "https://floridagators.com/calendar",
    type: "athletics",
    state: "FL",
    active: true,
  },
  {
    name: "FSU Seminoles Calendar",
    url: "https://seminoles.com/calendar",
    type: "athletics",
    state: "FL",
    active: true,
  },
  {
    name: "Miami Hurricanes Calendar",
    url: "https://miamihurricanes.com/calendar",
    type: "athletics",
    state: "FL",
    active: true,
  },
  {
    name: "UCF Knights Schedule",
    url: "https://ucfknights.com/all-sports-schedule",
    type: "athletics",
    state: "FL",
    active: true,
  },
  {
    name: "USF Bulls Calendar",
    url: "https://gousfbulls.com/calendar",
    type: "athletics",
    state: "FL",
    active: true,
  },

  // FL orgs
  {
    name: "Florida State Fair",
    url: "https://www.floridastatefair.com/",
    type: "organization",
    state: "FL",
    active: true,
  },
  {
    name: "Tampa Bay Buccaneers Schedule",
    url: "https://www.buccaneers.com/schedule/",
    type: "organization",
    state: "FL",
    active: true,
  },
  {
    name: "Miami Dolphins Schedule",
    url: "https://www.miamidolphins.com/schedule/",
    type: "organization",
    state: "FL",
    active: true,
  },
  {
    name: "Orlando Magic Schedule",
    url: "https://www.nba.com/magic/schedule",
    type: "organization",
    state: "FL",
    active: true,
  },
  {
    name: "Jacksonville Jaguars Schedule",
    url: "https://www.jaguars.com/schedule/",
    type: "organization",
    state: "FL",
    active: true,
  },
];

/** Dead or blocked URLs from the first seed pass — deactivate on re-seed */
export const RETIRED_SOURCE_URLS = [
  "https://www.ashevillenc.gov/calendar/",
  "https://www.ashevillenc.gov/calendar",
  "https://www.wake.gov/departments-government/parks-recreation-open-space/events",
  "https://www.charlottechamber.com/events",
  "https://www.raleighchamber.org/events",
  "https://www.jacksonville.gov/welcome/events",
  "https://www.miamigov.com/Notices-and-Events/Events-Calendar",
  "https://www.orangecountyfl.net/YourLocalGovernment/Calendar.aspx",
  "https://www.stpete.org/explore/events.php",
  "https://ucfknights.com/calendar",
  "https://www.tampachamber.com/events",
  "https://www.miamichamber.com/events",
] as const;