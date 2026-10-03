import ImagePrediction from "../components/ImagePrediction/ImagePrediction";
import "./FreshnessDetection.css";

function FreshnessDetection() {
    return (
        <div className="freshness-page">

            <div className="freshness-container">

                <div className="freshness-header">
                    <h1>🧪 Freshness Detection</h1>

                    <p>
                        Upload a pineapple image to detect
                        whether the pineapple is fresh or rotten
                        using the trained YOLO AI model.
                    </p>
                </div>

                <ImagePrediction />

            </div>

        </div>
    );
}

export default FreshnessDetection;