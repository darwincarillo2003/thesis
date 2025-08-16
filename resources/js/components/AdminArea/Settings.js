import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Globe,
  Mail,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import '../../../sass/AdminAreas/Settings.scss';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    formSubmissionNotifications: true,
    userRegistrationNotifications: true,
    systemMaintenanceNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'admin',
    showLastSeen: false,
    allowAnalytics: true,
    
    // Display Settings
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordRequireSymbols: true,
    passwordMinLength: '8',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    // Load settings from localStorage or API
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(prev => ({
          ...prev,
          ...JSON.parse(savedSettings)
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('adminSettings', JSON.stringify(settings));

      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        emailNotifications: true,
        pushNotifications: false,
        formSubmissionNotifications: true,
        userRegistrationNotifications: true,
        systemMaintenanceNotifications: true,
        profileVisibility: 'admin',
        showLastSeen: false,
        allowAnalytics: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordRequireSymbols: true,
        passwordMinLength: '8',
        autoBackup: true,
        backupFrequency: 'daily',
        maintenanceMode: false,
        debugMode: false
      });
      setSuccess('Settings reset to defaults');
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'security', label: 'Security', icon: Eye },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  const renderNotificationSettings = () => (
    <div className="settings__section">
      <h3 className="settings__section-title">
        <Bell size={20} />
        Notification Preferences
      </h3>
      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
          />
          <label htmlFor="emailNotifications">
            <span className="settings__toggle-label">Email Notifications</span>
            <span className="settings__toggle-description">Receive notifications via email</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={settings.pushNotifications}
            onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
          />
          <label htmlFor="pushNotifications">
            <span className="settings__toggle-label">Push Notifications</span>
            <span className="settings__toggle-description">Receive browser push notifications</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="formSubmissionNotifications"
            checked={settings.formSubmissionNotifications}
            onChange={(e) => handleSettingChange('notifications', 'formSubmissionNotifications', e.target.checked)}
          />
          <label htmlFor="formSubmissionNotifications">
            <span className="settings__toggle-label">Form Submissions</span>
            <span className="settings__toggle-description">Get notified when new forms are submitted</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="userRegistrationNotifications"
            checked={settings.userRegistrationNotifications}
            onChange={(e) => handleSettingChange('notifications', 'userRegistrationNotifications', e.target.checked)}
          />
          <label htmlFor="userRegistrationNotifications">
            <span className="settings__toggle-label">User Registrations</span>
            <span className="settings__toggle-description">Get notified when new users register</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="systemMaintenanceNotifications"
            checked={settings.systemMaintenanceNotifications}
            onChange={(e) => handleSettingChange('notifications', 'systemMaintenanceNotifications', e.target.checked)}
          />
          <label htmlFor="systemMaintenanceNotifications">
            <span className="settings__toggle-label">System Maintenance</span>
            <span className="settings__toggle-description">Get notified about system maintenance</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings__section">
      <h3 className="settings__section-title">
        <Shield size={20} />
        Privacy Settings
      </h3>
      
      <div className="settings__form-group">
        <label className="settings__label">Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
          className="settings__select"
        >
          <option value="public">Public</option>
          <option value="admin">Admin Only</option>
          <option value="private">Private</option>
        </select>
        <span className="settings__help-text">Who can see your profile information</span>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="showLastSeen"
            checked={settings.showLastSeen}
            onChange={(e) => handleSettingChange('privacy', 'showLastSeen', e.target.checked)}
          />
          <label htmlFor="showLastSeen">
            <span className="settings__toggle-label">Show Last Seen</span>
            <span className="settings__toggle-description">Show when you were last active</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="allowAnalytics"
            checked={settings.allowAnalytics}
            onChange={(e) => handleSettingChange('privacy', 'allowAnalytics', e.target.checked)}
          />
          <label htmlFor="allowAnalytics">
            <span className="settings__toggle-label">Analytics</span>
            <span className="settings__toggle-description">Allow anonymous analytics collection</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="settings__section">
      <h3 className="settings__section-title">
        <Monitor size={20} />
        Display Settings
      </h3>
      
      <div className="settings__form-group">
        <label className="settings__label">Theme</label>
        <div className="settings__radio-group">
          <label className="settings__radio">
            <input
              type="radio"
              value="light"
              checked={settings.theme === 'light'}
              onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
            />
            <Sun size={16} />
            Light
          </label>
          <label className="settings__radio">
            <input
              type="radio"
              value="dark"
              checked={settings.theme === 'dark'}
              onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
            />
            <Moon size={16} />
            Dark
          </label>
          <label className="settings__radio">
            <input
              type="radio"
              value="auto"
              checked={settings.theme === 'auto'}
              onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
            />
            <Monitor size={16} />
            Auto
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <label className="settings__label">Language</label>
        <select
          value={settings.language}
          onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
          className="settings__select"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="settings__form-group">
        <label className="settings__label">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
          className="settings__select"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Asia/Manila">Philippine Time</option>
        </select>
      </div>

      <div className="settings__form-group">
        <label className="settings__label">Date Format</label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
          className="settings__select"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="MMM DD, YYYY">MMM DD, YYYY</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings__section">
      <h3 className="settings__section-title">
        <Eye size={20} />
        Security Settings
      </h3>
      
      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
          />
          <label htmlFor="twoFactorAuth">
            <span className="settings__toggle-label">Two-Factor Authentication</span>
            <span className="settings__toggle-description">Add an extra layer of security to your account</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <label className="settings__label">Session Timeout (minutes)</label>
        <select
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
          className="settings__select"
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
          <option value="480">8 hours</option>
        </select>
        <span className="settings__help-text">Automatically log out after inactivity</span>
      </div>

      <div className="settings__form-group">
        <label className="settings__label">Minimum Password Length</label>
        <select
          value={settings.passwordMinLength}
          onChange={(e) => handleSettingChange('security', 'passwordMinLength', e.target.value)}
          className="settings__select"
        >
          <option value="6">6 characters</option>
          <option value="8">8 characters</option>
          <option value="12">12 characters</option>
          <option value="16">16 characters</option>
        </select>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="passwordRequireSymbols"
            checked={settings.passwordRequireSymbols}
            onChange={(e) => handleSettingChange('security', 'passwordRequireSymbols', e.target.checked)}
          />
          <label htmlFor="passwordRequireSymbols">
            <span className="settings__toggle-label">Require Special Characters</span>
            <span className="settings__toggle-description">Passwords must contain symbols (!@#$%^&*)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="settings__section">
      <h3 className="settings__section-title">
        <SettingsIcon size={20} />
        System Settings
      </h3>
      
      <div className="settings__form-group">
        <div className="settings__toggle">
          <input
            type="checkbox"
            id="autoBackup"
            checked={settings.autoBackup}
            onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
          />
          <label htmlFor="autoBackup">
            <span className="settings__toggle-label">Automatic Backups</span>
            <span className="settings__toggle-description">Automatically backup system data</span>
          </label>
        </div>
      </div>

      {settings.autoBackup && (
        <div className="settings__form-group">
          <label className="settings__label">Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
            className="settings__select"
          >
            <option value="hourly">Every Hour</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <div className="settings__form-group">
        <div className="settings__toggle settings__toggle--warning">
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
          />
          <label htmlFor="maintenanceMode">
            <span className="settings__toggle-label">
              <AlertTriangle size={16} />
              Maintenance Mode
            </span>
            <span className="settings__toggle-description">Put the system in maintenance mode</span>
          </label>
        </div>
      </div>

      <div className="settings__form-group">
        <div className="settings__toggle settings__toggle--danger">
          <input
            type="checkbox"
            id="debugMode"
            checked={settings.debugMode}
            onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
          />
          <label htmlFor="debugMode">
            <span className="settings__toggle-label">
              Debug Mode
            </span>
            <span className="settings__toggle-description">Enable debug logging (not recommended for production)</span>
          </label>
        </div>
      </div>

      <div className="settings__danger-zone">
        <h4 className="settings__danger-title">
          <AlertTriangle size={16} />
          Danger Zone
        </h4>
        <p className="settings__danger-description">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <div className="settings__danger-actions">
          <button className="settings__btn settings__btn--danger" type="button">
            <Download size={16} />
            Export All Data
          </button>
          <button className="settings__btn settings__btn--danger" type="button">
            <Trash2 size={16} />
            Clear All Logs
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'display': return renderDisplaySettings();
      case 'security': return renderSecuritySettings();
      case 'system': return renderSystemSettings();
      default: return renderNotificationSettings();
    }
  };

  return (
    <div className="settings">
      <div className="settings__header">
        <div className="settings__title-section">
          <h1 className="settings__title">
            <SettingsIcon size={24} />
            Settings
          </h1>
          <p className="settings__subtitle">Manage your application preferences and system configuration</p>
        </div>
        
        <div className="settings__actions">
          <button 
            className="settings__btn settings__btn--secondary"
            onClick={handleResetSettings}
            disabled={isSaving}
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <button 
            className="settings__btn settings__btn--primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="settings__alert settings__alert--error">
          {error}
        </div>
      )}

      {success && (
        <div className="settings__alert settings__alert--success">
          {success}
        </div>
      )}

      <div className="settings__content">
        <div className="settings__tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings__tab ${activeTab === tab.id ? 'settings__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="settings__panel">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
