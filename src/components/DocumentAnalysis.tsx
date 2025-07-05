import React, { useState } from 'react';
import { Upload, FileText, X, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorker } from 'tesseract.js';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAbT84OsZXcsNfc8Go3iaXHaep-jjgL3vc');

interface reqPayload {
  name: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AnalysisResult {
  type: 'lab_report' | 'prescription';
  summary: string;
  status: 'normal' | 'attention' | 'critical';
  abnormalValues?: {
    parameter: string;
    value: string;
    normalRange: string;
    status: 'high' | 'low' | 'normal';
    percentage: number;
    recommendation: string;
    urgency: 'low' | 'medium' | 'high';
  }[];
  recommendations?: {
    immediate: string[];
    lifestyle: string[];
    followUp: string;
  };
}

export default function DocumentAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const { t, i18n } = useTranslation();

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    try {
      // Create worker with language support
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Detect document type and analyze
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const analysisPrompt = `Analyze this medical document text:
        ${text}
        
        Provide a detailed analysis in JSON format:
        {
          "type": "lab_report OR prescription",
          "summary": "Brief overview",
          "status": "normal/attention/critical",
          "abnormalValues": [{
            "parameter": "Test name",
            "value": "Actual value",
            "normalRange": "Expected range",
            "status": "high/low/normal",
            "percentage": "Percentage from normal",
            "recommendation": "Action needed",
            "urgency": "low/medium/high"
          }],
          "recommendations": {
            "immediate": ["Urgent actions needed"],
            "lifestyle": ["Long-term changes"],
            "followUp": "When to see doctor next"
          }
        }`;
      
      const result = await model.generateContent([analysisPrompt]);
      const analysis = JSON.parse(await result.response.text());
      
      if (!isPrivateMode) {
        localStorage.setItem('lastAnalysis', JSON.stringify(analysis));
      }
      
      setResult(analysis);
    } catch (error) {
      console.error('Document analysis failed:', error);
      setError('Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeDocument(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-400';
      case 'low': return 'text-yellow-400';
      case 'normal': return 'text-green-400';
      default: return 'text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <ArrowUp className="text-red-400" size={16} />;
      case 'low': return <ArrowDown className="text-yellow-400" size={16} />;
      case 'normal': return <CheckCircle className="text-green-400" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Document Analysis</h2>
        <button
          onClick={() => {
            setIsPrivateMode(!isPrivateMode);
            if (!isPrivateMode) {
              setResult(null);
              localStorage.removeItem('lastAnalysis');
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
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
          id="document-upload"
          disabled={isAnalyzing}
        />
        <label
          htmlFor="document-upload"
          className="flex items-center justify-center space-x-2 bg-white/10 text-white p-6 rounded-lg cursor-pointer hover:bg-white/20 transition-all duration-300 border border-dashed border-white/20"
        >
          {isAnalyzing ? (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FileText size={32} className="mb-2" />
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-white/60">
                {t('analyzing')} ({Math.round(progress)}%)
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={32} className="mb-2" />
              <p className="text-white/80">{t('uploadDocument')}</p>
              <p className="text-sm text-white/60 mt-1">
                {t('supportedFormats')}
              </p>
              {isPrivateMode && (
                <p className="text-sm text-yellow-400 mt-2">
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
            className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center space-x-2"
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
            className="bg-white/10 rounded-lg p-6 space-y-4 border border-white/10"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <span>{result.type === 'lab_report' ? t('labReport') : t('prescription')}</span>
                  {result.status === 'normal' && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                  {result.status === 'attention' && (
                    <AlertTriangle size={20} className="text-yellow-400" />
                  )}
                  {result.status === 'critical' && (
                    <AlertTriangle size={20} className="text-red-400" />
                  )}
                </h3>
                <p className="text-white/80 mt-1">{result.summary}</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {result.type === 'lab_report' && result.abnormalValues && (
              <div className="space-y-4">
                <h4 className="font-medium text-white border-b border-white/10 pb-2">
                  {t('abnormalValues')}
                </h4>
                <div className="grid gap-4">
                  {result.abnormalValues.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 p-4 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className="font-medium text-white">
                              {item.parameter}
                            </span>
                          </div>
                          <div className="flex items-baseline space-x-2">
                            <span className={`text-lg ${getStatusColor(item.status)}`}>
                              {item.value}
                            </span>
                            <span className="text-sm text-white/60">
                              ({item.percentage > 0 ? '+' : ''}{item.percentage}% from normal)
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-white/60">
                          {t('normalRange')}: {item.normalRange}
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <p className={`${
                          item.urgency === 'high' 
                            ? 'text-red-400' 
                            : item.urgency === 'medium'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {item.recommendation}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations && (
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-white border-b border-white/10 pb-2">
                  {t('recommendations')}
                </h4>
                
                {result.recommendations.immediate.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-red-400">
                      {t('immediateActions')}
                    </h5>
                    <ul className="space-y-1">
                      {result.recommendations.immediate.map((action, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                          <span className="text-white/80">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.lifestyle.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-blue-400">
                      {t('lifestyleChanges')}
                    </h5>
                    <ul className="space-y-1">
                      {result.recommendations.lifestyle.map((change, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                          <span className="text-white/80">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60">
                    {t('followUp')}: {result.recommendations.followUp}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}