async function generateDescription() {

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();

    const material = document.getElementById("material").value.trim();
    const color = document.getElementById("color").value.trim();
    const features = document.getElementById("features").value.trim();

    // केवल ये 3 जानकारी जरूरी हैं
    if (product === "" || category === "" || brand === "") {
        alert("कृपया Product Name, Category और Brand भरें।");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ AI description बनाई जा रही है...";

    const prompt = `
Create a professional eCommerce product description.

Product Name: ${product}
Category: ${category}
Brand: ${brand}
Material: ${material || "Not specified"}
Color: ${color || "Not specified"}
Features: ${features || "Not specified"}

Requirements:
- Professional and SEO friendly
- Suitable for Amazon, Flipkart, Meesho and Shopify
- Use only the information provided
- Do not invent specifications
- Do not make false claims
- Include a short introduction
- Include important features as bullet points
- Include a short closing statement
- Easy to read
- Do not mention AI

Return only the final product description.
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

        console.error("AI Error:", error);

        result.value =
            "❌ AI से description नहीं मिल सकी।\n\n" +
            "Error: " + error.message;
    }
}


function copyDescription() {

    const result = document.getElementById("result");

    if (result.value.trim() === "") {
        alert("पहले description generate करें।");
        return;
    }

    navigator.clipboard.writeText(result.value)
        .then(function () {
            alert("✅ Description copied successfully!");
        })
        .catch(function () {
            alert("❌ Copy नहीं हो सका।");
        });
}
