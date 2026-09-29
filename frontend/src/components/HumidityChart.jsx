import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

import "./HumidityChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

function HumidityChart({ pineapples }) {

  const readings = pineapples || [];

  const chartData = {

    labels: readings.map(item => {

      if (!item.timestamp) {
        return "";
      }

      const date = new Date(item.timestamp);

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

    }),

    datasets: [

      {
        label: "Humidity %",

        data: readings.map(
          item => Number(item.humidity || 0)
        ),

        borderWidth: 3,

        tension: 0.4,

        pointRadius: 4

      }

    ]

  };


  const options = {

    responsive: true,

    plugins: {

      legend: {

        labels: {
          color: "white"
        }

      },

      tooltip: {

        callbacks: {

          title: function(context) {

            const index = context[0].dataIndex;

            if (
              readings[index] &&
              readings[index].timestamp
            ) {

              const date =
                new Date(
                  readings[index].timestamp
                );

              return date.toLocaleString();

            }

            return "Sensor Reading";

          },

          label: function(context) {

            return (
              "Humidity: " +
              context.parsed.y +
              " %"
            );

          }

        }

      }

    },

    scales: {

      y: {

        beginAtZero: true,

        ticks: {
          color: "white"
        },

        title: {

          display: true,

          text: "Humidity (%)",

          color: "white"

        }

      },

      x: {

        ticks: {

          color: "white",

          maxRotation: 45,

          minRotation: 0

        },

        title: {

          display: true,

          text: "Reading Time",

          color: "white"

        }

      }

    }

  };


  return (

    <div className="humidity-chart-container">

      <h2>
        Humidity Trend
      </h2>

      {readings.length > 0 ? (

        <Line
          data={chartData}
          options={options}
        />

      ) : (

        <p>
          Waiting for humidity data...
        </p>

      )}

    </div>

  );

}

export default HumidityChart;