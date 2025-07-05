import React, { useState } from 'react';
import { Upload, FileText, X, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTheme } from './ThemeProvider';

const genAI = new GoogleGenerativeAI('AIzaSyDnjBMvtXh3FzJnLdb7VO83ZHJQNe3HzQ0');

interface AnalysisResult {
  type: string;
  summary: string;
  status: 'normal' | 'attention' | 'critical';
  findings: {
    parameter: string;
    value: string;
    normalRange: string;
    status: 'high' | 'low' | 'normal';
    significance: string;
    urgency: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
  diagnosis: {
    condition: string;
    confidence: number;
    description: string;
    causes: string[];
  };
  recommendations: {
    immediate: string[];
    lifestyle: string[];
    medications: {
      name: string;
      dosage: string;
      duration: string;
      precautions: string[];
    }[];
    followUp: string;
  };
  preventiveMeasures: string[];
}

export default function MedicalReportAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();

  const analyzeReport = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Analyze this medical report text and provide detailed insights:
        ${text}
        
        Format response as JSON:
        {
          "type": "Type of report/scan",
          "summary": "Brief overview",
          "status": "normal/attention/critical",
          "findings": [{
            "parameter": "Test name/observation",
            "value": "Measured value",
            "normalRange": "Expected range",
            "status": "high/low/normal",
            "significance": "What this means",
            "urgency": "low/medium/high",
            "recommendation": "Action needed"
          }],
          "diagnosis": {
            "condition": "Primary diagnosis",
            "confidence": 0-100,
            "description": "Detailed explanation",
            "causes": ["Possible cause 1", "Possible cause 2"]
          },
          "recommendations": {
            "immediate": ["Urgent actions"],
            "lifestyle": ["Long-term changes"],
            "medications": [{
              "name": "Medicine name",
              "dosage": "How much to take",
              "duration": "How long to take",
              "precautions": ["Precaution 1", "Precaution 2"]
            }],
            "followUp": "When to see doctor next"
          },
          "preventiveMeasures": ["Preventive measure 1", "Preventive measure 2"]
        }
        
        Consider:
        1. Age-appropriate language if child mode
        2. Clear explanations of medical terms
        3. Urgency of findings
        4. Potential interactions with common conditions
        5. Lifestyle impact`;

      const result = await model.generateContent(prompt);
      const analysis = JSON.parse(await result.response.text());

      if (!isPrivateMode) {
        localStorage.setItem('lastAnalysis', JSON.stringify(analysis));
      }

      setResult(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeReport(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${
          theme === 'child' ? 'text-blue-900' : 'text-white'
        }`}>
          Medical Report Analysis
        </h2>
        <button
          onClick={() => {
            setIsPrivateMode(!isPrivateMode);
            if (!isPrivateMode) {
              setResult(null);
              localStorage.removeItem('lastAnalysis');
            }
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            theme === 'child'
              ? 'bg-blue-400/20 text-blue-900 hover:bg-blue-400/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isPrivateMode ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>{isPrivateMode ? 'Private Mode' : 'Normal Mode'}</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="file"
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          className="hidden"
          id="report-upload"
          disabled={isAnalyzing}
        />
        <label
          htmlFor="report-upload"
          className={`flex items-center justify-center space-x-2 p-6 rounded-lg cursor-pointer border-2 border-dashed transition-all ${
            theme === 'child'
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              : 'bg-white/10 border-white/20 hover:bg-white/20'
          }`}
        >
          {isAnalyzing ? (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FileText size={32} className={`mb-2 ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`} />
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    theme === 'child' ? 'bg-blue-500' : 'bg-blue-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className={`mt-2 text-sm ${
                theme === 'child' ? 'text-blue-900/60' : 'text-white/60'
              }`}>
                Analyzing ({Math.round(progress)}%)
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={32} className={`mb-2 ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`} />
              <p className={theme === 'child' ? 'text-blue-900' : 'text-white/80'}>
                Upload Medical Report
              </p>
              <p className={`text-sm mt-1 ${
                theme === 'child' ? 'text-blue-900/60' : 'text-white/60'
              }`}>
                Support: X-rays, Lab Reports, Prescriptions
              </p>
              {isPrivateMode && (
                <p className="text-sm text-yellow-600 mt-2">
                  Private Mode: Analysis will not be saved
                </p>
              )}
            </div>
          )}
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg flex items-center space-x-2 ${
              theme === 'child'
                ? 'bg-red-100 text-red-800'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            <AlertTriangle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-lg p-6 space-y-6 ${
              theme === 'child'
                ? 'bg-white shadow-lg'
                : 'bg-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-xl font-semibold flex items-center space-x-2 ${
                  theme === 'child' ? 'text-blue-900' : 'text-white'
                }`}>
                  <span>{result.type}</span>
                  {result.status === 'normal' && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                  {result.status === 'attention' && (
                    <AlertTriangle size={20} className="text-yellow-500" />
                  )}
                  {result.status === 'critical' && (
                    <AlertTriangle size={20} className="text-red-500" />
                  )}
                </h3>
                <p className={theme === 'child' ? 'text-blue-800/80' : 'text-white/60'}>
                  {result.summary}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                className={theme === 'child' ? 'text-blue-900/60' : 'text-white/60'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Findings */}
            <div className="space-y-4">
              <h4 className={`font-medium ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`}>
                Findings
              </h4>
              {result.findings.map((finding, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg space-y-2 ${
                    theme === 'child'
                      ? 'bg-blue-50 border border-blue-100'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className={`font-medium ${
                      theme === 'child' ? 'text-blue-900' : 'text-white'
                    }`}>
                      {finding.parameter}
                    </h5>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      finding.status === 'high'
                        ? theme === 'child'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-red-500/20 text-red-400'
                        : finding.status === 'low'
                        ? theme === 'child'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-yellow-500/20 text-yellow-400'
                        : theme === 'child'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {finding.status === 'high' && <ArrowUp size={14} className="inline mr-1" />}
                      {finding.status === 'low' && <ArrowDown size={14} className="inline mr-1" />}
                      {finding.status === 'normal' && <CheckCircle size={14} className="inline mr-1" />}
                      {finding.value} ({finding.normalRange})
                    </span>
                  </div>
                  <p className={theme === 'child' ? 'text-blue-800/80' : 'text-white/80'}>
                    {finding.significance}
                  </p>
                  <div className={`text-sm ${
                    finding.urgency === 'high'
                      ? 'text-red-500'
                      : finding.urgency === 'medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}>
                    {finding.recommendation}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Diagnosis */}
            <div className={`p-4 rounded-lg ${
              theme === 'child'
                ? 'bg-blue-50 border border-blue-100'
                : 'bg-white/5'
            }`}>
              <h4 className={`font-medium mb-2 ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`}>
                Diagnosis
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    theme === 'child' ? 'text-blue-900' : 'text-white'
                  }`}>
                    {result.diagnosis.condition}
                  </span>
                  <span className={`text-sm ${
                    result.diagnosis.confidence > 80
                      ? 'text-green-500'
                      : result.diagnosis.confidence > 60
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}>
                    {result.diagnosis.confidence}% confidence
                  </span>
                </div>
                <p className={theme === 'child' ? 'text-blue-800/80' : 'text-white/80'}>
                  {result.diagnosis.description}
                </p>
                <div className="space-y-1">
                  <span className={`text-sm font-medium ${
                    theme === 'child' ? 'text-blue-900' : 'text-white'
                  }`}>
                    Possible causes:
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {result.diagnosis.causes.map((cause, i) => (
                      <li key={i} className={
                        theme === 'child' ? 'text-blue-800/80' : 'text-white/80'
                      }>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className={`font-medium ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`}>
                Recommendations
              </h4>
              
              {/* Immediate Actions */}
              {result.recommendations.immediate.length > 0 && (
                <div className={`p-4 rounded-lg ${
                  theme === 'child'
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-red-500/10'
                }`}>
                  <h5 className={`text-sm font-medium mb-2 ${
                    theme === 'child' ? 'text-red-800' : 'text-red-400'
                  }`}>
                    Immediate Actions
                  </h5>
                  <ul className="space-y-2">
                    {result.recommendations.immediate.map((action, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <AlertTriangle size={16} className={
                          theme === 'child' ? 'text-red-800' : 'text-red-400'
                        } />
                        <span className={
                          theme === 'child' ? 'text-red-800' : 'text-red-400'
                        }>
                          {action}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medications */}
              {result.recommendations.medications.length > 0 && (
                <div className={`p-4 rounded-lg ${
                  theme === 'child'
                    ? 'bg-blue-50 border border-blue-100'
                    : 'bg-white/5'
                }`}>
                  <h5 className={`text-sm font-medium mb-2 ${
                    theme === 'child' ? 'text-blue-900' : 'text-white'
                  }`}>
                    Medications
                  </h5>
                  <div className="space-y-3">
                    {result.recommendations.medications.map((med, i) => (
                      <div key={i} className="space-y-1">
                        <div className={`font-medium ${
                          theme === 'child' ? 'text-blue-900' : 'text-white'
                        }`}>
                          {med.name}
                        </div>
                        <div className={
                          theme === 'child' ? 'text-blue-800/80' : 'text-white/80'
                        }>
                          {med.dosage} - {med.duration}
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {med.precautions.map((precaution, j) => (
                            <li key={j} className={
                              theme === 'child' ? 'text-blue-800/60' : 'text-white/60'
                            }>
                              {precaution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Changes */}
              <div className={`p-4 rounded-lg ${
                theme === 'child'
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-green-500/10'
              }`}>
                <h5 className={`text-sm font-medium mb-2 ${
                  theme === 'child' ? 'text-green-800' : 'text-green-400'
                }`}>
                  Lifestyle Changes
                </h5>
                <ul className="space-y-2">
                  {result.recommendations.lifestyle.map((change, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle size={16} className={
                        theme === 'child' ? 'text-green-800' : 'text-green-400'
                      } />
                      <span className={
                        theme === 'child' ? 'text-green-800' : 'text-green-400'
                      }>
                        {change}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up */}
              <div className={`mt-4 pt-4 border-t ${
                theme === 'child' ? 'border-blue-100' : 'border-white/10'
              }`}>
                <p className={theme === 'child' ? 'text-blue-800/60' : 'text-white/60'}>
                  Follow-up: {result.recommendations.followUp}
                </p>
              </div>
            </div>

            {/* Preventive Measures */}
            <div className={`p-4 rounded-lg ${
              theme === 'child'
                ? 'bg-blue-50 border border-blue-100'
                : 'bg-white/5'
            }`}>
              <h4 className={`font-medium mb-2 ${
                theme === 'child' ? 'text-blue-900' : 'text-white'
              }`}>
                Preventive Measures
              </h4>
              <ul className="space-y-2">
                {result.preventiveMeasures.map((measure, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle size={16} className={
                      theme === 'child' ? 'text-blue-900' : 'text-blue-400'
                    } />
                    <span className={
                      theme === 'child' ? 'text-blue-800' : 'text-white/80'
                    }>
                      {measure}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}