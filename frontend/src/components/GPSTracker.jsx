import { useEffect, useState } from "react";

function GPSTracker({ pineapples }) {

  const [latestLocation, setLatestLocation] = useState(null);

  useEffect(() => {

    if (!pineapples || pineapples.length === 0) {

      setLatestLocation(null);

      return;
    }

    const latestBatch = [...pineapples].sort(
  (a, b) =>
    new Date(b.timestamp) -
    new Date(a.timestamp)
)[0];

    if (!latestBatch.location) {

      setLatestLocation(null);

      return;
    }

    const parts =
      latestBatch.location.split(",");

    if (parts.length >= 2) {

      const latitude =
        Number(parts[0].trim());

      const longitude =
        Number(parts[1].trim());

      if (
        !isNaN(latitude) &&
        !isNaN(longitude)
      ) {

        setLatestLocation({

          latitude,
          longitude,

          batchId:
            latestBatch.batchId,

        });

      }

    }

  }, [pineapples]);


  // ===============================
  // GPS STATUS
  // ===============================

  const gpsStatus =
    latestLocation
      ? "GPS Active"
      : "GPS Unavailable";


  const gpsColor =
    latestLocation
      ? "#16a34a"
      : "#dc2626";


  return (

    <div
      className="environment-card"
      style={{
        borderLeft:
          "8px solid " +
          gpsColor
      }}
    >

      <h2>
        📍 GPS Location
      </h2>


      {latestLocation ? (

        <>

          <p>

            GPS Status:

            <strong
              style={{
                color: gpsColor,
                marginLeft: "8px"
              }}
            >

              {gpsStatus}

            </strong>

          </p>


          <p>

            Batch ID:

            <strong>

              {" " +
                latestLocation.batchId}

            </strong>

          </p>


          <p>

            Latitude:

            <strong>

              {" " +
                latestLocation.latitude.toFixed(6)}

            </strong>

          </p>


          <p>

            Longitude:

            <strong>

              {" " +
                latestLocation.longitude.toFixed(6)}

            </strong>

          </p>


          <a
            href={
              `https://www.google.com/maps?q=` +
              `${latestLocation.latitude},` +
              `${latestLocation.longitude}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "10px"
            }}
          >

            🗺️ Open Location in Google Maps

          </a>

        </>

      ) : (

        <>

          <p>

            GPS Status:

            <strong
              style={{
                color: gpsColor,
                marginLeft: "8px"
              }}
            >

              GPS Unavailable

            </strong>

          </p>


          <p>
            Waiting for GPS location...
          </p>

        </>

      )}

    </div>

  );

}

export default GPSTracker;
