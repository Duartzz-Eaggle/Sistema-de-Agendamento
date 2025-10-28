/*
  # Create Base Database Schema

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `price` (numeric)
      - `active` (boolean)
      - `created_at` (timestamptz)
    
    - `business_settings`
      - `id` (uuid, primary key)
      - `weekday_off` (integer array)
      - `specific_days_off` (date array)
      - `work_start_time` (time)
      - `work_end_time` (time)
      - `slot_interval_minutes` (integer)
      - `whatsapp_message_template` (text)
      - `whatsapp_number` (text)
      - `admin_password` (text)
      - `updated_at` (timestamptz)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `customer_name` (text)
      - `customer_whatsapp` (text)
      - `appointment_date` (date)
      - `appointment_time` (time)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read and insert
    - Add policies for public update

  3. Initial Data
    - Insert default business settings
    - Insert sample services
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration_minutes integer NOT NULL,
  price numeric(10, 2) NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday_off integer[] DEFAULT ARRAY[0]::integer[],
  specific_days_off date[] DEFAULT ARRAY[]::date[],
  work_start_time time DEFAULT '09:00:00'::time NOT NULL,
  work_end_time time DEFAULT '18:00:00'::time NOT NULL,
  slot_interval_minutes integer DEFAULT 30 NOT NULL,
  whatsapp_message_template text DEFAULT 'Olá {name}, seu horário foi agendado com sucesso para {date} às {time} na Onzy Barber! 💈',
  whatsapp_number text DEFAULT '',
  admin_password text DEFAULT 'onzy2025',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can view all services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert services"
  ON services FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update services"
  ON services FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete services"
  ON services FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for business_settings
CREATE POLICY "Anyone can view business settings"
  ON business_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update business settings"
  ON business_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert business settings"
  ON business_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for appointments
CREATE POLICY "Anyone can view appointments"
  ON appointments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update appointments"
  ON appointments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete appointments"
  ON appointments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert default business settings
INSERT INTO business_settings (
  weekday_off,
  specific_days_off,
  work_start_time,
  work_end_time,
  slot_interval_minutes,
  whatsapp_message_template,
  admin_password,
  whatsapp_number
) VALUES (
  ARRAY[0]::integer[],
  ARRAY[]::date[],
  '09:00:00'::time,
  '18:00:00'::time,
  30,
  'Olá {name}, seu horário foi agendado com sucesso para {date} às {time} na Onzy Barber! 💈',
  'onzy2025',
  ''
);

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, price, active) VALUES
  ('Corte Simples', 'Corte de cabelo masculino tradicional', 30, 35.00, true),
  ('Corte + Barba', 'Corte de cabelo e barba completa', 60, 60.00, true),
  ('Barba', 'Barba completa com toalha quente', 30, 30.00, true),
  ('Corte Infantil', 'Corte de cabelo para crianças até 12 anos', 30, 25.00, true);
