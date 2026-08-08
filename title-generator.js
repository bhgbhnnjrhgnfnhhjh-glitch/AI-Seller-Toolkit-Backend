async function generateTitle() {

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const keyword = document.getElementById("keyword").value.trim();

    if (product === "" || category === "" || brand === "" || keyword === "") {
        alert("कृपया सभी जानकारी भरें।");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ AI titles बनाए जा रहे हैं...";

    const prompt = `
You are a professional eCommerce SEO product title generator.

Create 5 high-quality product titles.

Product Name: ${product}
Category: ${category}
Brand: ${brand}
Main Keyword: ${keyword}

Requirements:
- Professional and attractive
- SEO friendly
- Suitable for Amazon, Flipkart, Meesho and Shopify
- Include important product information
- Do not use fake claims
- Do not use unnecessary symbols
- Keep titles clear and readable
- Each title should be different

Return only 5 numbered titles.
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


function copyTitle() {

    const result = document.getElementById("result");

    if (result.value.trim() === "") {
        alert("पहले title generate करें।");
        return;
    }

    navigator.clipboard.writeText(result.value)
        .then(function () {
            alert("✅ Titles copied successfully!");
        })
        .catch(function () {
            alert("❌ Copy नहीं हो सका।");
        });
}
