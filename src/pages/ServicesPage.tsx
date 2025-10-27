import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service } from '../types';

export function ServicesPage({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-600 p-4 rounded-full mb-4">
            <Scissors className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nossos Serviços
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Escolha o serviço ideal para você e agende seu horário
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando serviços...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[48px]">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        R$ {service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('booking', service.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Agendar Agora</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum serviço disponível no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
