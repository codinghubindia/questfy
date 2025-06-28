/*
  # Add quest status column

  1. Changes
    - Add `status` column to `quests` table with default value 'pending'
    - Status can be: 'pending', 'accepted', 'rejected'

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quests' AND column_name = 'status'
  ) THEN
    ALTER TABLE quests ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;