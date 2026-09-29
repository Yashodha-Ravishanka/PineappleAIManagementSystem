
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddPineapple from "./pages/AddPineapple";
import SmartAlert from "./pages/SmartAlert";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Pages */}
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/add"
          element={<AddPineapple />}
        />

        <Route
          path="/smart-alerts"
          element={<SmartAlert />}
        />
      </Routes>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
