import sys, os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.keras.utils.disable_interactive_logging()

try:
    m = tf.keras.models.load_model("models/plant_disease_recog_model_pwp.keras")
    print(f"SUCCESS: model loaded, type={type(m).__name__}")
except Exception as e:
    print(f"Error: {e}")
