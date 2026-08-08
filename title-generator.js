

async function generateTitle() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();

    if (product === "") {
        alert("Please enter Product Name");
        return;
    }

    const prompt = `
Create 5 professional eCommerce product titles.

Product Name: ${product}
Brand: ${brand || "Not specified"}

Requirements:
- SEO friendly
- Professional
- Suitable for Amazon, Flipkart, Meesho and Shopify
- Do not use fake claims
- Keep titles clear and readable

Return only the 5 titles as a numbered list.
`;

    const resultBox = document.getElementById("result");

    resultBox.value = "⏳ Generating titles...";

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

        resultBox.value = data.result;

    } catch (error) {

        console.error(error);

        resultBox.value =
            "❌ Error: AI response नहीं मिल सका।\n\n" +
            error.message;
    }
}


function copyTitle() {

    const resultBox = document.getElementById("result");

    if (resultBox.value.trim() === "") {
        alert("Generate a title first.");
        return;
    }

    navigator.clipboard.writeText(resultBox.value);

    alert("✅ Titles Copied Successfully!");
}
