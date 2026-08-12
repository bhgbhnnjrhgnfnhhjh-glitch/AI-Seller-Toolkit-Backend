/* =========================================
   AI PRODUCT TAGS GENERATOR
   AI Seller Toolkit
========================================= */

const BACKEND_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com/generate";


async function generateTags() {

    const product =
        document.getElementById("product").value.trim();

    const result =
        document.getElementById("result");


    if (product === "") {

        alert("Please enter Product Name.");

        return;
    }


    result.innerText =
        "⏳ AI Product Tags बनाए जा रहे हैं...";


    const prompt = `
You are a professional eCommerce product tag specialist.

Generate exactly 20 relevant product tags.

PRODUCT NAME:
${product}

STRICT RULES:

1. Generate exactly 20 tags.

2. Use ONLY the product name provided above.

3. NEVER invent a different product type.

4. NEVER remove an important product attribute from the
main product identity when creating the main tags.

5. If the product is:
"Black Cotton T-Shirt"

then the tags should remain related to:
"Black Cotton T-Shirt"

Do NOT change it into:
"Black Shirt"
"Formal Shirt"
"Top"
"Polo"
"Jeans"
"Clothing Store"

unless that exact information exists in the product name.

6. Do not invent:
- brand names
- material
- color
- size
- features
- benefits
- quality claims
- specifications

7. Do not use fake marketing words such as:
Best, Premium, Excellent, Amazing, Bestseller,
Trending, Luxury, Guaranteed.

8. You may create natural search variations such as:
- Product Name
- Product Name Online
- Buy Product Name
- Shop Product Name
- Product Name Store
- Product Name Shopping
- Product Name India

9. Keep the complete product identity in the important tags.

10. Do not create unrelated product categories.

11. Do not duplicate tags.

12. Do not use numbering.

13. Return ONLY the tags.

14. Each tag must be on a separate line.

15. Do not add explanations.

16. Do not add hashtags (#).

17. Use normal readable capitalization.

18. Avoid changing singular/plural unnecessarily.

19. Avoid meaningless word rearrangements.

20. All 20 tags must clearly refer to the same exact product.

Example:

Product:
Black Cotton T-Shirt

Good tags:

Black Cotton T-Shirt
Black Cotton T-Shirt Online
Buy Black Cotton T-Shirt
Shop Black Cotton T-Shirt
Black Cotton T-Shirt Store
Black Cotton T-Shirt Shopping
Black Cotton T-Shirt India
Black Cotton T-Shirt Clothing
Black Cotton T-Shirt Apparel
Black Cotton T-Shirt Fashion

Bad tags:

Black Shirt
Formal Shirt
Men's Shirt
Polo Shirt
Premium T-Shirt
Best T-Shirt

Return exactly 20 tags, one per line.
`;


    try {

        const response =
            await fetch(
                BACKEND_URL,
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Server error"
            );

        }


        let text =
            data.result || "";


        if (!text.trim()) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        /* =========================
           CLEAN AI RESPONSE
        ========================= */

        text =
            text.replace(
                /```[a-zA-Z]*\s*/g,
                ""
            );

        text =
            text.replace(
                /```/g,
                ""
            );


        /* =========================
           GET LINES
        ========================= */

        let tags =
            text
                .split("\n")
                .map(function(tag) {

                    return tag
                        .trim()
                        .replace(
                            /^\d+[\.\)\-\:]\s*/,
                            ""
                        )
                        .trim();

                })
                .filter(function(tag) {

                    return tag !== "";

                });


        /* =========================
           REMOVE DUPLICATES
        ========================= */

        const uniqueTags = [];

        const seen =
            new Set();


        tags.forEach(function(tag) {

            const normalized =
                tag.toLowerCase();

            if (!seen.has(normalized)) {

                seen.add(normalized);

                uniqueTags.push(tag);

            }

        });


        tags =
            uniqueTags;


        /* =========================
           LIMIT TO 20
        ========================= */

        tags =
            tags.slice(0, 20);


        if (tags.length === 0) {

            throw new Error(
                "AI ने कोई valid product tag नहीं बनाया।"
            );

        }


        /* =========================
           DISPLAY
        ========================= */

        result.innerText =
            tags
                .map(function(tag, index) {

                    return (
                        (index + 1) +
                        ". " +
                        tag
                    );

                })
                .join("\n");


    } catch (error) {

        console.error(
            "Product Tags Error:",
            error
        );


        result.innerText =
            "❌ Product Tags generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================================
   COPY TAGS
========================================= */

async function copyTags() {

    const result =
        document.getElementById("result");


    const text =
        result.innerText.trim();


    if (
        text === "" ||
        text ===
        "Enter a product name and click Generate."
    ) {

        alert(
            "पहले Product Tags generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ Product Tags generate नहीं हो सके"
        )
    ) {

        alert(
            "पहले Product Tags successfully generate करें।"
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        alert(
            "✅ Product Tags copied successfully!"
        );


    } catch (error) {

        /* Fallback copy method */

        const textarea =
            document.createElement("textarea");


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        alert(
            "✅ Product Tags copied successfully!"
        );

    }

}
