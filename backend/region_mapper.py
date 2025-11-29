"""
Comprehensive Region Mapper for PharmAI Nexus
Maps medications to 25+ body regions including organs, limbs, and symptom areas
"""

class RegionMapper:
    def __init__(self):
        # Comprehensive drug-to-region mapping
        # Each drug maps to list of affected regions
        self.drug_mapping = {
            # Antibiotics
            "monocef": ["kidneys", "liver", "intestines", "stomach"],
            "cefotaxime": ["kidneys", "liver", "intestines"],
            "erithromycin": ["liver", "stomach", "intestines", "heart"],
            "erythromycin": ["liver", "stomach", "intestines", "heart"],
            "azithromycin": ["heart", "liver", "stomach", "intestines"],
            "amoxicillin": ["kidneys", "liver", "stomach", "intestines"],
            "ciprofloxacin": ["kidneys", "tendons", "legs", "arms"],
            "doxycycline": ["stomach", "liver", "teeth"],
            
            # Pain & Anti-inflammatory
            "aspirin": ["blood", "stomach", "kidneys", "brain"],
            "ibuprofen": ["kidneys", "stomach", "liver"],
            "naproxen": ["stomach", "kidneys", "liver"],
            "acetaminophen": ["liver"],
            "paracetamol": ["liver"],
            "dolo": ["liver", "head"],
            "dolo 650": ["liver", "head"],
            "tramadol": ["brain", "liver", "stomach"],
            "morphine": ["brain", "intestines", "stomach"],
            
            # Cardiovascular
            "warfarin": ["blood", "liver", "brain"],
            "aspirin": ["blood", "stomach", "kidneys", "brain"],
            "clopidogrel": ["blood", "liver", "stomach"],
            "lisinopril": ["kidneys", "heart", "blood"],
            "losartan": ["kidneys", "heart", "blood"],
            "amlodipine": ["heart", "liver", "legs", "feet"],
            "metoprolol": ["heart", "lungs", "brain"],
            "atenolol": ["heart", "lungs", "hands", "feet"],
            "diltiazem": ["heart", "liver"],
            
            # Cholesterol
            "simvastatin": ["liver", "muscles", "arms", "legs"],
            "atorvastatin": ["liver", "muscles", "arms", "legs"],
            "rosuvastatin": ["liver", "muscles", "kidneys"],
            
            # Diabetes
            "metformin": ["kidneys", "liver", "intestines", "stomach"],
            "glipizide": ["liver", "pancreas"],
            "insulin": ["blood", "liver", "muscles"],
            
            # Respiratory
            "albuterol": ["lungs", "heart", "chest_wall"],
            "montelukast": ["lungs", "brain", "chest_wall"],
            "fluticasone": ["lungs", "throat", "chest_wall"],
            "budesonide": ["lungs", "throat"],
            
            # Gastrointestinal
            "omeprazole": ["stomach", "liver", "intestines"],
            "pantoprazole": ["stomach", "liver"],
            "ranitidine": ["stomach", "kidneys"],
            "metoclopramide": ["brain", "stomach", "intestines"],
            
            # Neurological / Psychiatric
            "gabapentin": ["brain", "kidneys", "eyes"],
            "pregabalin": ["brain", "kidneys", "eyes"],
            "sertraline": ["brain", "liver", "stomach"],
            "fluoxetine": ["brain", "liver", "stomach"],
            "escitalopram": ["brain", "liver"],
            "alprazolam": ["brain", "liver"],
            "clonazepam": ["brain", "liver"],
            "diazepam": ["brain", "liver", "muscles"],
            "amitriptyline": ["brain", "heart", "eyes", "mouth"],
            
            # Thyroid
            "levothyroxine": ["thyroid", "heart", "brain"],
            "methimazole": ["thyroid", "liver", "blood"],
            
            # Diuretics
            "furosemide": ["kidneys", "blood", "ears"],
            "hydrochlorothiazide": ["kidneys", "blood"],
            "spironolactone": ["kidneys", "blood", "breasts"],
            
            # Steroids
            "prednisone": ["immune_system", "bones", "stomach", "eyes"],
            "prednisolone": ["immune_system", "bones", "stomach", "eyes"],
            "dexamethasone": ["immune_system", "bones", "brain"],
            
            # Anticoagulants
            "heparin": ["blood", "liver"],
            "enoxaparin": ["blood", "kidneys"],
            
            # Others
            "allopurinol": ["liver", "kidneys", "joints", "feet"],
            "colchicine": ["intestines", "liver", "kidneys"],
        }
        
        # Symptom mapping: drug -> region -> list of symptoms
        self.symptom_mapping = {
            # Antibiotics
            "monocef": {
                "kidneys": ["Kidney strain", "Reduced urine output"],
                "liver": ["Elevated liver enzymes", "Mild jaundice risk"],
                "intestines": ["Diarrhea", "Cramping"],
                "stomach": ["Nausea", "Upset stomach"]
            },
            "erithromycin": {
                "liver": ["Liver enzyme elevation", "Hepatotoxicity risk"],
                "stomach": ["Nausea", "Vomiting", "Abdominal pain"],
                "intestines": ["Diarrhea", "Cramping"],
                "heart": ["QT prolongation", "Arrhythmia risk"]
            },
            "azithromycin": {
                "heart": ["Irregular heartbeat", "Palpitations"],
                "liver": ["Liver stress", "Enzyme elevation"],
                "stomach": ["Nausea", "Stomach pain"],
                "intestines": ["Diarrhea"]
            },
            "amoxicillin": {
                "kidneys": ["Kidney stress"],
                "liver": ["Rare liver issues"],
                "stomach": ["Nausea", "Upset stomach"],
                "intestines": ["Diarrhea", "Yeast infection risk"]
            },
            "ciprofloxacin": {
                "kidneys": ["Kidney damage risk"],
                "tendons": ["Tendon rupture risk", "Tendonitis"],
                "legs": ["Leg pain", "Weakness"],
                "arms": ["Arm pain", "Tendon inflammation"]
            },
            
            # Pain & Anti-inflammatory
            "aspirin": {
                "blood": ["Bleeding risk", "Thinning"],
                "stomach": ["Gastric bleeding", "Ulcer risk", "Heartburn"],
                "kidneys": ["Kidney damage", "Reduced function"],
                "brain": ["Stroke prevention (benefit)", "Bleeding risk"]
            },
            "ibuprofen": {
                "kidneys": ["Kidney damage", "Fluid retention"],
                "stomach": ["Stomach ulcers", "Bleeding", "Nausea"],
                "liver": ["Elevated enzymes", "Hepatotoxicity"]
            },
            "paracetamol": {
                "liver": ["Liver damage", "Hepatotoxicity", "Overdose risk"]
            },
            "dolo": {
                "liver": ["Liver stress", "Enzyme elevation"],
                "head": ["Headache relief (benefit)"]
            },
            "dolo 650": {
                "liver": ["Liver stress", "Enzyme elevation"],
                "head": ["Headache relief (benefit)"]
            },
            "tramadol": {
                "brain": ["Dizziness", "Drowsiness", "Confusion", "Seizure risk"],
                "liver": ["Liver metabolism stress"],
                "stomach": ["Nausea", "Vomiting", "Constipation"]
            },
            
            # Cardiovascular
            "warfarin": {
                "blood": ["Bleeding risk", "Clotting prevention"],
                "liver": ["Liver metabolism"],
                "brain": ["Stroke prevention", "Bleeding risk"]
            },
            "lisinopril": {
                "kidneys": ["Kidney function changes", "Potassium retention"],
                "heart": ["Blood pressure reduction", "Heart protection"],
                "blood": ["Electrolyte imbalance"]
            },
            "amlodipine": {
                "heart": ["Heart rate reduction", "Blood pressure lowering"],
                "liver": ["Liver metabolism"],
                "legs": ["Swelling", "Edema"],
                "feet": ["Ankle swelling"]
            },
            "metoprolol": {
                "heart": ["Slowed heart rate", "Blood pressure reduction"],
                "lungs": ["Breathing difficulty", "Bronchospasm risk"],
                "brain": ["Dizziness", "Fatigue"]
            },
            
            # Cholesterol
            "simvastatin": {
                "liver": ["Liver enzyme elevation", "Hepatotoxicity"],
                "muscles": ["Muscle pain", "Myopathy", "Rhabdomyolysis risk"],
                "arms": ["Muscle weakness", "Pain"],
                "legs": ["Muscle cramps", "Weakness"]
            },
            "atorvastatin": {
                "liver": ["Liver stress", "Enzyme changes"],
                "muscles": ["Muscle pain", "Weakness"],
                "arms": ["Muscle aches"],
                "legs": ["Muscle cramps"]
            },
            
            # Diabetes
            "metformin": {
                "kidneys": ["Kidney stress", "Lactic acidosis risk"],
                "liver": ["Liver metabolism"],
                "intestines": ["Diarrhea", "Gas"],
                "stomach": ["Nausea", "Upset stomach", "Loss of appetite"]
            },
            "insulin": {
                "blood": ["Low blood sugar risk", "Hypoglycemia"],
                "liver": ["Glucose regulation"],
                "muscles": ["Glucose uptake"]
            },
            
            # Respiratory
            "albuterol": {
                "lungs": ["Bronchodilation (benefit)", "Tremors"],
                "heart": ["Rapid heartbeat", "Palpitations"],
                "chest_wall": ["Chest tightness relief"]
            },
            "montelukast": {
                "lungs": ["Asthma control", "Breathing improvement"],
                "brain": ["Mood changes", "Sleep disturbances"],
                "chest_wall": ["Reduced inflammation"]
            },
            
            # Gastrointestinal
            "omeprazole": {
                "stomach": ["Acid reduction", "Ulcer healing"],
                "liver": ["Liver metabolism"],
                "intestines": ["Diarrhea", "Constipation"]
            },
            
            # Neurological
            "gabapentin": {
                "brain": ["Dizziness", "Drowsiness", "Mood changes"],
                "kidneys": ["Kidney excretion"],
                "eyes": ["Blurred vision", "Double vision"]
            },
            "sertraline": {
                "brain": ["Mood improvement", "Anxiety reduction", "Sleep changes"],
                "liver": ["Liver metabolism"],
                "stomach": ["Nausea", "Appetite changes"]
            },
            "alprazolam": {
                "brain": ["Drowsiness", "Memory impairment", "Dependence risk"],
                "liver": ["Liver metabolism"]
            },
            
            # Diuretics
            "furosemide": {
                "kidneys": ["Increased urination", "Electrolyte loss"],
                "blood": ["Dehydration risk", "Low potassium"],
                "ears": ["Hearing loss risk", "Tinnitus"]
            },
        }
        
        # Region categories for symptom-based mapping
        self.region_categories = {
            # Head & Sensory
            "head": ["headache", "migraine", "tension"],
            "brain": ["cognitive", "memory", "seizure", "stroke"],
            "eyes": ["vision", "glaucoma", "dry eyes"],
            "ears": ["hearing", "tinnitus", "vertigo"],
            "neck": ["throat", "thyroid", "swallowing"],
            
            # Torso
            "chest_wall": ["chest pain", "breathing difficulty"],
            "heart": ["cardiac", "arrhythmia", "angina"],
            "lungs": ["respiratory", "asthma", "copd", "pneumonia"],
            "upper_back": ["back pain", "posture"],
            "lower_back": ["lumbar pain", "sciatica"],
            
            # Upper Limbs
            "shoulders": ["shoulder pain", "rotator cuff"],
            "arm_left": ["arm pain", "weakness"],
            "arm_right": ["arm pain", "weakness"],
            "hand_left": ["hand pain", "arthritis", "carpal tunnel"],
            "hand_right": ["hand pain", "arthritis", "carpal tunnel"],
            
            # Abdomen
            "abdomen": ["abdominal pain", "bloating"],
            "stomach": ["gastritis", "ulcer", "nausea"],
            "liver": ["hepatitis", "cirrhosis", "jaundice"],
            "kidney_left": ["kidney stones", "infection"],
            "kidney_right": ["kidney stones", "infection"],
            "intestines": ["diarrhea", "constipation", "ibs"],
            "pelvis": ["pelvic pain"],
            
            # Lower Limbs
            "leg_left": ["leg pain", "dvt", "edema"],
            "leg_right": ["leg pain", "dvt", "edema"],
            "foot_left": ["foot pain", "gout", "neuropathy"],
            "foot_right": ["foot pain", "gout", "neuropathy"],
            
            # Female-specific
            "uterus": ["menstrual", "pregnancy", "endometriosis"],
            "ovary_left": ["ovarian", "pcos"],
            "ovary_right": ["ovarian", "pcos"],
        }
        
        # Default regions for unknown drugs (generic impact)
        self.default_regions = ["liver", "kidneys", "stomach"]
        
        # All supported regions
        self.all_regions = [
            "head", "brain", "eyes", "ears", "neck",
            "chest_wall", "heart", "lungs", "upper_back", "lower_back",
            "shoulders", "arm_left", "arm_right", "hand_left", "hand_right",
            "abdomen", "stomach", "liver", "kidney_left", "kidney_right", "intestines", "pelvis",
            "leg_left", "leg_right", "foot_left", "foot_right",
            "uterus", "ovary_left", "ovary_right"
        ]
    
    def get_affected_regions(self, drug_name: str) -> list:
        """
        Get list of body regions affected by a drug
        Returns default regions if drug is unknown
        """
        drug = drug_name.lower().strip()
        
        # Direct lookup
        if drug in self.drug_mapping:
            return self.drug_mapping[drug]
        
        # Partial match (e.g., "dolo 650" contains "dolo")
        for known_drug, regions in self.drug_mapping.items():
            if known_drug in drug or drug in known_drug:
                return regions
        
        # Unknown drug - return default regions
        return self.default_regions
    
    def get_region_severity(self, drug_name: str, region: str, base_severity: float = 0.5) -> float:
        """
        Calculate severity score for a specific region
        Returns 0 if region not affected, base_severity if affected
        """
        affected_regions = self.get_affected_regions(drug_name)
        
        if region in affected_regions:
            return base_severity
        
        return 0.0
    
    def get_region_symptoms(self, drug_name: str, region: str) -> list:
        """
        Get list of symptoms for a specific drug affecting a specific region
        Returns empty list if no symptoms defined
        """
        drug = drug_name.lower().strip()
        
        # Direct lookup
        if drug in self.symptom_mapping:
            drug_symptoms = self.symptom_mapping[drug]
            if region in drug_symptoms:
                return drug_symptoms[region]
        
        # Partial match
        for known_drug, symptoms_dict in self.symptom_mapping.items():
            if known_drug in drug or drug in known_drug:
                if region in symptoms_dict:
                    return symptoms_dict[region]
        
        # Default generic symptoms if region is affected but no specific symptoms defined
        affected_regions = self.get_affected_regions(drug_name)
        if region in affected_regions:
            return ["Potential side effects", "Monitor for changes"]
        
        return []
    
    def get_all_regions(self) -> list:
        """Return list of all supported body regions"""
        return self.all_regions.copy()

# Global instance
region_mapper = RegionMapper()
