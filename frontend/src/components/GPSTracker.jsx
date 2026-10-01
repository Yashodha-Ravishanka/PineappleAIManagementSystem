import { useEffect, useState } from "react";
import { getVehicleGPS } from "../services/api";
import "./GPSTracker.css";

function GPSTracker() {
    const [vehicleGPS, setVehicleGPS] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(true);

    const loadVehicleGPS = async () => {
        try {
            const data = await getVehicleGPS();

            if (data && data.length > 0) {
                const latest = data.reduce((latest, current) => {
                    return new Date(current.timestamp) >
                        new Date(latest.timestamp)
                        ? current
                        : latest;
                });

                setVehicleGPS(latest);
            } else {
                setVehicleGPS(null);
            }
        } catch (error) {
            console.error("Vehicle GPS error:", error);
            setVehicleGPS(null);
        } finally {
            setGpsLoading(false);
        }
    };

    useEffect(() => {
        loadVehicleGPS();

        const interval = setInterval(
            loadVehicleGPS,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    const getGoogleMapsURL = () => {
        if (!vehicleGPS) {
            return "#";
        }

        return `https://www.google.com/maps?q=${vehicleGPS.latitude},${vehicleGPS.longitude}`;
    };

    return (
        <div className="gps-tracker-container">

            {/* =====================================
                VEHICLE GPS ONLY
                ===================================== */}

            <div className="vehicle-gps-card">

                <div className="gps-header">

                    <h2>🚚 Vehicle GPS</h2>

                    <span className="vehicle-qr">
                        VEHICLE001
                    </span>

                </div>


                {/* GPS STATUS */}

                <div className="gps-status">

                    <span
                        className={
                            vehicleGPS
                                ? "status-dot active"
                                : "status-dot inactive"
                        }
                    ></span>

                    <strong>
                        GPS Status:
                    </strong>

                    <span>
                        {gpsLoading
                            ? "Checking..."
                            : vehicleGPS
                                ? "GPS Active"
                                : "GPS Unavailable"}
                    </span>

                </div>


                {/* GPS DATA */}

                {vehicleGPS ? (

                    <>

                        <div className="gps-data-grid">

                            <div className="gps-data-card">

                                <span className="gps-icon">
                                    🌐
                                </span>

                                <h3>
                                    Latitude
                                </h3>

                                <p>
                                    {Number(
                                        vehicleGPS.latitude
                                    ).toFixed(6)}
                                </p>

                            </div>


                            <div className="gps-data-card">

                                <span className="gps-icon">
                                    🌐
                                </span>

                                <h3>
                                    Longitude
                                </h3>

                                <p>
                                    {Number(
                                        vehicleGPS.longitude
                                    ).toFixed(6)}
                                </p>

                            </div>


                            <div className="gps-data-card">

                                <span className="gps-icon">
                                    🚗
                                </span>

                                <h3>
                                    Speed
                                </h3>

                                <p>
                                    {Number(
                                        vehicleGPS.speed || 0
                                    ).toFixed(2)}{" "}
                                    km/h
                                </p>

                            </div>

                        </div>


                        {/* GOOGLE MAPS */}

                        <a
                            href={getGoogleMapsURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="google-maps-button"
                        >
                            📍 Open Vehicle Location in Google Maps
                        </a>


                        {/* LAST UPDATE */}

                        <div className="gps-last-update">

                            Last update:{" "}

                            {vehicleGPS.timestamp
                                ? new Date(
                                      vehicleGPS.timestamp
                                  ).toLocaleString()
                                : "--"}

                        </div>

                    </>

                ) : (

                    <div className="gps-waiting">

                        <div className="waiting-icon">
                            📡
                        </div>

                        <p>
                            Waiting for vehicle GPS data...
                        </p>

                        <small>
                            Make sure the NEO-6M has a
                            satellite fix.
                        </small>

                    </div>

                )}

            </div>

        </div>
    );
}

export default GPSTracker;