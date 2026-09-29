import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

import joblib



# Load dataset

data = pd.read_csv("dataset.csv")



# Convert quality labels to numbers

encoder = LabelEncoder()

data["quality"] = encoder.fit_transform(
    data["quality"]
)



# Input features

X = data[
    [
        "temperature",
        "humidity",
        "storage_days"
    ]
]


# Output

y = data["quality"]



# Split data

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    random_state=42

)



# Create AI model

model = RandomForestClassifier(

    n_estimators=100,

    random_state=42

)



# Train model

model.fit(

    X_train,

    y_train

)



# Check accuracy

accuracy = model.score(

    X_test,

    y_test

)


print(
    "Model Accuracy:",
    accuracy
)



# Save model

joblib.dump(

    model,

    "model.pkl"

)



# Save encoder

joblib.dump(

    encoder,

    "encoder.pkl"

)



print(
    "AI model trained successfully!"
)