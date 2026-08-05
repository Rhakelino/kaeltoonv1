import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

export default function BackHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBack = () => {
      // Jika di halaman pertama (root), exit app
      if (location.pathname === '/' || location.pathname === '') {
        App.exitApp();
      } else {
        navigate(-1);
      }
    };

    const listener = App.addListener('backButton', handleBack);

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate, location]);

  return null;
}
