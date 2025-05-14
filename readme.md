# Feedback System — Project Overview

## What it does

An AI-powered assignment grading assistant for teachers. Upload a student submission (PDF/image/text) or pull it straight from Google Classroom, pick a subject with a grading rubric (or define a custom one), and get back an LLM-generated score, per-criterion feedback with highlighted text spans, suggestions, and an "AI-generated content" risk score — with batch processing and CSV export for whole classes.

## Architecture — 3 independent services, no shared DB

```
Browser (React client, :3000)
 ├─ extracts text client-side: pdfjs-dist/pdf-lib (PDF), tesseract.js (OCR)
 ├─ Google Classroom/Drive via gapi-script (OAuth straight from browser)
 ├─→ POST /generate-feedback → Node/Express server (:5000) → OpenAI-compatible LLM (GitHub Models, gpt-4o) → JSON feedback
 └─→ POST /detect-ai → Flask microservice (:5001) → AI-vs-human probability
```

No database anywhere — everything lives in React state / sessionStorage and is lost on refresh.

## Tech stack

- **Client:** React 19, React Router 7, Tailwind, three.js/react-three-fiber + GSAP (animated landing page), pdfjs-dist/pdf-lib, tesseract.js, axios, gapi-script
- **Server:** Node/Express, `openai` SDK pointed at `models.github.ai/inference` (not OpenAI directly), layered as config/controllers/services/routes/middleware
- **Flask:** Flask + Flask-Cors; requirements.txt lists torch/transformers but `app.py` doesn't actually use them yet

## Key features

- **Grading pipeline**: `SubjectManager.js` builds an LLM system prompt from rubric criteria → `feedbackController.js` calls the LLM → `feedbackService.js` parses/validates the JSON into a `Feedback` model → `HighlightedTextCanvas` renders flagged spans over the original text.
- **Custom subjects/rubrics**: a modal in `SubjectSelector.js` lets a user name a subject and list arbitrary criteria, wired through `SubjectManager.addSubject`.
- **Classroom multi-file fetch**: `ClassroomIntegration.js` supports checkbox multi-select across submissions, batch-downloads them, and feeds `FeedbackSystem.js`'s batch grid (progress bar, per-submission cards, CSV export, class-wide average score/AI-risk/histogram).
- **AI detector**: `ai_detector.ipynb` fine-tunes a DistilBERT model on the HC3 human-vs-ChatGPT dataset. The trained model/tokenizer is used by `/detect-ai` in `app.py` to classify submitted text as AI-generated vs. human-written.

## Folder structure

```
feedback-system/
├── client/                       React 19 CRA frontend
│   ├── public/                   static assets, favicon, manifest
│   ├── build/                    production build output (checked in)
│   └── src/
│       ├── App.js                Router: "/" LandingPage, "/feedback" FeedbackSystem, "/get-feedback" GetFeedback
│       ├── components/           feature components
│       │   ├── 3d/                react-three-fiber background
│       │   ├── animations/        GSAP hero/feature/stat animations
│       │   ├── ui/                small reusable UI (tooltip)
│       │   ├── HighlightedTextCanvas/  canvas text-highlight subcomponents
│       │   └── sections/, hooks/  currently empty
│       ├── services/              apiService, classroomService, documentService
│       └── utils/                 customGsap helper
├── server/                       Node/Express API
│   ├── index.js                  app bootstrap, env validation, middleware wiring
│   ├── config/index.js           central env-driven config (server + OpenAI/LLM)
│   ├── controllers/feedbackController.js   LLM call orchestration
│   ├── services/feedbackService.js         JSON extraction/validation/formatting
│   ├── models/Feedback.js        plain feedback data class
│   ├── routes/feedbackRoutes.js  /generate-feedback, /health, /version
│   ├── middleware/                requestLogger, errorHandler/notFoundHandler
│   └── utils/logger.js           structured logger
├── flask_server/                 Python AI-detection microservice
│   ├── app.py                    Flask app, /health and /detect-ai (serves DistilBERT model)
│   ├── ai_detector.ipynb         DistilBERT fine-tuning notebook on HC3 dataset
│   ├── ai_detector_model/        trained DistilBERT model config
│   ├── ai_detector_tokenizer/    full distilbert-base-uncased tokenizer artifacts
│   ├── requirements.txt          Flask, Flask-Cors, torch, transformers, numpy
│   └── venv/                     local Python virtualenv (checked into working tree)
└── .gitattributes, .gitignore
```

Each of the three services (`client`, `server`, `flask_server`) has its own `.env` file and is meant to be run independently (React dev server on 3000, Express on 5000, Flask on 5001), with no shared build tooling, monorepo manager, or containerization config.

## Key routes / endpoints

**Server (`server/routes/feedbackRoutes.js`)**
- `POST /generate-feedback` — main grading endpoint
- `GET /health` — health check (polled by client on load)
- `GET /version`

**Flask (`flask_server/app.py`)**
- `GET /health`
- `POST /detect-ai` — accepts `{text}`, returns `{ai_probability, human_probability, is_ai_generated}` using the trained DistilBERT model
