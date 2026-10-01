import { useEffect, useState } from "react";
import { getVehicleSensorData } from "../services/api";
import "./VehicleEnvironment.css";

function VehicleEnvironment() {
    const [sensorData, setSensorData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadSensorData = async () => {
        try {
            const data = await getVehicleSensorData();

            if (data && data.length > 0) {
                const latest = data.reduce((latestItem, currentItem) => {
                    return new Date(currentItem.timestamp) >
                        new Date(latestItem.timestamp)
                        ? currentItem
                        : latestItem;
                });

                setSensorData(latest);
            }
        } catch (error) {
            console.error("Vehicle sensor error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSensorData();

        const interval = setInterval(loadSensorData, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="vehicle-environment">
            <div className="vehicle-environment-header">
                <h2>🚚 Vehicle Environment</h2>
                <span className="vehicle-id">VEHICLE001</span>
            </div>

            {loading ? (
                <p className="vehicle-waiting">
                    Loading vehicle sensor data...
                </p>
            ) : !sensorData ? (
                <p className="vehicle-waiting">
                    Waiting for vehicle sensor data...
                </p>
            ) : (
                <>
                    <div className="vehicle-sensor-grid">

                        <div className="vehicle-sensor-card">
                            <span className="sensor-icon">🌡️</span>
                            <h3>Temperature</h3>
                            <p>
                                {sensorData.temperature ?? "--"} °C
                            </p>
                        </div>

                        <div className="vehicle-sensor-card">
                            <span className="sensor-icon">💧</span>
                            <h3>Humidity</h3>
                            <p>
                                {sensorData.humidity ?? "--"} %
                            </p>
                        </div>

                        <div className="vehicle-sensor-card">
                            <span className="sensor-icon">🌫️</span>
                            <h3>MQ135</h3>
                            <p>
                                {sensorData.mq135 ?? "--"}
                            </p>
                        </div>

                        <div className="vehicle-sensor-card">
                            <span className="sensor-icon">🍍</span>
                            <h3>Freshness Score</h3>
                            <p>
                                {sensorData.freshnessScore ?? "--"}
                            </p>
                        </div>

                    </div>

                    <div className="vehicle-last-update">
                        Last update:{" "}
                        {sensorData.timestamp
                            ? new Date(sensorData.timestamp).toLocaleString()
                            : "--"}
                    </div>
                </>
            )}
        </div>
    );
}

export default VehicleEnvironment;