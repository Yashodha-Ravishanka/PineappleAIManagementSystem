import { useEffect, useState } from "react";

import VehicleEnvironment from "../components/VehicleEnvironment";
import PineappleTable from "../components/PineappleTable";
import QualityChart from "../components/QualityChart";
import ReportExport from "../components/ReportExport";
import StatusCard from "../components/StatusCard";
import AIPrediction from "../components/AIPrediction";
import RiskChart from "../components/RiskChart";
import TemperatureChart from "../components/TemperatureChart";
import HumidityChart from "../components/HumidityChart";
import GPSTracker from "../components/GPSTracker";

import { getAllPineapples } from "../services/api";

import "./Dashboard.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api/pineapple";

function Dashboard() {

    const [data, setData] = useState([]);

    // Latest warehouse ESP32 sensor reading
    const [environment, setEnvironment] = useState(null);

    // ===============================
    // LOAD DATA
    // ===============================

    useEffect(() => {

        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 5000);

        const updateDashboard = () => {

            console.log("Dashboard updated");

            loadData();

        };

        window.addEventListener(
            "pineappleAdded",
            updateDashboard
        );

        return () => {

            clearInterval(interval);

            window.removeEventListener(
                "pineappleAdded",
                updateDashboard
            );

        };

    }, []);

    // ===============================
    // LOAD DATABASE + SENSOR DATA
    // ===============================

    async function loadData() {

        try {

            // =================================
            // LOAD PINEAPPLE BATCH DATA
            // =================================

            const result =
                await getAllPineapples();

            setData(
                Array.isArray(result)
                    ? result
                    : []
            );

            // =================================
            // LOAD LATEST WAREHOUSE SENSOR DATA
            // =================================

            const environmentResponse =
                await fetch(
                    `${API_URL}/environment/latest?warehouseId=WH-001`
                );

            if (environmentResponse.ok) {

                const environmentData =
                    await environmentResponse.json();

                console.log(
                    "LATEST WAREHOUSE ENVIRONMENT:",
                    environmentData
                );

                setEnvironment(
                    environmentData
                );

            } else {

                console.log(
                    "No latest warehouse environment data"
                );

            }

        } catch (error) {

            console.log(
                "LOAD ERROR:",
                error
            );

        }

    }

    // ===============================
    // LATEST OVERALL READING
    // ===============================

    const latestBatch =
        data.length > 0
            ? data[data.length - 1]
            : null;

    // ===============================
    // DASHBOARD STATISTICS
    // ===============================

    const totalReadings =
        data.length;

    // ===============================
    // UNIQUE BATCH IDs
    // ===============================

    const uniqueBatchIds = [
        ...new Set(
            data.map(
                (item) => item.batchId
            )
        )
    ];

    const activeBatches =
        uniqueBatchIds.length;

    // ===============================
    // QUALITY COUNTS
    // ===============================

    const goodCount =
        data.filter(
            (item) =>
                item.quality === "Good"
        ).length;

    const averageCount =
        data.filter(
            (item) =>
                item.quality === "Average"
        ).length;

    const badCount =
        data.filter(
            (item) =>
                item.quality === "Bad"
        ).length;

    // ===============================
    // RISK COUNTS
    // ===============================

    const highRiskCount =
        data.filter(
            (item) =>
                item.riskLevel === "High"
        ).length;

    const mediumRiskCount =
        data.filter(
            (item) =>
                item.riskLevel === "Medium"
        ).length;

    const lowRiskCount =
        data.filter(
            (item) =>
                item.riskLevel === "Low"
        ).length;

    // ===============================
    // AVERAGE TEMPERATURE
    // ===============================

    const averageTemperature =
        data.length
            ? (
                data.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.temperature || 0
                        ),
                    0
                ) / data.length
            ).toFixed(1)
            : 0;

    // ===============================
    // AVERAGE HUMIDITY
    // ===============================

    const averageHumidity =
        data.length
            ? (
                data.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.humidity || 0
                        ),
                    0
                ) / data.length
            ).toFixed(1)
            : 0;

    // ===============================
    // LIVE ESP32 TEMPERATURE
    // ===============================

    const liveTemperature =
        environment
            ? Number(
                environment.temperature || 0
            )
            : Number(
                latestBatch?.temperature || 0
            );

    // ===============================
    // LIVE ESP32 HUMIDITY
    // ===============================

    const liveHumidity =
        environment
            ? Number(
                environment.humidity || 0
            )
            : Number(
                latestBatch?.humidity || 0
            );

    // ===============================
    // LIVE ESP32 MQ135 RAW VALUE
    // ===============================

    const latestMQ135 =
        environment
            ? Number(
                environment.mq135 || 0
            )
            : Number(
                latestBatch?.mq135 || 0
            );

    // ===============================
    // LIVE SENSOR LOCATION
    // ===============================

    const sensorLocation =
        environment?.location ||
        latestBatch?.location ||
        "Gampaha";

    // ===============================
    // SENSOR TIMESTAMP
    // ===============================

    const sensorTimestamp =
        environment?.timestamp ||
        latestBatch?.timestamp ||
        null;

    // ===============================
    // MQ135 PROJECT CALIBRATION
    // ===============================

    const MQ135_BASELINE =
        26.03;

    let mq135Status = "";
    let mq135Color = "";

    if (latestMQ135 <= 31) {

        mq135Status =
            "Normal";

        mq135Color =
            "#16a34a";

    } else if (latestMQ135 <= 39) {

        mq135Status =
            "Warning";

        mq135Color =
            "#facc15";

    } else {

        mq135Status =
            "High";

        mq135Color =
            "#dc2626";

    }

    // ===============================
    // ENVIRONMENT STATUS
    // ===============================

    const currentTemperature =
        liveTemperature;

    const currentHumidity =
        liveHumidity;

    let environmentStatus = "";
    let statusColor = "";

    if (
        currentTemperature <= 28 &&
        currentHumidity <= 70
    ) {

        environmentStatus =
            "Optimal Storage";

        statusColor =
            "#16a34a";

    } else if (
        currentTemperature <= 33 &&
        currentHumidity <= 85
    ) {

        environmentStatus =
            "Warning";

        statusColor =
            "#facc15";

    } else {

        environmentStatus =
            "Critical";

        statusColor =
            "#dc2626";

    }

    // ===============================
    // FIXED WAREHOUSE LOCATION
    // ===============================

    const WAREHOUSE_LATITUDE =
        7.243556;

    const WAREHOUSE_LONGITUDE =
        80.022711;

    const warehouseMapsURL =
        `https://www.google.com/maps?q=${WAREHOUSE_LATITUDE},${WAREHOUSE_LONGITUDE}`;

    // ===============================
    // DASHBOARD UI
    // ===============================

    return (

        <div className="dashboard-container">

            {/* ===============================
                DASHBOARD TITLE
                =============================== */}

            <div className="dashboard-header">

                <h1>
                    🍍 Pineapple AI Dashboard
                </h1>

                <p>
                    Smart warehouse and vehicle
                    quality monitoring system
                </p>

            </div>

            {/* ===============================
                WAREHOUSE MONITORING
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        🏭 Warehouse Monitoring
                    </h2>

                    <p>
                        Pineapple quality and warehouse
                        environmental conditions
                    </p>

                </div>

                {/* ===============================
                    STATUS CARDS
                    =============================== */}

                <div className="status-container">

                    <StatusCard
                        title="Sensor Readings"
                        value={totalReadings}
                        type="total"
                        icon="📡"
                    />

                    <StatusCard
                        title="Active Batches"
                        value={activeBatches}
                        type="total"
                        icon="🍍"
                    />

                    <StatusCard
                        title="Good"
                        value={goodCount}
                        type="good"
                        icon="✅"
                    />

                    <StatusCard
                        title="Average"
                        value={averageCount}
                        type="warning"
                        icon="⚠️"
                    />

                    <StatusCard
                        title="Bad"
                        value={badCount}
                        type="bad"
                        icon="❌"
                    />

                    <StatusCard
                        title="High Risk"
                        value={highRiskCount}
                        type="high-risk"
                        icon="🔴"
                    />

                    <StatusCard
                        title="Medium Risk"
                        value={mediumRiskCount}
                        type="medium-risk"
                        icon="🟠"
                    />

                    <StatusCard
                        title="Low Risk"
                        value={lowRiskCount}
                        type="low-risk"
                        icon="🟢"
                    />

                    <StatusCard
                        title="Temperature"
                        value={`${liveTemperature} °C`}
                        type="temperature"
                        icon="🌡️"
                    />

                    <StatusCard
                        title="Humidity"
                        value={`${liveHumidity} %`}
                        type="humidity"
                        icon="💧"
                    />

                    <StatusCard
                        title="MQ135 Raw Value"
                        value={latestMQ135}
                        type="air"
                        icon="🌫️"
                    />

                </div>

                {/* ===============================
                    LIVE SENSOR INFORMATION
                    =============================== */}

                <div className="environment-card">

                    <h2>
                        📡 Live Warehouse Sensor Data
                    </h2>

                    <p>
                        Temperature:
                        <strong>
                            {" " +
                                liveTemperature +
                                " °C"}
                        </strong>
                    </p>

                    <p>
                        Humidity:
                        <strong>
                            {" " +
                                liveHumidity +
                                " %"}
                        </strong>
                    </p>

                    <p>
                        MQ135 Raw Value:
                        <strong>
                            {" " +
                                latestMQ135}
                        </strong>
                    </p>

                    <p>
                        Location:
                        <strong>
                            {" " +
                                sensorLocation}
                        </strong>
                    </p>

                    {sensorTimestamp && (
                        <p>
                            Last Sensor Update:
                            <strong>
                                {" " +
                                    new Date(
                                        sensorTimestamp
                                    ).toLocaleString()}
                            </strong>
                        </p>
                    )}

                </div>

                {/* ===============================
                    ENVIRONMENT STATUS
                    =============================== */}

                <div
                    className="environment-card"
                    style={{
                        borderLeft:
                            "8px solid " +
                            statusColor
                    }}
                >

                    <h2>
                        🌡️ Warehouse Environment Status
                    </h2>

                    <p>
                        Current Temperature:
                        <strong>
                            {" " +
                                liveTemperature +
                                " °C"}
                        </strong>
                    </p>

                    <p>
                        Current Humidity:
                        <strong>
                            {" " +
                                liveHumidity +
                                " %"}
                        </strong>
                    </p>

                    <p>
                        Latest MQ135 Raw Value:
                        <strong>
                            {" " +
                                latestMQ135}
                        </strong>
                    </p>

                    <h3
                        style={{
                            color: statusColor
                        }}
                    >
                        {environmentStatus}
                    </h3>

                </div>

                {/* ===============================
                    MQ135 AIR QUALITY STATUS
                    =============================== */}

                <div
                    className="environment-card"
                    style={{
                        borderLeft:
                            "8px solid " +
                            mq135Color
                    }}
                >

                    <h2>
                        🫁 MQ135 Air Quality
                    </h2>

                    <p>
                        Calibration Baseline:
                        <strong>
                            {" " +
                                MQ135_BASELINE}
                        </strong>
                    </p>

                    <p>
                        Current Raw Value:
                        <strong>
                            {" " +
                                latestMQ135}
                        </strong>
                    </p>

                    <h3
                        style={{
                            color: mq135Color
                        }}
                    >
                        {mq135Status}
                    </h3>

                    <p
                        style={{
                            fontSize: "14px",
                            marginTop: "8px"
                        }}
                    >
                        Project-specific monitoring status
                        based on the calibrated clean-air
                        baseline.
                    </p>

                </div>

                {/* ===============================
                    WAREHOUSE LOCATION
                    =============================== */}

                <div className="warehouse-location-dashboard">

                    <div className="warehouse-location-icon">
                        📍
                    </div>

                    <div>

                        <h2>
                            🏭 Warehouse Location
                        </h2>

                        <p>
                            {WAREHOUSE_LATITUDE},{" "}
                            {WAREHOUSE_LONGITUDE}
                        </p>

                        <a
                            href={warehouseMapsURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="warehouse-map-link"
                        >
                            Open in Google Maps →
                        </a>

                    </div>

                </div>

            </div>

            {/* ===============================
                VEHICLE MONITORING
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        🚚 Vehicle & Location Monitoring
                    </h2>

                    <p>
                        Live vehicle position and
                        transportation environment
                    </p>

                </div>

                <GPSTracker />

                <VehicleEnvironment />

            </div>

            {/* ===============================
                ENVIRONMENTAL AI MONITORING
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        🤖 AI Quality Monitoring
                    </h2>

                    <p>
                        AI-based pineapple quality
                        prediction and risk analysis
                    </p>

                </div>

                <AIPrediction
                    pineapples={data}
                />

            </div>

            {/* ===============================
                ANALYTICS
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        📊 Analytics
                    </h2>

                    <p>
                        Quality, risk and environmental
                        monitoring trends
                    </p>

                </div>

                <QualityChart
                    pineapples={data}
                />

                <RiskChart
                    pineapples={data}
                />

                <TemperatureChart
                    pineapples={data}
                />

                <HumidityChart
                    pineapples={data}
                />

            </div>

            {/* ===============================
                PINEAPPLE BATCH DATA
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        🍍 Pineapple Batch Data
                    </h2>

                    <p>
                        Current pineapple monitoring
                        records
                    </p>

                </div>

                <PineappleTable
                    pineapples={data}
                />

            </div>

            {/* ===============================
                REPORTS
                =============================== */}

            <div className="dashboard-section">

                <div className="section-title">

                    <h2>
                        📄 Reports
                    </h2>

                    <p>
                        Export pineapple monitoring data
                    </p>

                </div>

                <ReportExport
                    pineapples={data}
                />

            </div>

        </div>

    );
}

export default Dashboard;