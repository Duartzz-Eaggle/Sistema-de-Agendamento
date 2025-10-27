import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, Calendar as CalendarIcon, Phone, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BusinessSettings } from '../types';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekdaysOff, setWeekdaysOff] = useState<number[]>([]);
  const [specificDaysOff, setSpecificDaysOff] = useState<string[]>([]);
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [slotInterval, setSlotInterval] = useState(30);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newDateOff, setNewDateOff] = useState('');

  const weekdays = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Segunda' },
    { id: 2, name: 'Terça' },
    { id: 3, name: 'Quarta' },
    { id: 4, name: 'Quinta' },
    { id: 5, name: 'Sexta' },
    { id: 6, name: 'Sábado' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setWeekdaysOff(data.weekday_off || []);
        setSpecificDaysOff(data.specific_days_off || []);
        setWorkStartTime(data.work_start_time?.slice(0, 5) || '09:00');
        setWorkEndTime(data.work_end_time?.slice(0, 5) || '18:00');
        setSlotInterval(data.slot_interval_minutes || 30);
        setWhatsappNumber(data.whatsapp_number || '');
        setAdminPassword(data.admin_password || 'onzy2025');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleWeekday(dayId: number) {
    setWeekdaysOff(prev =>
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  }

  function addSpecificDayOff() {
    if (newDateOff && !specificDaysOff.includes(newDateOff)) {
      setSpecificDaysOff([...specificDaysOff, newDateOff]);
      setNewDateOff('');
    }
  }

  function removeSpecificDayOff(date: string) {
    setSpecificDaysOff(specificDaysOff.filter(d => d !== date));
  }

  async function handleSave() {
    setSaving(true);

    try {
      const updateData = {
        weekday_off: weekdaysOff,
        specific_days_off: specificDaysOff,
        work_start_time: `${workStartTime}:00`,
        work_end_time: `${workEndTime}:00`,
        slot_interval_minutes: slotInterval,
        whatsapp_number: whatsappNumber,
        admin_password: adminPassword,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_settings')
        .update(updateData)
        .eq('id', settings?.id);

      if (error) throw error;

      alert('Configurações salvas com sucesso!');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Painel</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Configurações do Barbeiro
          </h1>

          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dias Fixos de Folga
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecione os dias da semana em que você não trabalha
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {weekdays.map(day => (
                  <button
                    key={day.id}
                    onClick={() => toggleWeekday(day.id)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all border-2 ${
                      weekdaysOff.includes(day.id)
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-red-400'
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Datas Específicas de Folga
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adicione datas excepcionais de folga (feriados, férias, etc.)
              </p>

              <div className="flex space-x-2 mb-4">
                <input
                  type="date"
                  value={newDateOff}
                  onChange={(e) => setNewDateOff(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSpecificDayOff}
                  disabled={!newDateOff}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Adicionar
                </button>
              </div>

              {specificDaysOff.length > 0 ? (
                <div className="space-y-2">
                  {specificDaysOff.map(date => (
                    <div
                      key={date}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        onClick={() => removeSpecificDayOff(date)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Nenhuma data específica de folga configurada
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Horário de Funcionamento
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Intervalo Entre Agendamentos
                </h2>
              </div>

              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  WhatsApp da Barbearia
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Número usado para enviar confirmações automáticas (ex: 5511987654321)
              </p>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="5511987654321"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Senha do Painel Administrativo
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Altere a senha de acesso ao painel
              </p>
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Configurações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
