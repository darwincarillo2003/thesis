import React, { useState } from 'react';
import { Eye, EyeOff, Camera, Edit, Save, X } from 'lucide-react';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Add your save logic here
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any form changes here if needed
  };

  const renderProfileTab = () => (
    <div className="my-profile__container">
      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Profile Picture</h3>
        <div className="my-profile__profile-pic-section">
          <img src="/images/csp.png" alt="Profile" className="my-profile__profile-pic" />
          {isEditing && (
            <div className="my-profile__profile-pic-actions">
              <button className="my-profile__btn my-profile__btn--secondary my-profile__btn--small">
                <Camera size={16} />
                Change Photo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Personal Information</h3>
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              First Name <span className="required">*</span>
            </label>
            <input type="text" className="my-profile__input" defaultValue="John" readOnly={!isEditing} />
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Last Name <span className="required">*</span>
            </label>
            <input type="text" className="my-profile__input" defaultValue="Doe" readOnly={!isEditing} />
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">Middle Name</label>
            <input type="text" className="my-profile__input" defaultValue="Smith" readOnly={!isEditing} />
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">Suffix</label>
            <input type="text" className="my-profile__input" defaultValue="" readOnly={!isEditing} />
          </div>
        </div>
      </div>

      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Account Information</h3>
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">Email</label>
            <input type="email" className="my-profile__input" defaultValue="john.doe@fsuu.edu.ph" readOnly />
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">Role</label>
            <input type="text" className="my-profile__input" defaultValue="Student Organization" readOnly />
          </div>
        </div>
      </div>

      {/* Action Buttons for Profile Tab */}
      {!isEditing ? (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={16} />
            Cancel
          </button>
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );

  const renderPasswordTab = () => (
    <div className="my-profile__container">
      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Change Password</h3>
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Current Password <span className="required">*</span>
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className="my-profile__input"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleCurrentPasswordVisibility}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              New Password <span className="required">*</span>
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                className="my-profile__input"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleNewPasswordVisibility}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Confirm New Password <span className="required">*</span>
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="my-profile__input"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="my-profile__tab-actions">
        <button className="my-profile__btn my-profile__btn--primary">Update Password</button>
        <button className="my-profile__btn my-profile__btn--secondary">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="my-profile">
      <div className="my-profile__header">
        <h1 className="my-profile__title">My Profile</h1>
      </div>

      <div className="my-profile__tab-wrapper">
        <button
          className={`my-profile__tab ${activeTab === 'profile' ? 'my-profile__tab--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button
          className={`my-profile__tab ${activeTab === 'password' ? 'my-profile__tab--active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          My Password
        </button>
      </div>

      <div className="my-profile__content">
        {activeTab === 'profile' ? renderProfileTab() : renderPasswordTab()}
      </div>
    </div>
  );
};

export default MyProfile;
