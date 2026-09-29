
import { useEffect, useState } from "react";
import { getAllPineapples } from "../services/api";
import "./SmartAlert.css";

function SmartAlert() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  async function loadData() {
    try {
      const result = await getAllPineapples();

      console.log("SMART ALERT DATA:", result);

      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("SMART ALERT ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Get the latest reading for each batch
   */
  const latestByBatch = {};

  data.forEach((item) => {
    const batchId = item.batchId || "Unknown";

    const existing = latestByBatch[batchId];

    if (
      !existing ||
      new Date(item.timestamp) >
        new Date(existing.timestamp)
    ) {
      latestByBatch[batchId] = item;
    }
  });

  const latestData = Object.values(latestByBatch);

  /*
   * Create alert information
   */
  const alerts = latestData.map((item) => {
    let type = "low";
    let title = "GOOD";
    let message =
      "This batch is currently in good condition.";

    const risk = String(
      item.riskLevel || ""
    ).toLowerCase();

    if (risk === "high") {
      type = "high";
      title = "HIGH RISK";
      message =
        "This batch has a high spoilage risk and requires immediate monitoring.";
    } else if (risk === "medium") {
      type = "medium";
      title = "MONITORING";
      message =
        "This batch has a medium spoilage risk and should be monitored.";
    } else if (risk === "low") {
      type = "low";
      title = "GOOD";
      message =
        "This batch currently has a low spoilage risk.";
    }

    return {
      type,
      title,
      message,
      batchId: item.batchId || "Unknown",
      temperature: item.temperature,
      humidity: item.humidity,
      mq135: item.mq135 ?? 0,
      quality: item.quality || "Pending",
      riskLevel: item.riskLevel || "Pending",
      recommendation:
        item.recommendation || "Monitor batch",
      location: item.location || "Unknown",
      timestamp: item.timestamp
    };
  });

  const highCount = alerts.filter(
    (item) => item.type === "high"
  ).length;

  const mediumCount = alerts.filter(
    (item) => item.type === "medium"
  ).length;

  const lowCount = alerts.filter(
    (item) => item.type === "low"
  ).length;

  /*
   * Search + risk filtering
   */
  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all") {
        return true;
      }

      return alert.type === filter;
    })
    .filter((alert) => {
      const searchText = search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        alert.batchId
          .toLowerCase()
          .includes(searchText) ||
        alert.location
          .toLowerCase()
          .includes(searchText) ||
        alert.quality
          .toLowerCase()
          .includes(searchText) ||
        alert.riskLevel
          .toLowerCase()
          .includes(searchText)
      );
    })
    /*
     * High risk first
     */
    .sort((a, b) => {
      const priority = {
        high: 1,
        medium: 2,
        low: 3
      };

      return (
        (priority[a.type] || 4) -
        (priority[b.type] || 4)
      );
    });

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

  return (
    <div className="smart-alert-page">

      {/* HEADER */}
      <div className="smart-alert-header">

        <div>
          <h1>🚨 Smart Alerts</h1>

          <p>
            AI-powered pineapple batch
            monitoring and risk alerts.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          Live Monitoring
        </div>

      </div>


      {/* SUMMARY */}
      <div className="alert-summary">

        <div className="summary-card">
          <span>Total Batches</span>
          <strong>{alerts.length}</strong>
        </div>

        <div className="summary-card high-card">
          <span>High Risk</span>
          <strong>{highCount}</strong>
        </div>

        <div className="summary-card medium-card">
          <span>Monitoring</span>
          <strong>{mediumCount}</strong>
        </div>

        <div className="summary-card low-card">
          <span>Good</span>
          <strong>{lowCount}</strong>
        </div>

      </div>


      {/* ALERT SECTION */}
      <div className="alerts-section">

        <div className="section-header">

          <div>
            <h2>Batch Alerts</h2>

            <span>
              Latest reading for each batch
            </span>
          </div>

        </div>


        {/* SEARCH + FILTERS */}
        <div className="alert-controls">

          <input
            type="text"
            className="alert-search"
            placeholder="🔍 Search Batch, Location, Quality, Risk"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="alert-filters">

            <button
              className={
                filter === "all"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={
                filter === "high"
                  ? "filter-btn high-filter active"
                  : "filter-btn high-filter"
              }
              onClick={() => setFilter("high")}
            >
              🔴 High Risk
            </button>

            <button
              className={
                filter === "medium"
                  ? "filter-btn medium-filter active"
                  : "filter-btn medium-filter"
              }
              onClick={() => setFilter("medium")}
            >
              🟠 Monitoring
            </button>

            <button
              className={
                filter === "low"
                  ? "filter-btn low-filter active"
                  : "filter-btn low-filter"
              }
              onClick={() => setFilter("low")}
            >
              🟢 Good
            </button>

          </div>

        </div>


        {/* RESULT COUNT */}
        {!loading && alerts.length > 0 && (
          <div className="alert-result-count">
            Showing{" "}
            <strong>
              {filteredAlerts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {alerts.length}
            </strong>{" "}
            batches
          </div>
        )}


        {/* CONTENT */}
        {loading ? (
          <div className="empty-alert">

            <h3>
              Loading Smart Alerts...
            </h3>

          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-alert">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              No Active Batch Data
            </h3>

            <p>
              No pineapple batch data is
              currently available.
            </p>

          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-alert">

            <div className="empty-icon">
              🔍
            </div>

            <h3>
              No Matching Batches
            </h3>

            <p>
              Try changing the search text
              or risk filter.
            </p>

          </div>
        ) : (
          <div className="alerts-list">

            {filteredAlerts.map((alert) => (

              <div
                key={alert.batchId}
                className={`smart-alert-card ${alert.type}`}
              >

                {/* CARD HEADER */}
                <div className="alert-card-header">

                  <div>

                    <span className="alert-type">
                      {alert.title}
                    </span>

                    <h3>
                      🍍 {alert.batchId}
                    </h3>

                  </div>

                  <span className="active-badge">
                    ACTIVE
                  </span>

                </div>


                {/* MESSAGE */}
                <p className="alert-message">
                  {alert.message}
                </p>


                {/* SENSOR DATA */}
                <div className="sensor-grid">

                  <div className="sensor-item">

                    <span>
                      🌡 Temperature
                    </span>

                    <strong>
                      {alert.temperature} °C
                    </strong>

                  </div>


                  <div className="sensor-item">

                    <span>
                      💧 Humidity
                    </span>

                    <strong>
                      {alert.humidity} %
                    </strong>

                  </div>


                  <div className="sensor-item">

                    <span>
                      🧪 MQ135 Raw
                    </span>

                    <strong>
                      {alert.mq135}
                    </strong>

                  </div>


                  <div className="sensor-item">

                    <span>
                      ⭐ Quality
                    </span>

                    <strong>
                      {alert.quality}
                    </strong>

                  </div>

                </div>


                {/* AI RECOMMENDATION */}
                <div className="recommendation">

                  <strong>
                    🤖 AI Recommendation
                  </strong>

                  <p>
                    {alert.recommendation}
                  </p>

                </div>


                {/* LOCATION + TIME */}
                <div className="alert-info">

                  <p>
                    📍 {alert.location}
                  </p>

                  <p>
                    🕒 Last Updated:{" "}
                    {formatTime(
                      alert.timestamp
                    )}
                  </p>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default SmartAlert;

