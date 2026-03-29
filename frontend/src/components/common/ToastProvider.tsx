import { Toaster } from 'react-hot-toast';
import { useThemeContext } from '../../contexts/ThemeContext';

export const ToastProvider = () => {
  const { mode } = useThemeContext();
  
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: mode === 'dark' ? '#1f2937' : '#ffffff',
          color: mode === 'dark' ? '#ffffff' : '#000000',
          border: `1px solid ${mode === 'dark' ? '#374151' : '#e5e7eb'}`,
          borderRadius: '0.5rem',
          padding: '1rem',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#6b7280',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};
