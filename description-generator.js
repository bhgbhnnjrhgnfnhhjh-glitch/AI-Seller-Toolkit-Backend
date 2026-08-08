async function generateDescription() {

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const material = document.getElementById("material").value.trim();
    const color = document.getElementById("color").value.trim();
    const features = document.getElementById("features").value.trim();

    if (
        product === "" ||
        category === "" ||
        brand === "" ||
        material === "" ||
        color === "" ||
        features === ""
    ) {
        alert("कृपया सभी जानकारी भरें।");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ AI description बनाई जा रही है...";

    const prompt = `
You are a professional eCommerce product description writer.

Create a high-quality product description for the following product.

Product Name: ${product}
Category: ${category}
Brand: ${brand}
Material: ${material}
Color: ${color}
Features: ${features}

Requirements:
- Write a professional and attractive eCommerce description.
- Suitable for Amazon, Flipkart, Meesho and Shopify.
- Use simple and clear English.
- Highlight the real product information provided above.
- Do not invent specifications.
- Do not make false claims.
- Include a short introduction.
- Include key features in bullet points.
- Include benefits based only on the provided information.
- End with a short buying recommendation.
- Make the description easy to copy and use.

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
            "❌ AI से response नहीं मिला।\n\n" +
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
