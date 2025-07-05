import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Eye, EyeOff, Brain, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeProvider';

const genAI = new GoogleGenerativeAI('AIzaSyAbT84OsZXcsNfc8Go3iaXHaep-jjgL3vc');

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: 'symptoms' | 'medicine' | 'remedies';
  emotion?: string;
}

const getCategoryPrompt = (category: string, text: string, emotion: string = '', isChild: boolean = false) => {
  const emotionalContext = emotion ? `Consider patient's emotional state: ${emotion}` : '';
  const childContext = isChild ? 'Use simple, child-friendly language and gentle explanations.' : '';
  
  switch (category) {
    case 'symptoms':
      return `Analyze these symptoms and provide a very brief, clear response:
        "${text}"
        ${emotionalContext}
        ${childContext}
        
        Format response EXACTLY like this:
        CONDITION: [One line what it might be]
        CAUSE: [One line why it happens]
        SEVERITY: [Low/Medium/High]`;
    
    case 'medicine':
      return `Recommend appropriate medication briefly:
        "${text}"
        ${emotionalContext}
        ${childContext}
        
        Format response EXACTLY like this:
        MEDICINE: [Name]
        DOSAGE: [Amount]
        TIMING: [When to take]
        ⚠️ CAUTION: [Key warning]`;
    
    case 'remedies':
      return `Suggest 2-3 quick home remedies:
        "${text}"
        ${emotionalContext}
        ${childContext}
        
        Format response EXACTLY like this:
        REMEDIES:
        1. [Simple remedy]
        2. [Simple remedy]
        3. [Simple remedy if applicable]
        
        NOTE: [When to see doctor]`;
    
    default:
      return '';
  }
};

const analyzeEmotion = async (text: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Analyze the emotional tone of this text and return ONLY ONE of these emotions: neutral, anxious, angry, sad, worried, stressed, calm. Text: "${text}"`;
  const result = await model.generateContent(prompt);
  return result.response.text().toLowerCase();
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<'symptoms' | 'medicine' | 'remedies'>('symptoms');
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isPrivateMode) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages, isPrivateMode]);

  useEffect(() => {
    if (!isPrivateMode) {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    const emotion = await analyzeEmotion(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      category,
      emotion
    }]);
    
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = getCategoryPrompt(category, userMessage, emotion, theme === 'child');
      const result = await model.generateContent([prompt]);
      const response = await result.response.text();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        category,
        emotion: 'neutral'
      }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: theme === 'child' 
          ? 'I\'m sorry, I couldn\'t understand that. Can you try asking in a different way?' 
          : 'Sorry, I could not process your request. Please try again.',
        category
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionalStyle = (emotion: string = 'neutral') => {
    if (theme === 'child') {
      switch (emotion) {
        case 'anxious':
        case 'worried':
        case 'stressed':
          return 'bg-blue-100 text-blue-800';
        case 'angry':
          return 'bg-red-100 text-red-800';
        case 'sad':
          return 'bg-purple-100 text-purple-800';
        case 'calm':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-white text-blue-900';
      }
    } else {
      switch (emotion) {
        case 'anxious':
        case 'worried':
        case 'stressed':
          return 'bg-blue-500/20 text-blue-200';
        case 'angry':
          return 'bg-red-500/20 text-red-200';
        case 'sad':
          return 'bg-purple-500/20 text-purple-200';
        case 'calm':
          return 'bg-green-500/20 text-green-200';
        default:
          return 'bg-white/10 text-white';
      }
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'medicine':
        return <AlertTriangle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-300px)] ${
      theme === 'child'
        ? 'bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200'
        : 'bg-black/50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'child' ? 'border-blue-100 bg-blue-50' : 'border-white/10 bg-white/5'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            {['symptoms', 'medicine', 'remedies'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat as 'symptoms' | 'medicine' | 'remedies')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                  theme === 'child'
                    ? category === cat
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : category === cat
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat === 'medicine' && <AlertTriangle size={16} className={
                  theme === 'child' ? 'text-yellow-300' : 'text-yellow-500'
                } />}
                <span>{t(cat)}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsPrivateMode(!isPrivateMode);
              if (!isPrivateMode) {
                setMessages([]);
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              theme === 'child'
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isPrivateMode ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{isPrivateMode ? 'Private Mode' : 'Normal Mode'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              className="flex items-center justify-center h-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-4">
                <AlertCircle size={40} className={`mx-auto ${
                  theme === 'child' ? 'text-blue-500' : 'text-white animate-pulse'
                }`} />
                <p className={
                  theme === 'child' ? 'text-blue-800' : 'text-white/80'
                }>
                  {category === 'symptoms' 
                    ? 'Tell me how you\'re feeling...'
                    : category === 'medicine'
                    ? 'What do you need medicine for?'
                    : 'What would you like help with?'}
                </p>
                {isPrivateMode && (
                  <p className="text-sm text-yellow-600">
                    Private Mode: Your conversation will not be saved
                  </p>
                )}
              </div>
            </motion.div>
          )}
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'child' ? 'bg-blue-100' : 'bg-white/10'
                }`}>
                  <Bot size={24} className={
                    theme === 'child' ? 'text-blue-500' : 'text-white'
                  } />
                </div>
              )}
              <div className={`max-w-[80%] p-4 rounded-xl ${
                message.role === 'user'
                  ? getEmotionalStyle(message.emotion)
                  : theme === 'child'
                  ? 'bg-blue-50 text-blue-900'
                  : 'bg-white/10 text-white'
              }`}>
                {message.role === 'assistant' && message.category === 'medicine' && (
                  <div className={`flex items-center space-x-2 mb-2 ${
                    theme === 'child' ? 'text-yellow-600' : 'text-yellow-400'
                  }`}>
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">Medical Advice</span>
                  </div>
                )}
                {message.content}
                {message.emotion && message.role === 'user' && (
                  <div className={`mt-2 text-xs opacity-60 flex items-center ${
                    theme === 'child' ? 'text-blue-800' : ''
                  }`}>
                    <Brain size={12} className="mr-1" />
                    Feeling: {message.emotion}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'child' ? 'bg-blue-500' : 'bg-white'
                }`}>
                  <User size={24} className={
                    theme === 'child' ? 'text-white' : 'text-black'
                  } />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-pulse ${
              theme === 'child' ? 'bg-blue-100' : 'bg-white/10'
            }`}>
              <Bot size={24} className={
                theme === 'child' ? 'text-blue-500' : 'text-white'
              } />
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'child' ? 'bg-blue-50 text-blue-800' : 'bg-white/10 text-white'
            }`}>
              Thinking...
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit}
        className={`p-4 border-t ${
          theme === 'child'
            ? 'border-blue-100 bg-blue-50'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              category === 'symptoms'
                ? 'How are you feeling?'
                : category === 'medicine'
                ? 'What do you need medicine for?'
                : 'What would you like help with?'
            }
            className={`flex-1 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 ${
              theme === 'child'
                ? 'bg-white text-blue-900 placeholder-blue-400 border border-blue-200 focus:ring-blue-300'
                : 'bg-white/10 text-white placeholder-white/60 border border-white/10 focus:ring-white/50'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 ${
              theme === 'child'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
}