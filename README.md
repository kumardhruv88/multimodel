<div align="center">

<img src="https://img.shields.io/badge/NEXUS-AI-cf6679?style=for-the-badge&labelColor=1a1a1a&color=cf6679" alt="NEXUS AI" width="200"/>

# NEXUS AI

### A Claude.ai-inspired multimodal AI assistant platform

*Stream conversations • Search the web • Analyze documents • Generate images • Speak & listen*

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description | Status |
|--------|-------------|--------|
| 🤖 **Streaming AI Chat** | Real-time responses via Groq (Llama 3.3 70B) | ✅ Live |
| 🧠 **Conversation Memory** | Full chat history sent per session | ✅ Live |
| 🔍 **Web Search** | Live web results via Tavily API | ✅ Live |
| 📄 **Document RAG** | Upload PDFs/DOCX and query them | ✅ Live |
| 🎨 **Image Generation** | AI images via Pollinations (free) | ✅ Live |
| 🎙️ **Voice Input** | Speech-to-text via Web Speech API | ✅ Live |
| 🔊 **Voice Output** | Text-to-speech via ElevenLabs | ✅ Live |
| 💾 **Persistent Threads** | Chats saved to Supabase DB | ✅ Live |
| 🗂️ **Workspaces** | Organize chats by project | ✅ Live |
| 📎 **Artifacts** | Save AI outputs (code, images, text) | ✅ Live |
| ⚙️ **Settings** | Model selection & preferences | ✅ Live |
| 🚀 **Together AI Image Gen** | FLUX.1-schnell via Together AI | 🔜 Soon |
| 🔐 **Clerk Auth** | User authentication | 🔜 Soon |
| ☁️ **Vercel Deployment** | Production deployment | 🔜 Soon |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js) | 16.1.6 | React framework |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | 19 | UI library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | 5 | Type safety |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white) | v4 | Styling |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=flat-square&logo=framer) | latest | Animations |
| ![Zustand](https://img.shields.io/badge/Zustand-brown?style=flat-square) | latest | State management |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | 0.111.0 | API server |
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | 3.12 | Runtime |
| ![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square) | 0.9.0 | LLM inference |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | 2.3.0 | Database |

### AI & Services
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Groq** (Llama 3.3 70B) | Chat completions + streaming | ✅ Yes |
| **Tavily** | Web search integration | ✅ Yes |
| **ElevenLabs** | Text-to-speech | ✅ 10k chars/mo |
| **Pollinations AI** | Image generation | ✅ Unlimited |
| **Supabase** | PostgreSQL database | ✅ Yes |

---

## 📁 Project Structure

```
nexus-ai/
├── frontend/                    # Next.js 16 application
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── chat/[threadId]/ # Main chat interface
│   │   │   ├── workspace/       # Workspaces page
│   │   │   ├── documents/       # Document management
│   │   │   ├── artifacts/       # Saved AI outputs
│   │   │   ├── settings/        # User preferences
│   │   │   └── layout.tsx       # Dashboard layout
│   │   ├── globals.css          # Design system
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput/       # Message input with tools
│   │   │   └── Message/         # User & AI message bubbles
│   │   └── layout/
│   │       └── Sidebar/         # Collapsible sidebar
│   └── lib/
│       └── tts.ts               # ElevenLabs TTS helper
│
├── backend/                     # FastAPI application
│   ├── api/
│   │   ├── index.py             # App entry + CORS
│   │   ├── chat.py              # Streaming chat endpoint
│   │   ├── documents.py         # Document upload + RAG
│   │   ├── images.py            # Image generation
│   │   ├── threads.py           # Thread management
│   │   ├── workspaces.py        # Workspace CRUD
│   │   └── artifacts.py         # Artifacts CRUD
│   ├── services/
│   │   ├── db_service.py        # Supabase operations
│   │   ├── search_service.py    # Tavily web search
│   │   ├── document_service.py  # PDF/DOCX text extraction
│   │   └── vector_store.py      # In-memory document search
│   └── requirements.txt
│
├── .env.example                 # Environment variables template
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/nexus-ai.git
cd nexus-ai
```

### 2. Set up environment variables

**Frontend** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
```

**Backend** — create `backend/.env`:
```env
GROQ_API_KEY=gsk_your_groq_key
TAVILY_API_KEY=tvly-your_tavily_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 3. Set up Supabase database

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🗂️',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artifact_type TEXT DEFAULT 'text',
  content TEXT,
  image_url TEXT,
  thread_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Install dependencies & run

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn api.index:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔑 API Keys — Where to Get Them

| Service | URL | Free Tier |
|---------|-----|-----------|
| **Groq** | [console.groq.com](https://console.groq.com) | ✅ Free |
| **Tavily** | [tavily.com](https://tavily.com) | ✅ 1000 req/mo |
| **ElevenLabs** | [elevenlabs.io](https://elevenlabs.io) | ✅ 10k chars/mo |
| **Supabase** | [supabase.com](https://supabase.com) | ✅ 500MB DB |
| **Pollinations** | No key needed | ✅ Unlimited |

---

## 🎨 Design System

NEXUS AI uses a custom dark theme built with Tailwind v4:

```css
--color-bg-primary:    #1a1a1a   /* Sidebar background */
--color-bg-secondary:  #212121   /* Main background */
--color-bg-tertiary:   #2a2a2a   /* Input/card background */
--color-accent:        #cf6679   /* Coral brand color */
--color-accent-purple: #7c6cf0   /* Image gen mode */
--color-text-primary:  #ececec   /* Primary text */
--color-text-muted:    #a0a0a0   /* Secondary text */
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by **Dhruv Kumar**

⭐ Star this repo if you find it useful!

</div>
