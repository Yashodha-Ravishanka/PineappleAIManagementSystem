
from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import pandas as pd
import os

app = Flask(__name__)

CORS(app)

# Load trained AI model
model = joblib.load("model.pkl")
encoder = joblib.load("encoder.pkl")


@app.route("/")
def home():

    return "Pineapple AI Prediction Service Running"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    temperature = float(data["temperature"])
    humidity = float(data["humidity"])
    storage_days = int(data["storage_days"])

    input_data = pd.DataFrame([{

        "temperature": temperature,

        "humidity": humidity,

        "storage_days": storage_days

    }])

    prediction = model.predict(input_data)

    quality = encoder.inverse_transform(prediction)[0]

    # Risk Level
    if quality == "Bad":

        risk = "High"

    elif quality == "Average":

        risk = "Medium"

    else:

        risk = "Low"

    # AI Recommendation
    if quality == "Good":

        recommendation = (
            "Continue normal storage. "
            "Maintain current temperature and humidity."
        )

    elif quality == "Average":

        recommendation = (
            "Monitor temperature and humidity daily. "
            "Inspect the batch regularly."
        )

    elif quality == "Bad":

        recommendation = (
            "Move to cold storage immediately or prioritize sale."
        )

    else:

        recommendation = "Monitor batch."

    return jsonify({

        "quality": quality,

        "risk": risk,

        "recommendation": recommendation

    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5001))

    app.run(

        host="0.0.0.0",

        port=port,

        debug=False

    )