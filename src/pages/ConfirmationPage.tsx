import { CheckCircle, Calendar, Clock, User, Phone, Scissors, Home } from 'lucide-react';
import { Service } from '../types';

interface ConfirmationPageProps {
  onNavigate: (page: string) => void;
  bookingDetails: {
    service: Service;
    date: string;
    time: string;
    customerName: string;
    customerWhatsapp: string;
  };
}

export function ConfirmationPage({ onNavigate, bookingDetails }: ConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agendamento Confirmado!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Seu horário foi reservado com sucesso
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Serviço</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bookingDetails.service.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bookingDetails.service.duration_minutes} minutos • R$ {bookingDetails.service.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bookingDetails.date}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Horário</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bookingDetails.time}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bookingDetails.customerName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {bookingDetails.customerWhatsapp}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              Guarde essas informações. Chegue com 5 minutos de antecedência.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('home')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Voltar para Início</span>
              </button>

              <button
                onClick={() => onNavigate('booking')}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Fazer Outro Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
