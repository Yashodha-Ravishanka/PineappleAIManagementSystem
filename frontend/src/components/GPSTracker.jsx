import { useEffect, useState } from "react";

function GPSTracker({ pineapples }) {
  const [latestLocation, setLatestLocation] = useState(null);

  useEffect(() => {
    if (!pineapples || pineapples.length === 0) {
      setLatestLocation(null);
      return;
    }

    const latestBatch = pineapples[pineapples.length - 1];

    if (latestBatch.location) {
      const parts = latestBatch.location.split(",");

      if (parts.length >= 2) {
        const latitude = Number(parts[0].trim());
        const longitude = Number(parts[1].trim());

        if (!isNaN(latitude) && !isNaN(longitude)) {
          setLatestLocation({
            latitude,
            longitude,
            batchId: latestBatch.batchId,
          });
        }
      }
    }
  }, [pineapples]);

  return (
    <div className="gps-card">
      <h2>📍 GPS Tracking</h2>

      {latestLocation ? (
        <>
          <p>
            <strong>Batch ID:</strong>{" "}
            {latestLocation.batchId}
          </p>

          <p>
            <strong>Latitude:</strong>{" "}
            {latestLocation.latitude.toFixed(6)}
          </p>

          <p>
            <strong>Longitude:</strong>{" "}
            {latestLocation.longitude.toFixed(6)}
          </p>

          <a
            href={`https://www.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Location in Google Maps
          </a>
        </>
      ) : (
        <p>Waiting for GPS location...</p>
      )}
    </div>
  );
}

export default GPSTracker;