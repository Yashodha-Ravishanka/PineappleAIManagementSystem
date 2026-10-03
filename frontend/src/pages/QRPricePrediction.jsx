
import { useState } from "react";
import axios from "axios";
import "./QRPricePrediction.css";

const ML_API_URL =
    import.meta.env.VITE_ML_API_URL ||
    "http://localhost:5002";

const QR_API_URL =
    import.meta.env.VITE_QR_API_URL ||
    "http://localhost:3000/api/qr/generate";

function QRPricePrediction() {
    const [formData, setFormData] = useState({
        batchId: "",
        fruitWeight: "",
        fruitLength: "",
        fruitWidth: "",
        fruitHeight: "",
        sizeGrade: "Large",
        fruitRipenessScore: "",
        fruitQualityScore: "",
        marketPrice: "",
        aromaScore: "",
        sweetnessBrix: ""
    });

    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);

    const [generatedQR, setGeneratedQR] = useState(null);
    const [generatingQR, setGeneratingQR] = useState(false);

    const [error, setError] = useState("");

    /*
     * ---------------------------------------------------------
     * HANDLE INPUT
     * ---------------------------------------------------------
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    /*
     * ---------------------------------------------------------
     * PREDICT PRICE
     * ---------------------------------------------------------
     */
    const handlePredictPrice = async (e) => {
        e.preventDefault();

        setError("");
        setPrediction(null);
        setGeneratedQR(null);

        /*
         * Required fields
         */
        if (!formData.batchId.trim()) {
            setError("Please enter a Batch ID.");
            return;
        }

        if (!formData.fruitWeight) {
            setError("Please enter fruit weight.");
            return;
        }

        if (!formData.fruitLength) {
            setError("Please enter fruit length.");
            return;
        }

        if (!formData.fruitWidth) {
            setError("Please enter fruit width.");
            return;
        }

        if (!formData.fruitHeight) {
            setError("Please enter fruit height.");
            return;
        }

        if (!formData.fruitRipenessScore) {
            setError("Please select ripeness score.");
            return;
        }

        if (!formData.fruitQualityScore) {
            setError("Please select quality score.");
            return;
        }

        const ripenessScore = Number(
            formData.fruitRipenessScore
        );

        const qualityScore = Number(
            formData.fruitQualityScore
        );

        /*
         * Validate scores
         */
        if (
            ripenessScore < 1 ||
            ripenessScore > 5
        ) {
            setError(
                "Ripeness score must be between 1 and 5."
            );
            return;
        }

        if (
            qualityScore < 1 ||
            qualityScore > 5
        ) {
            setError(
                "Quality score must be between 1 and 5."
            );
            return;
        }

        const requestData = {
            weight_kg: Number(
                formData.fruitWeight
            ),

            length_cm: Number(
                formData.fruitLength
            ),

            width_cm: Number(
                formData.fruitWidth
            ),

            height_cm: Number(
                formData.fruitHeight
            ),

            ripeness_score:
                ripenessScore,

            quality_score:
                qualityScore
        };

        console.log(
            "PRICE PREDICTION REQUEST:",
            requestData
        );

        setPredicting(true);

        try {
            const response = await axios.post(
                `${ML_API_URL}/price_predict`,
                requestData
            );

            console.log(
                "PRICE PREDICTION RESPONSE:",
                response.data
            );

            /*
             * Price AI returns:
             *
             * {
             *     success: true,
             *     data: {...}
             * }
             */
            if (
                !response.data?.success ||
                !response.data?.data
            ) {
                throw new Error(
                    response.data?.message ||
                    "Price prediction failed."
                );
            }

            setPrediction(
                response.data.data
            );

        } catch (err) {
            console.error(
                "PRICE PREDICTION ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Could not connect to the price prediction server."
            );
        } finally {
            setPredicting(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * GENERATE QR AFTER PRICE PREDICTION
     * ---------------------------------------------------------
     */
    const handleGenerateQR = async () => {
        if (!prediction) {
            setError(
                "Please predict the price before generating the QR code."
            );
            return;
        }

        setError("");
        setGeneratedQR(null);
        setGeneratingQR(true);

        try {
            const qrData = {
                batchId:
                    formData.batchId.trim(),

                warehouseId:
                    "WH-001",

                location:
                    "Gampaha",

                temperature:
                    0,

                humidity:
                    0,

                storage_days:
                    0,

                fruitWeight:
                    Number(
                        formData.fruitWeight
                    ),

                sizeGrade:
                    formData.sizeGrade,

                /*
                 * Save the predicted AI price
                 * into the QR record.
                 */
                marketPrice:
                    Number(
                        prediction.predicted_price_lkr
                    ),

                aromaScore:
                    Number(
                        formData.aromaScore || 0
                    ),

                sweetnessBrix:
                    Number(
                        formData.sweetnessBrix || 0
                    ),

                fruitLength:
                    Number(
                        formData.fruitLength
                    ),

                fruitWidth:
                    Number(
                        formData.fruitWidth
                    ),

                fruitHeight:
                    Number(
                        formData.fruitHeight
                    ),

                fruitRipenessScore:
                    Number(
                        formData.fruitRipenessScore
                    ),

                fruitQualityScore:
                    Number(
                        formData.fruitQualityScore
                    )
            };

            console.log(
                "QR GENERATION REQUEST:",
                qrData
            );

            const response = await axios.post(
                QR_API_URL,
                qrData
            );

            console.log(
                "QR GENERATION RESPONSE:",
                response.data
            );

            /*
             * IMPORTANT:
             * PineappleQR.js returns:
             *
             * {
             *     message: "...",
             *     data: newQR
             * }
             *
             * It does NOT return success: true.
             */
            if (!response.data?.data) {
                throw new Error(
                    response.data?.message ||
                    "QR generation failed."
                );
            }

            setGeneratedQR(
                response.data.data
            );

        } catch (err) {
            console.error(
                "QR GENERATION ERROR:",
                err
            );

            if (err.response) {
                console.error(
                    "QR SERVER RESPONSE:",
                    err.response.data
                );
            }

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Could not generate the QR code."
            );
        } finally {
            setGeneratingQR(false);
        }
    };

    return (
        <div className="qr-price-page">

            <div className="qr-price-container">

                {/* =========================================
                    PAGE HEADER
                ========================================== */}
                <div className="qr-price-title">

                    <h1>
                        💰 QR & AI Price Prediction
                    </h1>

                    <p>
                        Predict the pineapple market price
                        first, then generate a QR record for
                        the predicted batch.
                    </p>

                </div>

                {/* =========================================
                    PRICE INPUT
                ========================================== */}
                <div className="qr-generator-card">

                    <div className="section-header">

                        <div className="section-icon">
                            💰
                        </div>

                        <div>
                            <h2>
                                AI Price Prediction
                            </h2>

                            <p>
                                Enter the pineapple details
                                required by the machine
                                learning model.
                            </p>
                        </div>

                    </div>

                    <form
                        className="qr-form"
                        onSubmit={
                            handlePredictPrice
                        }
                    >

                        {/* Batch ID */}
                        <div className="form-group">

                            <label>
                                Batch ID
                            </label>

                            <input
                                type="text"
                                name="batchId"
                                value={
                                    formData.batchId
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Example: BATCH-001"
                            />

                        </div>

                        {/* Weight */}
                        <div className="form-group">

                            <label>
                                Weight (kg)
                            </label>

                            <input
                                type="number"
                                name="fruitWeight"
                                value={
                                    formData.fruitWeight
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.01"
                                placeholder="Example: 1.5"
                            />

                        </div>

                        {/* Length */}
                        <div className="form-group">

                            <label>
                                Length (cm)
                            </label>

                            <input
                                type="number"
                                name="fruitLength"
                                value={
                                    formData.fruitLength
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.1"
                                placeholder="Example: 20"
                            />

                        </div>

                        {/* Width */}
                        <div className="form-group">

                            <label>
                                Width (cm)
                            </label>

                            <input
                                type="number"
                                name="fruitWidth"
                                value={
                                    formData.fruitWidth
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.1"
                                placeholder="Example: 12"
                            />

                        </div>

                        {/* Height */}
                        <div className="form-group">

                            <label>
                                Height (cm)
                            </label>

                            <input
                                type="number"
                                name="fruitHeight"
                                value={
                                    formData.fruitHeight
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.1"
                                placeholder="Example: 10"
                            />

                        </div>

                        {/* Size */}
                        <div className="form-group">

                            <label>
                                Size Grade
                            </label>

                            <select
                                name="sizeGrade"
                                value={
                                    formData.sizeGrade
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="Large">
                                    Large
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="Small">
                                    Small
                                </option>

                            </select>

                        </div>

                        {/* Ripeness */}
                        <div className="form-group">

                            <label>
                                Ripeness Score
                            </label>

                            <select
                                name="fruitRipenessScore"
                                value={
                                    formData.fruitRipenessScore
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    Select score
                                </option>

                                <option value="1">
                                    1 / 5
                                </option>

                                <option value="2">
                                    2 / 5
                                </option>

                                <option value="3">
                                    3 / 5
                                </option>

                                <option value="4">
                                    4 / 5
                                </option>

                                <option value="5">
                                    5 / 5
                                </option>

                            </select>

                        </div>

                        {/* Quality */}
                        <div className="form-group">

                            <label>
                                Quality Score
                            </label>

                            <select
                                name="fruitQualityScore"
                                value={
                                    formData.fruitQualityScore
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    Select score
                                </option>

                                <option value="1">
                                    1 / 5
                                </option>

                                <option value="2">
                                    2 / 5
                                </option>

                                <option value="3">
                                    3 / 5
                                </option>

                                <option value="4">
                                    4 / 5
                                </option>

                                <option value="5">
                                    5 / 5
                                </option>

                            </select>

                        </div>

                        {/* Market Price */}
                        <div className="form-group">

                            <label>
                                Market Price
                            </label>

                            <input
                                type="number"
                                name="marketPrice"
                                value={
                                    formData.marketPrice
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.01"
                                placeholder="Optional"
                            />

                        </div>

                        {/* Aroma */}
                        <div className="form-group">

                            <label>
                                Aroma Score
                            </label>

                            <input
                                type="number"
                                name="aromaScore"
                                value={
                                    formData.aromaScore
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.1"
                                placeholder="Optional"
                            />

                        </div>

                        {/* Sweetness */}
                        <div className="form-group">

                            <label>
                                Sweetness (Brix)
                            </label>

                            <input
                                type="number"
                                name="sweetnessBrix"
                                value={
                                    formData.sweetnessBrix
                                }
                                onChange={
                                    handleChange
                                }
                                step="0.1"
                                placeholder="Optional"
                            />

                        </div>

                        {/* Predict */}
                        <button
                            type="submit"
                            className="generate-qr-button"
                            disabled={
                                predicting
                            }
                        >
                            {predicting
                                ? "Predicting Price..."
                                : "💰 Predict Price"}
                        </button>

                    </form>

                    {error && (
                        <div className="qr-error">
                            ⚠️ {error}
                        </div>
                    )}

                </div>

                {/* =========================================
                    PRICE RESULT
                ========================================== */}
                {prediction && (
                    <div className="price-result-card">

                        <div className="section-header">

                            <div className="section-icon">
                                ✅
                            </div>

                            <div>
                                <h2>
                                    Price Prediction Complete
                                </h2>

                                <p>
                                    The machine learning model
                                    has calculated the predicted
                                    market price.
                                </p>
                            </div>

                        </div>

                        <div className="predicted-price-box">

                            <span>
                                AI Predicted Market Price
                            </span>

                            <strong>
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

                            <small>
                                Random Forest ML Model
                            </small>

                        </div>

                        <button
                            type="button"
                            className="generate-qr-button"
                            onClick={
                                handleGenerateQR
                            }
                            disabled={
                                generatingQR
                            }
                        >
                            {generatingQR
                                ? "Generating QR..."
                                : "🍍 Generate QR Code"}
                        </button>

                    </div>
                )}

                {/* =========================================
                    GENERATED QR
                ========================================== */}
                {generatedQR && (
                    <div className="generated-qr-card">

                        <div className="section-header">

                            <div className="section-icon">
                                ✅
                            </div>

                            <div>
                                <h2>
                                    QR Code Generated
                                </h2>

                                <p>
                                    The pineapple batch QR
                                    record was created
                                    successfully.
                                </p>
                            </div>

                        </div>

                        {generatedQR.qrCodeImage && (
                            <img
                                src={
                                    generatedQR.qrCodeImage
                                }
                                alt="Generated pineapple QR code"
                                className="qr-code-image"
                            />
                        )}

                        <div className="qr-details">

                            <p>
                                <strong>
                                    Batch ID:
                                </strong>{" "}
                                {generatedQR.batchId}
                            </p>

                            <p>
                                <strong>
                                    QR ID:
                                </strong>{" "}
                                {generatedQR.qrId}
                            </p>

                            <p>
                                <strong>
                                    Warehouse:
                                </strong>{" "}
                                {generatedQR.warehouseId}
                            </p>

                            <p>
                                <strong>
                                    Predicted Price:
                                </strong>{" "}
                                Rs.{" "}
                                {Number(
                                    prediction?.predicted_price_lkr || 0
                                ).toLocaleString(
                                    "en-LK",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </p>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default QRPricePrediction;
