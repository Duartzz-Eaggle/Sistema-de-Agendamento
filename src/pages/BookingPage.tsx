import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, BusinessSettings, Appointment } from '../types';
import { formatDate, formatDateForDB, generateTimeSlots, isDateUnavailable, isTimeSlotAvailable } from '../utils/dateUtils';
import { generateWhatsAppLink, formatPhoneNumber } from '../utils/whatsappUtils';

interface BookingPageProps {
  onNavigate: (page: string, data?: any) => void;
  selectedServiceId?: string;
}

export function BookingPage({ onNavigate, selectedServiceId }: BookingPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const service = services.find(s => s.id === selectedServiceId);
      if (service) {
        setSelectedService(service);
        setStep(2);
      }
    }
  }, [selectedServiceId, services]);

  async function loadInitialData() {
    try {
      const [servicesRes, settingsRes, appointmentsRes] = await Promise.all([
        supabase.from('services').select('*').eq('active', true).order('price'),
        supabase.from('business_settings').select('*').limit(1).single(),
        supabase.from('appointments').select('*').gte('appointment_date', formatDateForDB(new Date()))
      ]);

      if (servicesRes.data) setServices(servicesRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (appointmentsRes.data) setAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  function getAvailableTimeSlots(): string[] {
    if (!settings || !selectedService || !selectedDate) return [];

    const slots = generateTimeSlots(
      settings.work_start_time.slice(0, 5),
      settings.work_end_time.slice(0, 5),
      settings.slot_interval_minutes,
      selectedService.duration_minutes
    );

    return slots.filter(slot => isTimeSlotAvailable(selectedDate, slot, appointments));
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerWhatsapp) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          service_id: selectedService.id,
          customer_name: customerName,
          customer_whatsapp: customerWhatsapp,
          appointment_date: formatDateForDB(selectedDate),
          appointment_time: selectedTime,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const whatsappLink = generateWhatsAppLink(
        settings?.whatsapp_number || '',
        customerName,
        formatDate(selectedDate),
        selectedTime
      );

      if (settings?.whatsapp_number) {
        window.open(whatsappLink, '_blank');
      }

      onNavigate('confirmation', {
        service: selectedService,
        date: formatDate(selectedDate),
        time: selectedTime,
        customerName,
        customerWhatsapp
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const timeSlots = getAvailableTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => step === 1 ? onNavigate('services') : setStep(step - 1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Agendar Horário
          </h1>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Serviço</span>
            </div>
            <div className="h-px w-12 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Data/Hora</span>
            </div>
            <div className="h-px w-12 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium hidden sm:inline">Dados</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Escolha o Serviço
              </h2>
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedService?.id === service.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {service.duration_minutes} minutos
                      </p>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Escolha Data e Horário
              </h2>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth(currentMonth).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const unavailable = !settings || isDateUnavailable(
                      date,
                      settings.weekday_off,
                      settings.specific_days_off
                    );
                    const selected = selectedDate && isSameDay(date, selectedDate);

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (isCurrentMonth && !unavailable) {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }
                        }}
                        disabled={!isCurrentMonth || unavailable}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          !isCurrentMonth
                            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                            : unavailable
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-not-allowed'
                            : selected
                            ? 'bg-blue-600 text-white'
                            : isToday(date)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Horários Disponíveis para {formatDate(selectedDate)}
                  </h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setStep(3);
                          }}
                          className={`py-3 px-4 rounded-lg font-medium transition-all ${
                            selectedTime === slot
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      Nenhum horário disponível para esta data
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Seus Dados
              </h2>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resumo do Agendamento</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p><strong>Serviço:</strong> {selectedService?.name}</p>
                  <p><strong>Data:</strong> {selectedDate && formatDate(selectedDate)}</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                  <p><strong>Valor:</strong> R$ {selectedService?.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !customerName || !customerWhatsapp}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Confirmar Agendamento</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
