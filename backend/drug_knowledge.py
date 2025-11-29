"""
Enhanced Drug Knowledge Layer with Fuzzy Matching
Supports any medication name with intelligent fallback
"""
from difflib import get_close_matches
from typing import List, Dict, Tuple

class DrugKnowledgeLayer:
    def __init__(self):
        # Drug class mappings for generic matching
        self.drug_classes = {
            # NSAIDs
            "nsaid": {
                "drugs": ["ibuprofen", "naproxen", "diclofenac", "indomethacin", "celecoxib"],
                "regions": ["stomach", "kidneys", "liver", "heart"],
                "base_severity": 0.5
            },
            # Antibiotics
            "antibiotic": {
                "drugs": ["amoxicillin", "azithromycin", "ciprofloxacin", "doxycycline", "cephalexin"],
                "regions": ["liver", "kidneys", "intestines", "stomach"],
                "base_severity": 0.4
            },
            # Beta Blockers
            "beta_blocker": {
                "drugs": ["metoprolol", "atenolol", "propranolol", "carvedilol"],
                "regions": ["heart", "lungs", "brain", "blood"],
                "base_severity": 0.6
            },
            # ACE Inhibitors
            "ace_inhibitor": {
                "drugs": ["lisinopril", "enalapril", "ramipril", "captopril"],
                "regions": ["kidneys", "heart", "blood"],
                "base_severity": 0.5
            },
            # ARBs
            "arb": {
                "drugs": ["losartan", "valsartan", "irbesartan", "candesartan"],
                "regions": ["kidneys", "heart", "blood"],
                "base_severity": 0.5
            },
            # Statins
            "statin": {
                "drugs": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
                "regions": ["liver", "muscles", "arms", "legs"],
                "base_severity": 0.5
            },
            # SSRIs
            "ssri": {
                "drugs": ["sertraline", "fluoxetine", "escitalopram", "paroxetine"],
                "regions": ["brain", "liver", "stomach"],
                "base_severity": 0.4
            },
            # Benzodiazepines
            "benzodiazepine": {
                "drugs": ["alprazolam", "diazepam", "lorazepam", "clonazepam"],
                "regions": ["brain", "liver"],
                "base_severity": 0.6
            },
            # PPIs
            "ppi": {
                "drugs": ["omeprazole", "pantoprazole", "esomeprazole", "lansoprazole"],
                "regions": ["stomach", "liver", "intestines"],
                "base_severity": 0.3
            },
            # Diuretics
            "diuretic": {
                "drugs": ["furosemide", "hydrochlorothiazide", "spironolactone"],
                "regions": ["kidneys", "blood", "heart"],
                "base_severity": 0.5
            },
            # Calcium Channel Blockers
            "calcium_blocker": {
                "drugs": ["amlodipine", "diltiazem", "verapamil", "nifedipine"],
                "regions": ["heart", "liver", "legs", "feet"],
                "base_severity": 0.5
            },
            # Anticoagulants
            "anticoagulant": {
                "drugs": ["warfarin", "heparin", "enoxaparin", "rivaroxaban"],
                "regions": ["blood", "liver", "brain", "stomach"],
                "base_severity": 0.7
            },
            # Antiplatelets
            "antiplatelet": {
                "drugs": ["aspirin", "clopidogrel", "ticagrelor"],
                "regions": ["blood", "stomach", "kidneys"],
                "base_severity": 0.6
            }
        }
        
        # Common drug name variations and brand names
        self.drug_aliases = {
            # Pain relievers
            "tylenol": "acetaminophen",
            "panadol": "acetaminophen",
            "crocin": "acetaminophen",
            "dolo": "acetaminophen",
            "advil": "ibuprofen",
            "motrin": "ibuprofen",
            "brufen": "ibuprofen",
            "aleve": "naproxen",
            
            # Antibiotics
            "augmentin": "amoxicillin",
            "zithromax": "azithromycin",
            "cipro": "ciprofloxacin",
            "monocef": "cefotaxime",
            
            # Cardiovascular
            "coumadin": "warfarin",
            "plavix": "clopidogrel",
            "norvasc": "amlodipine",
            "lopressor": "metoprolol",
            "cozaar": "losartan",
            
            # Statins
            "lipitor": "atorvastatin",
            "zocor": "simvastatin",
            "crestor": "rosuvastatin",
            
            # Diabetes
            "glucophage": "metformin",
            
            # PPIs
            "prilosec": "omeprazole",
            "nexium": "esomeprazole",
            "protonix": "pantoprazole",
            
            # Psychiatric
            "xanax": "alprazolam",
            "valium": "diazepam",
            "ativan": "lorazepam",
            "zoloft": "sertraline",
            "prozac": "fluoxetine",
            "lexapro": "escitalopram"
        }
        
        # Suffix patterns for drug identification
        self.drug_suffixes = {
            "pril": "ace_inhibitor",  # lisinopril, enalapril
            "sartan": "arb",  # losartan, valsartan
            "statin": "statin",  # atorvastatin, simvastatin
            "olol": "beta_blocker",  # metoprolol, atenolol
            "dipine": "calcium_blocker",  # amlodipine, nifedipine
            "prazole": "ppi",  # omeprazole, pantoprazole
            "cillin": "antibiotic",  # amoxicillin, penicillin
            "mycin": "antibiotic",  # azithromycin, erythromycin
            "cycline": "antibiotic",  # doxycycline, tetracycline
            "floxacin": "antibiotic",  # ciprofloxacin, levofloxacin
            "pam": "benzodiazepine",  # diazepam, lorazepam
            "lam": "benzodiazepine"  # alprazolam, clonazepam
        }
    
    def normalize_drug_name(self, drug_name: str) -> str:
        """Normalize drug name to generic form"""
        drug = drug_name.lower().strip()
        
        # Remove common dosage patterns
        import re
        drug = re.sub(r'\s*\d+\s*(mg|mcg|g|ml).*$', '', drug)
        drug = re.sub(r'\s*\d+$', '', drug)  # Remove trailing numbers
        
        # Check aliases
        if drug in self.drug_aliases:
            return self.drug_aliases[drug]
        
        return drug
    
    def identify_drug_class(self, drug_name: str) -> Tuple[str, float]:
        """
        Identify drug class using suffix patterns and fuzzy matching
        Returns (class_name, confidence)
        """
        drug = self.normalize_drug_name(drug_name)
        
        # Check suffix patterns
        for suffix, drug_class in self.drug_suffixes.items():
            if drug.endswith(suffix):
                return (drug_class, 0.9)
        
        # Fuzzy match against known drugs in each class
        best_match = None
        best_score = 0
        
        for class_name, class_data in self.drug_classes.items():
            matches = get_close_matches(drug, class_data["drugs"], n=1, cutoff=0.6)
            if matches:
                score = self._similarity_score(drug, matches[0])
                if score > best_score:
                    best_score = score
                    best_match = class_name
        
        if best_match:
            return (best_match, best_score)
        
        return ("unknown", 0.0)
    
    def _similarity_score(self, str1: str, str2: str) -> float:
        """Calculate similarity score between two strings"""
        from difflib import SequenceMatcher
        return SequenceMatcher(None, str1, str2).ratio()
    
    def get_drug_info(self, drug_name: str, region_mapper) -> Dict:
        """
        Get comprehensive drug information with fallback
        Returns dict with regions, severity, and confidence
        """
        drug = self.normalize_drug_name(drug_name)
        
        # Try direct lookup from region_mapper first
        regions = region_mapper.get_affected_regions(drug)
        
        # If we got default regions, try class-based matching
        if regions == region_mapper.default_regions:
            drug_class, confidence = self.identify_drug_class(drug)
            
            if drug_class != "unknown" and drug_class in self.drug_classes:
                class_data = self.drug_classes[drug_class]
                return {
                    "regions": class_data["regions"],
                    "base_severity": class_data["base_severity"],
                    "confidence": confidence,
                    "source": f"class:{drug_class}"
                }
        
        # Return region_mapper results
        return {
            "regions": regions,
            "base_severity": 0.4,
            "confidence": 1.0 if regions != region_mapper.default_regions else 0.3,
            "source": "direct" if regions != region_mapper.default_regions else "fallback"
        }
    
    def fuzzy_match_drug(self, drug_name: str, known_drugs: List[str]) -> str:
        """
        Fuzzy match a drug name against known drugs
        Returns best match or original name
        """
        drug = self.normalize_drug_name(drug_name)
        matches = get_close_matches(drug, known_drugs, n=1, cutoff=0.7)
        return matches[0] if matches else drug_name

# Global instance
drug_knowledge = DrugKnowledgeLayer()
