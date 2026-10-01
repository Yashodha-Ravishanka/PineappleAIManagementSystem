from flask import Flask, request, jsonify
from flask_cors import CORS

from ultralytics import YOLO
from PIL import Image

import io
import os

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# YOLO MODEL
# --------------------------------------------------

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "pineapple_quality.pt"
)

print("Loading Pineapple YOLO model...")
print("Model path:", MODEL_PATH)

model = YOLO(MODEL_PATH)

print("YOLO model loaded successfully.")
print("Classes:", model.names)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "Pineapple Image AI API is running"
    })


# --------------------------------------------------
# IMAGE PREDICTION
# --------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Check image
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image provided. Use field name 'image'."
            }), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "No image selected."
            }), 400

        # Read image
        image_bytes = file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        # Run YOLO
        results = model.predict(
            source=image,
            conf=0.25,
            verbose=False
        )

        predictions = []

        # Process detections
        for result in results:

            boxes = result.boxes

            if boxes is None:
                continue

            for box in boxes:

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                confidence = float(
                    box.conf[0].item()
                )

                class_id = int(
                    box.cls[0].item()
                )

                class_name = model.names[class_id]

                predictions.append({

                    "class_id": class_id,

                    "class_name": class_name,

                    "confidence": round(
                        confidence,
                        4
                    ),

                    "bbox": {

                        "x1": round(x1, 2),

                        "y1": round(y1, 2),

                        "x2": round(x2, 2),

                        "y2": round(y2, 2)
                    }
                })


        # Find highest confidence prediction
        best_prediction = None

        if predictions:

            best_prediction = max(
                predictions,
                key=lambda x: x["confidence"]
            )


        # Return result
        return jsonify({

            "success": True,

            "filename": file.filename,

            "image_width": image.width,

            "image_height": image.height,

            "count": len(predictions),

            "predictions": predictions,

            "best_prediction": best_prediction
        })


    except Exception as e:

        print(
            "Prediction error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# --------------------------------------------------
# START SERVER
# --------------------------------------------------
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )