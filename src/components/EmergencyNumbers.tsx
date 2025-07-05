import React from 'react';
import { Phone, Ambulance, ChevronFirst as FirstAid, Heart } from 'lucide-react';

export default function EmergencyNumbers() {
  return (
    <div className="flex flex-wrap items-center gap-8 text-sm">
      <div className="flex items-center text-red-400 animate-pulse">
        <Phone size={16} className="mr-2" />
        Emergency Numbers:
      </div>
      <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full">
        <Ambulance size={14} className="text-red-400" />
        <span className="text-gray-300">Ambulance:</span>
        <span className="font-bold text-red-400">102</span>
      </div>
      <div className="flex items-center space-x-2 bg-yellow-500/10 px-3 py-1 rounded-full">
        <Heart size={14} className="text-yellow-400" />
        <span className="text-gray-300">Emergency:</span>
        <span className="font-bold text-yellow-400">108</span>
      </div>
      <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full">
        <Phone size={14} className="text-red-400" />
        <span className="text-gray-300">Health Helpline:</span>
        <span className="font-bold text-red-400">1075</span>
      </div>
      <div className="flex items-center space-x-2 bg-yellow-500/10 px-3 py-1 rounded-full">
        <FirstAid size={14} className="text-yellow-400" />
        <span className="text-gray-300">Medical Advice:</span>
        <span className="font-bold text-yellow-400">104</span>
      </div>
    </div>
  );
}