import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  prefersReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  prefersReducedMotion: false,
  toggleReducedMotion: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to light (professional)
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  // Initialize motion preference from localStorage or system preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem('reducedMotion');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Apply theme to body element
  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save motion preference
  useEffect(() => {
    localStorage.setItem('reducedMotion', String(prefersReducedMotion));
  }, [prefersReducedMotion]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const toggleReducedMotion = () => {
    setPrefersReducedMotion((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, prefersReducedMotion, toggleReducedMotion }}>
      {children}
    </ThemeContext.Provider>
  );
};