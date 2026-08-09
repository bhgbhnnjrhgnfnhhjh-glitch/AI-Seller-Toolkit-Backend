async function generateFeatures() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value.trim();
    const material = document.getElementById("material").value.trim();
    const audience = document.getElementById("audience").value;
    const color = document.getElementById("color").value.trim();
    const extra = document.getElementById("extra").value.trim();

    if (product === "") {
        alert("कृपया Product Name भरें।");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ AI product features बनाई जा रही हैं...";

    const prompt = `
You are a professional eCommerce product features writer.

Create 10 clear and professional product features.

Product Name: ${product}
Brand: ${brand || "Not specified"}
Category: ${category || "Not specified"}
Material: ${material || "Not specified"}
Target Audience: ${audience}
Color: ${color || "Not specified"}
Extra Information: ${extra || "Not specified"}

Requirements:
- Create exactly 10 useful product features.
- Keep each feature short and easy to understand.
- Suitable for Amazon, Flipkart, Meesho and Shopify.
- Use only the information provided.
- Do not invent technical specifications.
- Do not make false claims or guarantees.
- Make the features attractive for customers.
- Avoid unnecessary emojis.
- Return only a numbered list from 1 to 10.

Example format:
1. Premium Quality
2. Comfortable Design
3. Durable Construction
`;

    try {

        const response = await fetch(
            "https://ai-seller-toolkit-backend-1.onrender.com/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        result.value = data.result;

    } catch (error) {

        console.error("Features AI Error:", error);

        result.value =
            "❌ AI features नहीं बना सका।\n\n" +
            "Error: " + error.message;
    }
}


function copyFeatures() {

    const result = document.getElementById("result");

    if (result.value.trim() === "") {
        alert("पहले features generate करें।");
        return;
    }

    navigator.clipboard.writeText(result.value)
        .then(function () {

            alert("✅ Product Features copied successfully!");

        })
        .catch(function () {

            alert("❌ Copy नहीं हो सका।");

        });
}
