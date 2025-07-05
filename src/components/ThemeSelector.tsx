import React from 'react';
import { Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Palette className="text-white/60" size={20} />
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme('child')}
          className={`px-4 py-2 rounded-lg ${
            theme === 'child'
              ? 'bg-blue-400 text-white shadow-lg shadow-blue-500/50'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Child Mode
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme('default')}
          className={`px-4 py-2 rounded-lg ${
            theme === 'default'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Default Mode
        </motion.button>
      </div>
    </div>
  );
}