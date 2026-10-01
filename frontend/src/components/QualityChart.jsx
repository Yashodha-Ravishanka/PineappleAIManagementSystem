import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

import "./QualityChart.css";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


function QualityChart({ pineapples }) {

    const readings = pineapples || [];


    // AI predicted quality analysis

    const good = readings.filter(
        (item) => item.quality === "Good"
    ).length;


    const average = readings.filter(
        (item) => item.quality === "Average"
    ).length;


    const bad = readings.filter(
        (item) => item.quality === "Bad"
    ).length;


    const chartData = {

        labels: [
            "Good",
            "Average",
            "Bad"
        ],

        datasets: [
            {
                label: "Pineapple Quality",

                data: [
                    good,
                    average,
                    bad
                ],

                backgroundColor: [
                    "#22c55e",
                    "#eab308",
                    "#ef4444"
                ],

                borderColor: [
                    "#22c55e",
                    "#eab308",
                    "#ef4444"
                ],

                borderWidth: 1,

                borderRadius: 10,

                barThickness: 55,

                hoverBorderWidth: 2
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
                display: false
            },

            title: {
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

                    text: "Quality Classification",

                    color:
                        "rgba(255,255,255,0.85)"

                }

            }

        }

    };


    return (

        <div className="quality-chart-container">

            <div className="quality-chart-header">

                <div className="quality-chart-title">

                    <span className="quality-chart-icon">
                        📊
                    </span>

                    <h2>
                        Quality Analysis
                    </h2>

                </div>

                <p>
                    AI-predicted pineapple quality
                    distribution
                </p>

            </div>


            {readings.length > 0 ? (

                <div className="quality-chart-wrapper">

                    <Bar
                        data={chartData}
                        options={options}
                    />

                </div>

            ) : (

                <div className="quality-chart-empty">

                    <span>
                        📊
                    </span>

                    <p>
                        Waiting for quality data...
                    </p>

                </div>

            )}

        </div>

    );

}


export default QualityChart;