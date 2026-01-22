from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

# Create FastAPI app
app = FastAPI(title="Smart Agriculture API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pest_nb_pipeline.joblib")
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    model = None
    print(f"Warning: Model file not found at {MODEL_PATH}")

class PestInput(BaseModel):
    temp_avg: float
    humidity: float
    rainfall_mm: float
    crop_type: str
    growth_stage: str
    prev_pest_incidence: float

@app.get("/")
def read_root():
    return {"message": "Smart Agriculture API"}

@app.get("/profile")
def get_profile():
    return {"profile": "user_data"}

@app.post("/predict")
def predict_pest_risk(data: PestInput):
    print("predct from api_nb is being called:: ")
    if model is None:
        return {"error": "Model not loaded"}
    
    try:
        df = pd.DataFrame([data.dict()])
        prediction = model.predict(df)[0]
        return {"risk_level": prediction}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}