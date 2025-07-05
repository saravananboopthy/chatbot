import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MapPin, Phone, User, Building2, Clock, Globe, AlertCircle, Star, Stethoscope, Ambulance } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Player } from '@lottiefiles/react-lottie-player';

const genAI = new GoogleGenerativeAI('AIzaSyAbT84OsZXcsNfc8Go3iaXHaep-jjgL3vc');

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  availability: string;
  languages: string[];
  phone: string;
}

interface Hospital {
  name: string;
  address: string;
  phone: string;
  type: string;
  specialties: string[];
  emergency_services: boolean;
  rating: number;
  working_hours: string;
  website: string;
  doctors: Doctor[];
  location: {
    lat: number;
    lng: number;
  };
  distance?: string;
  facilities?: string[];
}

export default function Hospitals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const searchHospitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a location');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHospitals([]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Generate a list of 15 hospitals and medical facilities in and around ${searchQuery}. Return the response in this exact JSON format without any additional text or markdown:
{
  "hospitals": [
    {
      "name": "Hospital name",
      "address": "Full address",
      "phone": "Phone number",
      "type": "Hospital type",
      "specialties": ["specialty1", "specialty2", "specialty3"],
      "emergency_services": true/false,
      "rating": 4.5,
      "working_hours": "Working hours",
      "website": "Website URL",
      "distance": "Distance from center",
      "facilities": ["facility1", "facility2", "facility3"],
      "doctors": [
        {
          "name": "Doctor name",
          "specialty": "Specialty",
          "experience": "Years of experience",
          "availability": "Availability hours",
          "languages": ["language1", "language2"],
          "phone": "Phone number"
        }
      ],
      "location": {
        "lat": 12.3456,
        "lng": 78.9012
      }
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      // Remove any potential markdown code block indicators
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      
      const data = JSON.parse(cleanJson);
      
      if (!data.hospitals || !Array.isArray(data.hospitals)) {
        throw new Error('Invalid response format');
      }
      
      setHospitals(data.hospitals);
    } catch (error) {
      console.error('Search Error:', error);
      setError('Failed to fetch hospitals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'child' 
        ? 'bg-blue-50' 
        : 'bg-gray-900'
    }`}>
      {theme === 'child' && (
        <>
          <div className="fixed top-0 right-0 w-64 h-64 opacity-20 pointer-events-none">
            <Player
              autoplay
              loop
              src="https://assets5.lottiefiles.com/packages/lf20_tutvdkg0.json"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="fixed bottom-0 left-0 w-64 h-64 opacity-20 pointer-events-none">
            <Player
              autoplay
              loop
              src="https://assets5.lottiefiles.com/packages/lf20_yd8fbnml.json"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 text-center ${
            theme === 'child' ? 'text-blue-900' : 'text-white'
          }`}
        >
          <h1 className="text-3xl font-bold mb-4">Find Hospitals Near You</h1>
          <p className="text-lg opacity-80">
            Search for hospitals, clinics, and medical facilities in your area
          </p>
        </motion.div>

        <form onSubmit={searchHospitals} className="mb-8">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Enter city, town, or village name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-6 py-4 rounded-xl text-lg ${
                theme === 'child'
                  ? 'bg-white border-2 border-blue-200 text-blue-900 placeholder-blue-400'
                  : 'bg-white/10 text-white placeholder-white/60'
              }`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`px-8 py-4 rounded-xl text-lg font-medium ${
                theme === 'child'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`max-w-2xl mx-auto p-4 rounded-lg flex items-center space-x-2 mb-8 ${
                theme === 'child'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {hospitals.length > 0 && (
          <div className="mb-8 text-center">
            <p className={`text-lg ${theme === 'child' ? 'text-blue-900' : 'text-white/80'}`}>
              Found {hospitals.length} medical facilities near {searchQuery}
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {hospitals.map((hospital, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden ${
                  theme === 'child'
                    ? 'bg-white shadow-lg border-2 border-blue-100'
                    : 'bg-white/10 backdrop-blur-lg'
                }`}
              >
                <div className={`p-6 ${
                  theme === 'child' ? 'text-blue-900' : 'text-white'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{hospital.name}</h2>
                    <div className="flex items-center">
                      <Star className={`w-5 h-5 ${
                        theme === 'child' ? 'text-yellow-500' : 'text-yellow-400'
                      }`} />
                      <span className="ml-1">{hospital.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                      <div>
                        <span>{hospital.address}</span>
                        {hospital.distance && (
                          <span className={`block text-sm ${
                            theme === 'child' ? 'text-blue-600' : 'text-blue-400'
                          }`}>
                            {hospital.distance} from center
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <a href={`tel:${hospital.phone}`} className="hover:underline">
                        {hospital.phone}
                      </a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>{hospital.type}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{hospital.working_hours}</span>
                    </div>

                    {hospital.emergency_services && (
                      <div className={`flex items-center space-x-2 ${
                        theme === 'child' ? 'text-red-600' : 'text-red-400'
                      }`}>
                        <Ambulance className="w-5 h-5" />
                        <span>24/7 Emergency Services</span>
                      </div>
                    )}

                    {hospital.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5" />
                        <a 
                          href={hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {hospital.facilities && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Key Facilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {hospital.facilities.map((facility, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-sm ${
                              theme === 'child'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((specialty, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-full text-sm flex items-center ${
                            theme === 'child'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <Stethoscope className="w-3 h-3 mr-1" />
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Available Doctors</h3>
                    <div className="space-y-4">
                      {hospital.doctors.map((doctor, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg ${
                            theme === 'child'
                              ? 'bg-blue-50'
                              : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-5 h-5" />
                            <span className="font-medium">{doctor.name}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>{doctor.specialty}</p>
                            <p>{doctor.experience} experience</p>
                            <p>Available: {doctor.availability}</p>
                            <p>Languages: {doctor.languages.join(', ')}</p>
                            <a
                              href={`tel:${doctor.phone}`}
                              className={`inline-flex items-center space-x-1 mt-2 ${
                                theme === 'child'
                                  ? 'text-blue-600 hover:text-blue-700'
                                  : 'text-blue-400 hover:text-blue-300'
                              }`}
                            >
                              <Phone className="w-4 h-4" />
                              <span>{doctor.phone}</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}