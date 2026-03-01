# NEXUS AI

![NEXUS AI Banner](https://via.placeholder.com/1200x300?text=NEXUS+AI)

NEXUS AI is an advanced, full-stack application leveraging modern frontend
technologies and a powerful Python backend to deliver intelligent, AI-driven
experiences.

## 🚀 Tech Stack

### Frontend

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![Zustand](https://img.shields.io/badge/Zustand-black?style=for-the-badge&logo=react&logoColor=white)

### Backend

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

### AI & Integrations

![Vapi AI](https://img.shields.io/badge/Vapi_AI-Voice-black?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-Fast_AI-f55036?style=for-the-badge)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)

## 📁 Project Structure

The repository is structured as a monorepo containing both the frontend and
backend.

```
nexus-ai/
├── frontend/            # Next.js frontend application
│   ├── app/             # App router pages
│   ├── components/      # Reusable React components
│   ├── lib/             # Utility functions
│   └── public/          # Static assets
├── backend/             # FastAPI backend application
│   ├── api/             # API routes
│   └── services/        # Business logic & integrations
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.local.example` if available, or fill
   in `.env.local` based on Clerk/Vapi keys).
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:6571` (as per
   `package.json`).

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables in `.env` (Supabase, Groq keys).
5. Run the FastAPI development server:
   ```bash
   uvicorn api.index:app --reload
   ```

## 🚀 Deployment

This project is configured for deployment on Vercel. Both the Next.js frontend
and FastAPI backend (via `vercel.json` in the backend folder or serverless
functions setup) can be deployed seamlessly.
