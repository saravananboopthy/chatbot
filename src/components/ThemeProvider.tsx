import React, { createContext, useContext, useState } from 'react';

type Theme = 'child' | 'default';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`${getThemeClasses(theme)}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function getThemeClasses(theme: Theme): string {
  switch (theme) {
    case 'child':
      return 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 text-white min-h-screen transition-all duration-500';
    default:
      return 'bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen transition-all duration-500';
  }
}