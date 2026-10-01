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

import "./TemperatureChart.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);

function TemperatureChart({ pineapples }) {

    const readings = pineapples || [];

    const chartData = {

        labels: readings.map((item) => {

            if (!item.timestamp) {
                return "";
            }

            const date = new Date(item.timestamp);

            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        }),

        datasets: [
            {
                label: "Temperature (°C)",

                data: readings.map(
                    (item) => Number(item.temperature || 0)
                ),

                borderWidth: 3,

                tension: 0.4,

                pointRadius: 4,

                pointHoverRadius: 6,

                fill: false
            }
        ]

    };


    const options = {

        responsive: true,

        maintainAspectRatio: true,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {

                display: true,

                position: "top",

                labels: {
                    color: "white",
                    padding: 15,
                    font: {
                        size: 13,
                        weight: "600"
                    }
                }

            },

            tooltip: {

                backgroundColor: "rgba(15, 23, 42, 0.95)",

                titleColor: "#facc15",

                bodyColor: "white",

                padding: 12,

                callbacks: {

                    title: function (context) {

                        const index =
                            context[0].dataIndex;

                        if (
                            readings[index] &&
                            readings[index].timestamp
                        ) {

                            return new Date(
                                readings[index].timestamp
                            ).toLocaleString();

                        }

                        return "Sensor Reading";

                    },

                    label: function (context) {

                        return (
                            "Temperature: " +
                            context.parsed.y +
                            " °C"
                        );

                    }

                }

            }

        },

        scales: {

            y: {

                beginAtZero: false,

                ticks: {
                    color: "rgba(255,255,255,0.75)"
                },

                grid: {
                    color: "rgba(255,255,255,0.08)"
                },

                title: {

                    display: true,

                    text: "Temperature (°C)",

                    color: "rgba(255,255,255,0.85)"

                }

            },

            x: {

                ticks: {

                    color: "rgba(255,255,255,0.75)",

                    maxRotation: 45,

                    minRotation: 0

                },

                grid: {
                    color: "rgba(255,255,255,0.05)"
                },

                title: {

                    display: true,

                    text: "Reading Time",

                    color: "rgba(255,255,255,0.85)"

                }

            }

        }

    };


    return (

        <div className="temperature-chart-container">

            <div className="chart-header">

                <div>

                    <span className="chart-icon">
                        🌡️
                    </span>

                    <h2>
                        Temperature Trend
                    </h2>

                </div>

                <p>
                    Warehouse temperature monitoring
                </p>

            </div>


            {readings.length > 0 ? (

                <div className="chart-wrapper">

                    <Line
                        data={chartData}
                        options={options}
                    />

                </div>

            ) : (

                <div className="chart-empty">

                    <span>
                        🌡️
                    </span>

                    <p>
                        Waiting for temperature data...
                    </p>

                </div>

            )}

        </div>

    );

}

export default TemperatureChart;