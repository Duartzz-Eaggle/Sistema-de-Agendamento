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
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface BookingData {
  service: Service;
  date: Date;
  time: string;
  customerName: string;
  customerWhatsapp: string;
}
