import { useState } from "react";
import "./ImagePrediction.css";

const YOLO_API_URL =
    import.meta.env.VITE_PHOTO_AI_URL ||
    "http://localhost:5000/predict";

function ImagePrediction() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError("");
    };

    const handlePredict = async () => {
        if (!selectedImage) {
            setError("Please select a pineapple image first.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();

            formData.append("image", selectedImage);

            const response = await fetch(YOLO_API_URL, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Image prediction failed."
                );
            }

            setResult(data);

        } catch (err) {
            console.error("Prediction error:", err);

            setError(
                err.message ||
                "Could not connect to the image AI service."
            );

        } finally {
            setLoading(false);
        }
    };

    const getBestPrediction = () => {
        if (!result) {
            return null;
        }

        if (result.best_prediction) {
            return result.best_prediction;
        }

        if (
            result.predictions &&
            result.predictions.length > 0
        ) {
            return result.predictions.reduce(
                (best, current) =>
                    current.confidence > best.confidence
                        ? current
                        : best
            );
        }

        return null;
    };

    const bestPrediction = getBestPrediction();

    const getQualityLabel = () => {
        if (!bestPrediction) {
            return "No Pineapple Detected";
        }

        const className =
            bestPrediction.class_name.toLowerCase();

        if (className === "fresh") {
            return "Fresh Pineapple";
        }

        if (className === "rotten") {
            return "Rotten Pineapple";
        }

        return bestPrediction.class_name;
    };

    const getQualityClass = () => {
        if (!bestPrediction) {
            return "quality-none";
        }

        const className =
            bestPrediction.class_name.toLowerCase();

        if (className === "fresh") {
            return "quality-fresh";
        }

        if (className === "rotten") {
            return "quality-rotten";
        }

        return "quality-none";
    };

    const confidence =
        bestPrediction
            ? Math.round(bestPrediction.confidence * 100)
            : 0;

    return (
        <div className="image-prediction">

            <div className="image-prediction-header">
                <div>
                    <h2>🍍 Pineapple Image AI</h2>

                    <p>
                        Upload a pineapple image to detect
                        freshness using the trained YOLO model.
                    </p>
                </div>
            </div>


            {/* Upload Section */}

            <div className="image-upload-section">

                <label
                    htmlFor="pineapple-image"
                    className="upload-area"
                >
                    <div className="upload-icon">
                        📷
                    </div>

                    <h3>
                        Select Pineapple Image
                    </h3>

                    <p>
                        Click here to choose an image
                    </p>

                    <input
                        id="pineapple-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </label>


                {previewUrl && (
                    <div className="image-preview">

                        <img
                            src={previewUrl}
                            alt="Selected pineapple"
                        />

                    </div>
                )}

            </div>


            {/* Predict Button */}

            {selectedImage && (
                <button
                    className="predict-button"
                    onClick={handlePredict}
                    disabled={loading}
                >
                    {loading
                        ? "🤖 Analyzing..."
                        : "🔍 Analyze Pineapple"}
                </button>
            )}


            {/* Error */}

            {error && (
                <div className="prediction-error">
                    ❌ {error}
                </div>
            )}


            {/* Results */}

            {result && (
                <div className="prediction-results">

                    <div className="results-header">
                        <h3>
                            🤖 AI Prediction Result
                        </h3>
                    </div>


                    {/* Quality */}

                    <div
                        className={`quality-result ${getQualityClass()}`}
                    >
                        <div className="result-icon">
                            {bestPrediction?.class_name
                                ?.toLowerCase() === "fresh"
                                ? "🍍"
                                : bestPrediction?.class_name
                                      ?.toLowerCase() === "rotten"
                                ? "⚠️"
                                : "❓"}
                        </div>

                        <div>
                            <span className="result-label">
                                Quality
                            </span>

                            <h2>
                                {getQualityLabel()}
                            </h2>
                        </div>
                    </div>


                    {/* Confidence */}

                    {bestPrediction && (
                        <div className="confidence-section">

                            <div className="confidence-header">

                                <span>
                                    AI Confidence
                                </span>

                                <strong>
                                    {confidence}%
                                </strong>

                            </div>

                            <div className="confidence-bar">

                                <div
                                    className="confidence-fill"
                                    style={{
                                        width: `${confidence}%`,
                                    }}
                                />

                            </div>

                        </div>
                    )}


                    {/* Detection Information */}

                    <div className="prediction-info">

                        <div className="info-card">

                            <span>
                                🍍 Objects Detected
                            </span>

                            <strong>
                                {result.count}
                            </strong>

                        </div>


                        <div className="info-card">

                            <span>
                                📐 Image Size
                            </span>

                            <strong>
                                {result.image_width} ×{" "}
                                {result.image_height}
                            </strong>

                        </div>


                        {bestPrediction && (
                            <div className="info-card">

                                <span>
                                    🎯 Detection Class
                                </span>

                                <strong>
                                    {bestPrediction.class_name}
                                </strong>

                            </div>
                        )}

                    </div>


                    {/* All Predictions */}

                    {result.predictions &&
                        result.predictions.length > 0 && (
                            <div className="all-predictions">

                                <h3>
                                    Detected Pineapples
                                </h3>

                                {result.predictions.map(
                                    (prediction, index) => (

                                        <div
                                            className="prediction-item"
                                            key={index}
                                        >

                                            <span>
                                                {prediction.class_name}
                                            </span>

                                            <strong>
                                                {Math.round(
                                                    prediction.confidence *
                                                        100
                                                )}
                                                %
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                </div>
            )}

        </div>
    );
}

export default ImagePrediction;