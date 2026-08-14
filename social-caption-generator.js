async function generateCaption() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const offer = document.getElementById("offer").value.trim();
    const platform = document.getElementById("platform").value;

    const result = document.getElementById("result");
    const button = document.querySelector("button[onclick='generateCaption()']");

    if (product === "") {
        alert("Please enter Product Name.");
        return;
    }

    result.value = "⏳ AI caption बना रहा है...";

    if (button) {
        button.disabled = true;
        button.innerText = "⏳ Generating...";
    }

    const prompt = `
You are a professional eCommerce and social media caption writer.

Create ONE short, natural social media caption using ONLY the information provided.

PRODUCT INFORMATION:

Product Name:
${product}

Brand:
${brand || "Not specified"}

Offer:
${offer || "Not specified"}

Platform:
${platform}


STRICT RULES:

1. Use ONLY the provided information.

2. Do NOT invent product features.

3. Do NOT invent material, color, size, quality, durability,
comfort, performance or benefits.

4. Do NOT invent price.

5. Do NOT invent discount unless the offer is provided.

6. Do NOT invent delivery information.

7. Do NOT invent reviews or customer experience.

8. Do NOT use claims such as:
Premium Quality
Best Product
Amazing Quality
Trending
No.1
Guaranteed
Must Buy
Perfect Quality
unless explicitly provided.

9. Do NOT add another brand name.

10. Keep the exact product name.

11. Keep the exact brand name.

12. Mention the offer ONLY if provided.

13. The platform may affect the writing style,
but do not invent platform-specific claims.

14. Do not mention AI.

15. Do not create fake information.

16. Keep the caption short and useful.

17. Hashtags must be directly related to the provided
product, brand, offer or category information.

18. Do NOT use generic spam hashtags such as:
#Trending
#Viral
#Best
#Amazing
#MustBuy
unless explicitly provided.

19. Do not add unrelated brands such as:
Nike, Adidas, Puma, Apple, Samsung, etc.

20. Do not add emojis unless they are useful and natural.

OUTPUT FORMAT:

Caption:
[caption text]

Hashtags:
[relevant hashtags]

Return ONLY the caption and hashtags.
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


        if (!response.ok) {

            let errorMessage = "Server error";

            try {

                const errorData = await response.json();

                errorMessage =
                    errorData.error ||
                    errorData.message ||
                    errorMessage;

            } catch (e) {}

            throw new Error(errorMessage);
        }


        const data = await response.json();

        let text = data.result || data.response || "";


        if (!text.trim()) {

            throw new Error(
                "AI ने कोई caption नहीं बनाया।"
            );

        }


        /*
         * Remove unwanted AI phrases.
         */

        const bannedPhrases = [
            "premium quality",
            "best product",
            "amazing quality",
            "no.1",
            "number 1",
            "must buy",
            "perfect quality",
            "guaranteed",
            "viral",
            "trending"
        ];


        for (const phrase of bannedPhrases) {

            const regex =
                new RegExp(
                    phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    "gi"
                );

            text = text.replace(regex, "");
        }


        /*
         * Remove excessive blank lines.
         */

        text = text
            .replace(/\n\s*\n\s*\n/g, "\n\n")
            .trim();


        /*
         * Remove unrelated common brand names.
         */

        const unwantedBrands = [
            "Nike",
            "Adidas",
            "Puma",
            "Apple",
            "Samsung",
            "Reebok",
            "Gucci",
            "Louis Vuitton"
        ];


        for (const brandName of unwantedBrands) {

            if (
                brandName.toLowerCase() !==
                brand.toLowerCase()
            ) {

                const regex =
                    new RegExp(
                        "\\b" +
                        brandName.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        ) +
                        "\\b",
                        "gi"
                    );

                text = text.replace(regex, "");
            }
        }


        result.value = text;

        if (button) {
            button.disabled = false;
            button.innerText = "Generate Caption";
        }


    } catch (error) {

        console.error(
            "Social Caption Generator Error:",
            error
        );


        result.value =
            "❌ Caption generate नहीं हो सका.\n\n" +
            "Error: " +
            error.message;


        if (button) {
            button.disabled = false;
            button.innerText = "Generate Caption";
        }

    }

}


async function copyCaption() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (!text) {

        alert("पहले caption generate करें.");

        return;
    }


    try {

        await navigator.clipboard.writeText(text);

        alert(
            "✅ Caption copied successfully!"
        );

    } catch (error) {

        result.select();

        document.execCommand("copy");

        alert(
            "✅ Caption copied successfully!"
        );

    }

}
