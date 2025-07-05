import React, { useEffect, useState } from 'react';
import { Bell, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  time: string;
  language: string;
}

export default function NotificationManager() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    sound: true,
    time: '09:00',
    language: i18n.language
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Request notification permission if not set
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up notification timer
    const checkNotifications = () => {
      if (settings.enabled && 'Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        const [hours, minutes] = settings.time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0);

        if (now.getHours() === scheduledTime.getHours() && 
            now.getMinutes() === scheduledTime.getMinutes()) {
          new Notification(t('medicationReminder'), {
            body: t('timeToTakeMedicine'),
            icon: '/medicine-icon.png',
            silent: !settings.sound
          });
        }
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings, t]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  const toggleNotifications = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
      } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSettings(prev => ({ ...prev, enabled: true }));
        }
      }
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('testNotification'), {
        body: t('notificationTest'),
        icon: '/medicine-icon.png',
        silent: !settings.sound
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/10 rounded-lg p-4 space-y-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Bell className="mr-2" />
          {t('notificationSettings')}
        </h3>
        <button
          onClick={testNotification}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          {t('testNotification')}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={toggleNotifications}
              className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-white">{t('enableNotifications')}</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) => setSettings(prev => ({ ...prev, sound: e.target.checked }))}
              className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-white">{t('notificationSound')}</span>
          </label>
          <Volume2 className="text-white/60" size={20} />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-white">{t('notificationTime')}</label>
          <input
            type="time"
            value={settings.time}
            onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
            className="bg-white/10 text-white rounded px-2 py-1 border border-white/20"
          />
        </div>
      </div>

      {!('Notification' in window) && (
        <div className="text-yellow-400 text-sm flex items-center">
          <AlertTriangle size={16} className="mr-2" />
          {t('notificationNotSupported')}
        </div>
      )}
    </motion.div>
  );
}