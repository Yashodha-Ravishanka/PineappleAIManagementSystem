import { useEffect, useState } from "react";
import axios from "axios";
import "./AddPineapple.css";

const API_URL = "http://localhost:3000/api/pineapple";

const PHOTO_AI_URL =
"http://127.0.0.1:5000/predict";

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


const [environment, setEnvironment] =
    useState(null);

const [environmentLoading, setEnvironmentLoading] =
    useState(true);

const [environmentError, setEnvironmentError] =
    useState("");


const [selectedImage, setSelectedImage] =
    useState(null);

const [imagePreview, setImagePreview] =
    useState("");

const [aiResult, setAiResult] =
    useState(null);

const [aiLoading, setAiLoading] =
    useState(false);

const [aiError, setAiError] =
    useState("");


const [loading, setLoading] =
    useState(false);

const [generatedQR, setGeneratedQR] =
    useState(null);

const [qrModalVisible, setQRModalVisible] =
    useState(false);


// ==========================================
// GET LATEST WAREHOUSE ENVIRONMENT
// ==========================================

const loadEnvironment = async () => {

    try {

        setEnvironmentLoading(true);

        setEnvironmentError("");

        const response = await axios.get(
            `${API_URL}/environment/latest?warehouseId=WH-001`
        );


        if (response.data.success) {

            setEnvironment(response.data);

        } else {

            setEnvironment(null);

        }

    } catch (error) {

        console.error(
            "Environment loading error:",
            error
        );

        setEnvironment(null);

        setEnvironmentError(
            error.response?.data?.message ||
            "No ESP32 sensor data available."
        );

    } finally {

        setEnvironmentLoading(false);

    }

};


// ==========================================
// LOAD ENVIRONMENT
// ==========================================

useEffect(() => {

    loadEnvironment();

    const interval = setInterval(
        loadEnvironment,
        5000
    );

    return () => {
        clearInterval(interval);
    };

}, []);


// ==========================================
// FORM CHANGE
// ==========================================

const handleChange = (e) => {

    const {
        name,
        value
    } = e.target;

    setFormData(previous => ({
        ...previous,
        [name]: value
    }));

};


// ==========================================
// IMAGE SELECTION
// ==========================================

const handleImageChange = (e) => {

    const file =
        e.target.files?.[0];

    if (!file) return;


    setSelectedImage(file);

    setImagePreview(
        URL.createObjectURL(file)
    );

    setAiResult(null);

    setAiError("");

};


// ==========================================
// GET BEST PHOTO PREDICTION
// ==========================================

const getBestPrediction = (result) => {

    if (result?.best_prediction) {

        return result.best_prediction;

    }


    if (
        result?.predictions &&
        result.predictions.length > 0
    ) {

        return result.predictions.reduce(
            (best, current) =>
                current.confidence >
                best.confidence
                    ? current
                    : best
        );

    }


    return null;

};


// ==========================================
// CALCULATE PHOTO QUALITY GRADE
// ==========================================

const calculatePhotoGrade = (
    prediction
) => {

    if (!prediction) {

        return "Pending";

    }


    const className =
        String(
            prediction.class_name || ""
        ).toLowerCase();


    const confidence =
        Number(
            prediction.confidence
        );


    // Rotten pineapple
    if (
        className.includes("rotten")
    ) {

        return "D";

    }


    // Fresh pineapple
    if (
        className.includes("fresh")
    ) {

        if (confidence >= 0.90) {

            return "A";

        }

        if (confidence >= 0.75) {

            return "B";

        }

        if (confidence >= 0.60) {

            return "C";

        }

        return "D";

    }


    return "Pending";

};


// ==========================================
// RUN PHOTO AI
// ==========================================

const handlePhotoPrediction = async () => {

    if (!selectedImage) {

        setAiError(
            "Please select a pineapple image first."
        );

        return;

    }


    try {

        setAiLoading(true);

        setAiError("");

        const data =
            new FormData();

        data.append(
            "image",
            selectedImage
        );


        const response =
            await axios.post(
                PHOTO_AI_URL,
                data,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );


        const result =
            response.data;


        const bestPrediction =
            getBestPrediction(result);


        const grade =
            calculatePhotoGrade(
                bestPrediction
            );


        setAiResult({

            ...result,

            bestPrediction,

            grade

        });


    } catch (error) {

        console.error(
            "Photo AI error:",
            error
        );

        setAiError(
            error.response?.data?.message ||
            "Photo AI prediction failed."
        );

    } finally {

        setAiLoading(false);

    }

};


// ==========================================
// SUBMIT
// ==========================================

const handleSubmit = async (e) => {

    e.preventDefault();


    // ======================================
    // CHECK ENVIRONMENT
    // ======================================

    if (!environment) {

        alert(
            "No warehouse temperature/humidity data is available. Please make sure the ESP32 is connected and sending sensor data."
        );

        return;

    }


    // ======================================
    // CHECK PHOTO AI
    // ======================================

    if (!aiResult?.bestPrediction) {

        alert(
            "Please select a pineapple image and run Photo AI before adding the batch."
        );

        return;

    }


    // ======================================
    // CHECK BATCH ID
    // ======================================

    if (!formData.batchId.trim()) {

        alert(
            "Please enter a Batch ID."
        );

        return;

    }


    try {

        setLoading(true);


        const bestPrediction =
            aiResult.bestPrediction;


        const qualityGrade =
            aiResult.grade ||
            "Pending";


        const qualityScore =
            Number(
                bestPrediction.confidence
            );


        // ==================================
        // SEND BATCH TO BACKEND
        // ==================================

        const pineappleData = {

            batchId:
                formData.batchId.trim(),

            warehouseId:
                "WH-001",

            storage_days:
                Number(
                    formData.storage_days
                ),

            location:
                environment.location ||
                "Gampaha",

            // Photo AI
            qualityGrade,

            qualityScore

        };


        console.log(
            "SENDING PINEAPPLE DATA:",
            pineappleData
        );


        const response =
            await axios.post(
                `${API_URL}/add`,
                pineappleData
            );


        console.log(
            "BATCH SAVED:",
            response.data
        );


        // ==================================
        // GENERATE QR CODE
        // ==================================

        const qrData = {

            batchId:
                formData.batchId.trim(),

            warehouseId:
                "WH-001",

            location:
                environment.location ||
                "Gampaha",

            // Sensor values
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

            // Product information
            fruitWeight:
                Number(
                    formData.fruitWeight || 0
                ),

            sizeGrade:
                formData.sizeGrade,

            marketPrice:
                Number(
                    formData.marketPrice || 0
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
                    formData.fruitLength || 0
                ),

            fruitWidth:
                Number(
                    formData.fruitWidth || 0
                ),

            fruitHeight:
                Number(
                    formData.fruitHeight || 0
                ),

            // IMPORTANT:
            // QR API expects a NUMBER.
            // It must NOT receive A/B/C/D.
            fruitQualityScore:
                Math.round(
                    qualityScore * 100
                )

        };


        console.log(
            "QR DATA:",
            qrData
        );


        try {

            const qrResponse =
                await axios.post(
                    QR_API_URL,
                    qrData
                );


            console.log(
                "QR RESPONSE:",
                qrResponse.data
            );


            setGeneratedQR(
                qrResponse.data
            );

            setQRModalVisible(true);


        } catch (qrError) {

            console.error(
                "QR generation error:",
                qrError
            );

            alert(
                "Pineapple batch was saved, but QR generation failed."
            );

        }


        // ==================================
        // RESET FORM
        // ==================================

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


        setSelectedImage(null);

        setImagePreview("");

        setAiResult(null);


    } catch (error) {

        console.error(
            "Add pineapple error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Failed to add pineapple batch."
        );

    } finally {

        setLoading(false);

    }

};


// ==========================================
// UI
// ==========================================

return (

    <div className="add-pineapple">

        <h2>
            Add Pineapple Batch
        </h2>


        {/* =================================
            WAREHOUSE ENVIRONMENT
        ================================= */}

        <div className="environment-card">

            <h3>
                🌡️ Warehouse Environment
            </h3>


            {environmentLoading && (

                <p>
                    Reading ESP32 sensor data...
                </p>

            )}


            {!environmentLoading &&
                environment && (

                <div>

                    <p>
                        <strong>
                            Temperature:
                        </strong>{" "}
                        {Number(
                            environment.temperature
                        ).toFixed(1)}
                        °C
                    </p>


                    <p>
                        <strong>
                            Humidity:
                        </strong>{" "}
                        {Number(
                            environment.humidity
                        ).toFixed(1)}
                        %
                    </p>


                    <p>
                        <strong>
                            Air Quality:
                        </strong>{" "}
                        {environment.mq135}
                    </p>


                    <p>
                        <strong>
                            Location:
                        </strong>{" "}
                        {environment.location}
                    </p>


                    <p>
                        <strong>
                            Sensor Time:
                        </strong>{" "}

                        {environment.timestamp
                            ? new Date(
                                environment.timestamp
                            ).toLocaleString()
                            : "Unknown"}

                    </p>


                    <p>
                        🟢 ESP32 sensor connected
                    </p>

                </div>

            )}


            {!environmentLoading &&
                !environment && (

                <p>

                    ⚠️{" "}

                    {environmentError ||
                        "No ESP32 sensor data available."}

                </p>

            )}

        </div>


        {/* =================================
            FORM
        ================================= */}

        <form
            onSubmit={handleSubmit}
        >


            {/* =================================
                BASIC INFORMATION
            ================================= */}

            <div>

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
                    required
                />

            </div>


            <div>

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
                    required
                />

            </div>


            {/* =================================
                PHOTO AI
            ================================= */}

            <div className="photo-ai-section">

                <h3>
                    📷 Pineapple Photo Analysis
                </h3>


                <input
                    type="file"
                    accept="image/*"
                    onChange={
                        handleImageChange
                    }
                />


                {imagePreview && (

                    <img
                        src={imagePreview}
                        alt="Pineapple preview"
                        style={{
                            width: "250px",
                            marginTop: "10px"
                        }}
                    />

                )}


                <button
                    type="button"
                    onClick={
                        handlePhotoPrediction
                    }
                    disabled={
                        aiLoading ||
                        !selectedImage
                    }
                >

                    {aiLoading
                        ? "Analyzing..."
                        : "Analyze Photo"}

                </button>


                {aiError && (

                    <p>
                        ⚠️ {aiError}
                    </p>

                )}


                {aiResult?.bestPrediction && (

                    <div>

                        <p>

                            <strong>
                                Detected:
                            </strong>{" "}

                            {
                                aiResult
                                    .bestPrediction
                                    .class_name
                            }

                        </p>


                        <p>

                            <strong>
                                Confidence:
                            </strong>{" "}

                            {(
                                Number(
                                    aiResult
                                        .bestPrediction
                                        .confidence
                                ) * 100
                            ).toFixed(2)}

                            %

                        </p>


                        <p>

                            <strong>
                                Automatic Quality Grade:
                            </strong>{" "}

                            {aiResult.grade}

                        </p>


                    </div>

                )}

            </div>


            {/* =================================
                PRODUCT INFORMATION
            ================================= */}

            <div>

                <label>
                    Fruit Weight (g)
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
                    min="0"
                />

            </div>


            <div>

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

                    <option value="Small">
                        Small
                    </option>

                    <option value="Medium">
                        Medium
                    </option>

                    <option value="Large">
                        Large
                    </option>

                </select>

            </div>


            <div>

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
                    min="0"
                />

            </div>


            <div>

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
                    min="0"
                />

            </div>


            <div>

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
                    min="0"
                />

            </div>


            <div>

                <label>
                    Fruit Length
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
                    min="0"
                />

            </div>


            <div>

                <label>
                    Fruit Width
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
                    min="0"
                />

            </div>


            <div>

                <label>
                    Fruit Height
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
                    min="0"
                />

            </div>


            {/* =================================
                SUBMIT
            ================================= */}

            <button
                type="submit"
                disabled={
                    loading ||
                    !environment ||
                    !aiResult?.bestPrediction
                }
            >

                {loading
                    ? "Saving..."
                    : "Add Pineapple Batch"}

            </button>


        </form>


        {/* =====================================
            QR MODAL
        ===================================== */}

        {qrModalVisible &&
            generatedQR && (

            <div>

                <h3>
                    QR Code Generated
                </h3>


                {generatedQR.qrCode && (

                    <img
                        src={
                            generatedQR.qrCode
                        }
                        alt="Generated QR Code"
                        style={{
                            width: "300px"
                        }}
                    />

                )}


                <button
                    type="button"
                    onClick={() =>
                        setQRModalVisible(false)
                    }
                >

                    Close

                </button>

            </div>

        )}

    </div>

);

}

export default AddPineapple;
