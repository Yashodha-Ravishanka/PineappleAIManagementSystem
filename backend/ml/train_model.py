import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# Load dataset
df = pd.read_csv("dataset/pineapple_dataset.csv")

print("Dataset loaded successfully!")
print(f"Total records: {len(df)}")


# Features
X = df[
    [
        "weight_kg",
        "length_cm",
        "width_cm",
        "height_cm",
        "ripeness_score",
        "quality_score"
    ]
]


# Target
y = df["price_lkr"]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


print()
print("Training records:", len(X_train))
print("Testing records:", len(X_test))


# Create model
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)


# Train
print()
print("Training model...")

model.fit(X_train, y_train)

print("Training completed!")


# Predict test data
y_pred = model.predict(X_test)


# Evaluate model
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
r2 = r2_score(y_test, y_pred)


print()
print("========== MODEL PERFORMANCE ==========")
print(f"MAE  : Rs. {mae:.2f}")
print(f"RMSE : Rs. {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# Save model
os.makedirs("models", exist_ok=True)

joblib.dump(
    model,
    "models/pineapple_price_model.pkl"
)

print()
print("Model saved successfully!")
print("Location: models/pineapple_price_model.pkl")