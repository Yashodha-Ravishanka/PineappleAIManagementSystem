import "./AlertBox.css";

function AlertBox({ alerts }) {

  if (!alerts || alerts.length === 0) {

    return (
      <div className="alert-box no-alert">

        <div className="alert-header">
          <h2>Smart Alerts</h2>

          <span className="alert-status">
            CLEAR
          </span>
        </div>

        <p>
          No active alerts.
        </p>

      </div>
    );

  }


  return (

    <div className="smart-alerts-container">

      <div className="smart-alerts-title">

        <h2>
          Smart Alerts
        </h2>

        <span>
          {alerts.length} Batch
          {alerts.length !== 1 ? "es" : ""}
        </span>

      </div>


      {alerts.map((alert) => (

        <div
          key={alert.batchId}
          className={`alert-box ${alert.type}`}
        >

          <div className="alert-header">

            <div>

              <h3>
                {alert.type === "high" &&
                  "HIGH RISK"}

                {alert.type === "medium" &&
                  "MONITORING"}

                {alert.type === "low" &&
                  "GOOD"}
              </h3>

              <p className="alert-batch">

                {alert.batchId}

              </p>

            </div>


            <span className="alert-status">

              ACTIVE

            </span>

          </div>


          <p className="alert-message">

            {alert.message}

          </p>


          <div className="alert-details">


            <div>

              <span>
                Temperature
              </span>

              <strong>

                {alert.temperature}
                °C

              </strong>

            </div>


            <div>

              <span>
                Humidity
              </span>

              <strong>

                {alert.humidity}
                %

              </strong>

            </div>


            <div>

              <span>
                MQ135 Raw
              </span>

              <strong>

                {alert.mq135 ?? 0}

              </strong>

            </div>


          </div>


          {alert.location && (

            <p className="alert-location">

              Location:
              {" "}
              {alert.location}

            </p>

          )}


          {alert.timestamp && (

            <p className="alert-time">

              Last updated:
              {" "}
              {new Date(
                alert.timestamp
              ).toLocaleString()}

            </p>

          )}

        </div>

      ))}

    </div>

  );

}


export default AlertBox;