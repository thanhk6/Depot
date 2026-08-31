import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark' as const,
      toggleTheme: () => {},
      isDark: true,
    };
  }
  return context;
};
