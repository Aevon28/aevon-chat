import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import '../styles/Settings.css';

const Settings = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    theme: 'light',
    notificationsEnabled: true,
    soundNotifications: true,
    emailNotifications: false,
    privacy: 'friends',
  });
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    phone: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
      });
      if (user.settings) {
        setSettings(user.settings);
      }
    }
  }, [user]);

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleProfileChange = (key, value) => {
    setProfileData({ ...profileData, [key]: value });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to server
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL}/api/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Profile Settings</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={profileData.username}
            onChange={(e) => handleProfileChange('username', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            maxLength="160"
            placeholder="Tell something about yourself"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
          />
        </div>
        <button onClick={saveProfile} disabled={loading}>
          Save Profile
        </button>
      </div>

      <div className="settings-section">
        <h2>Notification Settings</h2>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.soundNotifications}
              onChange={(e) => handleSettingChange('soundNotifications', e.target.checked)}
            />
            Sound Notifications
          </label>
        </div>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="form-group">
          <label>Theme</label>
          <select value={settings.theme} onChange={(e) => handleSettingChange('theme', e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h2>Privacy</h2>
        <div className="form-group">
          <label>Privacy Level</label>
          <select value={settings.privacy} onChange={(e) => handleSettingChange('privacy', e.target.value)}>
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <button onClick={saveSettings} disabled={loading} className="save-btn">
        Save Settings
      </button>

      {message && <div className="message">{message}</div>}

      <div className="settings-section danger-zone">
        <h2>Account</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
