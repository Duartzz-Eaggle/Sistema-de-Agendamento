import { format, parse, addMinutes, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function formatDate(date: Date): string {
  return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseTime(timeString: string): Date {
  return parse(timeString, 'HH:mm', new Date());
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number,
  serviceDuration: number
): string[] {
  const slots: string[] = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let current = start;
  while (current < end) {
    const slotEnd = addMinutes(current, serviceDuration);
    if (slotEnd <= end) {
      slots.push(format(current, 'HH:mm'));
    }
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

export function isDateUnavailable(
  date: Date,
  weekdaysOff: number[],
  specificDaysOff: string[]
): boolean {
  const dayOfWeek = date.getDay();
  if (weekdaysOff.includes(dayOfWeek)) {
    return true;
  }

  const dateString = formatDateForDB(date);
  if (specificDaysOff.includes(dateString)) {
    return true;
  }

  const today = startOfDay(new Date());
  if (date < today) {
    return true;
  }

  return false;
}

export function isTimeSlotAvailable(
  date: Date,
  time: string,
  appointments: Array<{ appointment_date: string; appointment_time: string; status: string }>
): boolean {
  const dateString = formatDateForDB(date);

  return !appointments.some(
    (apt) =>
      apt.appointment_date === dateString &&
      apt.appointment_time === time &&
      apt.status !== 'cancelled'
  );
}
