import { Clock, Calendar, Star, Scissors } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-600 p-6 rounded-full mb-6 shadow-lg">
            <Scissors className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Onzy Company
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed px-4">
            Agende seu horário de forma rápida e prática. Escolha o serviço, data e horário que melhor se adequa à sua rotina.
          </p>

          <button
            onClick={() => onNavigate('booking')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Calendar className="w-6 h-6" />
            <span>Agendar Agora</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Rápido e Fácil
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Agende em poucos cliques. Escolha o serviço, data e horário disponível.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Horários Flexíveis
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Diversos horários disponíveis para se adequar à sua agenda.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Qualidade Garantida
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Profissionais experientes e serviços de alta qualidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
