import React, { useState } from 'react';
import { Save, RefreshCw, Bell, Eye, Shield, Globe } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const renderGeneralTab = () => (
    <div className="settings__container">
      <div className="settings__section">
        <h3 className="settings__section-title">
          <Globe size={20} />
          General Settings
        </h3>
        <div className="settings__form-grid">
          <div className="settings__form-group">
            <label className="settings__label">Language</label>
            <select className="settings__input">
              <option value="en">English</option>
              <option value="tl">Filipino</option>
            </select>
          </div>
          <div className="settings__form-group">
            <label className="settings__label">Timezone</label>
            <select className="settings__input">
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div className="settings__form-group">
            <label className="settings__label">Date Format</label>
            <select className="settings__input">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings__container">
      <div className="settings__section">
        <h3 className="settings__section-title">
          <Bell size={20} />
          Notification Preferences
        </h3>
        <div className="settings__form-grid">
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Email notifications for form submissions
            </label>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Email notifications for status updates
            </label>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" />
              <span className="settings__checkbox-custom"></span>
              SMS notifications (if available)
            </label>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Browser push notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings__container">
      <div className="settings__section">
        <h3 className="settings__section-title">
          <Shield size={20} />
          Privacy & Security
        </h3>
        <div className="settings__form-grid">
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Show profile information to other users
            </label>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Allow system to store activity logs
            </label>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" />
              <span className="settings__checkbox-custom"></span>
              Enable two-factor authentication (2FA)
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings__container">
      <div className="settings__section">
        <h3 className="settings__section-title">
          <Eye size={20} />
          Display Settings
        </h3>
        <div className="settings__form-grid">
          <div className="settings__form-group">
            <label className="settings__label">Theme</label>
            <select className="settings__input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div className="settings__form-group">
            <label className="settings__label">Items per page</label>
            <select className="settings__input">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="settings__form-group settings__checkbox-group">
            <label className="settings__checkbox-label">
              <input type="checkbox" className="settings__checkbox" defaultChecked />
              <span className="settings__checkbox-custom"></span>
              Compact view mode
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings">
      <div className="settings__header">
        <h1 className="settings__title">Settings</h1>
      </div>

      <div className="settings__tab-wrapper">
        <button
          className={`settings__tab ${activeTab === 'general' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`settings__tab ${activeTab === 'notifications' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`settings__tab ${activeTab === 'privacy' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy
        </button>
        <button
          className={`settings__tab ${activeTab === 'display' ? 'settings__tab--active' : ''}`}
          onClick={() => setActiveTab('display')}
        >
          Display
        </button>
      </div>

      <div className="settings__content">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'display' && renderDisplayTab()}
      </div>

      <div className="settings__actions">
        <button className="settings__btn settings__btn--primary">
          <Save size={16} />
          Save All Changes
        </button>
        <button className="settings__btn settings__btn--secondary">
          <RefreshCw size={16} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings;
