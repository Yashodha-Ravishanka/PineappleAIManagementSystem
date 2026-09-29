import { useState } from "react";
import { addPineapple } from "../services/api";
import "./AddPineapple.css";
import { useNavigate } from "react-router-dom";


function AddPineapple() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

        batchId: "",
        temperature: "",
        humidity: "",
        storage_days: "",
        location: ""

    });

    const [loading, setLoading] = useState(false);


    function handleChange(e) {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    }


    async function handleSubmit(e) {

        e.preventDefault();

        if (

            formData.batchId.trim() === "" ||

            formData.temperature === "" ||

            formData.humidity === "" ||

            formData.storage_days === "" ||

            formData.location.trim() === ""

        ) {

            alert("Please fill all fields");

            return;

        }


        try {

            setLoading(true);


            const pineappleData = {

                // Batch information
                batchId: formData.batchId,

                // Warehouse
                warehouseId: "WH-001",

                // Sensor values
                temperature: Number(
                    formData.temperature
                ),

                humidity: Number(
                    formData.humidity
                ),

                storage_days: Number(
                    formData.storage_days
                ),

                // Warehouse/location
                location: formData.location

            };


            console.log(
                "ADDING PINEAPPLE:",
                pineappleData
            );


            const result = await addPineapple(
                pineappleData
            );


            console.log(
                "BACKEND RESPONSE:",
                result
            );


            // Backend now returns the saved record
            // inside result.savedReading
            const savedBatch =
                result.savedReading || result;


            console.log(
                "SAVED BATCH:",
                savedBatch
            );


            alert(

                `🍍 Batch Added

Quality: ${savedBatch.quality}

Risk: ${savedBatch.riskLevel}

Warehouse: ${savedBatch.warehouseId}`

            );


            // Update dashboard
            window.dispatchEvent(
                new Event("pineappleAdded")
            );


            // Clear form
            setFormData({

                batchId: "",
                temperature: "",
                humidity: "",
                storage_days: "",
                location: ""

            });


            // Go to dashboard
            navigate("/dashboard");


        }

        catch (error) {

            console.log(
                "ADD ERROR:",
                error
            );


            alert(
                "Failed to add pineapple data"
            );

        }

        finally {

            setLoading(false);

        }

    }


    return (

        <div className="add-container">

            <h1>
                🍍 Add Pineapple Batch
            </h1>


            <form onSubmit={handleSubmit}>


                <input

                    type="text"

                    name="batchId"

                    placeholder="Batch ID"

                    value={formData.batchId}

                    onChange={handleChange}

                />


                {/* Warehouse */}

                <input

                    type="text"

                    value="WH-001 - Pineapple Central Warehouse"

                    readOnly

                />


                <input

                    type="number"

                    name="temperature"

                    placeholder="Temperature °C"

                    value={formData.temperature}

                    onChange={handleChange}

                    step="0.1"

                />


                <input

                    type="number"

                    name="humidity"

                    placeholder="Humidity %"

                    value={formData.humidity}

                    onChange={handleChange}

                    step="0.1"

                />


                <input

                    type="number"

                    name="storage_days"

                    placeholder="Storage Days"

                    value={formData.storage_days}

                    onChange={handleChange}

                    min="0"

                />


                <input

                    type="text"

                    name="location"

                    placeholder="Location"

                    value={formData.location}

                    onChange={handleChange}

                />


                <button

                    type="submit"

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        "🤖 AI Analyzing..."

                        :

                        "Add Pineapple"

                    }

                </button>


            </form>

        </div>

    );

}


export default AddPineapple;
