/* =========================================
   AI PRODUCT TAGS GENERATOR
   Gemini API Backend Connected
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
        "⏳ Gemini AI Product Tags बना रहा है...\n\nPlease wait...";


    const prompt = `
You are a professional eCommerce product tag generator.

Generate exactly 20 useful product tags for this EXACT product:

PRODUCT NAME:
${product}

VERY IMPORTANT RULES:

1. The exact product name is:
"${product}"

2. NEVER change the product name.

3. NEVER remove any important word from the product name.

4. Every generated tag MUST contain the complete exact product name:
"${product}"

5. Do NOT create shortened versions.

6. Do NOT remove:
- color
- material
- product type
- brand
- model
- other words present in the product name

7. Do NOT change:
"T-Shirt" into "Shirt".

8. Do NOT change:
"T-Shirt" into "Tshirt".

9. Do NOT change:
"T-Shirt" into "T Shirt".

10. Keep the exact spelling and wording:
"${product}"

11. You may add useful search phrases AFTER the complete product name.

Examples:

"${product}"
"${product} Online"
"${product} Shopping"
"Buy ${product}"
"Shop ${product}"
"${product} Store"
"${product} Shop"
"${product} India"
"${product} Online Shopping"
"Buy ${product} Online"

12. Do NOT invent:
- another product type
- another brand
- another material
- another color
- another specification
- fake benefits
- fake quality claims

13. Do not use:
Best
Premium
Amazing
Excellent
Bestseller
Luxury
Guaranteed

14. Do not create unrelated keywords.

15. Do not use hashtags.

16. Do not number the tags.

17. Return exactly 20 tags.

18. Each tag must be on a separate line.

19. Every tag MUST contain this exact phrase:

"${product}"

20. Return ONLY the 20 tags.
No explanation.
No heading.
No extra text.
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
                "Gemini returned an empty response."
            );

        }


        /* =========================
           CLEAN RESPONSE
        ========================= */

        text =
            text
                .replace(/```[a-zA-Z]*\s*/g, "")
                .replace(/```/g, "")
                .trim();


        /* =========================
           SPLIT INTO TAGS
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
           IMPORTANT VALIDATION
           Every AI tag must contain
           the complete product name.
        ========================= */

        const validTags =
            tags.filter(function(tag) {

                return tag
                    .toLowerCase()
                    .includes(
                        product.toLowerCase()
                    );

            });


        /* =========================
           CREATE SAFE BACKUP TAGS
           IF AI GIVES FEWER THAN 20
        ========================= */

        const backupTags = [

            product,

            product + " Online",

            product + " Shopping",

            "Buy " + product,

            "Shop " + product,

            product + " Store",

            product + " Shop",

            product + " India",

            product + " Online Store",

            product + " Online Shopping",

            "Buy " + product + " Online",

            "Shop " + product + " Online",

            product + " Marketplace",

            product + " Product",

            product + " Collection",

            product + " Clothing",

            product + " Apparel",

            product + " Fashion",

            product + " Wear",

            product + " Shopping Online"

        ];


        /* =========================
           COMBINE AI + BACKUP
        ========================= */

        const finalTags = [];

        const finalSeen =
            new Set();


        function addTag(tag) {

            const clean =
                tag.trim();

            const normalized =
                clean.toLowerCase();


            if (
                clean !== "" &&
                !finalSeen.has(normalized) &&
                clean
                    .toLowerCase()
                    .includes(
                        product.toLowerCase()
                    )
            ) {

                finalSeen.add(normalized);

                finalTags.push(clean);

            }

        }


        validTags.forEach(addTag);

        backupTags.forEach(addTag);


        /* =========================
           EXACTLY 20 TAGS
        ========================= */

        const finalResult =
            finalTags.slice(0, 20);


        if (finalResult.length < 20) {

            throw new Error(
                "20 valid product tags generate नहीं हो सके।"
            );

        }


        /* =========================
           DISPLAY
        ========================= */

        result.innerText =
            finalResult
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
            "Product Tags AI Error:",
            error
        );


        result.innerText =
            "❌ AI Product Tags generate नहीं हो सके.\n\n" +
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
        text.includes(
            "Product Name डालें"
        )
    ) {

        alert(
            "पहले Product Tags generate करें।"
        );

        return;
    }


    if (
        text.includes(
            "❌ AI Product Tags"
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
