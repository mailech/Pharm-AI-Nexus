import networkx as nx
import pandas as pd
from .config import DDINTER_PATH
import random

class GraphBuilder:
    def __init__(self):
        self.graph = nx.Graph()
        self.load_data()

    def load_data(self):
        """Loads data from CSV if available. Graph builder is now optional - main analysis uses region_mapper."""
        if DDINTER_PATH.exists():
            try:
                df = pd.read_csv(DDINTER_PATH)
                # Normalize column names
                df.columns = [c.strip() for c in df.columns]
                
                # Simple mapping if columns are different, try to find drug columns
                cols = df.columns.tolist()
                drug_a_col = next((c for c in cols if 'drug' in c.lower() and '1' in c), cols[0])
                drug_b_col = next((c for c in cols if 'drug' in c.lower() and '2' in c), cols[1])
                level_col = next((c for c in cols if 'level' in c.lower()), None)
                
                for _, row in df.iterrows():
                    d1 = str(row[drug_a_col]).strip().lower()
                    d2 = str(row[drug_b_col]).strip().lower()
                    severity = str(row[level_col]) if level_col else "Unknown"
                    
                    self.graph.add_edge(d1, d2, severity=severity, type="interaction")
                    
                print(f"✓ Loaded {len(self.graph.nodes)} drugs and {len(self.graph.edges)} interactions from CSV")
                
            except Exception as e:
                print(f"⚠ Error loading CSV: {e}. Using region_mapper for dynamic analysis.")
        else:
            print(f"ℹ No CSV dataset found. Using region_mapper for dynamic drug analysis.")


    def generate_mock_data(self):
        """Generates a realistic-looking interaction graph for demo purposes."""
        common_drugs = [
            "aspirin", "warfarin", "ibuprofen", "acetaminophen", "lisinopril", 
            "simvastatin", "metformin", "amoxicillin", "omeprazole", "losartan",
            "atorvastatin", "levothyroxine", "amlodipine", "metoprolol", "gabapentin",
            "dolo 650", "ciprofloxacin", "azithromycin", "sertraline", "fluoxetine", "alprazolam",
            "monocef", "cefotaxime", "erithromycin", "erythromycin", "doxycycline",
            "tramadol", "naproxen", "prednisone", "furosemide", "clopidogrel"
        ]
        
        # Add nodes
        self.graph.add_nodes_from(common_drugs)
        
        # Add known risky pairs
        risky_pairs = [
            ("warfarin", "aspirin", "Major"),
            ("warfarin", "ibuprofen", "Major"),
            ("lisinopril", "losartan", "Moderate"),
            ("simvastatin", "amlodipine", "Moderate"),
            ("metformin", "lisinopril", "Minor"),
            ("aspirin", "dolo 650", "Moderate"),
            ("metformin", "dolo 650", "Minor"),
            ("monocef", "aspirin", "Moderate"),
            ("erithromycin", "aspirin", "Moderate"),
            ("monocef", "erithromycin", "Minor"),
            ("erithromycin", "warfarin", "Major"),
            ("ciprofloxacin", "warfarin", "Major"),
            ("tramadol", "sertraline", "Major"),
        ]
        
        for d1, d2, sev in risky_pairs:
            self.graph.add_edge(d1, d2, severity=sev, type="interaction")
            
        # Add some random connections for graph density
        for _ in range(20):
            d1, d2 = random.sample(common_drugs, 2)
            if not self.graph.has_edge(d1, d2) and d1 != d2:
                self.graph.add_edge(d1, d2, severity="Unknown", type="potential")

    def get_subgraph(self, drugs):
        """Returns a subgraph containing only the specified drugs and their direct interactions."""
        normalized_drugs = [d.strip().lower() for d in drugs]
        # Filter for drugs that exist in the graph
        valid_drugs = [d for d in normalized_drugs if d in self.graph]
        return self.graph.subgraph(valid_drugs)

    def check_interaction(self, drug_a, drug_b):
        """Checks if there is an edge between two drugs."""
        d1 = drug_a.strip().lower()
        d2 = drug_b.strip().lower()
        
        if self.graph.has_edge(d1, d2):
            return self.graph[d1][d2]
        return None

# Singleton
drug_graph = GraphBuilder()
