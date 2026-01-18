import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Always use dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      {token ? <Dashboard /> : <Login />}
    </>
  );
}

export default App;
