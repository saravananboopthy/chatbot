import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Plus, Calendar, Pill, X, Edit2, Save, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAbT84OsZXcsNfc8Go3iaXHaep-jjgL3vc');

interface MedicalHistory {
  allergies: string[];
  chronicConditions: string[];
  pastMedications: {
    name: string;
    reaction: 'good' | 'bad' | 'neutral';
    sideEffects?: string;
    date: string;
  }[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
  }[];
}

interface PersonalizedRecommendation {
  medicine: string;
  reason: string;
  safetyScore: number;
  alternatives: string[];
  warnings: string[];
  interactions: string[];
}

export default function PatientHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<MedicalHistory>({
    allergies: [],
    chronicConditions: [],
    pastMedications: [],
    currentMedications: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('medicalHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = (updatedHistory: MedicalHistory) => {
    localStorage.setItem('medicalHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      const updatedHistory = {
        ...history,
        allergies: [...history.allergies, newAllergy.trim()]
      };
      saveHistory(updatedHistory);
      setNewAllergy('');
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      const updatedHistory = {
        ...history,
        chronicConditions: [...history.chronicConditions, newCondition.trim()]
      };
      saveHistory(updatedHistory);
      setNewCondition('');
    }
  };

  const addMedication = (medication: any, type: 'past' | 'current') => {
    const updatedHistory = {
      ...history,
      [type === 'past' ? 'pastMedications' : 'currentMedications']: [
        ...history[type === 'past' ? 'pastMedications' : 'currentMedications'],
        medication
      ]
    };
    saveHistory(updatedHistory);
  };

  const removeMedication = (index: number, type: 'past' | 'current') => {
    const updatedHistory = {
      ...history,
      [type === 'past' ? 'pastMedications' : 'currentMedications']: history[
        type === 'past' ? 'pastMedications' : 'currentMedications'
      ].filter((_, i) => i !== index)
    };
    saveHistory(updatedHistory);
  };

  const analyzeAndRecommend = async (symptoms: string) => {
    setIsAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Given the following patient history and symptoms, provide personalized medicine recommendations:

Patient History:
- Allergies: ${history.allergies.join(', ')}
- Chronic Conditions: ${history.chronicConditions.join(', ')}
- Past Medications: ${history.pastMedications.map(m => m.name).join(', ')}
- Current Medications: ${history.currentMedications.map(m => m.name).join(', ')}

Current Symptoms: ${symptoms}

Provide recommendations in this JSON format:
{
  "recommendations": [{
    "medicine": "Medicine name",
    "reason": "Why this medicine is recommended",
    "safetyScore": 0-100,
    "alternatives": ["Alternative 1", "Alternative 2"],
    "warnings": ["Warning 1", "Warning 2"],
    "interactions": ["Interaction with current medication 1", "Interaction 2"]
  }]
}

Consider:
1. Allergies and past adverse reactions
2. Drug interactions with current medications
3. Impact on chronic conditions
4. Past medication effectiveness
5. Provide safer alternatives if needed`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const { recommendations } = JSON.parse(response);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 rounded-lg p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FileText className="mr-2" />
            {t('patientHistory')}
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-white/60 hover:text-white"
          >
            {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
          </button>
        </div>

        <div className="space-y-6">
          {/* Allergies Section */}
          <div>
            <h3 className="text-white/80 mb-2 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {t('allergies')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {history.allergies.map((allergy, index) => (
                <motion.div
                  key={index}
                  className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const updatedHistory = {
                          ...history,
                          allergies: history.allergies.filter((_, i) => i !== index)
                        };
                        saveHistory(updatedHistory);
                      }}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="bg-white/10 text-white rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={t('addAllergy')}
                  />
                  <button
                    onClick={addAllergy}
                    className="bg-red-500 text-white p-1 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions Section */}
          <div>
            <h3 className="text-white/80 mb-2 flex items-center">
              <History size={16} className="mr-2" />
              {t('chronicConditions')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {history.chronicConditions.map((condition, index) => (
                <motion.div
                  key={index}
                  className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {condition}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const updatedHistory = {
                          ...history,
                          chronicConditions: history.chronicConditions.filter((_, i) => i !== index)
                        };
                        saveHistory(updatedHistory);
                      }}
                      className="ml-2"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="bg-white/10 text-white rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder={t('addCondition')}
                  />
                  <button
                    onClick={addCondition}
                    className="bg-yellow-500 text-white p-1 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Current Medications Section */}
          <div>
            <h3 className="text-white/80 mb-2 flex items-center">
              <Pill size={16} className="mr-2" />
              {t('currentMedications')}
            </h3>
            <div className="space-y-2">
              {history.currentMedications.map((medication, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-500/20 text-white p-3 rounded-lg flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm text-white/60">
                      {medication.dosage} - {medication.frequency}
                    </div>
                    <div className="text-xs text-white/40">
                      {t('startedOn')}: {medication.startDate}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeMedication(index, 'current')}
                      className="text-white/60 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Past Medications Section */}
          <div>
            <h3 className="text-white/80 mb-2 flex items-center">
              <Calendar size={16} className="mr-2" />
              {t('pastMedications')}
            </h3>
            <div className="space-y-2">
              {history.pastMedications.map((medication, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    medication.reaction === 'good'
                      ? 'bg-green-500/20 text-green-400'
                      : medication.reaction === 'bad'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <div className="font-medium">{medication.name}</div>
                    {medication.sideEffects && (
                      <div className="text-sm opacity-80">{medication.sideEffects}</div>
                    )}
                    <div className="text-xs opacity-60">{medication.date}</div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeMedication(index, 'past')}
                      className="opacity-60 hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 rounded-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('personalizedRecommendations')}
            </h2>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-white/5 p-4 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{rec.medicine}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/60">{t('safetyScore')}:</span>
                      <span className={`font-medium ${
                        rec.safetyScore > 80 ? 'text-green-400' :
                        rec.safetyScore > 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {rec.safetyScore}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/80">{rec.reason}</p>

                  {rec.warnings.length > 0 && (
                    <div className="bg-red-500/10 p-3 rounded">
                      <h4 className="text-red-400 font-medium mb-2">{t('warnings')}</h4>
                      <ul className="space-y-1">
                        {rec.warnings.map((warning, i) => (
                          <li key={i} className="text-sm text-red-300 flex items-center">
                            <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.interactions.length > 0 && (
                    <div className="bg-yellow-500/10 p-3 rounded">
                      <h4 className="text-yellow-400 font-medium mb-2">{t('interactions')}</h4>
                      <ul className="space-y-1">
                        {rec.interactions.map((interaction, i) => (
                          <li key={i} className="text-sm text-yellow-300 flex items-center">
                            <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                            {interaction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.alternatives.length > 0 && (
                    <div>
                      <h4 className="text-white/80 font-medium mb-2">{t('alternatives')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.alternatives.map((alt, i) => (
                          <span
                            key={i}
                            className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}