import os
from typing import List, Dict

# Try to import langchain dependencies, fall back to mock mode if unavailable
try:
    from langchain_ollama import ChatOllama  # NEW - Free local LLM
    from langchain_google_genai import ChatGoogleGenerativeAI # NEW - Free Gemini API
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain_core.documents import Document  # FIXED: Updated from deprecated langchain.schema
    from langchain_core.prompts import PromptTemplate  # FIXED: Updated import
    from langchain.chains.llm import LLMChain  # FIXED: More specific import path
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    print(f"✓ LangChain in MOCK mode (using region_mapper for analysis): {e}")
    LANGCHAIN_AVAILABLE = False

from .config import OPENAI_API_KEY, GEMINI_API_KEY

class RAGPipeline:
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        self.gemini_key = GEMINI_API_KEY
        self.llm = None
        self.vector_store = None
        self.initialized = False
        self.use_ollama = True  # Prefer Ollama by default
        
        if LANGCHAIN_AVAILABLE:
            try:
                self.initialize_rag()
            except Exception as e:
                print(f"Failed to initialize RAG: {e}")
        else:
            print("LangChain dependencies not available. RAG pipeline will run in MOCK mode.")

    def initialize_rag(self):
        """Initializes the LLM and Vector Store using Ollama or Gemini"""
        try:
            # Try Ollama first (FREE local LLM)
            self.llm = ChatOllama(
                model="llama3.1:8b",  # Using user's installed model
                temperature=0.3,
                base_url="http://localhost:11434"  # Default Ollama port
            )
            print("✓ Ollama LLM initialized successfully (FREE local model: llama3.1:8b)")
            self.use_ollama = True
        except Exception as e:
            print(f"Ollama not available: {e}")
            
            # Fallback to Gemini (Free Tier)
            if self.gemini_key:
                try:
                    self.llm = ChatGoogleGenerativeAI(
                        model="gemini-pro",
                        google_api_key=self.gemini_key,
                        temperature=0.3
                    )
                    print("✓ Gemini LLM initialized successfully (Free Tier)")
                    self.use_ollama = False
                except Exception as e_gemini:
                    print(f"Gemini initialization failed: {e_gemini}")
                    # Fallback to OpenAI if API key exists
                    if self.api_key:
                        try:
                            self.llm = ChatOpenAI(temperature=0.3, model_name="gpt-3.5-turbo", openai_api_key=self.api_key)
                            print("Using OpenAI as fallback")
                            self.use_ollama = False
                        except Exception as e2:
                            print(f"OpenAI also failed: {e2}. Using MOCK mode.")
                            return
                    else:
                        print("No API key and Ollama unavailable. Using MOCK mode.")
                        return
            elif self.api_key:
                 try:
                    self.llm = ChatOpenAI(temperature=0.3, model_name="gpt-3.5-turbo", openai_api_key=self.api_key)
                    print("Using OpenAI as fallback")
                    self.use_ollama = False
                 except Exception as e2:
                    print(f"OpenAI also failed: {e2}. Using MOCK mode.")
                    return
            else:
                print("No API key and Ollama unavailable. Using MOCK mode.")
                return
        
        # Medical knowledge base
        texts = [
            "Warfarin and Aspirin: Co-administration increases the risk of bleeding because both drugs affect blood clotting mechanisms. Warfarin inhibits Vitamin K dependent factors, while Aspirin inhibits platelet aggregation.",
            "Lisinopril and Losartan: Dual blockade of the renin-angiotensin-aldosterone system (RAAS) is generally not recommended due to increased risk of hypotension, hyperkalemia, and renal failure.",
            "Simvastatin and Amlodipine: Amlodipine can inhibit the metabolism of Simvastatin via CYP3A4, leading to increased Simvastatin levels and risk of myopathy or rhabdomyolysis.",
            "Metformin and Lisinopril: Generally safe, but monitor renal function as both can affect the kidneys in rare cases.",
            "Ibuprofen and Warfarin: NSAIDs like Ibuprofen can displace Warfarin from protein binding sites and cause gastric erosion, significantly increasing bleeding risk.",
            "Monocef (Cefotaxime): A cephalosporin antibiotic. May cause kidney stress, GI upset. Monitor renal function.",
            "Erithromycin: A macrolide antibiotic. Can prolong QT interval affecting heart rhythm. May cause liver enzyme elevation and GI side effects."
        ]
        
        self.medical_knowledge = texts
        self.initialized = True
        print("RAG Pipeline initialized successfully.")

    def get_explanation(self, drug_a, drug_b, severity):
        """Generates an explanation for the interaction."""
        if not self.initialized:
            return self.mock_explanation(drug_a, drug_b, severity)
            
        try:
            # Simple context retrieval from medical knowledge
            context = "\n".join([t for t in self.medical_knowledge if drug_a.lower() in t.lower() or drug_b.lower() in t.lower()])
            if not context:
                context = "No specific interaction data found in database."
            
            # Prompt
            template = """
            You are a clinical pharmacist. Explain the interaction between {drug_a} and {drug_b}.
            Severity: {severity}
            
            Context from medical database:
            {context}
            
            Please provide:
            1. Mechanism: A technical explanation of why they interact.
            2. Patient: A simple explanation for a non-expert.
            3. Alternatives: 1-2 safer alternatives if applicable (or say "Consult doctor").
            
            Format as JSON with keys: mechanism, patient, alternatives (list).
            """
            
            prompt = PromptTemplate(template=template, input_variables=["drug_a", "drug_b", "severity", "context"])
            chain = LLMChain(llm=self.llm, prompt=prompt)
            
            response = chain.run(drug_a=drug_a, drug_b=drug_b, severity=severity, context=context)
            
            # Parse JSON
            import json
            try:
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                    return json.loads(json_str)
                else:
                    raise ValueError("No JSON found")
            except:
                return {
                    "mechanism": response,
                    "patient": "See mechanism.",
                    "alternatives": ["Consult healthcare provider"]
                }
                
        except Exception as e:
            print(f"RAG Error: {e}")
            return self.mock_explanation(drug_a, drug_b, severity)

    def mock_explanation(self, drug_a, drug_b, severity):
        """Fallback mock response."""
        return {
            "mechanism": f"Potential pharmacodynamic or pharmacokinetic interaction between {drug_a} and {drug_b}.",
            "patient": f"Taking {drug_a} and {drug_b} together might cause side effects. Please check with your doctor.",
            "alternatives": ["Consult healthcare provider"]
        }

    def agent_chat(self, message, context_str):
        """Handles conversational queries from the Nexus agent."""
        if not self.initialized:
            return self.mock_agent_chat(message, context_str)
            
        template = """You are Nexus, a professional medical assistant specializing in medication safety and drug interactions.

Your role:
- Provide clear, accurate medical information about medications
- Explain drug interactions and risks in patient-friendly language
- Suggest when to consult healthcare providers
- Answer questions about medications, side effects, and safety

IMPORTANT INSTRUCTIONS:
1. **Context Awareness**: Use the provided patient context (current drugs, organ impacts, risks) to tailor your answer.
2. **Specific Drugs**: If the user asks about a specific drug (e.g., "Warfarin"), focus on that drug but mention relevant interactions with their other medications.
3. **Structure**: Format your response with these clear sections:
   - **Usage**: 1-2 sentences on what the drug/combination is used for.
   - **Common Side Effects**: A short bulleted list of common, manageable side effects.
   - **Serious Risks & Warnings**: Highlight serious risks, especially those related to the user's high-risk organs (from context) or major interactions.
   - **How to Reduce Risk**: Actionable mitigation steps (e.g., "Take with food", "Avoid alcohol", "Monitor BP").
   - **Disclaimer**: A brief medical disclaimer at the very end.

4. **Tone**: Professional, empathetic, and concise.
5. **Prohibitions**: NEVER mention you are an AI, LLM, or language model.

Current Patient Context:
{context}

Patient Question: {message}

Provide a structured, helpful response following the format above."""
        
        try:
            prompt = PromptTemplate(template=template, input_variables=["message", "context"])
            chain = LLMChain(llm=self.llm, prompt=prompt)
            response = chain.run(message=message, context=context_str)
            
            # Remove any self-referential AI mentions that might slip through
            response = response.replace("as an AI", "").replace("As an AI", "")
            response = response.replace("I'm an AI", "I'm a medical assistant")
            response = response.replace("AI model", "medical system")
            response = response.replace("language model", "medical assistant")
            response = response.replace("Ollama", "").replace("ollama", "")
            response = response.replace("LLM", "").replace("llm", "")
            
            return response.strip()
        except Exception as e:
            return "I'm having trouble processing your request right now. Please try rephrasing your question or consult your healthcare provider for immediate assistance."

    def mock_agent_chat(self, message, context_str):
        """Mock response for agent chat - acts as professional medical assistant."""
        msg = message.lower()
        
        # Mock Knowledge Base
        mock_drug_data = {
            "warfarin": {
                "usage": "Warfarin is an anticoagulant (blood thinner) used to prevent and treat blood clots.",
                "side_effects": ["Bleeding gums", "Bruising easily", "Nosebleeds", "Prolonged bleeding from cuts"],
                "risks": "Major bleeding events, especially when combined with other blood thinners or NSAIDs.",
                "mitigation": "Regular INR monitoring, avoid alcohol, consistent Vitamin K intake."
            },
            "aspirin": {
                "usage": "Aspirin is used to reduce pain, fever, inflammation, and prevent blood clots.",
                "side_effects": ["Stomach upset", "Heartburn", "Nausea"],
                "risks": "Stomach ulcers, GI bleeding, increased bleeding risk.",
                "mitigation": "Take with food, avoid alcohol, monitor for stomach pain."
            },
            "ibuprofen": {
                "usage": "Ibuprofen is an NSAID used for pain relief, fever reduction, and inflammation.",
                "side_effects": ["Stomach pain", "Heartburn", "Dizziness"],
                "risks": "Stomach bleeding, kidney stress, increased heart attack risk with long-term use.",
                "mitigation": "Take with food/milk, stay hydrated, avoid long-term use without advice."
            },
            "metformin": {
                "usage": "Metformin is used to treat type 2 diabetes by controlling blood sugar levels.",
                "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
                "risks": "Lactic acidosis (rare but serious), Vitamin B12 deficiency.",
                "mitigation": "Take with meals to reduce GI upset, monitor kidney function."
            },
            "lisinopril": {
                "usage": "Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure.",
                "side_effects": ["Dry cough", "Dizziness", "Headache"],
                "risks": "Hyperkalemia (high potassium), kidney function changes.",
                "mitigation": "Monitor blood pressure and kidney function regularly."
            },
            "amoxicillin": {
                "usage": "Amoxicillin is a penicillin antibiotic used to treat bacterial infections.",
                "side_effects": ["Nausea", "Rash", "Diarrhea"],
                "risks": "Severe allergic reactions (anaphylaxis), antibiotic-associated colitis.",
                "mitigation": "Complete full course, take with food if stomach upset occurs."
            },
             "dolo": {
                "usage": "Dolo (Paracetamol) is used for fever reduction and mild to moderate pain relief.",
                "side_effects": ["Nausea", "Allergic reactions (rare)"],
                "risks": "Liver damage if taken in overdose.",
                "mitigation": "Do not exceed recommended dose, avoid alcohol."
            }
        }

        # Extract medication info from context
        drugs_mentioned = []
        if "taking:" in context_str.lower():
            import re
            matches = re.findall(r'taking:\s*([^.]+)', context_str.lower())
            if matches:
                drugs_mentioned = [d.strip() for d in matches[0].split(',')]
        
        # Check for direct drug interaction queries
        known_drugs = list(mock_drug_data.keys()) + ["paracetamol", "ciprofloxacin", "monocef", "erithromycin", "azithromycin"]
        found_drugs = [d for d in known_drugs if d in msg]
        
        # 1. Interaction Query (2+ drugs)
        if len(found_drugs) >= 2 or (" and " in msg and len(found_drugs) >= 1):
             return f"I notice you're asking about {', '.join(found_drugs) if found_drugs else 'multiple medications'}. When combining these types of medications, there can be potential interactions affecting efficacy or safety. I recommend checking the specific interaction details in the dashboard or consulting your healthcare provider for a personalized risk assessment."

        # 2. Single Drug Query (Specific Info)
        if len(found_drugs) == 1:
            drug = found_drugs[0]
            info = mock_drug_data.get(drug)
            if info:
                return f"""**Usage**: {info['usage']}

**Common Side Effects**:
{chr(10).join(['- ' + s for s in info['side_effects']])}

**Serious Risks & Warnings**:
{info['risks']}

**How to Reduce Risk**:
{info['mitigation']}

**Disclaimer**: This is general information and not a substitute for medical advice. Please consult your healthcare provider."""

        # 3. Symptom/Condition Queries
        if "serious" in msg or "severe" in msg or "emergency" in msg:
            return "If you are experiencing severe symptoms, please seek immediate medical attention or go to the nearest emergency room. Do not rely on this chat for emergency medical advice."

        if "headache" in msg or "head ache" in msg:
            return "For a headache, common over-the-counter options include Acetaminophen (Tylenol) or Ibuprofen (Advil). However, since you are taking other medications, please check the 'Interactions' tab to ensure these are safe for you. If the headache is severe or sudden, consult a doctor."
        
        if "fever" in msg or "temperature" in msg:
            return "For fever, Paracetamol (Acetaminophen) is commonly used. Ensure you stay hydrated. If fever persists above 102°F (39°C) or lasts more than 3 days, consult a doctor immediately."
            
        if "stomach" in msg and ("pain" in msg or "ache" in msg or "upset" in msg or "cramps" in msg):
            return "Stomach issues can be a common side effect of medications (especially NSAIDs or Metformin). \n\n**Recommendations:**\n- Try taking your medication with food.\n- Avoid spicy or acidic foods.\n- If you need relief, antacids might help, but check for interactions first.\n\nIf the pain is severe, persistent, or accompanied by other symptoms, please see a doctor."

        if "what medicine" in msg or "what should i take" in msg:
             return "I cannot prescribe new medications, but I can suggest checking the **'Recommended Actions'** section in the Graph tab for safer alternatives identified by the analysis. For common ailments, over-the-counter remedies might be appropriate, but always verify with your pharmacist given your current prescription list."

        # 4. General Risk/Safety Queries
        if "risk" in msg or "safe" in msg or "danger" in msg:
            if "0.8" in context_str or "0.9" in context_str or "1.0" in context_str or "high" in context_str.lower():
                return "Based on your current medication profile, I've identified some significant interaction risks. These medications may affect each other's effectiveness or increase the risk of side effects. I strongly recommend consulting your doctor or pharmacist before continuing this combination."
            else:
                return "Your current medication combination appears to have manageable risks. However, it's important to monitor for any unusual symptoms and report them to your healthcare provider. Always take medications as prescribed."
        
        # 5. Logistics
        elif "hospital" in msg or "doctor" in msg or "clinic" in msg:
            return "I can help you find nearby medical facilities. Based on your location, I've identified several options. Would you like me to provide more details or help you schedule an appointment?"
        
        elif "book" in msg or "appointment" in msg:
            return "I can assist with appointment scheduling. Please select a facility from the list, and I'll help you book a convenient time slot."
        
        # 6. General Fallback
        else:
            return f"I understand you have a question about your health. While I can provide general information, for specific medical advice, please consult your healthcare provider. \n\nYou can ask me about:\n- **Side effects** of your drugs\n- **Interactions** between your medications\n- **Risks** associated with your current prescription"


    def analyze_prescription(self, file_contents):
        """
        Analyzes prescription image (Mock).
        In real implementation, this would use OCR/Vision API.
        """
        # Mock detected drugs
        detected_drugs = ["Amoxicillin", "Ibuprofen"]
        
        return {
            "detected_drugs": detected_drugs,
            "summary": "Prescription analyzed. Detected: Amoxicillin (Antibiotic) and Ibuprofen (Pain reliever).",
            "confidence": 0.95
        }

# Singleton
rag = RAGPipeline()
