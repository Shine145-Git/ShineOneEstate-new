from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load models
models_dir = os.path.join(os.getcwd(), 'Models')
delhi_model = joblib.load(os.path.join(models_dir, 'delhi_price_model.pkl'))
gurgaon_model = joblib.load(os.path.join(models_dir, 'gurgaon_price_model.pkl'))

# Load TF-IDF vectorizer for Gurgaon address
gurgaon_tfidf = joblib.load(os.path.join(models_dir, 'gurgaon_tfidf.pkl'))

@app.route("/predict", methods=["POST"])
def predict_price():
    data = request.get_json()
    try:
        city = data.get("city", "").lower()

        if city == "delhi":
            model = delhi_model
            area = float(data.get("Area", 0))
            bhk = float(data.get("BHK", 0))
            bathroom = float(data.get("Bathroom", 0))
            furnishing = float(data.get("Furnishing", 0))
            locality = float(data.get("Locality", 0))
            parking = float(data.get("Parking", 0))
            prop_type = float(data.get("Type", 0))
            features = np.array([[area, bhk, bathroom, furnishing, locality, parking, prop_type]])
        elif city == "gurgaon":
            model = gurgaon_model
            area = float(data.get("areaWithType", 0))
            address = str(data.get("address", ""))
            # Transform address using TF-IDF
            address_vector = gurgaon_tfidf.transform([address]).toarray()
            # Combine numeric area with address vector
            features = np.hstack((np.array([[area]]), address_vector))
        else:
            return jsonify({"error": "Invalid or missing city parameter"}), 400

        prediction = model.predict(features)[0]
        return jsonify({"predicted_price": round(prediction, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001, debug=True)