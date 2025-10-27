import { Scissors, Calendar, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Onzy Company</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sistema de Agendamento</p>
            </div>
          </button>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Início
            </button>

            <button
              onClick={() => onNavigate('services')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'services'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Serviços
            </button>

            <button
              onClick={() => onNavigate('booking')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar</span>
            </button>

            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
              title="Alternar tema"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
