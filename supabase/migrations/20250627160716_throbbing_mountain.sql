/*
  # Add completed_at column to quests table

  1. Changes
    - Add `completed_at` column to `quests` table
    - Column is nullable timestamp with time zone
    - Allows tracking when quests are completed

  2. Notes
    - This column is required by the application logic
    - Existing quests will have NULL completed_at values
    - New completions will populate this field automatically
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quests' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE quests ADD COLUMN completed_at timestamptz;
  END IF;
END $$;