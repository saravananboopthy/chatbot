import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
  className?: string;
}

export default function PrivacyToggle({ isPrivate, onToggle, className = '' }: PrivacyToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isPrivate
          ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-white/10 text-white hover:bg-white/20'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
      <span>{isPrivate ? 'Private Mode' : 'Normal Mode'}</span>
    </motion.button>
  );
}