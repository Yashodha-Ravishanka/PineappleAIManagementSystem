import { useEffect, useState } from "react";
import "./AIPrediction.css";

import { getAllPineapples } from "../services/api";

function AIPrediction() {
    const [latest, setLatest] = useState(null);

    useEffect(() => {
        loadLatest();
    }, []);

    async function loadLatest() {
        try {
            const data = await getAllPineapples();

            if (data && data.length > 0) {
                const latestReading = data.reduce(
                    (latestItem, currentItem) => {
                        return new Date(currentItem.timestamp) >
                            new Date(latestItem.timestamp)
                            ? currentItem
                            : latestItem;
                    }
                );

                setLatest(latestReading);
            }
        } catch (error) {
            console.log("AI prediction error:", error);
        }
    }

    function getQualityClass(quality) {
        switch (quality?.toLowerCase()) {
            case "good":
                return "ai-quality-good";

            case "average":
                return "ai-quality-average";

            case "bad":
                return "ai-quality-bad";

            default:
                return "ai-quality-pending";
        }
    }

    function getRiskClass(risk) {
        switch (risk?.toLowerCase()) {
            case "low":
                return "ai-risk-low";

            case "medium":
                return "ai-risk-medium";

            case "high":
                return "ai-risk-high";

            default:
                return "ai-risk-pending";
        }
    }

    return (
        <div className="ai-prediction">

            {/* ===============================
                HEADER
                =============================== */}

            <div className="ai-header">

                <div className="ai-header-icon">
                    🤖
                </div>

                <div>

                    <h2>
                        Latest AI Quality Prediction
                    </h2>

                    <p>
                        AI-based pineapple quality and
                        storage risk assessment
                    </p>

                </div>

            </div>

            {/* ===============================
                PREDICTION
                =============================== */}

            {latest ? (

                <div className="prediction-result">

                    <div className="prediction-batch">

                        <div>

                            <span className="batch-label">
                                Monitored Batch
                            </span>

                            <strong>
                                🍍 {latest.batchId}
                            </strong>

                        </div>

                        <span className="ai-active">
                            ● AI Analysis
                        </span>

                    </div>


                    {/* ===============================
                        SENSOR DATA
                        =============================== */}

                    <div className="prediction-grid">

                        <div className="prediction-card">

                            <span className="prediction-icon">
                                🌡️
                            </span>

                            <div>

                                <span>
                                    Temperature
                                </span>

                                <strong>
                                    {latest.temperature ?? "--"} °C
                                </strong>

                            </div>

                        </div>


                        <div className="prediction-card">

                            <span className="prediction-icon">
                                💧
                            </span>

                            <div>

                                <span>
                                    Humidity
                                </span>

                                <strong>
                                    {latest.humidity ?? "--"} %
                                </strong>

                            </div>

                        </div>


                        <div className="prediction-card">

                            <span className="prediction-icon">
                                📅
                            </span>

                            <div>

                                <span>
                                    Storage Days
                                </span>

                                <strong>
                                    {latest.storage_days ?? 0}
                                </strong>

                            </div>

                        </div>


                        <div className="prediction-card">

                            <span className="prediction-icon">
                                🧪
                            </span>

                            <div>

                                <span>
                                    MQ135 Raw
                                </span>

                                <strong>
                                    {latest.mq135 ?? 0}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* ===============================
                        AI RESULT
                        =============================== */}

                    <div className="ai-result-section">

                        <div className="ai-result-card">

                            <span className="result-label">
                                ⭐ Predicted Quality
                            </span>

                            <span
                                className={getQualityClass(
                                    latest.quality
                                )}
                            >
                                {latest.quality || "Pending"}
                            </span>

                        </div>


                        <div className="ai-result-card">

                            <span className="result-label">
                                ⚠ Risk Level
                            </span>

                            <span
                                className={getRiskClass(
                                    latest.riskLevel
                                )}
                            >
                                {latest.riskLevel || "Pending"}
                            </span>

                        </div>

                    </div>


                    {/* ===============================
                        RECOMMENDATION
                        =============================== */}

                    <div className="ai-recommendation">

                        <div className="recommendation-title">
                            🤖 AI Recommendation
                        </div>

                        <p>
                            {latest.recommendation ||
                                "No recommendation available."}
                        </p>

                    </div>


                    {/* ===============================
                        TIMESTAMP
                        =============================== */}

                    <div className="ai-last-update">

                        🕒 Last analyzed:{" "}

                        {latest.timestamp
                            ? new Date(
                                latest.timestamp
                            ).toLocaleString()
                            : "N/A"}

                    </div>

                </div>

            ) : (

                <div className="ai-empty">

                    <span>
                        🤖
                    </span>

                    <strong>
                        No AI prediction available
                    </strong>

                    <p>
                        Waiting for pineapple sensor
                        data and AI analysis.
                    </p>

                </div>

            )}

        </div>
    );
}

export default AIPrediction;