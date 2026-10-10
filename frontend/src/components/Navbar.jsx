import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <h2 className="logo">
        🍍 Pineapple AI
      </h2>

      <div className="nav-links">

        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/smart-alerts">
          🚨 Smart Alerts
        </NavLink>

        <NavLink to="/add">
          Add Data
        </NavLink>

         <NavLink to="/freshness">
          🧪 Freshness Detection
        </NavLink>

        <NavLink to="/grading">
          🍍 Pineapple Grading
        </NavLink>

        <NavLink to="/qr-price">
          💰 QR & AI Price
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;