
import { useState } from "react";

function PhotoQualityAI() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError("");
    };

    const handlePredict = async () => {
        if (!image) {
            setError("Please select a pineapple image.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        const formData = new FormData();
        formData.append("image", image);

        try {
            const response = await fetch(
                "http://127.0.0.1:5001/predict",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(
                    data.error || "Prediction failed."
                );
            }

            setResult(data);

        } catch (error) {
            console.error(error);

            setError(
                "Could not connect to the Pineapple Photo AI."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="photo-ai-container">

            <h2>🍍 Pineapple Photo AI</h2>

            <p>
                Upload a pineapple image to analyze its
                ripeness, size, sweetness and quality.
            </p>

            {/* Image Upload */}
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
            />

            {/* Image Preview */}
            {preview && (
                <div className="image-preview">
                    <img
                        src={preview}
                        alt="Pineapple preview"
                        style={{
                            width: "300px",
                            maxHeight: "300px",
                            objectFit: "contain",
                            marginTop: "15px"
                        }}
                    />
                </div>
            )}

            {/* Predict Button */}
            <button
                onClick={handlePredict}
                disabled={loading || !image}
            >
                {loading ? "Analyzing..." : "Predict Quality"}
            </button>

            {/* Error */}
            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {/* Results */}
            {result && (
                <div className="photo-ai-results">

                    <h3>AI Prediction Results</h3>

                    <p>
                        <strong>Ripeness:</strong>{" "}
                        {result.ripeness}
                    </p>

                    <p>
                        <strong>Ripeness Confidence:</strong>{" "}
                        {result.ripeness_confidence}%
                    </p>

                    <p>
                        <strong>Size:</strong>{" "}
                        {result.size}
                    </p>

                    <p>
                        <strong>Size Confidence:</strong>{" "}
                        {result.size_confidence}%
                    </p>

                    <p>
                        <strong>Sweetness Index:</strong>{" "}
                        {result.sweetness_index}
                    </p>

                    <p>
                        <strong>Sweetness Level:</strong>{" "}
                        {result.sweetness_level}
                    </p>

                    <p>
                        <strong>Quality Grade:</strong>{" "}
                        {result.quality_grade}
                    </p>

                </div>
            )}

        </div>
    );
}

export default PhotoQualityAI;
