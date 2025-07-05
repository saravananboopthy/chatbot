import React, { useState } from 'react';
import { MessageCircle, Calendar, Building2, Info, AlertTriangle, Heart, Code, FileText } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import Reminders from './components/Reminders';
import Hospitals from './components/Hospitals';
import EmergencyNumbers from './components/EmergencyNumbers';
import PatientHistory from './components/PatientHistory';
import LanguageSelector from './components/LanguageSelector';
import BackgroundAnimation from './components/BackgroundAnimation';
import ThemeSelector from './components/ThemeSelector';
import MedicalReportAnalyzer from './components/MedicalReportAnalyzer';
import { ThemeProvider } from './components/ThemeProvider';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const { t } = useTranslation();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <BackgroundAnimation />
        
        {/* Header */}
        <motion.header 
          className="sticky top-0 z-50 bg-black/50 border-b border-white/10 p-4 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Heart className="text-white animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                {t('medicalAssistant')}
              </h1>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ThemeSelector />
              <LanguageSelector />
              <nav className="flex flex-wrap justify-center gap-2">
                {[
                  { id: 'chat', icon: MessageCircle, label: 'Chat' },
                  { id: 'reminders', icon: Calendar, label: 'Reminders' },
                  { id: 'hospitals', icon: Building2, label: 'Hospitals' },
                  { id: 'reports', icon: FileText, label: 'Reports' },
                  { id: 'info', icon: Info, label: 'Info' }
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white text-black shadow-lg shadow-white/20' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon size={20} />
                    <span>{t(tab.id)}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Emergency Numbers Banner */}
        <motion.div 
          className="bg-white/5 py-2 border-b border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="container mx-auto overflow-x-auto">
            <EmergencyNumbers />
          </div>
        </motion.div>

        {/* Medical Disclaimer */}
        <motion.div 
          className="bg-black/50 border-b border-white/10 p-4"
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <div className="container mx-auto flex items-center space-x-2 text-white/80">
            <AlertTriangle size={20} className="animate-pulse flex-shrink-0" />
            <p className="text-sm md:text-base">
              {t('medicalDisclaimer')}
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <main className="container mx-auto p-4 relative z-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'reminders' && <Reminders />}
            {activeTab === 'hospitals' && <Hospitals />}
            {activeTab === 'reports' && <MedicalReportAnalyzer />}
            {activeTab === 'info' && <PatientHistory />}
          </motion.div>
        </main>

        {/* Watermark */}
        <motion.div 
          className="fixed bottom-4 right-4 text-white/40 text-sm flex items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Code size={14} />
          <span>Created by Rithika</span>
        </motion.div>
      </div>
    </ThemeProvider>
  );
}

export default App;