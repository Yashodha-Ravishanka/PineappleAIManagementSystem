
import { useEffect, useState } from "react";

import {
    getAllPineapples,
    updatePineapple,
    deletePineapple,
} from "../services/api";

import "./PineappleTable.css";


function PineappleTable({ pineapples = [] }) {

    const [data, setData] = useState(pineapples);

    const [editItem, setEditItem] = useState(null);

    const [viewItem, setViewItem] = useState(null);

    const [search, setSearch] = useState("");

    const [notification, setNotification] = useState(null);


    // =====================================================
    // USE DATA FROM DASHBOARD
    // =====================================================

    useEffect(() => {

        if (Array.isArray(pineapples)) {

            setData(pineapples);

        }

    }, [pineapples]);


    // =====================================================
    // RELOAD DATA
    // Used after EDIT / DELETE
    // =====================================================

    const loadData = async () => {

        try {

            const response =
                await getAllPineapples();

            const newData =
                Array.isArray(response)
                    ? response
                    : response?.data || [];

            setData(newData);

        } catch (error) {

            console.error(
                "Failed to load pineapple data:",
                error
            );

        }

    };


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
    // SORT NEWEST BATCH FIRST
    // =====================================================

    latestBatchData.sort((a, b) => {

        return (
            new Date(b.timestamp || 0) -
            new Date(a.timestamp || 0)
        );

    });


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredData =
        latestBatchData.filter((item) => {

            const searchText =
                search.toLowerCase();


            return (

                String(
                    item.batchId || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    item.warehouseId || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    item.location || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    item.quality || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    item.qualityGrade || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    item.riskLevel || ""
                )
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    // =====================================================
    // QUALITY GRADE CLASS
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
                        Number(
                            editItem.temperature
                        ),

                    humidity:
                        Number(
                            editItem.humidity
                        ),

                    storage_days:
                        Number(
                            editItem.storage_days
                        ),

                    mq135:
                        Number(
                            editItem.mq135 || 0
                        ),

                    location:
                        editItem.location

                }

            );


            setNotification(
                "Pineapple batch updated successfully. AI quality and grade recalculated."
            );


            setEditItem(null);


            await loadData();


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


            await loadData();


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

                <div className="table-title">

                    <div className="table-title-icon">
                        🍍
                    </div>

                    <div>

                        <h2>
                            Recently Added Data
                        </h2>

                        <p>
                            Latest pineapple batch monitoring records
                        </p>

                    </div>

                </div>


                <div className="batch-count">

                    {filteredData.length} Batch
                    {filteredData.length !== 1 ? "es" : ""}

                </div>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="table-controls">

                <div className="search-wrapper">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input

                        type="text"

                        placeholder="Search batch, warehouse, quality, grade..."

                        value={search}

                        onChange={(e) =>
                            setSearch(e.target.value)
                        }

                        className="search-input"

                    />

                    {search && (

                        <button
                            className="clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>

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

                                    <div className="no-data-content">

                                        <span>
                                            🍍
                                        </span>

                                        <strong>
                                            No pineapple data found
                                        </strong>

                                        <small>
                                            Add a pineapple batch to see it here.
                                        </small>

                                    </div>

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

                                            <span className="batch-id">

                                                {item.batchId || "N/A"}

                                            </span>

                                        </td>


                                        {/* WAREHOUSE */}

                                        <td>

                                            <span className="warehouse-value">

                                                {item.warehouseId || "N/A"}

                                            </span>

                                        </td>


                                        {/* TEMPERATURE */}

                                        <td>

                                            <span className="sensor-value temperature-value">

                                                {item.temperature ?? "N/A"} °C

                                            </span>

                                        </td>


                                        {/* HUMIDITY */}

                                        <td>

                                            <span className="sensor-value humidity-value">

                                                {item.humidity ?? "N/A"} %

                                            </span>

                                        </td>


                                        {/* MQ135 */}

                                        <td>

                                            <span className="mq-value">

                                                {item.mq135 ?? 0}

                                            </span>

                                        </td>


                                        {/* QUALITY */}

                                        <td>

                                            <span
                                                className={
                                                    `quality-${String(
                                                        item.quality ||
                                                        "pending"
                                                    ).toLowerCase()}`
                                                }
                                            >

                                                {item.quality ||
                                                    "Pending"}

                                            </span>

                                        </td>


                                        {/* GRADE */}

                                        <td>

                                            <span
                                                className={
                                                    `quality-grade ${gradeClass(
                                                        grade
                                                    )}`
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
                                                        item.riskLevel ||
                                                        "pending"
                                                    ).toLowerCase()}`
                                                }
                                            >

                                                {item.riskLevel ||
                                                    "Pending"}

                                            </span>

                                        </td>


                                        {/* LOCATION */}

                                        <td>

                                            <span className="location-value">

                                                {item.location ||
                                                    "N/A"}

                                            </span>

                                        </td>


                                        {/* TIMESTAMP */}

                                        <td>

                                            <span className="timestamp-value">

                                                {formatDate(
                                                    item.timestamp
                                                )}

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="action-buttons">

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

                                            </div>

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

                <div className="edit-overlay">

                    <div className="details-box">

                        <div className="modal-header">

                            <div>

                                <div className="modal-icon">
                                    🍍
                                </div>

                                <div>

                                    <h2>
                                        Pineapple Batch Details
                                    </h2>

                                </div>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setViewItem(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="details-grid">

                            <div className="detail-item">

                                <span>
                                    Batch ID
                                </span>

                                <strong>
                                    {viewItem.batchId}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Warehouse
                                </span>

                                <strong>
                                    {viewItem.warehouseId}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Temperature
                                </span>

                                <strong>
                                    {viewItem.temperature} °C
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Humidity
                                </span>

                                <strong>
                                    {viewItem.humidity} %
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    MQ135
                                </span>

                                <strong>
                                    {viewItem.mq135 ?? 0}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Storage Days
                                </span>

                                <strong>
                                    {viewItem.storage_days}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    AI Quality
                                </span>

                                <strong>
                                    {viewItem.quality ||
                                        "Pending"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    AI Quality Grade
                                </span>

                                <strong>

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

                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    AI Confidence
                                </span>

                                <strong>

                                    {viewItem.qualityScore !==
                                        undefined &&
                                    viewItem.qualityScore !==
                                        null &&
                                    viewItem.qualityScore > 0

                                        ? `${(
                                            Number(
                                                viewItem.qualityScore
                                            ) * 100
                                        ).toFixed(1)}%`

                                        : "N/A"}

                                </strong>

                            </div>


                            <div className="detail-item">

                                <span>
                                    Risk
                                </span>

                                <strong>
                                    {viewItem.riskLevel ||
                                        "Pending"}
                                </strong>

                            </div>

                        </div>


                        <div className="recommendation-box">

                            <span>
                                AI Recommendation
                            </span>

                            <p>
                                {viewItem.recommendation ||
                                    "Monitor batch"}
                            </p>

                        </div>


                        <div className="location-box">

                            <span>
                                Location
                            </span>

                            <strong>
                                {viewItem.location ||
                                    "N/A"}
                            </strong>

                        </div>


                        <div className="last-updated-box">

                            Last Updated:{" "}

                            {formatDate(
                                viewItem.timestamp
                            )}

                        </div>


                        <button
                            className="modal-close-btn"
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

                <div className="edit-overlay">

                    <div className="edit-box">

                        <div className="modal-header">

                            <div>

                                <div className="modal-icon">
                                    ✏️
                                </div>

                                <div>

                                    <h2>
                                        Edit Pineapple Batch
                                    </h2>

                                </div>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setEditItem(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="edit-warehouse">

                            Warehouse:

                            <strong>
                                {" "}
                                {editItem.warehouseId}
                            </strong>

                        </div>


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


                        <div className="ai-notice">

                            <strong>
                                🤖 AI
                            </strong>

                            Quality, Grade, Risk and
                            Recommendation will be
                            recalculated after saving.

                        </div>


                        <div className="modal-actions">

                            <button
                                className="save-btn"
                                onClick={handleUpdate}
                            >
                                Save Changes
                            </button>


                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setEditItem(null)
                                }
                            >
                                Cancel
                            </button>

                        </div>

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

