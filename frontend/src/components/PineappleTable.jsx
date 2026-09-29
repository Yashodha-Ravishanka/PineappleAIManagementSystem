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

      <h2>
        🍍 Pineapple Batch Data
      </h2>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: "15px",
        }}
      >
        Showing the latest sensor reading
        for each batch.
      </p>

      {/* ===============================
          SEARCH
          =============================== */}

      <input
        className="search-input"
        placeholder="Search Batch, Warehouse, Location, Quality, Risk"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* ===============================
          TABLE
          =============================== */}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >

        <table
          style={{
            minWidth: "1350px",
          }}
        >

          <thead>

            <tr>

              <th>
                Batch ID
              </th>

              <th>
                🏭 Warehouse
              </th>

              <th>
                Temperature
              </th>

              <th>
                Humidity
              </th>

              <th
                style={{
                  minWidth: "110px",
                  whiteSpace: "nowrap",
                }}
              >
                🧪 MQ135 Raw
              </th>

              <th>
                Quality
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
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.length === 0 ? (

              <tr>

                <td colSpan="10">
                  No Data Found
                </td>

              </tr>

            ) : (

              filteredData.map((item) => (

                <tr
                  key={item.batchId}
                >

                  {/* Batch ID */}

                  <td>
                    {item.batchId}
                  </td>

                  {/* Warehouse */}

                  <td
                    style={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🏭{" "}
                    {item.warehouseId || "WH-001"}
                  </td>

                  {/* Temperature */}

                  <td>
                    {item.temperature} °C
                  </td>

                  {/* Humidity */}

                  <td>
                    {item.humidity} %
                  </td>

                  {/* MQ135 */}

                  <td
                    style={{
                      minWidth: "110px",
                      fontWeight: "bold",
                      fontSize: "16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🧪 {item.mq135 ?? 0}
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
                    {item.location || "N/A"}
                  </td>

                  {/* Last Updated */}

                  <td>
                    {formatTime(
                      item.timestamp
                    )}
                  </td>

                  {/* Actions */}

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
                        editData(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        removeData(item._id)
                      }
                    >
                      Delete
                    </button>

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

            <h2>
              🍍 Batch Details
            </h2>

            <p>
              <strong>
                Batch ID:
              </strong>{" "}
              {viewItem.batchId}
            </p>

            <p>
              <strong>
                🏭 Warehouse:
              </strong>{" "}
              {viewItem.warehouseId || "WH-001"}
            </p>

            <p>
              <strong>
                🌡 Temperature:
              </strong>{" "}
              {viewItem.temperature} °C
            </p>

            <p>
              <strong>
                💧 Humidity:
              </strong>{" "}
              {viewItem.humidity} %
            </p>

            <p>
              <strong>
                🧪 MQ135 Raw:
              </strong>{" "}
              {viewItem.mq135 ?? 0}
            </p>

            <p>
              <strong>
                📅 Storage Days:
              </strong>{" "}
              {viewItem.storage_days ?? 0}
            </p>

            <p>
              <strong>
                ⭐ Quality:
              </strong>{" "}

              <span
                className={qualityClass(
                  viewItem.quality
                )}
              >
                {viewItem.quality || "Pending"}
              </span>

            </p>

            <p>
              <strong>
                ⚠ Risk:
              </strong>{" "}

              <span
                className={riskClass(
                  viewItem.riskLevel
                )}
              >
                {viewItem.riskLevel || "Pending"}
              </span>

            </p>

            <p>

              <strong>
                🤖 Recommendation:
              </strong>

              <br />

              {viewItem.recommendation ||
                "No recommendation available."}

            </p>

            <p>

              <strong>
                📍 Location:
              </strong>{" "}

              {viewItem.location || "N/A"}

            </p>

            <p>

              <strong>
                🕒 Last Updated:
              </strong>{" "}

              {formatTime(
                viewItem.timestamp
              )}

            </p>

            <button
              className="cancel-btn"
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

            <h3>
              🍍 Edit Pineapple Batch
            </h3>

            <p
              style={{
                color: "#94a3b8",
                marginBottom: "15px",
              }}
            >
              🏭 Warehouse:{" "}
              {editItem.warehouseId || "WH-001"}
            </p>

            <label>
              Temperature °C
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
              Humidity %
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
                    e.target.value,
                })
              }
            />

            <label>
              Location
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

            <p>
              🤖 AI will recalculate
              Quality and Risk
            </p>

            <button
              className="save-btn"
              onClick={saveUpdate}
            >
              Save Update
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

      )}

    </div>
  );
}

export default PineappleTable;
