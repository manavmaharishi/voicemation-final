# Voicemation Pipeline

An AI-powered voice-to-animation system that converts speech or text into educational Manim animations with voiceovers.

## 🚀 Quick Start

The project is now **RUNNING** and ready to use!

### Access the Application
- **Frontend (React)**: http://localhost:5173/
- **Backend (Flask)**: http://localhost:5001

### Current Status
✅ Python virtual environment configured  
✅ All dependencies installed (including Manim)  
✅ Flask backend running on port 5001  
✅ React frontend running on port 5173  
✅ Environment variables configured  

## 🎯 How to Use

1. **Open your browser** and go to http://localhost:5173/
2. **Click or tap the microphone** button in the interface
3. **Speak or type** an educational concept (e.g., "Explain quadratic equations")
4. **Wait** for the AI to generate a Manim animation with voiceover
5. **Watch** the educational video that gets created

## 🎨 Features

- **Voice Input**: Record speech using your microphone
- **Text Input**: Type concepts directly
- **AI Animation Generation**: GPT-4o creates Manim code
- **Voiceover**: AI-generated narration synced to animations
- **In-Depth Mode**: Toggle for longer, comprehensive animations
- **Real-time Preview**: See animations inline in chat
- **Fullscreen Player**: Dedicated viewer for animations

## 🔧 Architecture

### Backend (Flask)
- **Port**: 5001
- **Endpoints**:
  - `GET /` - Serve index page
  - `POST /generate_audio` - Process voice/text input
  - `GET /video/<filename>` - Serve generated videos
  - `GET /download` - Download latest video

### Frontend (React + Vite)
- **Port**: 5173
- **Features**: Voice recording, chat interface, video player
- **Tech Stack**: React 19, Framer Motion, Tailwind CSS

### AI Pipeline
1. **Speech Recognition** → Google Speech API
2. **Content Generation** → GPT-4o via GitHub Models
3. **Animation Rendering** → Manim Community
4. **Voiceover Generation** → Google Text-to-Speech
5. **Video Merging** → FFmpeg

## 📁 Project Structure

```
voicemation_pipeline/
├── app.py                 # Flask backend
├── voicemation.py        # Core AI pipeline
├── voiceover_utils.py    # TTS and video merging
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
├── run_integrated_app.sh # Startup script
├── media/               # Generated videos and assets
├── static/              # Static web assets
├── templates/           # Flask templates
└── Voicemation/
    └── voicemation/     # React frontend
        ├── src/
        ├── public/
        └── package.json
```

## 🛑 Stopping the Services

To stop both services, press `Ctrl+C` in each terminal or run:

```bash
# Kill Flask backend
pkill -f "python.*app.py"

# Kill React frontend  
pkill -f "vite"
```

## 🔑 Environment Variables

Required in `.env`:
- `GITHUB_TOKEN` - Your GitHub Personal Access Token for GPT-4o access

## 🎓 Example Topics to Try

- "Explain photosynthesis"
- "What is calculus?"
- "How do neural networks work?"
- "Explain the solar system"
- "What is quantum physics?"

## 🎛️ Advanced Features

- **In-Depth Mode**: Creates 2+ minute comprehensive animations
- **Custom Manim Code**: AI generates educational visualizations
- **Video Download**: Save animations locally
- **Animation History**: Browse previous generations in chat

---

**Ready to create educational animations with your voice!** 🎤✨