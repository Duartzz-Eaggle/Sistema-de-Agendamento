/*
  # Add Admin Password and WhatsApp Number to Business Settings

  1. Changes
    - Add `admin_password` column to store the admin panel access password
    - Add `whatsapp_number` column to store the barbershop's WhatsApp number for notifications
    - Update the default whatsapp_message_template to match the requested format
  
  2. Security
    - Maintains existing RLS on business_settings table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'admin_password'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN admin_password text DEFAULT 'onzy2025';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_settings' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE business_settings ADD COLUMN whatsapp_number text DEFAULT '';
  END IF;
END $$;

UPDATE business_settings
SET whatsapp_message_template = 'Olá {name}, seu horário foi agendado com sucesso para {date} às {time} na Onzy Barber! 💈'
WHERE whatsapp_message_template IS NOT NULL;

INSERT INTO business_settings (
  id,
  weekday_off,
  specific_days_off,
  work_start_time,
  work_end_time,
  slot_interval_minutes,
  whatsapp_message_template,
  admin_password,
  whatsapp_number
)
SELECT
  gen_random_uuid(),
  ARRAY[0]::integer[],
  ARRAY[]::date[],
  '09:00:00'::time,
  '18:00:00'::time,
  30,
  'Olá {name}, seu horário foi agendado com sucesso para {date} às {time} na Onzy Barber! 💈',
  'onzy2025',
  ''
WHERE NOT EXISTS (SELECT 1 FROM business_settings);
