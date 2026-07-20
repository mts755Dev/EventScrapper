-- Better crawl sources for NC / FL (coverage-first).
-- Run in Supabase SQL Editor after the initial schema migration.
--
-- What this does:
-- 1. Deactivates Google search seeds (they block scrapers)
-- 2. Upserts real city calendars, athletics pages, chambers, fairs

-- ---------------------------------------------------------------------------
-- Disable low-value Google search sources
-- ---------------------------------------------------------------------------
update public.sources
set active = false
where type = 'google'
   or url ilike '%google.com/search%';

-- ---------------------------------------------------------------------------
-- Upsert better sources (unique on url)
-- ---------------------------------------------------------------------------
insert into public.sources (name, url, type, state, active)
values
  -- Tourism / statewide calendars
  ('VisitNC Events', 'https://www.visitnc.com/events', 'calendar', 'NC', true),
  ('VisitFlorida Events', 'https://www.visitflorida.com/events/', 'calendar', 'FL', true),

  -- NC city / county calendars
  ('Charlotte Events Directory', 'https://www.charlottenc.gov/Events-directory', 'calendar', 'NC', true),
  ('Raleigh Events', 'https://www.raleighnc.gov/events', 'calendar', 'NC', true),
  ('Durham Events Calendar', 'https://www.durhamnc.gov/Calendar.aspx', 'calendar', 'NC', true),
  ('Asheville City Calendar', 'https://www.ashevillenc.gov/calendar/', 'calendar', 'NC', true),
  ('Wilmington UNCW Events', 'https://uncw.edu/events/', 'calendar', 'NC', true),
  ('Wake County Events', 'https://www.wake.gov/departments-government/parks-recreation-open-space/events', 'calendar', 'NC', true),

  -- NC athletics / universities
  ('UNC Tar Heels Calendar', 'https://goheels.com/calendar', 'athletics', 'NC', true),
  ('NC State Wolfpack Calendar', 'https://gopack.com/calendar', 'athletics', 'NC', true),
  ('Duke Blue Devils Calendar', 'https://goduke.com/calendar', 'athletics', 'NC', true),
  ('East Carolina Pirates Calendar', 'https://ecupirates.com/calendar', 'athletics', 'NC', true),
  ('Charlotte 49ers Calendar', 'https://charlotte49ers.com/calendar', 'athletics', 'NC', true),

  -- NC orgs / fairs / chambers
  ('Charlotte Chamber Events', 'https://www.charlottechamber.com/events', 'organization', 'NC', true),
  ('Greater Raleigh Chamber Events', 'https://www.raleighchamber.org/events', 'organization', 'NC', true),
  ('NC State Fair', 'https://ncstatefair.org/', 'organization', 'NC', true),
  ('Carolina Panthers Schedule', 'https://www.panthers.com/schedule/', 'organization', 'NC', true),
  ('Charlotte Hornets Schedule', 'https://www.nba.com/hornets/schedule', 'organization', 'NC', true),

  -- FL city / county calendars
  ('Orlando Events', 'https://www.orlando.gov/Events', 'calendar', 'FL', true),
  ('Tampa Calendar', 'https://www.tampagov.net/calendar', 'calendar', 'FL', true),
  ('Miami Events Calendar', 'https://www.miamigov.com/Notices-and-Events/Events-Calendar', 'calendar', 'FL', true),
  ('Jacksonville Events', 'https://www.jacksonville.gov/welcome/events', 'calendar', 'FL', true),
  ('Orange County FL Calendar', 'https://www.orangecountyfl.net/YourLocalGovernment/Calendar.aspx', 'calendar', 'FL', true),
  ('St. Petersburg Events', 'https://www.stpete.org/explore/events.php', 'calendar', 'FL', true),

  -- FL athletics / universities
  ('Florida Gators Calendar', 'https://floridagators.com/calendar', 'athletics', 'FL', true),
  ('FSU Seminoles Calendar', 'https://seminoles.com/calendar', 'athletics', 'FL', true),
  ('Miami Hurricanes Calendar', 'https://miamihurricanes.com/calendar', 'athletics', 'FL', true),
  ('UCF Knights Calendar', 'https://ucfknights.com/calendar', 'athletics', 'FL', true),
  ('USF Bulls Calendar', 'https://gousfbulls.com/calendar', 'athletics', 'FL', true),

  -- FL orgs / fairs / chambers / sports
  ('Tampa Bay Chamber Events', 'https://www.tampachamber.com/events', 'organization', 'FL', true),
  ('Greater Miami Chamber Events', 'https://www.miamichamber.com/events', 'organization', 'FL', true),
  ('Florida State Fair', 'https://www.floridastatefair.com/', 'organization', 'FL', true),
  ('Tampa Bay Buccaneers Schedule', 'https://www.buccaneers.com/schedule/', 'organization', 'FL', true),
  ('Miami Dolphins Schedule', 'https://www.miamidolphins.com/schedule/', 'organization', 'FL', true),
  ('Orlando Magic Schedule', 'https://www.nba.com/magic/schedule', 'organization', 'FL', true),
  ('Jacksonville Jaguars Schedule', 'https://www.jaguars.com/schedule/', 'organization', 'FL', true)

on conflict (url) do update
set
  name = excluded.name,
  type = excluded.type,
  state = excluded.state,
  active = true;
