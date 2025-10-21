import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
import joblib
import sys
import os
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

if len(sys.argv) != 2:
    print("Usage: python train_model.py <city>")
    sys.exit(1)

city = sys.argv[1].lower()

if city == "delhi":
    data_file = "MagicBricks.csv"
    model_file = "delhi_price_model.pkl"
elif city == "gurgaon":
    data_file = "Datasets/Gurgaon/residential-land.csv"
    model_file = "gurgaon_price_model.pkl"
else:
    print("Unsupported city. Please choose either 'Delhi' or 'Gurgaon'.")
    sys.exit(1)

# Load dataset
data = pd.read_csv(data_file)

if city == "delhi":
    numeric_cols = ['Area', 'BHK', 'Bathroom', 'Parking', 'Price']
    categorical_cols = ['Furnishing', 'Locality', 'Property Type', 'Type']
    X_cols = ['Area', 'BHK', 'Bathroom', 'Furnishing', 'Locality', 'Parking', 'Type']
    y_col = 'Price'
elif city == "gurgaon":
    numeric_cols = ['price', 'areaWithType']
    categorical_cols = []
    X_cols = ['areaWithType']  # Address will be added via TF-IDF later
    y_col = 'price'

    # Convert price column to numeric
    def convert_price(val):
        val = str(val).strip()
        if val.lower() == "price on request":
            return np.nan
        if 'Crore' in val:
            return float(val.replace('Crore', '').strip()) * 1e7
        elif 'Lac' in val:
            return float(val.replace('Lac', '').strip()) * 1e5
        else:
            try:
                return float(val.replace(',', '').strip())
            except:
                return np.nan

    data[y_col] = data[y_col].apply(convert_price)
    data = data.dropna(subset=[y_col])

    # Extract numeric area in sq.m.
    import re
    def extract_area(val):
        val = str(val)
        match = re.search(r'([\d\.]+)', val)
        if match:
            return float(match.group(1))
        return np.nan

    data['areaWithType'] = data['areaWithType'].apply(extract_area)
    data = data.dropna(subset=['areaWithType'])

# Convert numeric columns
for col in numeric_cols:
    if col in data.columns:
        data[col] = pd.to_numeric(data[col], errors='coerce')
        data[col] = data[col].fillna(data[col].median())

# Features & target
X_numeric = data[X_cols].values
y = data[y_col].values

if city == "gurgaon":
    # TF-IDF vectorization for address
    tfidf = TfidfVectorizer(max_features=100)
    address_features = tfidf.fit_transform(data['address'].astype(str)).toarray()
    X = np.hstack([X_numeric, address_features])
    # Save TF-IDF vectorizer
    os.makedirs('Models', exist_ok=True)
    joblib.dump(tfidf, os.path.join('Models', 'gurgaon_tfidf.pkl'))
    print("✅ Gurgaon TF-IDF vectorizer saved!")
else:
    X = X_numeric

# Split train-test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = DecisionTreeRegressor(random_state=42)
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
print(f"Model trained successfully for {city.capitalize()}! Accuracy: {score:.2f}")

# Save model
os.makedirs('Models', exist_ok=True)
joblib.dump(model, os.path.join('Models', model_file))
print(f"✅ Model saved as '{model_file}'")