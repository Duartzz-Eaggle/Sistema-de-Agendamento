export function generateWhatsAppLink(
  phoneNumber: string,
  customerName: string,
  date: string,
  time: string
): string {
  const message = `Olá ${customerName}, seu horário foi agendado com sucesso para ${date} às ${time} na Onzy Barber! 💈`;

  const cleanPhone = phoneNumber.replace(/\D/g, '');

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}
