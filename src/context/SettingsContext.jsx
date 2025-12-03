import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/localStorage';

const SettingsContext = createContext(null);

const defaultSettings = {
  darkMode: false,
  cookNames: ['You', 'Morgan'],
  yourEmail: '',
  partnerEmail: '',
  anthropicApiKey: '',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  googleClientId: '',
  googleClientSecret: '',
  googleAccessToken: '',
  googleRefreshToken: '',
  googleConnectedAccount: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSettings = storage.settings.get();
    const finalSettings = { ...defaultSettings, ...savedSettings };
    setSettings(finalSettings);
    
    // Apply dark mode immediately
    if (finalSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setLoading(false);
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (!loading) {
      storage.settings.set(settings);
    }
  }, [settings, loading]);

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateCookNames = (names) => {
    setSettings(prev => ({ ...prev, cookNames: names }));
  };

  const updateGoogleTokens = (tokens) => {
    setSettings(prev => ({
      ...prev,
      googleAccessToken: tokens.access_token || prev.googleAccessToken,
      googleRefreshToken: tokens.refresh_token || prev.googleRefreshToken,
      googleConnectedAccount: tokens.email || prev.googleConnectedAccount,
    }));
  };

  const clearGoogleConnection = () => {
    setSettings(prev => ({
      ...prev,
      googleAccessToken: '',
      googleRefreshToken: '',
      googleConnectedAccount: '',
    }));
  };

  const getMaskedApiKey = (key) => {
    if (!key || key.length < 8) return '';
    return `${key.substring(0, 4)}${'*'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updateCookNames,
    updateGoogleTokens,
    clearGoogleConnection,
    getMaskedApiKey,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

