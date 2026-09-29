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


  const low = pineapples.filter(
    (item) =>
      item.riskLevel?.toLowerCase() === "low"
  ).length;



  const medium = pineapples.filter(
    (item) =>
      item.riskLevel?.toLowerCase() === "medium"
  ).length;



  const high = pineapples.filter(
    (item) =>
      item.riskLevel?.toLowerCase() === "high"
  ).length;





  const chartData = {


    labels:[

      "Low",
      "Medium",
      "High"

    ],



    datasets:[


      {

        label:"AI Risk Level",


        data:[

          low,
          medium,
          high

        ],



        backgroundColor:[

          "#22c55e",
          "#eab308",
          "#ef4444"

        ],



        borderRadius:10,


        barThickness:45


      }


    ]


  };







  const options={


    responsive:true,



    plugins:{


      legend:{


        display:false


      },



      tooltip:{


        enabled:true


      }


    },




    scales:{



      y:{


        beginAtZero:true,


        ticks:{


          color:"white",


          stepSize:1


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



<div className="risk-chart-container">



<h2>

🔔 AI Risk Analysis

</h2>





<Bar

data={chartData}

options={options}

/>




</div>



);



}



export default RiskChart;