import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BookingPage } from './pages/BookingPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

type Page = 'home' | 'services' | 'booking' | 'admin' | 'settings' | 'confirmation';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('admin');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  function handleNavigate(page: string, data?: any) {
    setCurrentPage(page as Page);

    if (page === 'confirmation' && data) {
      setBookingConfirmation(data);
    } else if (page === 'booking' && typeof data === 'string') {
      setSelectedServiceId(data);
    } else {
      setSelectedServiceId(undefined);
      setBookingConfirmation(null);
    }
  }

  const showHeader = currentPage !== 'admin' && currentPage !== 'settings' && currentPage !== 'confirmation';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {showHeader && <Header currentPage={currentPage} onNavigate={handleNavigate} />}

      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
      {currentPage === 'booking' && (
        <BookingPage
          selectedServiceId={selectedServiceId}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
      {currentPage === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
      {currentPage === 'confirmation' && bookingConfirmation && (
        <ConfirmationPage
          onNavigate={handleNavigate}
          bookingDetails={bookingConfirmation}
        />
      )}
    </div>
  );
}

export default App;
