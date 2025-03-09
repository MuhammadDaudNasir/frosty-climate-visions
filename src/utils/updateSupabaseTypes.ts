
// This file is only for documentation purposes to show what fields need to be added to the profiles table.
// DO NOT execute this file directly.

/*
SQL to update the profiles table to store user preferences:

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT NULL;

This adds a JSONB column to store user preferences. It will allow storing:
- units (metric/imperial)
- windSpeedFormat (km/h, mph, m/s)
- darkMode (true/false)
- notificationsEnabled (true/false)
*/
