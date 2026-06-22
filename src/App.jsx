import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flexGrow: 1, padding: '2rem 0' }}>
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
