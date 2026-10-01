from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)

CORS(app)

MODEL_PATH = "models/pineapple_price_model.pkl"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

print("Pineapple price ML model loaded successfully!")

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Pineapple Price Prediction API is running"
    })

@app.route("/price_predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400
        
        weight = data.get("weight_kg")
        length = data.get("length_cm")
        width = data.get("width_cm")
        height = data.get("height_cm")
        ripeness = data.get("ripeness_score")
        quality = data.get("quality_score")

        required_fields = [
            "weight_kg",
            "length_cm",
            "width_cm",
            "height_cm",
            "ripeness_score",
            "quality_score"
        ]

        missing_fields = []

        for field in required_fields:

            if data.get(field) is None:
                missing_fields.append(field)


        if missing_fields:

            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "missing_fields": missing_fields
            }), 400

        try:

            weight = float(weight)
            length = float(length)
            width = float(width)
            height = float(height)

            ripeness = int(ripeness)
            quality = int(quality)

        except (ValueError, TypeError):

            return jsonify({
                "success": False,
                "message": "Input values must be valid numbers"
            }), 400

        if weight <= 0:
            return jsonify({
                "success": False,
                "message": "Weight must be greater than 0"
            }), 400

        if length <= 0:
            return jsonify({
                "success": False,
                "message": "Length must be greater than 0"
            }), 400

        if width <= 0:
            return jsonify({
                "success": False,
                "message": "Width must be greater than 0"
            }), 400

        if height <= 0:
            return jsonify({
                "success": False,
                "message": "Height must be greater than 0"
            }), 400

        if ripeness < 1 or ripeness > 5:

            return jsonify({
                "success": False,
                "message": "Ripeness score must be between 1 and 5"
            }), 400

        if quality < 1 or quality > 5:

            return jsonify({
                "success": False,
                "message": "Quality score must be between 1 and 5"
            }), 400

        input_data = pd.DataFrame([{
            "weight_kg": weight,
            "length_cm": length,
            "width_cm": width,
            "height_cm": height,
            "ripeness_score": ripeness,
            "quality_score": quality
        }])

        prediction = model.predict(input_data)
        predicted_price = float(prediction[0])
        predicted_price = round(predicted_price, 2)

        return jsonify({
            "success": True,
            "message": "Price predicted successfully",
            "data": {
                "weight_kg": weight,
                "length_cm": length,
                "width_cm": width,
                "height_cm": height,
                "ripeness_score": ripeness,
                "quality_score": quality,
                "predicted_price_lkr": predicted_price
            }
        })


    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({
            "success": False,
            "message": "An error occurred while predicting the price",
            "error": str(e)
        }), 500

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )