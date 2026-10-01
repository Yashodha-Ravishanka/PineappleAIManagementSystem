import { useEffect, useState } from "react";

import {
    getAllPineapples,
    updatePineapple,
    deletePineapple,
} from "../services/api";

import "./PineappleTable.css";


function PineappleTable() {

    const [data, setData] = useState([]);

    const [editItem, setEditItem] = useState(null);

    const [viewItem, setViewItem] = useState(null);

    const [search, setSearch] = useState("");

    const [notification, setNotification] = useState(null);


    // =====================================================
    // LOAD PINEAPPLE DATA
    // =====================================================

    const loadData = async () => {

        try {

            const response =
                await getAllPineapples();

            setData(response.data || response);

        } catch (error) {

            console.error(
                "Failed to load pineapple data:",
                error
            );

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // =====================================================
    // GET LATEST READING FOR EACH BATCH
    // =====================================================

    const latestBatchData = Object.values(

        data.reduce((acc, item) => {

            const batchId =
                item.batchId || item._id;

            if (
                !acc[batchId] ||
                new Date(item.timestamp) >
                new Date(acc[batchId].timestamp)
            ) {

                acc[batchId] = item;

            }

            return acc;

        }, {})

    );


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredData =
        latestBatchData.filter((item) => {

            const searchText =
                search.toLowerCase();

            return (

                String(item.batchId || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.warehouseId || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.location || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.quality || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.qualityGrade || "")
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(item.riskLevel || "")
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    // =====================================================
    // QUALITY GRADE CLASS
    // =====================================================
    // Grade comes from the AI service.
    //
    // A = AI generated Grade A
    // B = AI generated Grade B
    // C = AI generated Grade C
    // D = AI generated Grade D
    // Pending = no grade yet
    // =====================================================

    const gradeClass = (grade) => {

        if (!grade) {
            return "grade-pending";
        }

        const value =
            String(grade)
                .trim()
                .toUpperCase();

        switch (value) {

            case "A":
                return "grade-a";

            case "B":
                return "grade-b";

            case "C":
                return "grade-c";

            case "D":
                return "grade-d";

            default:
                return "grade-pending";

        }

    };


    // =====================================================
    // SAVE EDIT
    // =====================================================

    const handleUpdate = async () => {

        try {

            await updatePineapple(
                editItem._id,
                {

                    temperature:
                        Number(editItem.temperature),

                    humidity:
                        Number(editItem.humidity),

                    storage_days:
                        Number(editItem.storage_days),

                    mq135:
                        Number(editItem.mq135 || 0),

                    location:
                        editItem.location

                }
            );


            setNotification(
                "Pineapple batch updated successfully. AI quality and grade recalculated."
            );


            setEditItem(null);

            loadData();


        } catch (error) {

            console.error(
                "Update failed:",
                error
            );

            setNotification(
                "Failed to update pineapple batch."
            );

        }

    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this pineapple batch?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            await deletePineapple(id);

            setNotification(
                "Pineapple batch deleted successfully."
            );

            loadData();


        } catch (error) {

            console.error(
                "Delete failed:",
                error
            );

            setNotification(
                "Failed to delete pineapple batch."
            );

        }

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (timestamp) => {

        if (!timestamp) {
            return "N/A";
        }

        return new Date(timestamp)
            .toLocaleString();

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="pineapple-table-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="table-header">

                <h2>
                    Pineapple Quality Monitoring
                </h2>


                <input

                    type="text"

                    placeholder="Search batch, warehouse, quality, grade..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                    className="search-input"

                />

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="table-wrapper">

                <table className="pineapple-table">

                    <thead>

                        <tr>

                            <th>
                                Batch ID
                            </th>

                            <th>
                                Warehouse
                            </th>

                            <th>
                                Temperature
                            </th>

                            <th>
                                Humidity
                            </th>

                            <th>
                                MQ135 Raw
                            </th>

                            <th>
                                Quality
                            </th>

                            <th>
                                Grade
                            </th>

                            <th>
                                Risk
                            </th>

                            <th>
                                Location
                            </th>

                            <th>
                                Last Updated
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredData.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="11"
                                    className="no-data"
                                >
                                    No pineapple data found.
                                </td>

                            </tr>

                        ) : (

                            filteredData.map((item) => {

                                const grade =
                                    item.qualityGrade ||
                                    "Pending";


                                return (

                                    <tr key={item._id}>

                                        {/* BATCH ID */}

                                        <td>
                                            {item.batchId || "N/A"}
                                        </td>


                                        {/* WAREHOUSE */}

                                        <td>
                                            {item.warehouseId || "N/A"}
                                        </td>


                                        {/* TEMPERATURE */}

                                        <td>
                                            {item.temperature ?? "N/A"} °C
                                        </td>


                                        {/* HUMIDITY */}

                                        <td>
                                            {item.humidity ?? "N/A"} %
                                        </td>


                                        {/* MQ135 */}

                                        <td>
                                            {item.mq135 ?? 0}
                                        </td>


                                        {/* QUALITY */}

                                        <td>

                                            <span
                                                className={
                                                    `quality-${String(
                                                        item.quality || "pending"
                                                    )
                                                        .toLowerCase()}`
                                                }
                                            >

                                                {item.quality ||
                                                    "Pending"}

                                            </span>

                                        </td>


                                        {/* =================================================
                                            AI QUALITY GRADE
                                        ================================================= */}

                                        <td>

                                            <span
                                                className={
                                                    `quality-grade ${gradeClass(grade)}`
                                                }
                                            >

                                                {grade}

                                            </span>

                                        </td>


                                        {/* RISK */}

                                        <td>

                                            <span
                                                className={
                                                    `risk-${String(
                                                        item.riskLevel || "pending"
                                                    )
                                                        .toLowerCase()}`
                                                }
                                            >

                                                {item.riskLevel ||
                                                    "Pending"}

                                            </span>

                                        </td>


                                        {/* LOCATION */}

                                        <td>
                                            {item.location || "N/A"}
                                        </td>


                                        {/* TIMESTAMP */}

                                        <td>
                                            {formatDate(
                                                item.timestamp
                                            )}
                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    setViewItem(item)
                                                }
                                            >
                                                View
                                            </button>


                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    setEditItem({
                                                        ...item
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>


                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        item._id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                VIEW DETAILS MODAL
            ================================================= */}

            {viewItem && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>
                            Pineapple Batch Details
                        </h2>


                        <p>
                            <strong>Batch ID:</strong>{" "}
                            {viewItem.batchId}
                        </p>


                        <p>
                            <strong>Warehouse:</strong>{" "}
                            {viewItem.warehouseId}
                        </p>


                        <p>
                            <strong>Temperature:</strong>{" "}
                            {viewItem.temperature} °C
                        </p>


                        <p>
                            <strong>Humidity:</strong>{" "}
                            {viewItem.humidity} %
                        </p>


                        <p>
                            <strong>MQ135:</strong>{" "}
                            {viewItem.mq135 ?? 0}
                        </p>


                        <p>
                            <strong>Storage Days:</strong>{" "}
                            {viewItem.storage_days}
                        </p>


                        <p>
                            <strong>AI Quality:</strong>{" "}
                            {viewItem.quality || "Pending"}
                        </p>


                        <p>
                            <strong>AI Quality Grade:</strong>{" "}

                            <span
                                className={
                                    `quality-grade ${gradeClass(
                                        viewItem.qualityGrade
                                    )}`
                                }
                            >

                                {viewItem.qualityGrade ||
                                    "Pending"}

                            </span>

                        </p>


                        <p>
                            <strong>AI Confidence:</strong>{" "}

                            {viewItem.qualityScore !== undefined &&
                            viewItem.qualityScore !== null &&
                            viewItem.qualityScore > 0

                                ? `${(
                                    Number(viewItem.qualityScore) * 100
                                ).toFixed(1)}%`

                                : "N/A"

                            }

                        </p>


                        <p>
                            <strong>Risk:</strong>{" "}
                            {viewItem.riskLevel || "Pending"}
                        </p>


                        <p>
                            <strong>Recommendation:</strong>{" "}
                            {viewItem.recommendation ||
                                "Monitor batch"}
                        </p>


                        <p>
                            <strong>Location:</strong>{" "}
                            {viewItem.location}
                        </p>


                        <p>
                            <strong>Last Updated:</strong>{" "}
                            {formatDate(
                                viewItem.timestamp
                            )}
                        </p>


                        <button
                            className="close-btn"
                            onClick={() =>
                                setViewItem(null)
                            }
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}


            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {editItem && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>
                            Edit Pineapple Batch
                        </h2>


                        <label>
                            Temperature
                        </label>

                        <input

                            type="number"

                            value={
                                editItem.temperature ?? ""
                            }

                            onChange={(e) =>
                                setEditItem({

                                    ...editItem,

                                    temperature:
                                        e.target.value

                                })
                            }

                        />


                        <label>
                            Humidity
                        </label>

                        <input

                            type="number"

                            value={
                                editItem.humidity ?? ""
                            }

                            onChange={(e) =>
                                setEditItem({

                                    ...editItem,

                                    humidity:
                                        e.target.value

                                })
                            }

                        />


                        <label>
                            MQ135
                        </label>

                        <input

                            type="number"

                            value={
                                editItem.mq135 ?? 0
                            }

                            onChange={(e) =>
                                setEditItem({

                                    ...editItem,

                                    mq135:
                                        e.target.value

                                })
                            }

                        />


                        <label>
                            Storage Days
                        </label>

                        <input

                            type="number"

                            value={
                                editItem.storage_days ?? ""
                            }

                            onChange={(e) =>
                                setEditItem({

                                    ...editItem,

                                    storage_days:
                                        e.target.value

                                })
                            }

                        />


                        <label>
                            Location
                        </label>

                        <input

                            type="text"

                            value={
                                editItem.location ?? ""
                            }

                            onChange={(e) =>
                                setEditItem({

                                    ...editItem,

                                    location:
                                        e.target.value

                                })
                            }

                        />


                        <div className="modal-buttons">

                            <button
                                className="save-btn"
                                onClick={handleUpdate}
                            >
                                Save Changes
                            </button>


                            <button
                                className="close-btn"
                                onClick={() =>
                                    setEditItem(null)
                                }
                            >
                                Cancel
                            </button>

                        </div>


                        <p className="ai-note">
                            AI will recalculate Quality,
                            Grade, Risk and Recommendation
                            using the updated values.
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                NOTIFICATION
            ================================================= */}

            {notification && (

                <div className="notification">

                    <span>
                        {notification}
                    </span>

                    <button
                        onClick={() =>
                            setNotification(null)
                        }
                    >
                        ×
                    </button>

                </div>

            )}

        </div>

    );

}


export default PineappleTable;