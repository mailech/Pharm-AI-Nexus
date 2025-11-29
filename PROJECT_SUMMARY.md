# PharmAI Nexus 2.0 - Project Summary 🚀

## Overview
PharmAI Nexus is a cutting-edge AI-powered medication safety platform that combines 3D visualization, machine learning, and blockchain technology to provide comprehensive drug interaction analysis.

## 🎯 Core Features

### 1. **3D Bio-Visualization**
- Interactive holographic human body model
- Real-time organ risk highlighting (Green → Yellow → Red)
- Smooth animations and particle effects
- Click organs for detailed risk information

### 2. **AI-Powered Analysis**
- **Known Interactions**: Database of verified drug-drug interactions
- **ML Predictions**: Node2Vec embeddings predict risks for unknown pairs
- **RAG Explanations**: LangChain + OpenAI generate clinical explanations
- **Organ Mapping**: 30+ drugs mapped to affected organs

### 3. **Nexus AI Agent**
- Context-aware conversational interface
- Understands current medications and analysis results
- Provides both technical and patient-friendly explanations
- Clinical, supportive tone

### 4. **3D Network Visualization**
- Interactive graph of drug interaction network
- Spherical layout with golden angle distribution
- Color-coded connections by severity
- Auto-rotating view

### 5. **Blockchain Audit Log**
- Immutable hash-chained blocks
- Cryptographic verification
- Visual explorer with timestamps
- Compliance-ready

### 6. **Analytics Dashboard**
- Severity distribution charts
- Top risky drug pairs
- Real-time statistics
- Visual insights

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (async, high-performance)
- **Graph**: NetworkX (interaction modeling)
- **ML**: Node2Vec (link prediction)
- **AI**: LangChain + OpenAI (RAG pipeline)
- **Storage**: Local JSON (blockchain), in-memory graph

### Frontend
- **Framework**: React 18 + Vite
- **3D**: Three.js via react-three-fiber
- **Styling**: Tailwind CSS (custom glassmorphism)
- **State**: React hooks (useState, useEffect)
- **HTTP**: Axios

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │3D Body   │  │Network   │  │Analytics│ │
│  │          │  │Viz       │  │Graph     │  │         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │             │      │
│       └─────────────┴──────────────┴─────────────┘      │
│                         │ HTTP/JSON                     │
└─────────────────────────┼─────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────┐
│                    Backend (FastAPI)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Graph     │  │RAG       │  │ML        │  │Blockchain│ │
│  │Builder   │  │Pipeline  │  │Predictor │  │Audit    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │             │      │
│       └─────────────┴──────────────┴─────────────┘      │
│                    NetworkX Graph                       │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API Key (optional, falls back to mock mode)

### Installation

```bash
# 1. Install backend dependencies
pip install -r requirements.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running

```bash
# Terminal 1: Start backend
uvicorn backend.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Access at: `http://localhost:5173`

## 🎬 Demo Flow

1. **Load** → See holographic 3D body
2. **Analyze** → Warfarin + Aspirin (known interaction)
3. **Visualize** → Organs glow red, risk displayed
4. **Chat** → Ask Nexus "Why is the stomach affected?"
5. **Network** → Toggle to see drug graph
6. **Predict** → Try Metformin + Gabapentin (ML prediction)
7. **Audit** → View blockchain verification
8. **Analytics** → Check severity distribution

## ⌨️ Keyboard Shortcuts

- `Ctrl + Enter` → Run analysis
- `Escape` → Clear results
- `Enter` (in input) → Add drug

## 📁 Project Structure

```
PharmAI Nexus/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── graph_builder.py     # NetworkX graph
│   ├── rag_pipeline.py      # LangChain RAG
│   ├── ml_prediction.py     # Node2Vec ML
│   ├── blockchain_audit.py  # Audit log
│   ├── organ_mapper.py      # Drug→Organ mapping
│   ├── models.py            # Pydantic schemas
│   └── config.py            # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main layout
│   │   │   ├── HumanBody3D.tsx        # 3D body viz
│   │   │   ├── DrugNetwork3D.tsx      # Network graph
│   │   │   ├── ChatPanel.tsx          # AI agent
│   │   │   ├── BlockchainExplorer.tsx # Audit log
│   │   │   ├── AnalyticsDashboard.tsx # Stats
│   │   │   ├── ErrorBoundary.tsx      # Error handling
│   │   │   └── LoadingSpinner.tsx     # Loading UI
│   │   ├── api.ts           # API helpers
│   │   ├── App.tsx          # Root component
│   │   └── index.css        # Global styles
│   └── package.json
├── data/
│   └── audit_chain.json     # Blockchain storage
├── DEMO_SCRIPT.md           # Presentation guide
├── KEYBOARD_SHORTCUTS.md    # Shortcuts reference
└── README.md                # User documentation
```

## 🎨 Design Philosophy

- **Jarvis-like**: Holographic, futuristic aesthetic
- **Glassmorphism**: Translucent panels with blur effects
- **Color Coding**: Intuitive risk visualization (Green/Yellow/Red)
- **Micro-animations**: Smooth transitions and hover effects
- **Premium Typography**: Inter + JetBrains Mono fonts

## 🔒 Security & Privacy

- All data processed locally
- No external data transmission (except OpenAI API)
- Blockchain ensures audit trail integrity
- CORS enabled for development (restrict in production)

## 📈 Performance

- Async backend (FastAPI)
- Lazy ML training (on-demand)
- Optimized 3D rendering (react-three-fiber)
- Minimal re-renders (React hooks)

## 🎓 Educational Value

- Demonstrates Graph ML (Node2Vec)
- Shows RAG implementation (LangChain)
- Illustrates blockchain concepts
- 3D visualization with Three.js
- Modern React patterns

## 🏆 Hackathon Highlights

1. **Visual Impact**: Stunning 3D holographic interface
2. **AI Innovation**: ML predictions + RAG explanations
3. **Technical Depth**: Graph theory, embeddings, blockchain
4. **Real-World Application**: Medication safety is critical
5. **Demo-Ready**: Polished, smooth, impressive

## 📝 Known Limitations

- **Organ Mapping**: Simplified heuristics (production needs medical database)
- **3D Model**: Procedural geometry (could use detailed GLTF models)
- **ML Accuracy**: ~70-80% on test data (needs larger training set)
- **Blockchain**: Local JSON (production needs distributed ledger)
- **OpenAI Dependency**: Falls back to mock mode without API key

## 🔮 Future Enhancements

- [ ] Real medical drug database (DrugBank, RxNorm)
- [ ] Patient profile integration (age, weight, conditions)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Clinical trial integration
- [ ] FDA adverse event data
- [ ] Genomic marker analysis
- [ ] Prescription optimization

## 📞 Support

For issues or questions:
- Check `DEMO_SCRIPT.md` for presentation guidance
- Review `README.md` for usage instructions
- Inspect `walkthrough.md` for technical details

---

**Built with ❤️ for the Hackathon**

*PharmAI Nexus - Making Medication Safety Accessible to Everyone*
