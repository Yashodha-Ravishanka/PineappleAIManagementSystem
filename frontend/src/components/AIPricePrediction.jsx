
import { useEffect, useState } from "react";
import "./AIPricePrediction.css";

const QR_API_URL =
    "https://pineapple-ai-backend.de.deplexo.com/api/qr";

const ML_API_URL =
    import.meta.env.VITE_ML_API_URL ||
    "http://localhost:5002";

function AIPricePrediction() {
    const [latestQR, setLatestQR] = useState(null);
    const [prediction, setPrediction] = useState(null);

    const [loadingQR, setLoadingQR] = useState(true);
    const [predicting, setPredicting] = useState(false);

    const [error, setError] = useState(null);

    useEffect(() => {
        loadLatestQR();
    }, []);

    async function loadLatestQR() {
        try {
            setLoadingQR(true);
            setError(null);

            const response = await fetch(QR_API_URL);

            if (!response.ok) {
                throw new Error("Failed to load QR data");
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                setLatestQR(null);
                return;
            }

            const latest = data.reduce((latestItem, currentItem) => {
                return new Date(currentItem.timestamp) >
                    new Date(latestItem.timestamp)
                    ? currentItem
                    : latestItem;
            });

            setLatestQR(latest);

            await predictPrice(latest);
        } catch (err) {
            console.error("AI price prediction error:", err);
            setError(err.message);
        } finally {
            setLoadingQR(false);
        }
    }

    async function predictPrice(qrData) {
        try {
            const ripeness = Number(qrData.fruitRipenessScore);
            const quality = Number(qrData.fruitQualityScore);

            if (
                !Number.isFinite(ripeness) ||
                !Number.isFinite(quality)
            ) {
                throw new Error(
                    "Ripeness and quality scores are required."
                );
            }

            if (ripeness < 1 || ripeness > 5) {
                throw new Error(
                    "Ripeness score must be between 1 and 5."
                );
            }

            if (quality < 1 || quality > 5) {
                throw new Error(
                    "Quality score must be between 1 and 5."
                );
            }

            setPredicting(true);
            setPrediction(null);

            const requestData = {
                weight_kg: Number(qrData.fruitWeight),
                length_cm: Number(qrData.fruitLength),
                width_cm: Number(qrData.fruitWidth),
                height_cm: Number(qrData.fruitHeight),
                ripeness_score: ripeness,
                quality_score: quality
            };

            const response = await fetch(
                `${ML_API_URL}/price_predict`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Price prediction failed."
                );
            }

            setPrediction(result.data);
        } catch (err) {
            console.error("Prediction error:", err);
            setError(err.message);
        } finally {
            setPredicting(false);
        }
    }

    if (loadingQR) {
        return (
            <div className="ai-price-prediction">
                <div className="ai-price-header">
                    <div className="ai-price-icon">🤖</div>

                    <div>
                        <h2>AI Price Prediction</h2>
                        <p>
                            Machine learning based pineapple
                            market price prediction
                        </p>
                    </div>
                </div>

                <div className="ai-price-loading">
                    Loading pineapple data...
                </div>
            </div>
        );
    }

    return (
        <div className="ai-price-prediction">

            <div className="ai-price-header">
                <div className="ai-price-icon">
                    🤖
                </div>

                <div>
                    <h2>AI Price Prediction</h2>

                    <p>
                        Machine learning based pineapple
                        market price prediction
                    </p>
                </div>

                <span className="ml-status">
                    ● ML ACTIVE
                </span>
            </div>

            {!latestQR ? (
                <div className="ai-price-empty">
                    <span>🍍</span>

                    <strong>
                        No pineapple data available
                    </strong>

                    <p>
                        Generate a QR record to run the
                        AI price prediction.
                    </p>
                </div>
            ) : (
                <>
                    <div className="ai-price-batch">
                        <span>Latest Batch</span>

                        <strong>
                            🍍 {latestQR.batchId}
                        </strong>
                    </div>

                    <div className="ai-price-inputs">

                        <div className="price-input-card">
                            <span>⚖️ Weight</span>
                            <strong>
                                {latestQR.fruitWeight ?? "--"} kg
                            </strong>
                        </div>

                        <div className="price-input-card">
                            <span>📏 Length</span>
                            <strong>
                                {latestQR.fruitLength ?? "--"} cm
                            </strong>
                        </div>

                        <div className="price-input-card">
                            <span>↔️ Width</span>
                            <strong>
                                {latestQR.fruitWidth ?? "--"} cm
                            </strong>
                        </div>

                        <div className="price-input-card">
                            <span>↕️ Height</span>
                            <strong>
                                {latestQR.fruitHeight ?? "--"} cm
                            </strong>
                        </div>

                        <div className="price-input-card">
                            <span>🍍 Ripeness</span>
                            <strong>
                                {latestQR.fruitRipenessScore ?? "--"} / 5
                            </strong>
                        </div>

                        <div className="price-input-card">
                            <span>⭐ Quality</span>
                            <strong>
                                {latestQR.fruitQualityScore ?? "--"} / 5
                            </strong>
                        </div>

                    </div>

                    {predicting && (
                        <div className="ai-price-calculating">
                            🤖 AI is calculating the predicted
                            pineapple price...
                        </div>
                    )}

                    {prediction && !predicting && (
                        <div className="ai-price-result">

                            <span className="ai-price-result-label">
                                💰 AI Predicted Market Price
                            </span>

                            <strong className="ai-price-value">
                                Rs.{" "}
                                {Number(
                                    prediction.predicted_price_lkr
                                ).toLocaleString(
                                    "en-LK",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </strong>

                            <span className="ai-price-model">
                                Random Forest ML Model
                            </span>

                        </div>
                    )}

                    {error && (
                        <div className="ai-price-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {latestQR.sizeGrade && (
                        <div className="ai-price-footer">
                            <span>
                                Size Grade:{" "}
                                <strong>
                                    {latestQR.sizeGrade}
                                </strong>
                            </span>

                            <span>
                                Sweetness:{" "}
                                <strong>
                                    {latestQR.sweetnessBrix ?? "--"} °Bx
                                </strong>
                            </span>

                            <span>
                                Aroma:{" "}
                                <strong>
                                    {latestQR.aromaScore ?? "--"} / 10
                                </strong>
                            </span>
                        </div>
                    )}

                </>
            )}
        </div>
    );
}

export default AIPricePrediction;