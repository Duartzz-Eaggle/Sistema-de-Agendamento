/*
  # WhatsApp Automation System

  1. New Tables
    - `whatsapp_logs`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key to appointments)
      - `message_type` (text: confirmation, reminder, cancellation_success, cancellation_error)
      - `recipient_number` (text)
      - `message_content` (text)
      - `status` (text: pending, sent, failed, delivered)
      - `error_message` (text, nullable)
      - `sent_at` (timestamptz)
      - `delivered_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
    
    - `whatsapp_templates`
      - `id` (uuid, primary key)
      - `template_type` (text: confirmation, reminder, cancellation_success, cancellation_error)
      - `template_content` (text)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Table Modifications
    - Add `reminder_sent` (boolean) to appointments table
    - Add `reminder_sent_at` (timestamptz) to appointments table
    - Add `cancellation_token` (text) to appointments table
    - Add `cancellation_requested_at` (timestamptz) to appointments table

  3. Security
    - Enable RLS on all new tables
    - Add policies for public access (for webhook system)

  4. Indexes
    - Add index on appointments(appointment_date, appointment_time) for reminder queries
    - Add index on whatsapp_logs(appointment_id) for lookup
    - Add index on whatsapp_logs(status) for filtering
*/

-- Create whatsapp_logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  message_type text NOT NULL,
  recipient_number text NOT NULL,
  message_content text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text UNIQUE NOT NULL,
  template_content text NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add new columns to appointments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'reminder_sent'
  ) THEN
    ALTER TABLE appointments ADD COLUMN reminder_sent boolean DEFAULT false NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'reminder_sent_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN reminder_sent_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancellation_token'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancellation_token text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'cancellation_requested_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN cancellation_requested_at timestamptz;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
  ON appointments(appointment_date, appointment_time);

CREATE INDEX IF NOT EXISTS idx_appointments_reminder 
  ON appointments(reminder_sent, appointment_date, appointment_time) 
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_appointment 
  ON whatsapp_logs(appointment_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status 
  ON whatsapp_logs(status);

-- Enable RLS
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_logs
CREATE POLICY "Anyone can insert whatsapp logs"
  ON whatsapp_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view whatsapp logs"
  ON whatsapp_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update whatsapp logs"
  ON whatsapp_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for whatsapp_templates
CREATE POLICY "Anyone can view active templates"
  ON whatsapp_templates FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can insert templates"
  ON whatsapp_templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update templates"
  ON whatsapp_templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default templates
INSERT INTO whatsapp_templates (template_type, template_content, active) VALUES
  ('confirmation', E'✅ Seu agendamento foi confirmado com sucesso!\n\n❗Informações 👇\n\n📅 Data: {{data}}\n⏰ Horário: {{horario}}\n💈 Serviço: {{servico}}\n💇 Profissional: {{profissional}}\n💵 Valor: R$ {{valor}}\n\nPara cancelar esse agendamento digite a palavra: cancelar', true),
  ('reminder', E'Boa tarde {{nome_cliente}}, só estou passando aqui para lembrar que você tem um horário agendado conosco hoje às {{horario}}. Espero por você, até breve!\n\n⚠️ Atenção:\nTolerância de até 5 minutos. Após esse tempo, seu horário será cedido a outro cliente.', true),
  ('cancellation_success', E'❌ Agendamento cancelado com sucesso!\nO horário das {{horario}} do dia {{data}} foi liberado.\nEsperamos você em uma próxima oportunidade!', true),
  ('cancellation_error', E'⚠️ O cancelamento só é permitido até 2 horas antes do seu horário.\nEntre em contato com o barbeiro para mais informações.', true)
ON CONFLICT (template_type) DO NOTHING;
