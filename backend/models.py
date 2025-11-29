from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class InteractionCheckRequest(BaseModel):
    drugs: List[str]

class InteractionResult(BaseModel):
    drugA: str
    drugB: str
    severity: float
    mechanism: str

class CheckResponse(BaseModel):
    drugs: List[str]
    drug_interactions: List[InteractionResult]
    organ_impacts: Dict[str, float]  # Legacy - kept for compatibility
    region_impacts: Dict[str, float]  # NEW - comprehensive body regions
    bloodflow_impacts: Dict[str, float] = {}  # NEW - blood vessel risk levels
    side_effect_spread: Dict[str, List[str]]
    global_risk: float
    alternatives: List[Dict[str, str]]

class AgentQueryRequest(BaseModel):
    message: str
    current_drugs: List[str] = []
    analysis_result: Dict[str, Any] = {}
    location: Dict[str, Any] = {}

class AgentQueryResponse(BaseModel):
    reply: str
    nearby_facilities: List[Dict[str, Any]] = []


class ExplainRequest(BaseModel):
    drug_a: str
    drug_b: str

class ExplainResponse(BaseModel):
    known_interaction: bool
    mechanism_explanation: str
    patient_friendly_explanation: str

class PredictRequest(BaseModel):
    drug_a: str
    drug_b: str

class PredictResponse(BaseModel):
    known_interaction: bool
    predicted_risk_score: float
    comment: str

class AnalyticsResponse(BaseModel):
    top_risky_pairs: List[Dict[str, Any]]
    severity_distribution: Dict[str, int]
