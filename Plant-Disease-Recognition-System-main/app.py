from flask import Flask, render_template,request,redirect,send_from_directory,url_for
import numpy as np
import json
import uuid
import tensorflow as tf

app = Flask(__name__)
model = tf.keras.models.load_model("models/plant_disease_recog_model_pwp.keras")
label = ['Apple___Apple_scab',
 'Apple___Black_rot',
 'Apple___Cedar_apple_rust',
 'Apple___healthy',
 'Background_without_leaves',
 'Blueberry___healthy',
 'Cherry___Powdery_mildew',
 'Cherry___healthy',
 'Corn___Cercospora_leaf_spot Gray_leaf_spot',
 'Corn___Common_rust',
 'Corn___Northern_Leaf_Blight',
 'Corn___healthy',
 'Grape___Black_rot',
 'Grape___Esca_(Black_Measles)',
 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
 'Grape___healthy',
 'Orange___Haunglongbing_(Citrus_greening)',
 'Peach___Bacterial_spot',
 'Peach___healthy',
 'Pepper,_bell___Bacterial_spot',
 'Pepper,_bell___healthy',
 'Potato___Early_blight',
 'Potato___Late_blight',
 'Potato___healthy',
 'Raspberry___healthy',
 'Soybean___healthy',
 'Squash___Powdery_mildew',
 'Strawberry___Leaf_scorch',
 'Strawberry___healthy',
 'Tomato___Bacterial_spot',
 'Tomato___Early_blight',
 'Tomato___Late_blight',
 'Tomato___Leaf_Mold',
 'Tomato___Septoria_leaf_spot',
 'Tomato___Spider_mites Two-spotted_spider_mite',
 'Tomato___Target_Spot',
 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
 'Tomato___Tomato_mosaic_virus',
 'Tomato___healthy']

with open("plant_disease.json",'r') as file:
    plant_disease = json.load(file)

# print(plant_disease[4])

@app.route('/uploadimages/<path:filename>')
def uploaded_images(filename):
    return send_from_directory('./uploadimages', filename)

@app.route('/',methods = ['GET'])
def home():
    return render_template('home.html')

def extract_features(image_path):
    img = tf.keras.utils.load_img(image_path)
    feature = tf.keras.utils.img_to_array(img)
    h, w = feature.shape[:2]
    if h > w:
        pad = (h - w) // 2
        feature = np.pad(feature, ((0, 0), (pad, pad), (0, 0)), mode='constant', constant_values=0)
    elif w > h:
        pad = (w - h) // 2
        feature = np.pad(feature, ((pad, pad), (0, 0), (0, 0)), mode='constant', constant_values=0)
    feature = tf.image.resize(feature, (160, 160), method='bilinear')
    feature = feature.numpy()
    feature = np.array([feature])
    return feature

def model_predict(image_path):
    img = extract_features(image_path)
    predictions = model.predict(img, verbose=0)
    probs = predictions[0]
    top3 = np.argsort(probs)[-3:][::-1]
    print(f"Top-3 predictions:")
    for i in top3:
        print(f"  {label[i]}: {probs[i]:.4f}")
    max_prob = probs.max()
    if max_prob < 0.5:
        return {"name": "Unrecognized / Low Confidence", "cause": "The model is not confident enough about this image.", "cure": "Try taking a clearer photo with good lighting and a plain background. Ensure the leaf is centered and well-visible."}
    prediction_label = plant_disease[predictions.argmax()]
    return prediction_label

@app.route('/upload/',methods = ['POST','GET'])
def uploadimage():
    if request.method == "POST":
        image = request.files['img']
        temp_name = f"uploadimages/temp_{uuid.uuid4().hex}"
        image.save(f'{temp_name}_{image.filename}')
        print(f'{temp_name}_{image.filename}')
        prediction = model_predict(f'./{temp_name}_{image.filename}')
        return render_template('home.html',result=True,imagepath = f'/{temp_name}_{image.filename}', prediction = prediction )
    
    else:
        return redirect('/')
        
    
if __name__ == "__main__":
    app.run(debug=True)