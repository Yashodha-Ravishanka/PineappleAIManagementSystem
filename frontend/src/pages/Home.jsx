import { Link } from "react-router-dom";
import "./Home.css";


function Home() {

  return (

    <div className="home-container">


      <div className="home-content">


        <h1>
          Pineapple AI Quality Monitoring System
        </h1>


        <p>
          Smart post-harvest quality monitoring system
          using AI technology to track pineapple storage
          conditions, quality levels, temperature,
          humidity, and location.
        </p>



        <Link to="/dashboard">

          <button>
            Start Monitoring
          </button>

        </Link>


      </div>



      <img

        src="/hero.png"

        alt="Pineapple"

        className="hero-image"

      />


    </div>

  );

}


export default Home;