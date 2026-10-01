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
    const [search, setSearch] = useState("");
    const [viewItem, setViewItem] = useState(null);

    // ===============================
    // LOAD DATA
    // ===============================

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const result = await getAllPineapples();

            console.log("TABLE DATA:", result);

            setData(result);
        } catch (error) {
            console.log("LOAD ERROR:", error);
        }
    }

    // ===============================
    // GET LATEST READING
    // FOR EACH UNIQUE BATCH
    // ===============================

    const latestByBatch = {};

    data.forEach((item) => {
        const batchId = item.batchId || "Unknown";

        const existing = latestByBatch[batchId];

        if (
            !existing ||
            new Date(item.timestamp) > new Date(existing.timestamp)
        ) {
            latestByBatch[batchId] = item;
        }
    });

    const latestData = Object.values(latestByBatch);

    // ===============================
    // EDIT
    // ===============================

    function editData(item) {
        setEditItem({
            ...item,
            storage_days: item.storage_days || 0,
        });
    }

    // ===============================
    // SAVE UPDATE
    // ===============================

    async function saveUpdate() {
        try {
            await updatePineapple(editItem._id, {
                temperature: Number(editItem.temperature),
                humidity: Number(editItem.humidity),
                storage_days: Number(editItem.storage_days),
                location: editItem.location,
            });

            alert("AI prediction updated successfully");

            setEditItem(null);

            await loadData();

            window.dispatchEvent(
                new Event("pineappleAdded")
            );
        } catch (error) {
            console.log("UPDATE ERROR:", error);

            alert("Update failed");
        }
    }

    // ===============================
    // DELETE
    // ===============================

    async function removeData(id) {
        try {
            if (
                window.confirm(
                    "Delete this pineapple batch?"
                )
            ) {
                await deletePineapple(id);

                await loadData();
            }
        } catch (error) {
            console.log("DELETE ERROR:", error);
        }
    }

    // ===============================
    // QUALITY CLASS
    // ===============================

    function qualityClass(value) {
        switch (value?.toLowerCase()) {
            case "good":
                return "quality-good";

            case "average":
                return "quality-average";

            case "bad":
                return "quality-bad";

            default:
                return "quality-pending";
        }
    }

    // ===============================
    // RISK CLASS
    // ===============================

    function riskClass(value) {
        switch (value?.toLowerCase()) {
            case "low":
                return "risk-low";

            case "medium":
                return "risk-medium";

            case "high":
                return "risk-high";

            default:
                return "risk-pending";
        }
    }

    // ===============================
    // FORMAT TIME
    // ===============================

    function formatTime(timestamp) {
        if (!timestamp) {
            return "N/A";
        }

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleString();
    }

    // ===============================
    // SEARCH
    // ===============================

    const filteredData = latestData.filter((item) => {
        const searchText = search.toLowerCase();

        return (
            (item.batchId || "")
                .toLowerCase()
                .includes(searchText) ||

            (item.warehouseId || "")
                .toLowerCase()
                .includes(searchText) ||

            (item.location || "")
                .toLowerCase()
                .includes(searchText) ||

            (item.quality || "")
                .toLowerCase()
                .includes(searchText) ||

            (item.riskLevel || "")
                .toLowerCase()
                .includes(searchText)
        );
    });

    // ===============================
    // DASHBOARD UI
    // ===============================

    return (
        <div className="table-container">

            <div className="table-header">

                <div className="table-title">

                    <span className="table-title-icon">
                        🍍
                    </span>

                    <div>
                        <h2>
                            Pineapple Batch Data
                        </h2>

                        <p>
                            Latest sensor reading for each unique pineapple batch
                        </p>
                    </div>

                </div>

                <div className="batch-count">
                    {filteredData.length}{" "}
                    {filteredData.length === 1
                        ? "Batch"
                        : "Batches"}
                </div>

            </div>

            {/* ===============================
                SEARCH
                =============================== */}

            <div className="table-controls">

                <div className="search-wrapper">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input
                        className="search-input"
                        placeholder="Search batch, warehouse, location, quality or risk..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            className="clear-search"
                            onClick={() => setSearch("")}
                            type="button"
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>

            {/* ===============================
                TABLE
                =============================== */}

            <div className="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Batch ID
                            </th>

                            <th>
                                🏭 Warehouse
                            </th>

                            <th>
                                🌡 Temperature
                            </th>

                            <th>
                                💧 Humidity
                            </th>

                            <th>
                                🧪 MQ135 Raw
                            </th>

                            <th>
                                Quality
                            </th>

                            <th>
                                Risk
                            </th>

                            <th>
                                📍 Location
                            </th>

                            <th>
                                🕒 Last Updated
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
                                    colSpan="10"
                                    className="no-data"
                                >

                                    <div className="no-data-content">

                                        <span>
                                            🍍
                                        </span>

                                        <strong>
                                            No batch data found
                                        </strong>

                                        <small>
                                            Try changing your search
                                            or wait for sensor data.
                                        </small>

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            filteredData.map((item) => (

                                <tr
                                    key={item.batchId}
                                >

                                    {/* Batch ID */}

                                    <td>
                                        <span className="batch-id">
                                            {item.batchId}
                                        </span>
                                    </td>

                                    {/* Warehouse */}

                                    <td>
                                        <span className="warehouse-value">
                                            🏭{" "}
                                            {item.warehouseId || "WH-001"}
                                        </span>
                                    </td>

                                    {/* Temperature */}

                                    <td>
                                        <span className="sensor-value temperature-value">
                                            {item.temperature ?? "--"} °C
                                        </span>
                                    </td>

                                    {/* Humidity */}

                                    <td>
                                        <span className="sensor-value humidity-value">
                                            {item.humidity ?? "--"} %
                                        </span>
                                    </td>

                                    {/* MQ135 */}

                                    <td>
                                        <span className="mq-value">
                                            🧪{" "}
                                            {item.mq135 ?? 0}
                                        </span>
                                    </td>

                                    {/* Quality */}

                                    <td>

                                        <span
                                            className={qualityClass(
                                                item.quality
                                            )}
                                        >
                                            {item.quality || "Pending"}
                                        </span>

                                    </td>

                                    {/* Risk */}

                                    <td>

                                        <span
                                            className={riskClass(
                                                item.riskLevel
                                            )}
                                        >
                                            {item.riskLevel || "Pending"}
                                        </span>

                                    </td>

                                    {/* Location */}

                                    <td>
                                        <span className="location-value">
                                            📍{" "}
                                            {item.location || "N/A"}
                                        </span>
                                    </td>

                                    {/* Last Updated */}

                                    <td>

                                        <span className="timestamp-value">
                                            {formatTime(
                                                item.timestamp
                                            )}
                                        </span>

                                    </td>

                                    {/* Actions */}

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    setViewItem(item)
                                                }
                                            >
                                                👁 View
                                            </button>

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    editData(item)
                                                }
                                            >
                                                ✏ Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    removeData(item._id)
                                                }
                                            >
                                                🗑 Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

            {/* ===============================
                VIEW DETAILS
                =============================== */}

            {viewItem && (

                <div className="edit-overlay">

                    <div className="details-box">

                        <div className="modal-header">

                            <div>
                                <span className="modal-icon">
                                    🍍
                                </span>

                                <h2>
                                    Batch Details
                                </h2>
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
                                <span>Batch ID</span>
                                <strong>
                                    {viewItem.batchId}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>🏭 Warehouse</span>
                                <strong>
                                    {viewItem.warehouseId || "WH-001"}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>🌡 Temperature</span>
                                <strong>
                                    {viewItem.temperature} °C
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>💧 Humidity</span>
                                <strong>
                                    {viewItem.humidity} %
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>🧪 MQ135 Raw</span>
                                <strong>
                                    {viewItem.mq135 ?? 0}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>📅 Storage Days</span>
                                <strong>
                                    {viewItem.storage_days ?? 0}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>⭐ Quality</span>
                                <strong>
                                    <span
                                        className={qualityClass(
                                            viewItem.quality
                                        )}
                                    >
                                        {viewItem.quality || "Pending"}
                                    </span>
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>⚠ Risk</span>
                                <strong>
                                    <span
                                        className={riskClass(
                                            viewItem.riskLevel
                                        )}
                                    >
                                        {viewItem.riskLevel || "Pending"}
                                    </span>
                                </strong>
                            </div>

                        </div>

                        <div className="recommendation-box">

                            <span>
                                🤖 AI Recommendation
                            </span>

                            <p>
                                {viewItem.recommendation ||
                                    "No recommendation available."}
                            </p>

                        </div>

                        <div className="location-box">

                            <span>
                                📍 Location
                            </span>

                            <strong>
                                {viewItem.location || "N/A"}
                            </strong>

                        </div>

                        <div className="last-updated-box">

                            🕒 Last Updated:{" "}
                            {formatTime(
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

            {/* ===============================
                EDIT BATCH
                =============================== */}

            {editItem && (

                <div className="edit-overlay">

                    <div className="edit-box">

                        <div className="modal-header">

                            <div>
                                <span className="modal-icon">
                                    🍍
                                </span>

                                <h3>
                                    Edit Pineapple Batch
                                </h3>
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
                            🏭 Warehouse:{" "}
                            <strong>
                                {editItem.warehouseId || "WH-001"}
                            </strong>
                        </div>

                        <label>
                            🌡 Temperature °C
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
                                        e.target.value,
                                })
                            }
                        />

                        <label>
                            💧 Humidity %
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
                                        e.target.value,
                                })
                            }
                        />

                        <label>
                            📅 Storage Days
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
                                        e.target.value,
                                })
                            }
                        />

                        <label>
                            📍 Location
                        </label>

                        <input
                            type="text"
                            value={
                                editItem.location || ""
                            }
                            onChange={(e) =>
                                setEditItem({
                                    ...editItem,
                                    location:
                                        e.target.value,
                                })
                            }
                        />

                        <div className="ai-notice">

                            🤖 AI will recalculate
                            <strong>
                                Quality
                            </strong>
                            and
                            <strong>
                                Risk
                            </strong>

                        </div>

                        <div className="modal-actions">

                            <button
                                className="save-btn"
                                onClick={saveUpdate}
                            >
                                ✓ Save Update
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

        </div>
    );
}

export default PineappleTable;