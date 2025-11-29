import networkx as nx
from node2vec import Node2Vec
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from .graph_builder import drug_graph
from .config import EMBEDDING_DIM, WALK_LENGTH, NUM_WALKS, WORKERS

class InteractionPredictor:
    def __init__(self):
        self.graph = drug_graph.graph
        self.model = None
        self.embeddings = {}
        self.is_trained = False

    def train(self):
        """Trains Node2Vec model on the current graph."""
        if len(self.graph.nodes) < 5:
            print("Graph too small for meaningful training. Skipping.")
            return

        print("Training Node2Vec model...")
        # Precompute probabilities and generate walks
        node2vec = Node2Vec(
            self.graph, 
            dimensions=EMBEDDING_DIM, 
            walk_length=WALK_LENGTH, 
            num_walks=NUM_WALKS, 
            workers=WORKERS,
            quiet=True
        )
        
        # Embed nodes
        self.model = node2vec.fit(window=10, min_count=1, batch_words=4)
        
        # Store embeddings in memory
        for node in self.graph.nodes():
            if node in self.model.wv:
                self.embeddings[node] = self.model.wv[node]
                
        self.is_trained = True
        print("Node2Vec training complete.")

    def predict(self, drug_a, drug_b):
        """Predicts interaction probability between two drugs."""
        d1 = drug_a.strip().lower()
        d2 = drug_b.strip().lower()
        
        # If known interaction
        if self.graph.has_edge(d1, d2):
            return {
                "known": True,
                "score": 1.0,
                "comment": "Known interaction found in database."
            }
            
        # If not trained or nodes missing
        if not self.is_trained or d1 not in self.embeddings or d2 not in self.embeddings:
            return {
                "known": False,
                "score": 0.0,
                "comment": "Insufficient data for prediction."
            }
            
        # Calculate cosine similarity
        vec1 = self.embeddings[d1].reshape(1, -1)
        vec2 = self.embeddings[d2].reshape(1, -1)
        similarity = cosine_similarity(vec1, vec2)[0][0]
        
        # Normalize -1 to 1 -> 0 to 1 (roughly)
        score = (similarity + 1) / 2
        
        comment = "Low risk predicted."
        if score > 0.7:
            comment = "High similarity to interacting pairs. Potential risk."
        elif score > 0.4:
            comment = "Moderate similarity. Monitor closely."
            
        return {
            "known": False,
            "score": float(score),
            "comment": comment
        }

# Singleton
predictor = InteractionPredictor()
# Optional: Train on startup? 
# For a hackathon demo, maybe train on first request or background task.
# We'll trigger it manually or let the app trigger it.
