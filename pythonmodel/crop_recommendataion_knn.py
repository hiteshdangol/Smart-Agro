from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import warnings
import uvicorn
warnings.filterwarnings('ignore')

# Pydantic models for request/response validation
class CropInput(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (0-200)")
    P: float = Field(..., ge=0, le=150, description="Phosphorous content (0-150)")
    K: float = Field(..., ge=0, le=100, description="Potassium content (0-100)")
    temperature: float = Field(..., ge=0, le=50, description="Temperature in Celsius (0-50)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage (0-100)")
    ph: float = Field(..., ge=3, le=10, description="pH value of soil (3-10)")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm (0-500)")

class CropProbability(BaseModel):
    crop: str
    probability: float

class CropRecommendation(BaseModel):
    predicted_crop: str
    confidence: float
    top_recommendations: List[CropProbability]
    all_probabilities: List[CropProbability]
    input_conditions: CropInput
    growing_tips: List[str]

class SimilarCondition(BaseModel):
    crop: str
    distance: float
    conditions: Dict[str, float]

class PredictionResponse(BaseModel):
    success: bool
    prediction: CropRecommendation
    similar_conditions: List[SimilarCondition]
    message: str

class RetrainRequest(BaseModel):
    model_type: Optional[str] = Field(default="random_forest", description="Model type: 'random_forest', 'naive_bayes', or 'svm'")

class RetrainResponse(BaseModel):
    success: bool
    accuracy: float
    model_type: str
    message: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    scaler_fitted: bool
    feature_names: List[str]
    available_crops: List[str]
    total_crops: int

class ModelInfo(BaseModel):
    service: str
    feature_names: List[str]
    available_crops: List[str]
    total_crops: int
    input_format: Dict[str, str]
    example_request: CropInput

# Initialize FastAPI app
app = FastAPI(
    title="Crop Recommendation System",
    description="AI-powered crop recommendation system based on soil and environmental conditions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropRecommendationSystem:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        self.crop_names = []
        
    def load_dataset(self, filepath='Crop_recommendation copy.csv'):
        """Load the crop recommendation dataset"""
        try:
            if os.path.exists(filepath):
                df = pd.read_csv(filepath)
                print(f"✅ Loaded dataset with {len(df)} samples")
                print(f"✅ Available crops: {sorted(df['label'].unique().tolist())}")
                print(f"✅ Dataset shape: {df.shape}")
                print(f"✅ Dataset columns: {df.columns.tolist()}")
                
                # Check for missing values
                if df.isnull().sum().sum() > 0:
                    print(f"⚠️ Missing values found: {df.isnull().sum()}")
                    df = df.dropna()
                    print(f"✅ After removing missing values: {len(df)} samples")
                
                return df
            else:
                raise FileNotFoundError(f"Dataset file '{filepath}' not found!")
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            raise e
    
    def train_model(self, model_type='random_forest'):
        """Train the crop recommendation model"""
        # Load dataset
        df = self.load_dataset()
        
        # Features and target
        X = df[self.feature_names]
        y = df['label']
        
        # Store unique crop names
        self.crop_names = sorted(y.unique().tolist())
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Choose and train model
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100, 
                random_state=42, 
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2
            )
        elif model_type == 'naive_bayes':
            self.model = GaussianNB()
        elif model_type == 'svm':
            self.model = SVC(kernel='rbf', probability=True, random_state=42)
        else:
            raise ValueError("Model type must be 'random_forest', 'naive_bayes', or 'svm'")
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Test accuracy
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"✅ {model_type.upper()} model trained with accuracy: {accuracy:.3f}")
        print(f"✅ Total crops in dataset: {len(self.crop_names)}")
        
        # Feature importance (for Random Forest)
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': self.feature_names,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            print("\n📊 Feature Importance:")
            for _, row in feature_importance.iterrows():
                print(f"   {row['feature']}: {row['importance']:.3f}")
        
        return accuracy
    
    def predict_crop(self, input_data: CropInput):
        """Predict the best crop for given conditions"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Convert input to DataFrame with correct feature names
        input_features = [
            input_data.N,
            input_data.P, 
            input_data.K,
            input_data.temperature,
            input_data.humidity,
            input_data.ph,
            input_data.rainfall
        ]
        
        input_df = pd.DataFrame([input_features], columns=self.feature_names)
        
        # Scale input
        input_scaled = self.scaler.transform(input_df)
        
        # Predict
        prediction_encoded = self.model.predict(input_scaled)[0]
        predicted_crop = self.label_encoder.inverse_transform([prediction_encoded])[0]
        
        # Get prediction probabilities
        if hasattr(self.model, 'predict_proba'):
            prediction_proba = self.model.predict_proba(input_scaled)[0]
            
            # Create crop probabilities list
            crop_probabilities = []
            for i, crop in enumerate(self.crop_names):
                crop_encoded = self.label_encoder.transform([crop])[0]
                # Find the index of this crop in the model's classes
                crop_index = np.where(self.model.classes_ == crop_encoded)[0]
                if len(crop_index) > 0:
                    prob = prediction_proba[crop_index[0]] * 100
                    crop_probabilities.append(CropProbability(
                        crop=crop,
                        probability=round(prob, 2)
                    ))
            
            # Sort by probability (highest first)
            crop_probabilities.sort(key=lambda x: x.probability, reverse=True)
            
            # Get top 5 recommendations
            top_recommendations = crop_probabilities[:5]
            
            # Get confidence (highest probability)
            confidence = max(prediction_proba) * 100
        else:
            # For models without probability prediction
            top_recommendations = [CropProbability(crop=predicted_crop, probability=100.0)]
            confidence = 100.0
            crop_probabilities = top_recommendations
        
        return CropRecommendation(
            predicted_crop=predicted_crop,
            confidence=round(confidence, 2),
            top_recommendations=top_recommendations,
            all_probabilities=crop_probabilities[:10],  # Top 10
            input_conditions=input_data,
            growing_tips=self._get_growing_tips(predicted_crop, input_data)
        )
    
    def _get_growing_tips(self, crop, input_data: CropInput):
        """Get growing tips based on predicted crop and conditions"""
        tips = []
        
        # Crop-specific tips
        crop_tips = {
            'rice': [
                "🌾 Ensure adequate water supply - rice needs flooded fields",
                "🌡️ Optimal temperature range: 20-35°C",
                "💧 Maintain 80-85% humidity during growing season",
                "🌱 Plant during monsoon season for best results"
            ],
            'wheat': [
                "🌾 Plant in well-drained soil",
                "❄️ Requires cool weather during growth",
                "☀️ Needs full sunlight exposure",
                "💧 Moderate water requirements"
            ],
            'cotton': [
                "🌡️ Requires warm weather (21-30°C)",
                "☀️ Needs plenty of sunlight",
                "💧 Deep, well-drained soil preferred",
                "🐛 Regular pest monitoring essential"
            ],
            'maize': [
                "🌽 Plant after last frost date",
                "💧 Regular watering needed",
                "🌱 Requires nitrogen-rich soil",
                "☀️ Full sun exposure essential"
            ],
            'sugarcane': [
                "🌡️ Thrives in hot, humid climate",
                "💧 High water requirement",
                "🌱 Rich, well-drained soil needed",
                "⏰ Long growing season (10-18 months)"
            ]
        }
        
        # Add crop-specific tips if available
        if crop in crop_tips:
            tips.extend(crop_tips[crop])
        else:
            tips.extend([
                f"🌱 {crop.title()} is recommended for your conditions",
                "📚 Research specific growing requirements",
                "🌡️ Monitor temperature and humidity regularly",
                "💧 Ensure proper irrigation"
            ])
        
        # Condition-specific tips
        if input_data.temperature > 30:
            tips.append("🌡️ High temperature - ensure adequate shade/cooling")
        elif input_data.temperature < 15:
            tips.append("❄️ Low temperature - consider greenhouse cultivation")
        
        if input_data.humidity > 85:
            tips.append("💧 High humidity - watch for fungal diseases")
        elif input_data.humidity < 50:
            tips.append("🏜️ Low humidity - increase irrigation frequency")
        
        if input_data.ph < 6.0:
            tips.append("🧪 Acidic soil - consider lime application")
        elif input_data.ph > 8.0:
            tips.append("🧪 Alkaline soil - may need sulfur amendment")
        
        if input_data.rainfall > 300:
            tips.append("🌧️ High rainfall - ensure proper drainage")
        elif input_data.rainfall < 50:
            tips.append("🏜️ Low rainfall - irrigation system essential")
        
        # Nutrient tips
        if input_data.N < 30:
            tips.append("🌱 Low nitrogen - consider nitrogen fertilizer")
        if input_data.P < 20:
            tips.append("🌱 Low phosphorus - add phosphate fertilizer")
        if input_data.K < 20:
            tips.append("🌱 Low potassium - potash application recommended")
        
        return tips
    
    def get_similar_conditions(self, input_data: CropInput, n_similar=5):
        """Find crops that grow in similar conditions"""
        try:
            df = self.load_dataset()
            
            # Convert input_data to dict for easier access
            input_dict = input_data.model_dump()
            
            # Calculate similarity based on all features
            similarities = []
            for _, row in df.iterrows():
                # Calculate Euclidean distance
                distance = np.sqrt(
                    sum([(input_dict[feature] - row[feature])**2 
                         for feature in self.feature_names])
                )
                similarities.append(SimilarCondition(
                    crop=row['label'],
                    distance=float(distance),
                    conditions={feature: float(row[feature]) for feature in self.feature_names}
                ))
            
            # Sort by similarity (lowest distance = most similar)
            similarities.sort(key=lambda x: x.distance)
            
            # Get unique crops (first occurrence of each)
            seen_crops = set()
            unique_similar = []
            for item in similarities:
                if item.crop not in seen_crops:
                    seen_crops.add(item.crop)
                    unique_similar.append(item)
                    if len(unique_similar) >= n_similar:
                        break
            
            return unique_similar
            
        except Exception as e:
            print(f"❌ Error finding similar conditions: {e}")
            return []
    
    def save_model(self, filepath='crop_recommendation_model.pkl'):
        """Save the trained model"""
        if self.model is None:
            raise ValueError("No model to save")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_names': self.feature_names,
            'crop_names': self.crop_names
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='crop_recommendation_model.pkl'):
        """Load a pre-trained model"""
        if os.path.exists(filepath):
            try:
                with open(filepath, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.label_encoder = model_data['label_encoder']
                self.feature_names = model_data['feature_names']
                self.crop_names = model_data['crop_names']
                
                print(f"✅ Model loaded from {filepath}")
                return True
            except Exception as e:
                print(f"❌ Error loading model: {e}")
                return False
        return False

# Initialize the crop recommendation system
crop_system = CropRecommendationSystem()

# Try to load existing model, otherwise train new one
@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    if not crop_system.load_model():
        print("🔄 Training new model...")
        try:
            crop_system.train_model('random_forest')
            crop_system.save_model()
        except Exception as e:
            print(f"❌ Error during training: {e}")

# API Endpoints
@app.post("/predict", response_model=PredictionResponse)
async def predict_crop(input_data: CropInput):
    """
    Predict the best crop for given soil and environmental conditions
    
    - **N**: Nitrogen content (0-200)
    - **P**: Phosphorous content (0-150)
    - **K**: Potassium content (0-100)
    - **temperature**: Temperature in Celsius (0-50)
    - **humidity**: Relative humidity percentage (0-100)
    - **ph**: pH value of soil (3-10)
    - **rainfall**: Rainfall in mm (0-500)
    """
    try:
        print("✅ /predict endpoint called for crop recommendation")
        
        # Make prediction
        result = crop_system.predict_crop(input_data)
        
        # Get similar conditions
        similar_conditions = crop_system.get_similar_conditions(input_data)
        
        return PredictionResponse(
            success=True,
            prediction=result,
            similar_conditions=similar_conditions,
            message="Crop recommendation generated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate crop recommendation: {str(e)}"
        )

@app.post("/retrain", response_model=RetrainResponse)
async def retrain_model(request: RetrainRequest):
    """
    Retrain the model with a different algorithm
    
    - **model_type**: Choose from 'random_forest', 'naive_bayes', or 'svm'
    """
    try:
        print(f"🔄 Retraining model with {request.model_type}...")
        accuracy = crop_system.train_model(request.model_type)
        crop_system.save_model()
        
        return RetrainResponse(
            success=True,
            accuracy=accuracy,
            model_type=request.model_type,
            message="Model retrained successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model retraining failed: {str(e)}"
        )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check the health status of the API and model"""
    return HealthResponse(
        status="healthy",
        model_loaded=crop_system.model is not None,
        scaler_fitted=hasattr(crop_system.scaler, 'mean_') if crop_system.scaler else False,
        feature_names=crop_system.feature_names,
        available_crops=crop_system.crop_names,
        total_crops=len(crop_system.crop_names)
    )

@app.get("/info", response_model=ModelInfo)
async def get_model_info():
    """Get information about the model and expected inputs"""
    return ModelInfo(
        service="Crop Recommendation System",
        feature_names=crop_system.feature_names,
        available_crops=crop_system.crop_names,
        total_crops=len(crop_system.crop_names),
        input_format={
            "N": "Nitrogen content (0-200)",
            "P": "Phosphorous content (0-150)", 
            "K": "Potassium content (0-100)",
            "temperature": "Temperature in Celsius (0-50)",
            "humidity": "Relative humidity percentage (0-100)",
            "ph": "pH value of soil (3-10)",
            "rainfall": "Rainfall in mm (0-500)"
        },
        example_request=CropInput(
            N=45.0,
            P=18.0,
            K=30.0,
            temperature=26.5,
            humidity=72.3,
            ph=6.4,
            rainfall=210.7
        )
    )

@app.get("/test-prediction", response_model=PredictionResponse)
async def test_prediction():
    """Test the model with example data"""
    test_data = CropInput(
        N=45.0,
        P=18.0,
        K=30.0,
        temperature=26.5,
        humidity=72.3,
        ph=6.4,
        rainfall=210.7
    )
    
    try:
        result = crop_system.predict_crop(test_data)
        similar_conditions = crop_system.get_similar_conditions(test_data)
        
        return PredictionResponse(
            success=True,
            prediction=result,
            similar_conditions=similar_conditions,
            message="Test prediction completed successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Test prediction failed: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Crop Recommendation System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "POST /predict": "Get crop recommendation",
            "POST /retrain": "Retrain model",
            "GET /health": "Health check",
            "GET /info": "Model information",
            "GET /test-prediction": "Test with example data"
        }
    }

if __name__ == '__main__':
    print("🚀 Starting FastAPI Crop Recommendation System...")
    print("📊 Using Crop_recommendation copy.csv dataset")
    print("🌱 Feature names:", crop_system.feature_names)
    print("🌾 Available crops will be loaded from dataset")
    print("🤖 Model: Random Forest (default)")
    print("🔗 API Documentation available at: http://localhost:8000/docs")
    print("📚 Alternative docs at: http://localhost:8000/redoc")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5003,
        reload=True,
        log_level="info"
    )