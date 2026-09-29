import "./AIStatus.css";


function AIStatus({pineapples}) {


  let prediction = "No Data";
  let risk = "Unknown";
  let statusClass = "unknown";


  if(pineapples.length > 0){


    const badCount = pineapples.filter(
      item => item.quality === "Bad"
    ).length;


    const goodCount = pineapples.filter(
      item => item.quality === "Good"
    ).length;



    if(badCount > goodCount){

      prediction = "Poor Quality Risk";
      risk = "High";
      statusClass = "high";

    }


    else if(goodCount >= badCount){

      prediction = "Healthy Stock";
      risk = "Low";
      statusClass = "low";

    }


  }



  return (

    <div className={`ai-status ${statusClass}`}>


      <h2>
        AI Quality Prediction
      </h2>



      <p>
        Prediction:
        <strong>
          {prediction}
        </strong>
      </p>



      <p>
        Storage Risk:
        <strong>
          {risk}
        </strong>
      </p>


    </div>

  );

}


export default AIStatus;