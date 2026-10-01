const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://pineapple-ai-backend.de.deplexo.com/api/pineapple";


// =====================================================
// PINEAPPLE / WAREHOUSE API
// =====================================================

export async function getAllPineapples() {
    const response = await fetch(`${API_URL}/all`);

    if (!response.ok) {
        throw new Error("Failed to fetch pineapple data");
    }

    return response.json();
}


export async function addPineapple(data) {
    const response = await fetch(`${API_URL}/add`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to add pineapple");
    }

    return response.json();
}


export async function updatePineapple(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to update pineapple");
    }

    return response.json();
}


export async function deletePineapple(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete pineapple");
    }

    return response.json();
}


// =====================================================
// VEHICLE
// =====================================================

// Fixed QR ID for the vehicle
const VEHICLE_QR_ID = "VEHICLE001";

// Cloud backend
const BACKEND_URL =
    "https://pineapple-ai-backend.de.deplexo.com";


// =====================================================
// VEHICLE GPS
// =====================================================

export async function getVehicleGPS() {
    const response = await fetch(
        `${BACKEND_URL}/api/gps/${VEHICLE_QR_ID}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch vehicle GPS data");
    }

    return response.json();
}


// =====================================================
// VEHICLE SENSOR DATA
// =====================================================

export async function getVehicleSensorData() {
    const response = await fetch(
        `${BACKEND_URL}/api/sensor/${VEHICLE_QR_ID}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch vehicle sensor data");
    }

    return response.json();
}


// =====================================================
// ADD VEHICLE GPS DATA
// =====================================================

export async function addVehicleGPS(data) {
    const response = await fetch(
        `${BACKEND_URL}/api/gps/add`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                ...data,
                qrId: VEHICLE_QR_ID,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add vehicle GPS data");
    }

    return response.json();
}


// =====================================================
// ADD VEHICLE SENSOR DATA
// =====================================================

export async function addVehicleSensorData(data) {
    const response = await fetch(
        `${BACKEND_URL}/api/sensor/add`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                ...data,
                qrId: VEHICLE_QR_ID,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add vehicle sensor data");
    }

    return response.json();
}