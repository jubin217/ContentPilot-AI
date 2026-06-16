# ContentPilot AI

ContentPilot AI is a premium writing and career development assistant built as a Google Chrome Extension. It leverages state-of-the-art LLMs (powered by Hugging Face Inference API) to help professionals create high-impact LinkedIn content, analyze writing style, track achievements, and get instant career advice.

---

## 🚀 Key Features

*   **Premium Content Generation**: Convert raw notes, milestones, or thoughts into engaging LinkedIn posts, updates, and comments.
*   **Intelligent Rewriter**: Instantly adjust your copy. Actions include: *Shorten, Expand, Professionalize, Simplify, Improve Grammar,* and *Add Storytelling*.
*   **Tone Detector & Reply Generator**: Analyzes text emotional tone (e.g., Frustrated, Confused, Anxious, Serious) and generates professional, constructive replies.
*   **Engagement Predictor**: Grades draft posts on three axes: **Hook, Storytelling, and Engagement** (scored from 0 to 10), and provides actionable optimization feedback.
*   **Career Copilot**: Input any achievement or course milestone to receive a drafted LinkedIn post, a strong resume bullet point, a GitHub project showcase idea, and 3 relevant interview preparation questions.
*   **Achievement Journal**: Log personal milestones as they happen. Synthesize multiple journal entries into a coherent LinkedIn post, resume summary, or portfolio paragraph at the end of the week or month.
*   **Custom Writing Styles**: Input samples of your writing to analyze your style. Save multiple style profiles and let the AI emulate your voice.

---

## 📂 Project Architecture

The project is structured as a monorepo containing two main parts:

```
ContentPilot-AI/
├── backend/            # FastAPI API server & Database models
│   ├── app/            # Main application source code
│   │   ├── main.py     # API routes and CORS config
│   │   ├── models.py   # SQLAlchemy database schemas
│   │   ├── schemas.py  # Pydantic data schemas
│   │   └── database.py # SQLite database engine configuration
│   ├── requirements.txt
│   └── verify_backend.py # Integration test script
├── frontend/           # Chrome Extension built with React, TypeScript, and Vite
│   ├── src/            # Extension source code (popup, background script, content script)
│   ├── build.js        # Vite compiler & bundling script
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Python 3.10+](https://www.python.org/)
*   A Hugging Face account and API Token ([Get HF Token](https://huggingface.co/settings/tokens))

---

### 1. Backend Setup

The backend is powered by **FastAPI** and uses **SQLAlchemy** with a local **SQLite** database (`contentpilot.db`) to persist your history, journal entries, and writing styles.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment and activate it:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure environment variables. Create a `.env` file inside the `backend` directory:
    ```env
    HF_TOKEN="your_huggingface_api_token_here"
    HF_MODEL="nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4"
    ```

5.  Run the API Server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend server will run on `http://127.0.0.1:8000`.

6.  *(Optional)* Verify the backend using the integration test script:
    ```bash
    python verify_backend.py
    ```

---

### 2. Frontend (Chrome Extension) Setup

The frontend is a modern web extension built using **React**, **TypeScript**, **TailwindCSS**, and **Vite**.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Build and package the extension:
    ```bash
    node build.js
    ```
    This script runs the Vite compiler and bundles the extension assets inside the `dist/` directory.

4.  Load the extension into your browser:
    *   Open Google Chrome and navigate to `chrome://extensions/`.
    *   Enable **Developer mode** (toggle switch in the top-right corner).
    *   Click **Load unpacked** in the top-left corner.
    *   Select the `frontend/dist` directory from this project.

---

## 💡 How to Use

1.  **Extension Popup**: Click the extension icon in the toolbar to access:
    *   The **Writer** tab: General generation and custom style management.
    *   The **Journal** tab: Logging achievements and generating weekly/monthly digests.
    *   The **Copilot** tab: Quick resume bullet point and interview prep generation.
    *   The **History** tab: Revisiting and copying previous AI generations.

2.  **LinkedIn Page Integration**:
    *   When browsing LinkedIn, a **ContentPilot AI widget** will hover at the bottom right.
    *   When creating or editing a post, clicking the icon launches the quick-rewrite toolbox directly beside your text fields to optimize your hooks or tone.

---

## 📝 License
This project is for educational/personal use. Please check the LICENSE or terms of your chosen API/LLM providers before deploying production versions.
