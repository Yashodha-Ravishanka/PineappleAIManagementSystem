
import { useEffect, useState } from "react";

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


function Dashboard() {

  const [data, setData] = useState([]);


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


  async function loadData() {

    try {

      const result =
        await getAllPineapples();

      setData(
        Array.isArray(result)
          ? result
          : []
      );

    }
    catch (error) {

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
  // LATEST MQ135
  // ===============================

  const latestMQ135 =
    latestBatch

      ? Number(
          latestBatch.mq135 || 0
        )

      : 0;


  // ===============================
  // MQ135 PROJECT CALIBRATION
  // ===============================

  const MQ135_BASELINE = 26.03;


  let mq135Status = "";

  let mq135Color = "";


  if (latestMQ135 <= 31) {

    mq135Status =
      "Normal";

    mq135Color =
      "#16a34a";

  }

  else if (latestMQ135 <= 39) {

    mq135Status =
      "Warning";

    mq135Color =
      "#facc15";

  }

  else {

    mq135Status =
      "High";

    mq135Color =
      "#dc2626";

  }


  // ===============================
  // ENVIRONMENT STATUS
  // ===============================

  const avgTemp =
    Number(
      averageTemperature
    );


  const avgHumidity =
    Number(
      averageHumidity
    );


  let environmentStatus = "";

  let statusColor = "";


  if (
    avgTemp <= 28 &&
    avgHumidity <= 70
  ) {

    environmentStatus =
      "Optimal Storage";

    statusColor =
      "#16a34a";

  }

  else if (
    avgTemp <= 33 &&
    avgHumidity <= 85
  ) {

    environmentStatus =
      "Warning";

    statusColor =
      "#facc15";

  }

  else {

    environmentStatus =
      "Critical";

    statusColor =
      "#dc2626";

  }


  // ===============================
  // DASHBOARD UI
  // ===============================

  return (

    <div className="dashboard-container">


      {/* ===============================
          DASHBOARD TITLE
          =============================== */}

      <h1>
        Pineapple AI Dashboard
      </h1>


      {/* ===============================
          STATUS CARDS
          =============================== */}

      <div className="status-container">

        <StatusCard
          title="Sensor Readings"
          value={totalReadings}
        />


        <StatusCard
          title="Active Batches"
          value={activeBatches}
        />


        <StatusCard
          title="Good"
          value={goodCount}
        />


        <StatusCard
          title="Average"
          value={averageCount}
        />


        <StatusCard
          title="Bad"
          value={badCount}
        />


        <StatusCard
          title="High Risk"
          value={highRiskCount}
        />


        <StatusCard
          title="Medium Risk"
          value={mediumRiskCount}
        />


        <StatusCard
          title="Low Risk"
          value={lowRiskCount}
        />


        <StatusCard
          title="Avg Temperature"
          value={
            String(
              averageTemperature
            ) + " C"
          }
        />


        <StatusCard
          title="Avg Humidity"
          value={
            String(
              averageHumidity
            ) + " %"
          }
        />


        <StatusCard
          title="MQ135 Raw Value"
          value={latestMQ135}
        />

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
          Environment Status
        </h2>


        <p>

          Average Temperature:

          <strong>

            {" " +
              averageTemperature +
              " C"}

          </strong>

        </p>


        <p>

          Average Humidity:

          <strong>

            {" " +
              averageHumidity +
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
          GPS TRACKING
          =============================== */}

      <GPSTracker
        pineapples={data}
      />


      {/* ===============================
          AI PREDICTION
          =============================== */}

      <AIPrediction
        pineapples={data}
      />


      {/* ===============================
          QUALITY CHART
          =============================== */}

      <QualityChart
        pineapples={data}
      />


      {/* ===============================
          RISK CHART
          =============================== */}

      <RiskChart
        pineapples={data}
      />


      {/* ===============================
          TEMPERATURE CHART
          =============================== */}

      <TemperatureChart
        pineapples={data}
      />


      {/* ===============================
          HUMIDITY CHART
          =============================== */}

      <HumidityChart
        pineapples={data}
      />


      {/* ===============================
          PINEAPPLE TABLE
          =============================== */}

      <PineappleTable
        pineapples={data}
      />


      {/* ===============================
          REPORT EXPORT
          =============================== */}

      <ReportExport
        pineapples={data}
      />

    </div>

  );

}


export default Dashboard;
