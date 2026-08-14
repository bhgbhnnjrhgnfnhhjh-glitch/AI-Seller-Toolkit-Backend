async function generateSEOTitle() {

    const productElement =
        document.getElementById("product");

    const brandElement =
        document.getElementById("brand");

    const marketplaceElement =
        document.getElementById("marketplace");

    const result =
        document.getElementById("result");

    const button =
        document.querySelector(
            "button[onclick='generateSEOTitle()']"
        );


    if (!productElement || !result) {

        alert(
            "❌ Product Name या Result field नहीं मिला।"
        );

        return;
    }


    const product =
        productElement.value.trim();

    const brand =
        brandElement
            ? brandElement.value.trim()
            : "";

    const marketplace =
        marketplaceElement
            ? marketplaceElement.value
            : "All Marketplaces";


    if (product === "") {

        alert(
            "Please enter Product Name."
        );

        productElement.focus();

        return;
    }


    if (button) {

        button.disabled = true;

        button.innerText =
            "⏳ Generating SEO Title...";
    }


    result.value =
        "⏳ AI SEO Title बना रहा है...";


    const prompt = `
You are a professional eCommerce SEO title writer.

Create ONE clear and professional product title.

PRODUCT INFORMATION

Product Name:
${product}

Brand:
${brand || "Not specified"}

Marketplace:
${marketplace}


STRICT RULES

1. Use ONLY the information provided above.

2. Keep the exact product name.

3. Use the brand only if it was provided.

4. Never invent product features.

5. Never invent material.

6. Never invent color.

7. Never invent size.

8. Never invent gender.

9. Never invent product specifications.

10. Never invent quality claims.

11. Never invent price.

12. Never invent discounts or offers.

13. Never invent delivery information.

14. Never use unsupported claims such as:

Premium
Best
Best Price
Amazing
High Quality
Top Quality
Perfect
No.1
Number One
Guaranteed
Bestseller
Trending
Free Delivery
Fast Delivery
Cash on Delivery

15. Do not add "India" unless India is provided.

16. Do not add another brand.

17. Never mention brands such as:

Nike
Adidas
Puma
Reebok
Apple
Samsung
Gucci
Louis Vuitton

unless that exact brand was provided by the user.

18. Do not add unsupported words such as:
Buy
Shop
Online
Sale
Offer
Deal

unless they are explicitly provided.

19. Do not use emojis.

20. Do not use quotation marks.

21. Do not write explanations.

22. Return ONLY ONE product title.

23. Keep the title natural and easy to read.

24. Do not repeat words unnecessarily.

25. The product name must remain clearly identifiable.

Example:

Fashion Hud Cotton T-Shirt

Return ONLY the final product title.
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


        let data = {};

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Backend ने valid response नहीं दिया।"
            );
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Backend Server Error"
            );
        }


        let title =
            data.result ||
            data.response ||
            data.text ||
            "";


        title =
            String(title).trim();


        if (!title) {

            throw new Error(
                "AI ने कोई SEO Title नहीं बनाया।"
            );
        }


        /*
         * Remove AI formatting
         */

        title = title
            .replace(/^["']+|["']+$/g, "")
            .replace(/^Title\s*:\s*/i, "")
            .replace(/^Product Title\s*:\s*/i, "")
            .replace(/\n+/g, " ")
            .replace(/\s+/g, " ")
            .trim();


        /*
         * Remove unsupported marketing claims
         */

        const bannedPhrases = [

            "best price",
            "best",
            "premium",
            "amazing",
            "high quality",
            "top quality",
            "perfect",
            "no.1",
            "number one",
            "guaranteed",
            "bestseller",
            "trending",
            "free delivery",
            "fast delivery",
            "cash on delivery",
            "buy online",
            "shop online"

        ];


        bannedPhrases.forEach(function (phrase) {

            const escaped =
                phrase.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            const regex =
                new RegExp(
                    "\\b" +
                    escaped +
                    "\\b",
                    "gi"
                );

            title =
                title.replace(regex, "");

        });


        /*
         * Remove unsupported brands
         */

        const blockedBrands = [

            "Nike",
            "Adidas",
            "Puma",
            "Reebok",
            "Apple",
            "Samsung",
            "Gucci",
            "Prada",
            "Versace",
            "Louis Vuitton"

        ];


        blockedBrands.forEach(function (blockedBrand) {

            /*
             * If user actually entered this brand,
             * don't remove it.
             */

            if (
                brand.toLowerCase() !==
                blockedBrand.toLowerCase()
            ) {

                const regex =
                    new RegExp(
                        "\\b" +
                        blockedBrand +
                        "\\b",
                        "gi"
                    );

                title =
                    title.replace(
                        regex,
                        ""
                    );
            }

        });


        /*
         * Remove unnecessary separators
         */

        title = title
            .replace(/\s+\|\s+/g, " ")
            .replace(/\s+-\s+/g, " - ")
            .replace(/\s{2,}/g, " ")
            .replace(/^[|,:-]+/, "")
            .replace(/[|,:-]+$/, "")
            .trim();


        /*
         * Safety check:
         * Product name must exist in title.
         */

        if (
            !title
                .toLowerCase()
                .includes(
                    product.toLowerCase()
                )
        ) {

            if (brand !== "") {

                title =
                    brand +
                    " " +
                    product;

            } else {

                title =
                    product;
            }

        }


        /*
         * Final cleanup
         */

        title =
            title
                .replace(/\s{2,}/g, " ")
                .trim();


        result.value =
            title;


    } catch (error) {

        console.error(
            "Advanced SEO Title Error:",
            error
        );


        result.value =
            "❌ SEO Title generate नहीं हो सका.\n\n" +
            "Error: " +
            error.message;


    } finally {

        if (button) {

            button.disabled = false;

            button.innerText =
                "Generate SEO Title";
        }

    }

}


/*
 * COPY TITLE
 */

async function copyTitle() {

    const result =
        document.getElementById("result");


    if (!result) {

        alert(
            "❌ Result field नहीं मिला।"
        );

        return;
    }


    const text =
        result.value.trim();


    if (
        !text ||
        text.startsWith("⏳") ||
        text.startsWith("❌")
    ) {

        alert(
            "पहले SEO Title generate करें।"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );

        alert(
            "✅ SEO Title copied successfully!"
        );

    } catch (error) {

        result.focus();

        result.select();

        document.execCommand("copy");

        alert(
            "✅ SEO Title copied successfully!"
        );

    }

}
