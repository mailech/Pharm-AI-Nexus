from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uvicorn
import json
import random

from .models import (
    InteractionCheckRequest, CheckResponse, InteractionResult,
    ExplainRequest, ExplainResponse,
    PredictRequest, PredictResponse,
    AnalyticsResponse, AgentQueryRequest, AgentQueryResponse
)
from .graph_builder import drug_graph
from .rag_pipeline import rag
from .ml_prediction import predictor
from .blockchain_audit import audit_log
from .region_mapper import region_mapper  # NEW - comprehensive region mapping
from .organ_mapper import organ_mapper  # Keep for legacy compatibility
from .llm_analyzer import initialize_llm_analyzer, llm_analyzer  # NEW - LLM-based analysis
from .places_service import places_service  # NEW - Free location services
from .drug_knowledge import drug_knowledge  # NEW - Fuzzy matching and drug class identification

app = FastAPI(
    title="PharmAI Nexus API",
    description="AI-Driven Drug Safety & Discovery Platform",
    version="3.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize LLM analyzer with the LLM from RAG pipeline
    if rag.llm:
        initialize_llm_analyzer(rag.llm)
        print("✓ LLM Analyzer initialized for real-time drug analysis")
    else:
        print("⚠ LLM not available, analyzer will use fallback mode")

@app.post("/analyze_prescription")
async def analyze_prescription(file: UploadFile = File(...)):
    """
    Analyzes an uploaded prescription image.
    In a real app, this would use OCR/Vision API.
    Here, we mock the analysis to return specific drugs.
    """
    try:
        # Read file (in real scenario, send bytes to OCR)
        contents = await file.read()
        
        # Call RAG pipeline to analyze (mock)
        result = rag.analyze_prescription(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/check_interactions")
async def check_interactions(request: InteractionCheckRequest):
    drugs = request.drugs
    drug_interactions = []
    organ_impacts = {}  # Legacy
    region_impacts = {}  # NEW - comprehensive regions
    
    # FAST: Use region_mapper directly (no LLM calls)
    for i in range(len(drugs)):
        for j in range(i + 1, len(drugs)):
            d1, d2 = drugs[i], drugs[j]
            
            # Get affected regions for both drugs
            regions_d1 = region_mapper.get_affected_regions(d1)
            regions_d2 = region_mapper.get_affected_regions(d2)
            
            # Calculate severity based on overlapping regions
            common_regions = set(regions_d1) & set(regions_d2)
            if len(common_regions) >= 3:
                sev_score = 0.8  # Major
            elif len(common_regions) >= 1:
                sev_score = 0.5  # Moderate
            else:
                sev_score = 0.2  # Minor
            
            # Update region impacts
            all_regions = set(regions_d1 + regions_d2)
            for region in all_regions:
                score = sev_score
                if region in common_regions:
                    score = min(1.0, score * 1.3)
                region_impacts[region.lower()] = max(region_impacts.get(region.lower(), 0), score)
            
            # Legacy organ impacts
            for region in all_regions:
                if region.lower() in ['liver', 'kidneys', 'kidney_left', 'kidney_right', 'heart', 'stomach', 'brain', 'lungs']:
                    organ_impacts[region.lower()] = max(organ_impacts.get(region.lower(), 0), sev_score)
            
            # Add interaction if severity is significant
            if sev_score > 0.2:
                mechanism = f"Both medications affect: {', '.join(list(common_regions)[:3]) if common_regions else 'different systems'}. Consult healthcare provider."
                drug_interactions.append({
                    "drugA": d1,
                    "drugB": d2,
                    "severity": sev_score,
                    "mechanism": mechanism
                })
    
    # Also compute individual drug impacts (not just interactions)
    for drug in drugs:
        regions = region_mapper.get_affected_regions(drug)
        for region in regions:
            base_severity = 0.3
            region_key = region.lower()
            
            # Get symptoms for this drug-region combination
            symptoms = region_mapper.get_region_symptoms(drug, region)
            
            # Check if region already has data
            if region_key in region_impacts:
                current = region_impacts[region_key]
                if isinstance(current, dict):
                    # Update existing dict
                    if base_severity > current.get('severity', 0):
                        current['severity'] = base_severity
                    # Merge symptoms
                    existing_symptoms = current.get('symptoms', [])
                    current['symptoms'] = list(set(existing_symptoms + symptoms))
                    if 'drugs' in current:
                        current['drugs'].append(drug)
                else:
                    # Convert number to dict
                    region_impacts[region_key] = {
                        'severity': max(current, base_severity),
                        'symptoms': symptoms,
                        'drugs': [drug]
                    }
            else:
                # Create new entry
                region_impacts[region_key] = {
                    'severity': base_severity,
                    'symptoms': symptoms,
                    'drugs': [drug]
                }
            
            # Legacy organ impacts (keep as simple numbers)
            if region_key in ['liver', 'kidneys', 'kidney_left', 'kidney_right', 'heart', 'stomach', 'brain', 'lungs']:
                organ_impacts[region_key] = max(organ_impacts.get(region_key, 0), base_severity)

    # Global risk - extract severity from dict values
    severity_values = []
    for value in region_impacts.values():
        if isinstance(value, dict):
            severity_values.append(value.get('severity', 0))
        else:
            severity_values.append(value)
    global_risk = max(severity_values) if severity_values else 0.0
    
    # Side effect spread - extract severity from dict values
    side_effect_spread = {}
    
    # Helper function to get severity value
    def get_severity(region_key):
        value = region_impacts.get(region_key, 0)
        if isinstance(value, dict):
            return value.get('severity', 0)
        return value
    
    if get_severity("liver") > 0.6:
        side_effect_spread["liver"] = ["kidney_left", "kidney_right", "stomach"]
    if get_severity("stomach") > 0.6:
        side_effect_spread["stomach"] = ["liver", "intestines"]
    if get_severity("heart") > 0.6:
        side_effect_spread["heart"] = ["lungs", "brain", "chest_wall"]
        
    # Alternatives
    alternatives = []
    if global_risk > 0.7:
        alternatives = [
            {"drug": "Clopidogrel", "reason": "Lower GI bleed risk"},
            {"drug": "Acetaminophen", "reason": "Lower interaction potential"}
        ]
    
    # Log to blockchain
    log_data = {
        "drugs": drugs,
        "interaction_count": len(drug_interactions),
        "global_risk": global_risk
    }
    audit_log.add_block(log_data)
    
    # Calculate bloodflow impacts based on organ risks
    bloodflow_impacts = {}
    for organ_key in ['brain', 'heart', 'liver', 'kidney_left', 'kidney_right', 'stomach', 'lungs']:
        if organ_key in organ_impacts:
            bloodflow_impacts[organ_key] = organ_impacts[organ_key]

    return {
        "drugs": drugs,
        "drug_interactions": drug_interactions,
        "organ_impacts": organ_impacts,  # Legacy
        "region_impacts": region_impacts,  # NEW
        "bloodflow_impacts": bloodflow_impacts,  # NEW - for blood vessel visualization
        "side_effect_spread": side_effect_spread,
        "global_risk": global_risk,
        "alternatives": alternatives
    }

@app.post("/api/agent_query")
async def agent_query(request: AgentQueryRequest):
    context = f"User is taking: {', '.join(request.current_drugs)}.\n"
    if request.analysis_result:
        context += f"Global Risk: {request.analysis_result.get('global_risk', 0)}.\n"
        organ_impacts = request.analysis_result.get('organ_impacts', {})
        if organ_impacts:
            context += f"Organ impacts: {', '.join([f'{k}: {v:.2f}' for k, v in organ_impacts.items()])}.\n"
    
    reply = rag.agent_chat(request.message, context)
    
    if request.analysis_result and request.analysis_result.get('global_risk', 0) > 0.8:
        reply = "⚠️ High-risk interaction detected. Immediate medical consultation recommended.\n\n" + reply
    
    return {"reply": reply}

@app.websocket("/agent/ws")
async def websocket_agent(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            
            message = msg_data.get("message", "")
            context_data = msg_data.get("context", {})
            location_data = msg_data.get("location", {})
            
            # Build context
            drugs = context_data.get("drugs", [])
            organ_impacts = context_data.get("organ_impacts", {})
            global_risk = context_data.get("global_risk", 0)
            
            context = f"User is taking: {', '.join(drugs)}.\n"
            context += f"Global Risk: {global_risk:.2f}.\n"
            if organ_impacts:
                context += f"Organ impacts: {', '.join([f'{k}: {v:.2f}' for k, v in organ_impacts.items()])}.\n"
            
            # Get real location details if available
            if location_data and location_data.get('lat') and location_data.get('lon'):
                lat = location_data.get('lat')
                lon = location_data.get('lon')
                
                # Reverse geocode to get city/country
                location_info = places_service.reverse_geocode(lat, lon)
                context += f"User Location: {location_info['city']}, {location_info['country']}.\n"
            elif location_data:
                context += f"User Location: {location_data.get('city', 'Unknown')}, {location_data.get('country', 'Unknown')}.\n"

            reply = rag.agent_chat(message, context)
            
            if global_risk > 0.8:
                reply = "⚠️ High-risk interaction detected. Immediate medical consultation recommended.\n\n" + reply
            
            # Search for REAL nearby facilities using OpenStreetMap (FREE!)
            nearby_facilities = []
            if ("hospital" in message.lower() or "doctor" in message.lower() or 
                "clinic" in message.lower() or "lab" in message.lower() or 
                "blood test" in message.lower()):
                
                if location_data and location_data.get('lat') and location_data.get('lon'):
                    lat = location_data.get('lat')
                    lon = location_data.get('lon')
                    
                    # Search using free OpenStreetMap API
                    nearby_facilities = places_service.search_nearby_facilities(
                        lat=lat,
                        lon=lon,
                        radius_km=10.0  # 10km radius
                    )
                    
                    if nearby_facilities:
                        reply += f"\n\n📍 Found {len(nearby_facilities)} medical facilities near you."

            await websocket.send_json({
                "reply": reply,
                "nearby_facilities": nearby_facilities
            })
    except WebSocketDisconnect:
        pass

@app.post("/api/appointments/mock")
async def book_appointment(request: Dict[str, Any]):
    return {
        "status": "confirmed",
        "facility": request.get("facility", "City Care Hospital"),
        "time": "2025-02-10T10:30:00",
        "reference": f"APT-{random.randint(10000, 99999)}"
    }

@app.post("/api/explain_interaction", response_model=ExplainResponse)
async def explain_interaction(request: ExplainRequest):
    edge_data = drug_graph.check_interaction(request.drug_a, request.drug_b)
    known = edge_data is not None
    severity = edge_data.get("severity", "Unknown") if known else "None"
    
    explanation_data = rag.get_explanation(request.drug_a, request.drug_b, severity)
    
    return ExplainResponse(
        known_interaction=known,
        mechanism_explanation=explanation_data.get("mechanism", ""),
        patient_friendly_explanation=explanation_data.get("patient", "")
    )

@app.post("/api/predict_interaction", response_model=PredictResponse)
async def predict_interaction(request: PredictRequest):
    if not predictor.is_trained:
        predictor.train()
        
    result = predictor.predict(request.drug_a, request.drug_b)
    
    return PredictResponse(
        known_interaction=result["known"],
        predicted_risk_score=result["score"],
        comment=result["comment"]
    )

@app.get("/api/analytics/summary", response_model=AnalyticsResponse)
async def get_analytics():
    severities = {}
    for u, v, data in drug_graph.graph.edges(data=True):
        sev = data.get("severity", "Unknown")
        severities[sev] = severities.get(sev, 0) + 1
        
    top_pairs = [
        {"pair": "Warfarin + Aspirin", "count": 120},
        {"pair": "Lisinopril + Losartan", "count": 85},
        {"pair": "Simvastatin + Amlodipine", "count": 60},
    ]
    
    return AnalyticsResponse(
        top_risky_pairs=top_pairs,
        severity_distribution=severities
    )

@app.get("/api/audit/chain")
async def get_chain():
    return audit_log.chain

@app.get("/api/graph/data")
async def get_graph_data():
    nodes = [{"id": n, "group": 1} for n in drug_graph.graph.nodes()]
    links = []
    for u, v, data in drug_graph.graph.edges(data=True):
        links.append({
            "source": u,
            "target": v,
            "severity": data.get("severity", "Unknown")
        })
    return {"nodes": nodes, "links": links}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
