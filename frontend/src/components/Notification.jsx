import "./Notification.css";


function Notification({ alert, closeAlert }) {


  if (!alert) {
    return null;
  }


  return (

    <div className={`notification ${alert.type}`}>

      <button
        className="close-btn"
        onClick={closeAlert}
      >
        ✕
      </button>


      <h3>🔔 Alert</h3>

      <p>
        {alert.message}
      </p>

    </div>

  );

}


export default Notification;