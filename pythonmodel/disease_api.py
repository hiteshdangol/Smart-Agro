import os
import uuid
import json
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Plant Disease Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE, "Plant-Disease-Recognition-System-main", "models", "plant_disease_recog_model_pwp.keras")
JSON_PATH = os.path.join(BASE, "Plant-Disease-Recognition-System-main", "plant_disease.json")

LABELS = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Background_without_leaves", "Blueberry___healthy", "Cherry___Powdery_mildew", "Cherry___healthy",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot", "Corn___Common_rust", "Corn___Northern_Leaf_Blight",
    "Corn___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy", "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight", "Potato___Late_blight",
    "Potato___healthy", "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot", "Tomato___Early_blight",
    "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

model = None
disease_db = []

@app.on_event("startup")
async def startup():
    global model, disease_db
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Failed to load model: {e}")
    try:
        with open(JSON_PATH, "r") as f:
            disease_db = json.load(f)
        print(f"Disease database loaded: {len(disease_db)} entries")
    except Exception as e:
        print(f"Failed to load disease DB: {e}")

def extract_features(image_bytes):
    img = tf.keras.utils.load_img(image_bytes)
    feature = tf.keras.utils.img_to_array(img)
    h, w = feature.shape[:2]
    if h > w:
        pad = (h - w) // 2
        feature = np.pad(feature, ((0, 0), (pad, pad), (0, 0)), mode="constant", constant_values=0)
    elif w > h:
        pad = (w - h) // 2
        feature = np.pad(feature, ((pad, pad), (0, 0), (0, 0)), mode="constant", constant_values=0)
    feature = tf.image.resize(feature, (160, 160), method="bilinear")
    feature = feature.numpy()
    feature = np.array([feature])
    return feature

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    temp_dir = os.path.join(BASE, "pythonmodel", "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4().hex}_{file.filename}")
    try:
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)
        img = extract_features(temp_path)
        predictions = model.predict(img, verbose=0)
        probs = predictions[0]
        top3_idx = np.argsort(probs)[-3:][::-1]
        top3 = [
            {"label": LABELS[int(i)], "probability": float(round(probs[int(i)] * 100, 2))}
            for i in top3_idx
        ]
        max_idx = int(predictions.argmax())
        confidence = float(probs[max_idx])
        if confidence < 0.5:
            return {
                "success": True,
                "recognized": False,
                "name": "Unrecognized",
                "cause": "The model is not confident enough about this image.",
                "cure": "Try taking a clearer photo with good lighting and a plain background. Ensure the leaf is centered and well-visible.",
                "confidence": round(confidence * 100, 2),
                "top3": top3,
            }
        label_name = LABELS[max_idx]
        disease_info = next((d for d in disease_db if d["name"] == label_name), {})
        return {
            "success": True,
            "recognized": True,
            "name": label_name,
            "cause": disease_info.get("cause", "Information not available"),
            "cure": disease_info.get("cure", "Information not available"),
            "confidence": round(confidence * 100, 2),
            "top3": top3,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None, "classes": len(LABELS)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("disease_api:app", host="0.0.0.0", port=5004, reload=True)
