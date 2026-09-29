import { useEffect, useState } from "react";
import "./AIPrediction.css";

import { getAllPineapples } from "../services/api";


function AIPrediction() {


const [latest, setLatest] = useState(null);



useEffect(()=>{

loadLatest();


},[]);



async function loadLatest(){


try{


const data = await getAllPineapples();


if(data.length > 0){

setLatest(
data[data.length - 1]
);

}


}

catch(error){

console.log(error);

}


}




return (


<div className="ai-prediction">


<h2>
🤖 Latest AI Quality Prediction
</h2>



{

latest ? (


<div className="prediction-result">


<p>
<strong>Batch:</strong> {latest.batchId}
</p>


<p>
<strong>Temperature:</strong> {latest.temperature}°C
</p>


<p>
<strong>Humidity:</strong> {latest.humidity}%
</p>


<p>
<strong>Storage Days:</strong> {latest.storage_days}
</p>



<p>
<strong>Quality:</strong>

<span className={

`quality-${latest.quality}`

}>

{latest.quality}

</span>

</p>



<p>
<strong>Risk Level:</strong>

<span className={

`risk-${latest.riskLevel}`

}>

{latest.riskLevel}

</span>

</p>



</div>


)


:


<p>
No AI prediction available
</p>


}



</div>


);


}



export default AIPrediction;