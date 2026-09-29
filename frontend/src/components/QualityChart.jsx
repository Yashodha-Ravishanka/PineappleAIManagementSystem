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


  // AI predicted Quality Analysis

  const good = pineapples.filter(
    item => item.quality === "Good"
  ).length;


  const average = pineapples.filter(
    item => item.quality === "Average"
  ).length;


  const bad = pineapples.filter(
    item => item.quality === "Bad"
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

        data:[
          good,
          average,
          bad
        ],


        backgroundColor: [

          "#22c55e",

          "#eab308",

          "#ef4444"

        ],


        borderRadius: 10,

        barThickness: 45

      }

    ]

  };



  const options = {

    responsive:true,


    plugins:{


      legend:{

        display:false

      },


      title:{

        display:false

      }


    },


    scales:{


      y:{

        beginAtZero:true,


        ticks:{

          color:"white"

        }

      },


      x:{


        ticks:{

          color:"white"

        }

      }


    }

  };



  return (

    <div className="chart-container">


      <h2>
        📊 Quality Analysis
      </h2>


      <Bar

        data={chartData}

        options={options}

      />


    </div>

  );

}


export default QualityChart;