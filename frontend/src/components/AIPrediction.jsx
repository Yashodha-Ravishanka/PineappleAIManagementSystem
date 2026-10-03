
import { useEffect, useState } from "react";
import "./AIPrediction.css";

import { getAllPineapples } from "../services/api";

function AIPrediction() {
    const [latest, setLatest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadLatest();

        // Refresh AI result every 5 seconds
        const interval = setInterval(() => {
            loadLatest();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // ==========================================
    // LOAD LATEST PINEAPPLE DATA
    // ==========================================

    async function loadLatest() {
        try {
            setError("");

            const data = await getAllPineapples();

            if (!Array.isArray(data) || data.length === 0) {
                setLatest(null);
                return;
            }

            // Find newest reading
            const latestReading = data.reduce(
                (latestItem, currentItem) => {
                    return new Date(currentItem.timestamp) >
                        new Date(latestItem.timestamp)
                        ? currentItem
                        : latestItem;
                }
            );

            setLatest(latestReading);
        } catch (error) {
            console.error("AI prediction error:", error);

            setError(
                "Unable to load the latest AI prediction."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // QUALITY CSS CLASS
    // ==========================================

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

    // ==========================================
    // RISK CSS CLASS
    // ==========================================

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

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="ai-prediction">

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

                <div className="ai-empty">

                    <span>
                        🤖
                    </span>

                    <strong>
                        Loading AI prediction...
                    </strong>

                    <p>
                        Retrieving the latest pineapple
                        monitoring data.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="ai-prediction">

            {/* ==========================================
                HEADER
            ========================================== */}

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


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="ai-error">
                    ⚠️ {error}
                </div>
            )}


            {/* ==========================================
                PREDICTION
            ========================================== */}

            {latest ? (

                <div className="prediction-result">

                    {/* ==================================
                        BATCH
                    ================================== */}

                    <div className="prediction-batch">

                        <div>

                            <span className="batch-label">
                                Monitored Batch
                            </span>

                            <strong>
                                🍍 {latest.batchId || "Unknown Batch"}
                            </strong>

                        </div>

                        <span className="ai-active">
                            ● AI Analysis
                        </span>

                    </div>


                    {/* ==================================
                        SENSOR DATA
                    ================================== */}

                    <div className="prediction-grid">

                        {/* Temperature */}

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


                        {/* Humidity */}

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


                        {/* Storage Days */}

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


                        {/* MQ135 */}

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


                    {/* ==================================
                        AI RESULT
                    ================================== */}

                    <div className="ai-result-section">

                        {/* Quality */}

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


                        {/* Risk */}

                        <div className="ai-result-card">

                            <span className="result-label">
                                ⚠️ Risk Level
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


                    {/* ==================================
                        QUALITY GRADE
                    ================================== */}

                    {latest.qualityGrade && (

                        <div className="ai-result-card">

                            <span className="result-label">
                                🏆 Quality Grade
                            </span>

                            <strong>
                                {latest.qualityGrade}
                            </strong>

                        </div>

                    )}


                    {/* ==================================
                        AI CONFIDENCE
                    ================================== */}

                    {latest.confidence !== undefined &&
                        latest.confidence !== null && (

                            <div className="ai-confidence">

                                <div className="confidence-header">

                                    <span>
                                        🤖 AI Confidence
                                    </span>

                                    <strong>
                                        {Math.round(
                                            Number(
                                                latest.confidence
                                            ) * 100
                                        )}%
                                    </strong>

                                </div>

                                <div className="confidence-bar">

                                    <div
                                        className="confidence-fill"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    Number(
                                                        latest.confidence
                                                    ) * 100
                                                )
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        )}


                    {/* ==================================
                        RECOMMENDATION
                    ================================== */}

                    <div className="ai-recommendation">

                        <div className="recommendation-title">
                            🤖 AI Recommendation
                        </div>

                        <p>
                            {latest.recommendation ||
                                "No recommendation available."}
                        </p>

                    </div>


                    {/* ==================================
                        TIMESTAMP
                    ================================== */}

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

                /* ======================================
                   NO DATA
                ====================================== */

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