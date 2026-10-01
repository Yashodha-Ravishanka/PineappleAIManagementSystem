from flask import Flask, request, jsonify
from flask_cors import CORS

import joblib
import pandas as pd
import os

app = Flask(__name__)

CORS(app)

# ==========================================
# LOAD TRAINED AI MODEL
# ==========================================

model = joblib.load("model.pkl")
encoder = joblib.load("encoder.pkl")


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return "Pineapple AI Prediction Service Running"


# ==========================================
# AI PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        # ------------------------------------------
        # GET INPUT VALUES
        # ------------------------------------------

        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        storage_days = int(data["storage_days"])

        # MQ135 is received from ESP32/backend.
        # The current trained model does not use it
        # because the model was trained with only:
        # temperature, humidity, storage_days

        mq135 = float(data.get("mq135", 0))


        # ------------------------------------------
        # CREATE AI INPUT
        # ------------------------------------------

        input_data = pd.DataFrame([{

            "temperature": temperature,

            "humidity": humidity,

            "storage_days": storage_days

        }])


        # ------------------------------------------
        # AI MODEL PREDICTION
        # ------------------------------------------

        prediction = model.predict(input_data)

        quality = encoder.inverse_transform(prediction)[0]


        # ------------------------------------------
        # AI CONFIDENCE
        # ------------------------------------------

        confidence = None

        if hasattr(model, "predict_proba"):

            probabilities = model.predict_proba(input_data)[0]

            confidence = float(max(probabilities))


        # ------------------------------------------
        # QUALITY GRADE
        # ------------------------------------------
        #
        # Grade is based on the AI model confidence.
        #
        # A = very high confidence
        # B = high confidence
        # C = moderate confidence
        # D = low confidence
        #
        # This is calculated by the AI service,
        # not by the React frontend.
        # ------------------------------------------

        if confidence is not None:

            if confidence >= 0.90:

                quality_grade = "A"

            elif confidence >= 0.75:

                quality_grade = "B"

            elif confidence >= 0.60:

                quality_grade = "C"

            else:

                quality_grade = "D"

        else:

            # If the model does not support
            # predict_proba(), we cannot calculate
            # confidence-based grading.

            quality_grade = "Pending"


        # ------------------------------------------
        # RISK LEVEL
        # ------------------------------------------

        if quality == "Bad":

            risk = "High"

        elif quality == "Average":

            risk = "Medium"

        else:

            risk = "Low"


        # ------------------------------------------
        # AI RECOMMENDATION
        # ------------------------------------------

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
                "Move to cold storage immediately "
                "or prioritize sale."
            )

        else:

            recommendation = "Monitor batch."


        # ------------------------------------------
        # RETURN AI RESULT
        # ------------------------------------------

        return jsonify({

            "quality": quality,

            "qualityGrade": quality_grade,

            "confidence": confidence,

            "risk": risk,

            "recommendation": recommendation

        })


    except Exception as e:

        print("AI ERROR:", str(e))

        return jsonify({

            "error": str(e)

        }), 500


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5001))

    app.run(

        host="0.0.0.0",

        port=port,

        debug=False

    )