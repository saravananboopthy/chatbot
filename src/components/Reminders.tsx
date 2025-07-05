import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Plus, Trash2, Check, AlertCircle, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { Howl } from 'howler';

const alarmSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
  volume: 0.7,
  loop: true
});

interface Reminder {
  id: string;
  medicine: string;
  time: string;
  notes: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  notificationEnabled: boolean;
  lastTaken?: string;
  alarmActive?: boolean;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medicine, setMedicine] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [notification, setNotification] = useState(true);
  const [upcomingReminder, setUpcomingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('medicalReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  useEffect(() => {
    // Save reminders to localStorage
    localStorage.setItem('medicalReminders', JSON.stringify(reminders));

    // Check for upcoming reminders
    const checkUpcomingReminders = () => {
      const now = new Date();
      const upcoming = reminders.find(reminder => {
        const [hours, minutes] = reminder.time.split(':');
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        // Consider a reminder upcoming if it's within the next 5 minutes
        const diff = reminderTime.getTime() - now.getTime();
        const isUpcoming = diff > 0 && diff <= 300000; // 5 minutes in milliseconds
        
        // Start alarm if it's exactly reminder time
        if (diff <= 60000 && diff >= 0 && reminder.notificationEnabled && !reminder.alarmActive) {
          alarmSound.play();
          setReminders(prev => prev.map(r => 
            r.id === reminder.id ? { ...r, alarmActive: true } : r
          ));
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Medicine Reminder', {
              body: `Time to take ${reminder.medicine}`,
              icon: '/medicine-icon.png'
            });
          }
        }
        
        return isUpcoming;
      });

      setUpcomingReminder(upcoming || null);
    };

    const interval = setInterval(checkUpcomingReminders, 30000); // Check every 30 seconds
    checkUpcomingReminders(); // Initial check

    return () => {
      clearInterval(interval);
      alarmSound.stop();
    };
  }, [reminders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine || !time) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      medicine,
      time,
      notes,
      frequency,
      notificationEnabled: notification,
      alarmActive: false
    };

    setReminders([...reminders, newReminder]);
    setMedicine('');
    setTime('');
    setNotes('');
    setFrequency('daily');
    setNotification(true);

    // Request notification permission if enabled
    if (notification && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const toggleNotification = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, notificationEnabled: !reminder.notificationEnabled }
        : reminder
    ));
  };

  const markAsTaken = (id: string) => {
    alarmSound.stop();
    setReminders(reminders.map(reminder =>
      reminder.id === id
        ? { 
            ...reminder, 
            lastTaken: new Date().toISOString(),
            alarmActive: false
          }
        : reminder
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upcoming Reminder Alert */}
      {upcomingReminder && (
        <div className="lg:col-span-2 bg-gradient-to-r from-yellow-500/20 to-red-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="text-yellow-400 animate-pulse" />
          <div>
            <h3 className="font-medium text-yellow-400">Upcoming Medication</h3>
            <p className="text-sm text-yellow-300">
              Remember to take {upcomingReminder.medicine} at {upcomingReminder.time}
            </p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#1e2538] to-[#1e2035] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
          <Plus className="mr-2 text-red-500" />
          Add New Reminder
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter medicine name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Add any special instructions"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notification"
              checked={notification}
              onChange={(e) => setNotification(e.target.checked)}
              className="rounded bg-gray-800/50 border-gray-600 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="notification" className="text-sm text-gray-300">
              Enable notifications
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Reminder</span>
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-[#1e2538] to-[#1e2035] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
          <Bell className="mr-2 text-yellow-500" />
          Your Reminders
        </h2>
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <p className="text-gray-400">No reminders set yet.</p>
          ) : (
            reminders.map(reminder => (
              <div
                key={reminder.id}
                className="bg-gray-800/50 p-4 rounded-lg space-y-2 hover:bg-gray-800/70 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Pill className="text-red-400" size={20} />
                    <h3 className="font-semibold">{reminder.medicine}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markAsTaken(reminder.id)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                      title="Mark as taken"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => toggleNotification(reminder.id)}
                      className={`${
                        reminder.notificationEnabled ? 'text-yellow-400' : 'text-gray-500'
                      } hover:text-yellow-300 transition-colors`}
                      title="Toggle notifications"
                    >
                      <Bell size={16} />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-yellow-400" />
                    {reminder.time}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-red-400" />
                    {reminder.frequency.charAt(0).toUpperCase() + reminder.frequency.slice(1)}
                  </div>
                </div>
                {reminder.notes && (
                  <p className="text-sm text-gray-400">{reminder.notes}</p>
                )}
                {reminder.lastTaken && (
                  <p className="text-xs text-green-400">
                    Last taken: {format(new Date(reminder.lastTaken), 'MMM d, yyyy HH:mm')}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}