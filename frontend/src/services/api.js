const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://pineapple-ai-backend.de.deplexo.com/api/pineapple";


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

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );


    if (!response.ok) {
        throw new Error("Failed to update pineapple");
    }


    return response.json();

}


export async function deletePineapple(id) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );


    if (!response.ok) {
        throw new Error("Failed to delete pineapple");
    }


    return response.json();

}