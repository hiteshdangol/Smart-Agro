import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import GaussianNB
import joblib

# Load CSV
df = pd.read_csv("pest_data.csv")

X = df[["temp_avg","humidity","rainfall_mm","crop_type","growth_stage","prev_pest_incidence"]]
y = df["risk_level"]

num_cols = ["temp_avg","humidity","rainfall_mm","prev_pest_incidence"]
cat_cols = ["crop_type","growth_stage"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", GaussianNB())
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)

# Save model
joblib.dump(pipeline, "pest_nb_pipeline.joblib")
print("Model trained successfully!")
