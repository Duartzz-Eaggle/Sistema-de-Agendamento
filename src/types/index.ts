export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  weekday_off: number[];
  specific_days_off: string[];
  work_start_time: string;
  work_end_time: string;
  slot_interval_minutes: number;
  whatsapp_message_template: string;
  whatsapp_number: string;
  admin_password: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  service_id: string;
  customer_name: string;
  customer_whatsapp: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  cancellation_token: string | null;
  cancellation_requested_at: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface WhatsAppLog {
  id: string;
  appointment_id: string;
  message_type: 'confirmation' | 'reminder' | 'cancellation_success' | 'cancellation_error';
  recipient_number: string;
  message_content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  template_type: 'confirmation' | 'reminder' | 'cancellation_success' | 'cancellation_error';
  template_content: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingData {
  service: Service;
  date: Date;
  time: string;
  customerName: string;
  customerWhatsapp: string;
}
