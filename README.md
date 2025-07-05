# 🩺 CareMate – Smart AI Healthcare Chatbot

CareMate is an advanced healthcare chatbot that helps users predict diseases based on symptoms, analyze medical documents, remind them to take medicines, locate nearby hospitals, and much more. It supports voice input, multi-language interaction, and smart health evaluation – all powered by AI.

---

## 🚀 Features

### ✅ Symptom Checker
- Users can input symptoms via text or voice.
- AI predicts the possible diseases.
- Provides health improvement suggestions.
- No direct medicine suggestions (for safety).

### 🗣️ Voice Input (Smart Mic)
- Voice input enabled with ON/OFF toggle.
- Triggers an alarm when the microphone is ON.
- Matches voice input and response language.

### 🌐 Multi-Language Support
- Supports English and Indian regional languages.
- Output language matches the user’s input.
- Works with both text and audio.

### 🧾 Medical Document Analysis
- Upload PDFs or images (even handwritten).
- Extracts values from reports (like sugar, BP, etc.).
- Compares with standard medical ranges.
- Determines if the report is “Perfect” or needs attention.
- Suggests ways to improve health.

### 🏥 Nearby Hospital Locator
- Locates nearby hospitals using your current location.
- Provides directions and contact info.

### ⏰ Medicine Reminder System
- Users set medicine name, time, and frequency.
- Triggers alarm + notification to remind on time.

### 📊 Health Status Evaluation
- Shows health status based on analyzed reports.
- Gives specific corrections or recommendations.

---

## 🧠 Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Modern UI with background video, futuristic theme)
- **Backend**: Python (Flask or FastAPI)
- **AI/ML**: ChatGPT, Symptom Matching Logic
- **OCR**: EasyOCR / Tesseract.js
- **Voice Input**: Web Speech API / Python Speech Recognition
- **Translation**: Google Translate API or Indic NLP
- **Map Services**: Google Maps API

---

## 💻 How to Run

```bash
# Clone the repo
git clone https://github.com/your-username/caremate-healthcare-chatbot.git
cd caremate-healthcare-chatbot

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # for Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
