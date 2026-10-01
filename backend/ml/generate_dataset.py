import numpy as np
import pandas as pd
import os

# Make results reproducible
np.random.seed(42)

# Number of records
NUM_RECORDS = 10000

data = []

for i in range(NUM_RECORDS):

    # Pineapple physical characteristics
    weight = np.random.uniform(0.8, 3.0)

    length = np.random.uniform(18, 32)

    width = np.random.uniform(10, 18)

    height = np.random.uniform(10, 17)

    # Scores from 1 to 5
    ripeness = np.random.randint(1, 6)

    quality = np.random.randint(1, 6)

    # Base price
    base_price = 250

    # Weight has the biggest effect
    weight_effect = weight * 180

    # Size effects
    length_effect = length * 5
    width_effect = width * 5
    height_effect = height * 4

    # Quality effects
    ripeness_effect = ripeness * 35
    quality_effect = quality * 50

    # Random market variation
    noise = np.random.normal(0, 40)

    # Final price
    price = (
        base_price
        + weight_effect
        + length_effect
        + width_effect
        + height_effect
        + ripeness_effect
        + quality_effect
        + noise
    )

    # Prevent unrealistic prices
    price = max(200, price)

    data.append([
        i + 1,
        round(weight, 2),
        round(length, 2),
        round(width, 2),
        round(height, 2),
        ripeness,
        quality,
        round(price, 2)
    ])


# Create DataFrame
df = pd.DataFrame(data, columns=[
    "id",
    "weight_kg",
    "length_cm",
    "width_cm",
    "height_cm",
    "ripeness_score",
    "quality_score",
    "price_lkr"
])


# Create dataset directory
os.makedirs("dataset", exist_ok=True)

# Save CSV
df.to_csv("dataset/pineapple_dataset.csv", index=False)

print("Dataset generated successfully!")
print(f"Number of records: {len(df)}")
print()
print(df.head())
print()
print(df.describe())