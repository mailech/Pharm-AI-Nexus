# PharmAI Nexus - Demo Script 🎬

## Pre-Demo Checklist
- [ ] Backend running: `uvicorn backend.main:app --reload`
- [ ] Frontend running: `npm run dev` (in frontend folder)
- [ ] Browser open to: `http://localhost:5173`

## Demo Flow (5-7 minutes)

### 1. Opening Hook (30 seconds)
**Say:** "What if you had a Jarvis-like AI that could visualize how medications interact inside your body in real-time?"

**Action:** Show the landing screen with the holographic 3D body rotating.

---

### 2. Known Interaction Demo (90 seconds)

**Say:** "Let's test a dangerous combination: Warfarin and Aspirin - both blood thinners."

**Actions:**
1. The drugs are already loaded (Warfarin, Aspirin)
2. Click **"RUN ANALYSIS"**
3. **Point out:**
   - Red interaction card appears (Major severity)
   - 3D body: Heart and Stomach glow RED
   - Global Risk indicator shows "High"
   - Blockchain entry created in real-time

**Say:** "Notice how the AI explains WHY this is dangerous - both drugs affect blood clotting, increasing bleeding risk in the stomach."

---

### 3. AI Agent Interaction (60 seconds)

**Say:** "Now let's ask our AI agent for more details."

**Actions:**
1. Switch to **NEXUS AGENT** tab
2. Type: `"Why is the stomach at risk?"`
3. **Show:** The AI explains the mechanism in clinical terms

**Say:** "The AI has full context of your current medications and analysis results."

---

### 4. Network Visualization (45 seconds)

**Say:** "Behind the scenes, we're using a knowledge graph of thousands of drug interactions."

**Actions:**
1. Click **NETWORK** toggle (top right)
2. **Show:** 3D rotating drug network
3. Point out color-coded connections (Red = Major, Yellow = Moderate)

**Say:** "Each node is a drug, each connection is a known interaction."

---

### 5. ML Prediction Demo (90 seconds)

**Say:** "Here's where it gets interesting - what about drug pairs we DON'T have data for?"

**Actions:**
1. Switch back to **BODY** view
2. Clear drugs and add: `Metformin` + `Gabapentin`
3. Click **RUN ANALYSIS**
4. **Point out:**
   - Purple card appears with **[AI PREDICTION]** badge
   - "Predicted Moderate" severity
   - Confidence score shown

**Say:** "Our Node2Vec ML model analyzes the graph structure to predict potential risks for unknown combinations."

---

### 6. Blockchain Audit (30 seconds)

**Say:** "Every analysis is logged to an immutable blockchain for compliance."

**Actions:**
1. Switch to **SYSTEM AUDIT** tab
2. Scroll through blocks
3. **Show:** Hash chains, timestamps, verified checkmarks

**Say:** "Perfect for clinical trials or regulatory audits."

---

### 7. Closing (30 seconds)

**Say:** "PharmAI Nexus combines:"
- ✅ 3D Bio-Visualization
- ✅ Graph ML for predictions
- ✅ RAG-powered AI explanations
- ✅ Blockchain audit trails

**Say:** "All in a Jarvis-like interface that makes medication safety accessible to everyone."

---

## Backup Demo Drugs

If you need to switch examples:

- **Cardio Risk:** `Lisinopril` + `Losartan` (both ACE inhibitors)
- **Liver Stress:** `Acetaminophen` + `Simvastatin`
- **Unknown Pair:** `Tramadol` + `Fluticasone` (triggers ML prediction)

---

## Common Questions & Answers

**Q: Is this real medical data?**
A: The interaction graph uses real drug names and known interactions, but this is a demo system. Always consult a healthcare professional.

**Q: How accurate are the predictions?**
A: The ML model uses Node2Vec embeddings with ~70-80% accuracy on test data. It's designed to flag potential risks for further investigation.

**Q: Can this scale?**
A: Yes! The backend uses FastAPI (async), the graph is NetworkX (efficient), and the blockchain is append-only. We can handle 10K+ drugs.

**Q: What about privacy?**
A: All data stays local. The blockchain is stored in a local JSON file. For production, we'd use encrypted storage and HIPAA-compliant infrastructure.
