class OrganMapper:
    def __init__(self):
        # Simple heuristic mapping for demo
        self.mapping = {
            "warfarin": ["blood", "liver"],
            "aspirin": ["blood", "stomach"],
            "ibuprofen": ["kidneys", "stomach"],
            "acetaminophen": ["liver"],
            "lisinopril": ["kidneys", "heart"],
            "losartan": ["kidneys", "heart"],
            "simvastatin": ["liver", "muscle"],
            "atorvastatin": ["liver"],
            "metformin": ["kidneys", "liver"],
            "amoxicillin": ["kidneys", "skin"],
            "omeprazole": ["stomach"],
            "metoprolol": ["heart"],
            "gabapentin": ["brain", "kidneys"],
            "levothyroxine": ["thyroid", "heart"],
            "amlodipine": ["heart", "liver"],
            "ciprofloxacin": ["kidneys", "tendons"],
            "azithromycin": ["heart", "liver"],
            "sertraline": ["brain", "liver"],
            "fluoxetine": ["brain", "liver"],
            "naproxen": ["stomach", "kidneys"],
            "tramadol": ["brain", "liver"],
            "clopidogrel": ["blood", "liver"],
            "furosemide": ["kidneys", "blood"],
            "prednisone": ["immune_system", "bones"],
            "albuterol": ["lungs", "heart"],
            "pantoprazole": ["stomach"],
            "montelukast": ["lungs", "brain"],
            "fluticasone": ["lungs"],
            "alprazolam": ["brain", "liver"],
            "clonazepam": ["brain", "liver"]
        }
        
        self.default_organs = ["liver", "kidneys"]

    def get_affected_organs(self, drug_name):
        drug = drug_name.lower().strip()
        return self.mapping.get(drug, self.default_organs)

organ_mapper = OrganMapper()
