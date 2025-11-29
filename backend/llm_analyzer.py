"""
LLM-based Drug Interaction Analyzer - FAST VERSION with caching
Uses region_mapper for instant responses
"""
import json
from typing import List, Dict, Tuple

class LLMDrugAnalyzer:
    def __init__(self, llm=None):
        self.llm = llm
        self._cache = {}  # Simple cache for faster responses
        
    def _get_cache_key(self, drug_a: str, drug_b: str) -> str:
        """Generate cache key for drug pair"""
        drugs = sorted([drug_a.lower(), drug_b.lower()])
        return f"{drugs[0]}_{drugs[1]}"
        
    def analyze_interaction(self, drug_a: str, drug_b: str) -> Dict:
        """
        Analyze interaction between two drugs using region_mapper (FAST)
        Returns: {severity: float, mechanism: str, affected_regions: list}
        """
        # Check cache first
        cache_key = self._get_cache_key(drug_a, drug_b)
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Use fast fallback (region_mapper based)
        result = self._fallback_analysis(drug_a, drug_b)
        self._cache[cache_key] = result
        return result
    
    def _fallback_analysis(self, drug_a: str, drug_b: str) -> Dict:
        """Fast fallback using region_mapper"""
        # Import here to avoid circular dependency
        from .region_mapper import region_mapper
        
        regions_a = region_mapper.get_affected_regions(drug_a)
        regions_b = region_mapper.get_affected_regions(drug_b)
        
        # Calculate severity based on overlapping regions
        common_regions = set(regions_a) & set(regions_b)
        if len(common_regions) >= 3:
            severity = 0.7  # Major
        elif len(common_regions) >= 1:
            severity = 0.5  # Moderate
        else:
            severity = 0.3  # Minor
        
        all_regions = list(set(regions_a + regions_b))
        
        return {
            "severity": severity,
            "severity_level": "Major" if severity >= 0.7 else "Moderate" if severity >= 0.4 else "Minor",
            "mechanism": f"Potential interaction between {drug_a} and {drug_b}. Both medications affect: {', '.join(common_regions) if common_regions else 'different systems'}.",
            "patient_explanation": f"These medications may interact. Please consult your doctor.",
            "affected_regions": all_regions[:10],  # Limit to 10 regions
            "monitoring": "Monitor for side effects and consult healthcare provider"
        }
    
    def analyze_drug_profile(self, drug: str) -> Dict:
        """
        Get drug profile using region_mapper (FAST)
        Returns: {regions: list, side_effects: list, class: str}
        """
        # Check cache
        cache_key = f"profile_{drug.lower()}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Use fast fallback
        result = self._fallback_profile(drug)
        self._cache[cache_key] = result
        return result
    
    def _fallback_profile(self, drug: str) -> Dict:
        """Fast drug profile using region_mapper"""
        from .region_mapper import region_mapper
        
        regions = region_mapper.get_affected_regions(drug)
        
        return {
            "drug_name": drug,
            "drug_class": "Medication",
            "affected_regions": regions,
            "common_side_effects": ["Consult healthcare provider for specific side effects"],
            "severity_baseline": 0.3
        }

# Global instance (will be initialized with LLM from rag_pipeline)
llm_analyzer = None

def initialize_llm_analyzer(llm):
    """Initialize the analyzer with an LLM instance"""
    global llm_analyzer
    llm_analyzer = LLMDrugAnalyzer(llm)
    return llm_analyzer
