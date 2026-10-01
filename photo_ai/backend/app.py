
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import os
import numpy as np
from io import BytesIO


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Load trained models
ripness_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "backend", "models", "ripness_model.keras")
)

size_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "backend", "models", "size_model.keras")
)


# Flask application
app = Flask(__name__)
CORS(app)


# Home / API status
@app.route("/")
def home():
    return jsonify({
        "message": "Pineapple Photo AI API is running",
        "predict_endpoint": "/predict"
    })


# Prediction
@app.route("/predict", methods=["POST"])
def predict():

    # Check image
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    try:
        # Read uploaded image
        image = tf.keras.utils.load_img(
            BytesIO(image_file.read()),
            target_size=(224, 224)
        )

        # Convert image to array
        image_array = tf.keras.utils.img_to_array(image)

        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)


        # -----------------------------
        # RIPENESS PREDICTION
        # -----------------------------

        ripness_prediction = ripness_model.predict(
            image_array,
            verbose=0
        )

        ripness_index = int(np.argmax(ripness_prediction[0]))

        ripness_confidence = float(
            np.max(ripness_prediction[0]) * 100
        )

        ripness_classes = [
            "FullYellow",
            "Green",
            "HalfYellow"
        ]

        ripness_result = ripness_classes[ripness_index]


        # -----------------------------
        # SIZE PREDICTION
        # -----------------------------

        size_prediction = size_model.predict(
            image_array,
            verbose=0
        )

        size_index = int(np.argmax(size_prediction[0]))

        size_confidence = float(
            np.max(size_prediction[0]) * 100
        )

        size_classes = [
            "Large",
            "Medium",
            "Small"
        ]

        size_result = size_classes[size_index]


        # -----------------------------
        # SCORE MAPPING
        # -----------------------------

        ripness_scores = {
            "Green": 1,
            "HalfYellow": 2,
            "FullYellow": 3
        }

        size_scores = {
            "Small": 1,
            "Medium": 1,
            "Large": 1
        }

        ripness_score = ripness_scores[ripness_result]
        size_score = size_scores[size_result]


        # -----------------------------
        # SWEETNESS INDEX
        # -----------------------------

        sweetness_index = (
            (ripness_score * 0.6) +
            (size_score * 0.4)
        )


        # -----------------------------
        # SWEETNESS LEVEL
        # -----------------------------

        if sweetness_index <= 1.66:
            sweetness_level = "Low"

        elif sweetness_index <= 2.33:
            sweetness_level = "Medium"

        else:
            sweetness_level = "High"


        # -----------------------------
        # QUALITY GRADE
        # -----------------------------

        if sweetness_index >= 2.34:
            quality_grade = "A"

        elif sweetness_index >= 1.67:
            quality_grade = "B"

        else:
            quality_grade = "C"


        # -----------------------------
        # RETURN RESULT
        # -----------------------------

        return jsonify({
            "ripeness": ripness_result,
            "ripeness_confidence": round(ripness_confidence, 2),

            "size": size_result,
            "size_confidence": round(size_confidence, 2),

            "ripeness_score": ripness_score,
            "size_score": size_score,

            "sweetness_index": round(sweetness_index, 2),
            "sweetness_level": sweetness_level,

            "quality_grade": quality_grade
        })


    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# Start server
if __name__ == "__main__":
    app.run(
        debug=True,
        port=5001
    )
