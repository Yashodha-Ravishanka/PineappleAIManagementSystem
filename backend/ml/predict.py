import joblib
import pandas as pd


# Load trained model
model = joblib.load(
    "models/pineapple_price_model.pkl"
)


print("🍍 Pineapple Price Prediction")
print("--------------------------------")


# User inputs
weight = float(input("Weight (kg): "))
length = float(input("Length (cm): "))
width = float(input("Width (cm): "))
height = float(input("Height (cm): "))
ripeness = int(input("Ripeness score (1-5): "))
quality = int(input("Quality score (1-5): "))


# Create input DataFrame
input_data = pd.DataFrame([{
    "weight_kg": weight,
    "length_cm": length,
    "width_cm": width,
    "height_cm": height,
    "ripeness_score": ripeness,
    "quality_score": quality
}])


# Predict
prediction = model.predict(input_data)


price = prediction[0]


print()
print("================================")
print(f"🍍 Predicted Price: Rs. {price:.2f}")
print("================================")