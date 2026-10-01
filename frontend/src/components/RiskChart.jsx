import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

import "./RiskChart.css";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);


function RiskChart({ pineapples }) {

    const readings = pineapples || [];


    const highRisk = readings.filter(
        (item) => item.riskLevel === "High"
    ).length;


    const mediumRisk = readings.filter(
        (item) => item.riskLevel === "Medium"
    ).length;


    const lowRisk = readings.filter(
        (item) => item.riskLevel === "Low"
    ).length;


    const chartData = {

        labels: [
            "High Risk",
            "Medium Risk",
            "Low Risk"
        ],

        datasets: [
            {
                label: "Risk Level",

                data: [
                    highRisk,
                    mediumRisk,
                    lowRisk
                ],

                backgroundColor: [
                    "#ef4444",
                    "#f97316",
                    "#22c55e"
                ],

                borderColor: [
                    "#ef4444",
                    "#f97316",
                    "#22c55e"
                ],

                borderWidth: 1,

                borderRadius: 10,

                barThickness: 55
            }
        ]

    };


    const options = {

        responsive: true,

        maintainAspectRatio: true,

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                backgroundColor:
                    "rgba(15, 23, 42, 0.95)",

                titleColor: "#facc15",

                bodyColor: "white",

                padding: 12,

                callbacks: {

                    label: function (context) {

                        return (
                            "Readings: " +
                            context.parsed.y
                        );

                    }

                }

            }

        },

        scales: {

            y: {

                beginAtZero: true,

                ticks: {

                    color:
                        "rgba(255,255,255,0.75)",

                    precision: 0

                },

                grid: {

                    color:
                        "rgba(255,255,255,0.08)"

                },

                title: {

                    display: true,

                    text: "Number of Readings",

                    color:
                        "rgba(255,255,255,0.85)"

                }

            },

            x: {

                ticks: {

                    color:
                        "rgba(255,255,255,0.85)",

                    font: {
                        size: 13,
                        weight: "600"
                    }

                },

                grid: {
                    display: false
                },

                title: {

                    display: true,

                    text: "Risk Classification",

                    color:
                        "rgba(255,255,255,0.85)"

                }

            }

        }

    };


    return (

        <div className="risk-chart-container">

            <div className="risk-chart-header">

                <div className="risk-chart-title">

                    <span className="risk-chart-icon">
                        ⚠️
                    </span>

                    <h2>
                        Risk Analysis
                    </h2>

                </div>

                <p>
                    AI-based pineapple storage
                    risk classification
                </p>

            </div>


            {readings.length > 0 ? (

                <div className="risk-chart-wrapper">

                    <Bar
                        data={chartData}
                        options={options}
                    />

                </div>

            ) : (

                <div className="risk-chart-empty">

                    <span>
                        ⚠️
                    </span>

                    <p>
                        Waiting for risk data...
                    </p>

                </div>

            )}

        </div>

    );

}


export default RiskChart;