import { useEffect, useState } from "react";
import axios from "axios";
import "./AddPineapple.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api/pineapple";

function AddPineapple() {
    const [formData, setFormData] = useState({
        batchId: "",
        storage_days: ""
    });

    const [environment, setEnvironment] = useState(null);
    const [loadingEnvironment, setLoadingEnvironment] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    /*
     * ---------------------------------------------------------
     * GET LATEST WAREHOUSE ENVIRONMENT
     * ---------------------------------------------------------
     */
    const loadEnvironment = async () => {
        try {
            setLoadingEnvironment(true);

            const response = await axios.get(
                `${API_URL}/environment/latest?warehouseId=WH-001`
            );

            console.log(
                "LATEST WAREHOUSE ENVIRONMENT:",
                response.data
            );

            if (response.data?.success) {
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
     * SUBMIT PINEAPPLE BATCH
     * ---------------------------------------------------------
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) {
            return;
        }

        if (!formData.batchId.trim()) {
            alert("Please enter a Batch ID.");
            return;
        }

        if (formData.storage_days === "") {
            alert("Please enter storage days.");
            return;
        }

        if (Number(formData.storage_days) < 0) {
            alert("Storage days cannot be negative.");
            return;
        }

        if (!environment) {
            alert(
                "Warehouse temperature and humidity data are not available."
            );
            return;
        }

        setSubmitting(true);

        try {
            const pineappleData = {
                batchId: formData.batchId.trim(),
                warehouseId: "WH-001",
                storage_days: Number(formData.storage_days),
                location:
                    environment.location || "Gampaha"
            };

            console.log(
                "SENDING PINEAPPLE DATA:",
                pineappleData
            );

            const response = await axios.post(
                `${API_URL}/add`,
                pineappleData
            );

            console.log(
                "BATCH SAVED:",
                response.data
            );

            alert(
                "Pineapple batch saved successfully!"
            );

            setFormData({
                batchId: "",
                storage_days: ""
            });

            loadEnvironment();
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
                    "Failed to save pineapple batch. Make sure the backend is running."
                );
            }
        } finally {
            setSubmitting(false);
        }
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
                    live warehouse sensor data.
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
                                    {Number(
                                        environment.temperature
                                    ).toFixed(1)}{" "}
                                    °C
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Humidity
                                </strong>

                                <span>
                                    {Number(
                                        environment.humidity
                                    ).toFixed(1)}{" "}
                                    %
                                </span>
                            </div>

                            <div>
                                <strong>
                                    MQ135
                                </strong>

                                <span>
                                    {Number(
                                        environment.mq135 || 0
                                    )}
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Location
                                </strong>

                                <span>
                                    {environment.location ||
                                        "Gampaha"}
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
                    ADD BATCH FORM
                -------------------------------------------- */}
                <form
                    onSubmit={handleSubmit}
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

                    {/* ---------------------------------------
                        SUBMIT
                    ---------------------------------------- */}
                    <button
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Saving..."
                            : "Add Pineapple Batch"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AddPineapple;