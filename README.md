# PharmAI Nexus 2.0 🧬

**"Jarvis of the Human Body" for Medication Safety**

PharmAI Nexus is an advanced AI-driven platform that visualizes drug interactions on a 3D human body, explains mechanisms using Generative AI, and predicts risks using Graph Machine Learning.

## 🌐 Live Deployment

| Component | Platform | Status | Link |
|-----------|----------|--------|------|
| **Frontend** | **Netlify** | 🟢 Live | [**https://pharm-nexus.netlify.app/**](https://pharm-nexus.netlify.app/) |
| **Backend** | **Render** | 🟢 Live | [**https://pharmnexus.onrender.com**](https://pharmnexus.onrender.com/docs) |

> **Note:** The backend is hosted on a free tier instance on Render, so it may spin down after inactivity. Please allow 50-60 seconds for the initial request to wake it up.

## 🌟 Key Features

- **3D Bio-Visualization**: Interactive 3D human body showing organ-level impact of drugs (Green/Yellow/Red severity).
- **Nexus AI Agent**: A "Jarvis-like" conversational assistant that answers clinical questions in context.
- **Graph RAG Engine**: Combines Knowledge Graphs with LLMs to explain *why* interactions happen.
- **Predictive ML**: Node2Vec algorithms to predict risks for unknown drug combinations.
- **Blockchain Audit**: Immutable ledger of all safety checks, visualized in a dedicated "System Audit" panel.

## 🚀 Quick Start

### 1. Start the Backend
Open a terminal in the **project root**:
```bash
uvicorn backend.main:app --reload
```
*API: http://127.0.0.1:8000*

### 2. Start the Frontend
Open a **new** terminal in the **project root**:
```bash
cd frontend
npm run dev
```
*App: http://localhost:5173*

## 🧪 Demo Instructions

1.  **Visual Analysis**:
    - Add `Warfarin` and `Aspirin`.
    - Watch the **Heart** and **Stomach** glow red/orange on the 3D body.
    - Click the organ to see the risk score.

2.  **AI Agent (Nexus)**:
    - Switch to the **NEXUS AGENT** tab.
    - Type: *"Why is the stomach affected?"*
    - Nexus will explain the bleeding risk mechanism.

3.  **Blockchain Audit**:
    - Switch to the **SYSTEM AUDIT** tab.
    - See the immutable log of your analysis, verified with cryptographic hashes.

4.  **Try These Drugs**:
    - *Cardio*: `Lisinopril`, `Losartan`, `Amlodipine`, `Metoprolol`
    - *Pain*: `Ibuprofen`, `Naproxen`, `Tramadol`
    - *Antibiotics*: `Amoxicillin`, `Azithromycin`, `Ciprofloxacin`
    - *Psych*: `Sertraline`, `Fluoxetine`, `Alprazolam`

5.  **Prediction**:
    - The system runs ML predictions in the background for any unknown pairs.

## ⌨️ Keyboard Shortcuts

- **Ctrl + Enter** - Run analysis
- **Escape** - Clear results
- **Enter** (in drug input) - Add drug

## 🎯 Pro Tips

- Use the **BODY/NETWORK** toggle to switch between organ view and graph view
- Purple badges indicate **AI predictions** vs red for known interactions
- Check the **SYSTEM AUDIT** tab to see the blockchain verification
- Keyboard shortcuts make demos smoother!

---
*Built for Major Hackathon Demo*
