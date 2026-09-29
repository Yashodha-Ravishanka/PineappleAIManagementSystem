import "./StatusCard.css";

function StatusCard({ title, value }) {

  let icon = "🍍";
  let color = "";

  if (title.includes("Temperature")) {
    icon = "🌡️";
    color = "temperature";
  }

  else if (title.includes("Humidity")) {
    icon = "💧";
    color = "humidity";
  }

  else if (title.includes("Good")) {
    icon = "✅";
    color = "good";
  }

  else if (title.includes("Bad")) {
    icon = "⚠️";
    color = "bad";
  }

  else if (title.includes("Total")) {
    icon = "📦";
    color = "total";
  }


  return (

    <div className={`status-card ${color}`}>

      <div className="card-icon">
        {icon}
      </div>


      <div className="card-content">

        <h3>
          {title}
        </h3>


        <p>
          {value}
        </p>

      </div>


    </div>

  );

}

export default StatusCard;