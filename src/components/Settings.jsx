import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { useSettings } from '../context/SettingsContext';
import GoogleCalendarButton from './GoogleCalendarButton';
import { toast } from 'sonner';
import { Eye, EyeOff, Moon, Sun, Upload, Download, FileUp } from 'lucide-react';
import { migrateToSupabase } from '../utils/supabaseStorage';
import { resetSupabaseClient } from '../utils/supabaseClient';
import { storage } from '../utils/localStorage';
import { getUserInfo } from '../utils/googleCalendarService';

export default function Settings() {
  const { settings, updateSettings, updateGoogleTokens, getMaskedApiKey } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync localSettings with context settings when they change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Fetch email if we have a token but no email stored
  useEffect(() => {
    const fetchEmailIfNeeded = async () => {
      if (settings.googleAccessToken && !settings.googleConnectedAccount) {
        try {
          const userInfo = await getUserInfo(settings.googleAccessToken);
          if (userInfo.email) {
            updateGoogleTokens({
              email: userInfo.email,
            });
          }
        } catch (error) {
          console.warn('Failed to fetch Google account email:', error);
          // Don't show error toast - this is a background operation
        }
      }
    };

    fetchEmailIfNeeded();
  }, [settings.googleAccessToken, settings.googleConnectedAccount, updateGoogleTokens]);

  const handleSave = () => {
    try {
      // Update context (which will trigger localStorage save)
      updateSettings(localSettings);
      
      // Also directly save to localStorage to ensure it's persisted
      const saved = storage.settings.set(localSettings);
      
      if (!saved) {
        toast.error('Couldn't save. Check the console.');
        return;
      }
      
      // Reset Supabase client if URL or key changed
      resetSupabaseClient();
      
      // Verify the save worked
      const verify = storage.settings.get();
      if (JSON.stringify(verify) === JSON.stringify(localSettings)) {
        toast.success('Settings saved!');
      } else {
        toast.warning('Saved, but something looks off. Check your browser storage.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Couldn't save: ' + error.message);
    }
  };

  const handleExportSettings = () => {
    try {
      const settingsToExport = {
        ...localSettings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      const dataStr = JSON.stringify(settingsToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meal-prep-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Settings exported!');
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Export failed');
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          // Remove metadata fields
          const { exportedAt, version, ...settings } = imported;
          // Merge with current settings to preserve any new fields
          const mergedSettings = { ...localSettings, ...settings };
          setLocalSettings(mergedSettings);
          updateSettings(mergedSettings);
          resetSupabaseClient();
          toast.success('Settings imported!');
        } catch (error) {
          console.error('Error importing settings:', error);
          toast.error('Couldn't import. Is that the right file?');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleMigrate = async () => {
    if (!localSettings.supabaseUrl || !localSettings.supabaseAnonKey) {
      toast.error('Set up Supabase URL and Key first');
      return;
    }

    // Save settings first to ensure Supabase client is initialized
    updateSettings(localSettings);
    resetSupabaseClient();

    toast.loading('Migrating your data...', { id: 'migration' });
    
    try {
      // Wait a bit for client to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await migrateToSupabase();
      
      if (success) {
        toast.success('All synced up!', { id: 'migration' });
      } else {
        toast.error('Migration failed. Check the console.', { id: 'migration' });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Check the console.', { id: 'migration' });
    }
  };

  const updateLocalSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCookName = (index, value) => {
    const newNames = [...localSettings.cookNames];
    newNames[index] = value;
    updateLocalSetting('cookNames', newNames);
  };

  const addCookName = () => {
    updateLocalSetting('cookNames', [...localSettings.cookNames, '']);
  };

  const removeCookName = (index) => {
    if (localSettings.cookNames.length > 1) {
      const newNames = localSettings.cookNames.filter((_, i) => i !== index);
      updateLocalSetting('cookNames', newNames);
    }
  };

  return (
    <div className="space-y-6 w-2/3 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Set it up once, stop hearing 'you never plan anything'</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Label className="text-base font-semibold mb-4 block font-mono">Appearance</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {localSettings.darkMode ? (
                  <Moon className="h-5 w-5 text-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-foreground" />
                )}
                <span className="font-mono text-sm">Dark Mode</span>
              </div>
              <Switch
                checked={localSettings.darkMode || false}
                onCheckedChange={(checked) => {
                  const updatedSettings = { ...localSettings, darkMode: checked };
                  setLocalSettings(updatedSettings);
                  // Immediately update context and apply dark mode
                  updateSettings(updatedSettings);
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Cook Names */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Who's Cooking?</Label>
            <div className="space-y-2">
              {localSettings.cookNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updateCookName(index, e.target.value)}
                    placeholder="Name"
                  />
                  {localSettings.cookNames.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCookName(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addCookName} className="w-full">
                + Add Another Cook
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Add everyone who cooks so you can assign meals fairly. No more 'I cooked last time' arguments.
            </p>
          </div>

          <Separator />

          {/* Email Address */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Email Setup</Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-address">Your Email</Label>
                <Input
                  id="email-address"
                  type="email"
                  value={localSettings.emailAddress || ''}
                  onChange={(e) => updateLocalSetting('emailAddress', e.target.value)}
                  placeholder="you@email.com"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Where we'll send shopping lists and calendar invites.
                </p>
              </div>
              
              {/* Additional Recipients */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Also Send To</Label>
                <div className="space-y-2">
                  {(localSettings.additionalEmails || []).map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...(localSettings.additionalEmails || [])];
                          newEmails[index] = e.target.value;
                          updateLocalSetting('additionalEmails', newEmails);
                        }}
                        placeholder="babe@email.com"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newEmails = (localSettings.additionalEmails || []).filter((_, i) => i !== index);
                          updateLocalSetting('additionalEmails', newEmails);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      updateLocalSetting('additionalEmails', [...(localSettings.additionalEmails || []), '']);
                    }} 
                    className="w-full"
                  >
                    + Add Another
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your partner, roommate, or anyone else who needs the list.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Anthropic API Key */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Recipe Parsing (AI)</Label>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.anthropicApiKey}
                onChange={(e) => updateLocalSetting('anthropicApiKey', e.target.value)}
                placeholder="sk-ant-api03-..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Powers the magic that turns messy recipe pages into clean data. Get yours at{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          <Separator />

          {/* EmailJS Credentials */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Email Sending</Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="emailjs-service">Service ID</Label>
                <Input
                  id="emailjs-service"
                  value={localSettings.emailjsServiceId}
                  onChange={(e) => updateLocalSetting('emailjsServiceId', e.target.value)}
                  placeholder="service_xxxxx"
                />
              </div>
              <div>
                <Label htmlFor="emailjs-template">Template ID</Label>
                <Input
                  id="emailjs-template"
                  value={localSettings.emailjsTemplateId}
                  onChange={(e) => updateLocalSetting('emailjsTemplateId', e.target.value)}
                  placeholder="template_xxxxx"
                />
              </div>
              <div>
                <Label htmlFor="emailjs-public">Public Key</Label>
                <Input
                  id="emailjs-public"
                  value={localSettings.emailjsPublicKey}
                  onChange={(e) => updateLocalSetting('emailjsPublicKey', e.target.value)}
                  placeholder="xxxxxxxxxxxxx"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              For sending shopping lists. Get these from{' '}
              <a
                href="https://www.emailjs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                emailjs.com
              </a>
            </p>
          </div>

          <Separator />

          {/* Google Calendar */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Google Calendar</Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="google-client-id">Client ID</Label>
                <Input
                  id="google-client-id"
                  value={localSettings.googleClientId}
                  onChange={(e) => updateLocalSetting('googleClientId', e.target.value)}
                  placeholder="xxxxx.apps.googleusercontent.com"
                />
              </div>
              <div>
                <Label htmlFor="google-client-secret">Client Secret</Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  value={localSettings.googleClientSecret}
                  onChange={(e) => updateLocalSetting('googleClientSecret', e.target.value)}
                  placeholder="GOCSPX-xxxxx"
                />
              </div>
              {settings.googleConnectedAccount && (
                <div className="p-3 rounded-lg border border-border bg-muted/50">
                  <Label className="text-sm font-medium text-muted-foreground">Connected Account</Label>
                  <p className="text-sm font-mono mt-1">{settings.googleConnectedAccount}</p>
                </div>
              )}
              <GoogleCalendarButton />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Connect to add meals to your calendar automatically. Set up OAuth in{' '}
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          <Separator />

          {/* Supabase Configuration */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Cloud Sync</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Sync recipes between devices so you and babe are always on the same page.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  value={localSettings.supabaseUrl || ''}
                  onChange={(e) => updateLocalSetting('supabaseUrl', e.target.value)}
                  placeholder="https://xxxxx.supabase.co"
                />
              </div>
              <div>
                <Label htmlFor="supabase-anon-key">Anon Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="supabase-anon-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={localSettings.supabaseAnonKey || ''}
                    onChange={(e) => updateLocalSetting('supabaseAnonKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Get these from your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Supabase Dashboard
              </a>
              {' '}→ Project Settings → API
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleMigrate}
                className="w-full"
                disabled={!localSettings.supabaseUrl || !localSettings.supabaseAnonKey}
              >
                <Upload className="h-4 w-4 mr-2" />
                Migrate My Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                One-time sync: uploads all your local recipes, favorites, and history to the cloud.
              </p>
            </div>
          </div>

          <Separator />

          {/* Settings Backup & Restore */}
          <div>
            <Label className="text-base font-semibold mb-3 block font-mono">Backup & Restore</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Export your settings to keep them safe. You know, just in case.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportSettings}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleImportSettings}
                className="flex-1"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Creates a JSON file with all your config. Keep it somewhere safe!
            </p>
          </div>

          <Separator />

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

