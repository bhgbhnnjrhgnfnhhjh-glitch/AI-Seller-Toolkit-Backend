async function generateSEO() {

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const keyword = document.getElementById("keyword").value.trim();
    const marketplace = document.getElementById("marketplace").value;

    if (product === "" || category === "") {
        alert("कृपया Product Name और Category भरें।");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ AI SEO keywords बनाए जा रहे हैं...";

    const prompt = `
You are a professional eCommerce SEO keyword specialist.

Generate high-quality SEO keywords for the following product.

Product Name: ${product}
Category: ${category}
Brand: ${brand || "Not specified"}
Main Keyword: ${keyword || "Not specified"}
Target Marketplace: ${marketplace}

Requirements:
- Generate 20 relevant SEO keywords.
- Mix short-tail and long-tail keywords.
- Include buyer-intent keywords where appropriate.
- Keep keywords relevant to the product.
- Suitable for ${marketplace}.
- Do not create fake specifications.
- Do not repeat the same keyword unnecessarily.
- Use natural search phrases.
- Do not add explanations.

Return the result in a numbered list from 1 to 20.
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

        console.error("SEO AI Error:", error);

        result.value =
            "❌ SEO keywords नहीं बन सके।\n\n" +
            "Error: " + error.message;
    }
}


function copySEO() {

    const result = document.getElementById("result");

    if (result.value.trim() === "") {

        alert("पहले SEO keywords generate करें।");

        return;
    }

    navigator.clipboard.writeText(result.value)
        .then(function () {

            alert("✅ SEO Keywords copied successfully!");

        })
        .catch(function () {

            alert("❌ Copy नहीं हो सका।");

        });
         }
