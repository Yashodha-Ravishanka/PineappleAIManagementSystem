
import { useEffect, useState } from "react";
import axios from "axios";
import "./AddPineapple.css";

const API_URL = "http://localhost:3000/api/pineapple";
const PHOTO_AI_URL = "http://127.0.0.1:5000/predict";
const QR_API_URL =
    "https://pineapple-ai-backend.de.deplexo.com/api/qr/generate";

function AddPineapple() {
    const [formData, setFormData] = useState({
        batchId: "",
        storage_days: "",
        fruitWeight: "",
        sizeGrade: "Large",
        marketPrice: "",
        aromaScore: "",
        sweetnessBrix: "",
        fruitLength: "",
        fruitWidth: "",
        fruitHeight: ""
    });

    const [environment, setEnvironment] = useState(null);
    const [loadingEnvironment, setLoadingEnvironment] = useState(true);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [photoPrediction, setPhotoPrediction] = useState(null);
    const [qualityGrade, setQualityGrade] = useState("Pending");
    const [qualityScore, setQualityScore] = useState(0);

    const [submitting, setSubmitting] = useState(false);

    const [generatedQR, setGeneratedQR] = useState(null);
    const [qrModalVisible, setQRModalVisible] = useState(false);

    // Keep the successfully generated batch ID
    // even after the form is reset.
    const [generatedBatchId, setGeneratedBatchId] = useState("");

    /*
     * ---------------------------------------------------------
     * GET LATEST WAREHOUSE ENVIRONMENT
     * ---------------------------------------------------------
     */
    const loadEnvironment = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/environment/latest?warehouseId=WH-001`
            );

            console.log(
                "LATEST WAREHOUSE ENVIRONMENT:",
                response.data
            );

            if (response.data?.success) {
                setEnvironment(response.data);
            }
        } catch (error) {
            console.error(
                "Environment loading error:",
                error
            );
        } finally {
            setLoadingEnvironment(false);
        }
    };

    useEffect(() => {
        loadEnvironment();

        const interval = setInterval(() => {
            loadEnvironment();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    /*
     * ---------------------------------------------------------
     * FORM INPUT
     * ---------------------------------------------------------
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    /*
     * ---------------------------------------------------------
     * IMAGE SELECT
     * ---------------------------------------------------------
     */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));

        setPhotoPrediction(null);
        setQualityGrade("Pending");
        setQualityScore(0);
    };

    /*
     * ---------------------------------------------------------
     * FIND BEST PHOTO AI PREDICTION
     * ---------------------------------------------------------
     */
    const getBestPrediction = (data) => {
        if (!data) {
            return null;
        }

        if (data.best_prediction) {
            return data.best_prediction;
        }

        if (
            Array.isArray(data.predictions) &&
            data.predictions.length > 0
        ) {
            return [...data.predictions].sort(
                (a, b) =>
                    Number(b.confidence || 0) -
                    Number(a.confidence || 0)
            )[0];
        }

        if (data.prediction) {
            return data.prediction;
        }

        return null;
    };

    /*
     * ---------------------------------------------------------
     * CALCULATE PHOTO QUALITY GRADE
     * ---------------------------------------------------------
     */
    const calculatePhotoGrade = (prediction) => {
        if (!prediction) {
            return "Pending";
        }

        const className = String(
            prediction.class ||
                prediction.class_name ||
                prediction.name ||
                prediction.label ||
                ""
        ).toLowerCase();

        const confidence = Number(
            prediction.confidence || 0
        );

        /*
         * Rotten fruit
         */
        if (className.includes("rotten")) {
            return "D";
        }

        /*
         * Fresh fruit
         */
        if (className.includes("fresh")) {
            if (confidence >= 0.9) {
                return "A";
            }

            if (confidence >= 0.75) {
                return "B";
            }

            if (confidence >= 0.6) {
                return "C";
            }

            return "D";
        }

        return "Pending";
    };

    /*
     * ---------------------------------------------------------
     * RUN PHOTO AI
     * ---------------------------------------------------------
     */
    const handlePhotoPrediction = async () => {
        if (!selectedImage) {
            alert(
                "Please select a pineapple image first."
            );
            return;
        }

        try {
            const imageData = new FormData();

            /*
             * IMPORTANT:
             * Photo AI expects the field name "image".
             */
            imageData.append(
                "image",
                selectedImage
            );

            const response = await axios.post(
                PHOTO_AI_URL,
                imageData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            console.log(
                "PHOTO AI RESPONSE:",
                response.data
            );

            const bestPrediction =
                getBestPrediction(
                    response.data
                );

            if (!bestPrediction) {
                alert(
                    "Photo AI could not detect the pineapple."
                );
                return;
            }

            const confidence = Number(
                bestPrediction.confidence || 0
            );

            const grade =
                calculatePhotoGrade(
                    bestPrediction
                );

            setPhotoPrediction(
                bestPrediction
            );

            setQualityScore(
                confidence
            );

            setQualityGrade(
                grade
            );

            console.log(
                "PHOTO QUALITY GRADE:",
                grade
            );

            console.log(
                "PHOTO QUALITY SCORE:",
                confidence
            );

            alert(
                `Photo analysis completed.\nQuality Grade: ${grade}\nConfidence: ${Math.round(
                    confidence * 100
                )}%`
            );
        } catch (error) {
            console.error(
                "PHOTO AI ERROR:",
                error
            );

            if (error.response) {
                console.error(
                    "PHOTO AI SERVER RESPONSE:",
                    error.response.data
                );
            }

            alert(
                "Photo AI prediction failed. Make sure the Photo AI service is running on port 5000."
            );
        }
    };

    /*
     * ---------------------------------------------------------
     * SUBMIT PINEAPPLE
     * ---------------------------------------------------------
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) {
            return;
        }

        if (!formData.batchId.trim()) {
            alert(
                "Please enter a Batch ID."
            );
            return;
        }

        if (!formData.storage_days) {
            alert(
                "Please enter storage days."
            );
            return;
        }

        if (!environment) {
            alert(
                "Warehouse temperature and humidity data are not available."
            );
            return;
        }

        setSubmitting(true);

        /*
         * Save this before resetting the form.
         */
        const currentBatchId =
            formData.batchId.trim();

        try {
            /*
             * -------------------------------------------------
             * SAVE PINEAPPLE BATCH
             * -------------------------------------------------
             */
            const pineappleData = {
                batchId:
                    currentBatchId,

                warehouseId:
                    "WH-001",

                storage_days:
                    Number(
                        formData.storage_days
                    ),

                location:
                    environment.location ||
                    "Gampaha",

                qualityGrade:
                    qualityGrade,

                qualityScore:
                    Number(
                        qualityScore
                    )
            };

            console.log(
                "SENDING PINEAPPLE DATA:",
                pineappleData
            );

            const batchResponse =
                await axios.post(
                    `${API_URL}/add`,
                    pineappleData
                );

            console.log(
                "BATCH SAVED:",
                batchResponse.data
            );

            /*
             * -------------------------------------------------
             * CONVERT PHOTO AI CONFIDENCE
             *
             * Photo AI:
             *     0 - 1
             *
             * Price AI:
             *     1 - 5
             *
             * Example:
             *     0.8941 -> 4
             * -------------------------------------------------
             */
            const photoScore5 =
                Math.min(
                    5,
                    Math.max(
                        1,
                        Math.round(
                            Number(
                                qualityScore
                            ) * 5
                        )
                    )
                );

            console.log(
                "PHOTO SCORE 0-1:",
                qualityScore
            );

            console.log(
                "QR / PRICE AI SCORE 1-5:",
                photoScore5
            );

            /*
             * -------------------------------------------------
             * QR DATA
             * -------------------------------------------------
             */
            const qrData = {
                batchId:
                    currentBatchId,

                warehouseId:
                    "WH-001",

                location:
                    environment.location ||
                    "Gampaha",

                temperature:
                    Number(
                        environment.temperature
                    ),

                humidity:
                    Number(
                        environment.humidity
                    ),

                storage_days:
                    Number(
                        formData.storage_days
                    ),

                fruitWeight:
                    Number(
                        formData.fruitWeight ||
                            0
                    ),

                sizeGrade:
                    formData.sizeGrade,

                marketPrice:
                    Number(
                        formData.marketPrice ||
                            0
                    ),

                aromaScore:
                    Number(
                        formData.aromaScore ||
                            0
                    ),

                sweetnessBrix:
                    Number(
                        formData.sweetnessBrix ||
                            0
                    ),

                fruitLength:
                    Number(
                        formData.fruitLength ||
                            0
                    ),

                fruitWidth:
                    Number(
                        formData.fruitWidth ||
                            0
                    ),

                fruitHeight:
                    Number(
                        formData.fruitHeight ||
                            0
                    ),

                /*
                 * Price AI requires 1-5.
                 */
                fruitQualityScore:
                    photoScore5,

                fruitRipenessScore:
                    photoScore5
            };

            console.log(
                "QR DATA:",
                qrData
            );

            /*
             * -------------------------------------------------
             * GENERATE QR
             * -------------------------------------------------
             */
            const qrResponse =
                await axios.post(
                    QR_API_URL,
                    qrData
                );

            console.log(
                "QR RESPONSE:",
                qrResponse.data
            );

            /*
             * -------------------------------------------------
             * SAVE GENERATED QR
             * -------------------------------------------------
             */
            setGeneratedQR(
                qrResponse.data.data
            );

            setGeneratedBatchId(
                currentBatchId
            );

            setQRModalVisible(
                true
            );

            /*
             * -------------------------------------------------
             * SUCCESS POPUP
             * -------------------------------------------------
             */
            alert(
                "Pineapple batch saved successfully and QR code generated!"
            );

            /*
             * -------------------------------------------------
             * RESET FORM
             * -------------------------------------------------
             */
            setFormData({
                batchId: "",
                storage_days: "",
                fruitWeight: "",
                sizeGrade: "Large",
                marketPrice: "",
                aromaScore: "",
                sweetnessBrix: "",
                fruitLength: "",
                fruitWidth: "",
                fruitHeight: ""
            });

            setSelectedImage(
                null
            );

            setImagePreview(
                ""
            );

            setPhotoPrediction(
                null
            );

            setQualityGrade(
                "Pending"
            );

            setQualityScore(
                0
            );
        } catch (error) {
            console.error(
                "ADD PINEAPPLE ERROR:",
                error
            );

            if (error.response) {
                console.error(
                    "SERVER RESPONSE:",
                    error.response.data
                );

                alert(
                    error.response.data?.message ||
                        error.response.data?.error ||
                        "Server returned an error."
                );
            } else {
                alert(
                    "Failed to save pineapple batch or generate QR code."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * CLOSE QR MODAL
     * ---------------------------------------------------------
     */
    const closeQRModal = () => {
        setQRModalVisible(
            false
        );
    };

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */
    return (
        <div className="add-pineapple-page">

            <div className="add-pineapple-container">

                <h1>
                    Add Pineapple Batch
                </h1>

                <p className="page-description">
                    Add a pineapple batch using
                    warehouse sensor data and
                    AI quality detection.
                </p>

                {/* -------------------------------------------
                    WAREHOUSE ENVIRONMENT
                -------------------------------------------- */}
                <div className="environment-card">

                    <h2>
                        Warehouse Environment
                    </h2>

                    {loadingEnvironment ? (
                        <p>
                            Loading sensor data...
                        </p>
                    ) : environment ? (
                        <div className="environment-grid">

                            <div>
                                <strong>
                                    Temperature
                                </strong>

                                <span>
                                    {
                                        Number(
                                            environment.temperature
                                        ).toFixed(1)
                                    } °C
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Humidity
                                </strong>

                                <span>
                                    {
                                        Number(
                                            environment.humidity
                                        ).toFixed(1)
                                    } %
                                </span>
                            </div>

                            <div>
                                <strong>
                                    MQ135
                                </strong>

                                <span>
                                    {
                                        Number(
                                            environment.mq135 ||
                                                0
                                        )
                                    }
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Location
                                </strong>

                                <span>
                                    {
                                        environment.location ||
                                        "Gampaha"
                                    }
                                </span>
                            </div>

                        </div>
                    ) : (
                        <p>
                            No warehouse sensor
                            data available.
                        </p>
                    )}

                </div>

                {/* -------------------------------------------
                    FORM
                -------------------------------------------- */}
                <form
                    onSubmit={
                        handleSubmit
                    }
                >

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
                            placeholder="Enter batch ID"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Storage Days
                        </label>

                        <input
                            type="number"
                            name="storage_days"
                            value={
                                formData.storage_days
                            }
                            onChange={
                                handleChange
                            }
                            min="0"
                            placeholder="Enter storage days"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Fruit Weight (kg)
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
                            placeholder="Enter market price"
                        />

                    </div>

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
                            placeholder="Enter aroma score"
                        />

                    </div>

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
                            placeholder="Example: 14"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Fruit Length (cm)
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
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Fruit Width (cm)
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
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Fruit Height (cm)
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
                        />

                    </div>

                    {/* ---------------------------------------
                        PHOTO AI
                    ---------------------------------------- */}
                    <div className="photo-ai-section">

                        <h2>
                            AI Quality Detection
                        </h2>

                        <div className="form-group">

                            <label>
                                Upload Pineapple Image
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                            />

                        </div>

                        {imagePreview && (
                            <div className="image-preview">

                                <img
                                    src={
                                        imagePreview
                                    }
                                    alt="Pineapple preview"
                                />

                            </div>
                        )}

                        <button
                            type="button"
                            onClick={
                                handlePhotoPrediction
                            }
                            disabled={
                                !selectedImage
                            }
                        >
                            Analyze Image
                        </button>

                        {photoPrediction && (
                            <div className="prediction-result">

                                <h3>
                                    Photo AI Result
                                </h3>

                                <p>
                                    <strong>
                                        Prediction:
                                    </strong>{" "}
                                    {
                                        photoPrediction.class ||
                                        photoPrediction.class_name ||
                                        photoPrediction.name ||
                                        photoPrediction.label ||
                                        "Unknown"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Confidence:
                                    </strong>{" "}
                                    {Math.round(
                                        Number(
                                            photoPrediction.confidence ||
                                                0
                                        ) * 100
                                    )}
                                    %
                                </p>

                                <p>
                                    <strong>
                                        Quality Grade:
                                    </strong>{" "}
                                    {
                                        qualityGrade
                                    }
                                </p>

                            </div>
                        )}

                    </div>

                    {/* ---------------------------------------
                        SUBMIT
                    ---------------------------------------- */}
                    <button
                        type="submit"
                        disabled={
                            submitting
                        }
                    >
                        {submitting
                            ? "Saving..."
                            : "Add Pineapple Batch"}
                    </button>

                </form>

            </div>

            {/* ---------------------------------------------
                QR MODAL
            ---------------------------------------------- */}
            {qrModalVisible &&
                generatedQR && (
                    <div className="qr-modal-overlay">

                        <div className="qr-modal">

                            <button
                                className="qr-close-button"
                                onClick={closeQRModal }
                            >
                                ×
                            </button>

                            <h2>
                                Pineapple QR Code
                            </h2>

                            <p>
                                Batch saved
                                successfully.
                            </p>

                           {generatedQR.qrCodeImage && (
                             <img
                                src={generatedQR.qrCodeImage}
                                alt="Generated QR Code"
                                className="generated-qr"
                               />
                            )}

                            <div className="qr-details">

                             <p>
                                    <strong>Batch ID:</strong>{" "}
                                    {generatedQR.batchId || generatedBatchId}
                                </p>

                             <p>
                                     <strong>QR ID:</strong>{" "}
                                     {generatedQR.qrId}
                                  </p>


                               <p>
                                    <strong>Warehouse:</strong>{" "}
                                    {generatedQR.warehouseId}
                                </p>

                                <p>
                                    QR code generated successfully.
                                </p>

                            </div>

                            <button
                                onClick={
                                    closeQRModal
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default AddPineapple;
