import { useContext } from "react";
import { useTheme as useThemeContext } from "@/components/ui/theme-provider";

// Re-export the theme hook for consistency
export function useTheme() {
  const context = useThemeContext();
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}

// Additional theme utilities
export function useThemeColors() {
  const { theme } = useTheme();
  
  const colors = {
    light: {
      background: 'hsl(210, 40%, 98%)',
      foreground: 'hsl(222.2, 84%, 4.9%)',
      card: 'hsl(0, 0%, 100%)',
      cardForeground: 'hsl(222.2, 84%, 4.9%)',
      primary: 'hsl(221.2, 83.2%, 53.3%)',
      primaryForeground: 'hsl(210, 40%, 98%)',
      secondary: 'hsl(210, 40%, 96%)',
      secondaryForeground: 'hsl(222.2, 84%, 4.9%)',
      muted: 'hsl(210, 40%, 96%)',
      mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
      accent: 'hsl(210, 40%, 96%)',
      accentForeground: 'hsl(222.2, 84%, 4.9%)',
      border: 'hsl(214.3, 31.8%, 91.4%)',
      ring: 'hsl(221.2, 83.2%, 53.3%)',
    },
    dark: {
      background: 'hsl(222.2, 84%, 4.9%)',
      foreground: 'hsl(210, 40%, 98%)',
      card: 'hsl(222.2, 84%, 4.9%)',
      cardForeground: 'hsl(210, 40%, 98%)',
      primary: 'hsl(217.2, 91.2%, 59.8%)',
      primaryForeground: 'hsl(222.2, 84%, 4.9%)',
      secondary: 'hsl(217.2, 32.6%, 17.5%)',
      secondaryForeground: 'hsl(210, 40%, 98%)',
      muted: 'hsl(217.2, 32.6%, 17.5%)',
      mutedForeground: 'hsl(215, 20.2%, 65.1%)',
      accent: 'hsl(217.2, 32.6%, 17.5%)',
      accentForeground: 'hsl(210, 40%, 98%)',
      border: 'hsl(217.2, 32.6%, 17.5%)',
      ring: 'hsl(224.3, 76.3%, 94.1%)',
    }
  };
  
  return colors[theme] || colors.light;
}

export function useSystemTheme() {
  const { theme, setTheme } = useTheme();
  
  const setSystemTheme = () => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  };
  
  const isSystemTheme = () => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return theme === systemTheme;
  };
  
  return {
    setSystemTheme,
    isSystemTheme,
  };
}
