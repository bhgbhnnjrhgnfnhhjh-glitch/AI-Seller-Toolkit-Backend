/* =========================================
   AI SEO KEYWORD GENERATOR
   ========================================= */

async function generateSEO() {

    const product =
        document.getElementById("product").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const keyword =
        document.getElementById("keyword").value.trim();

    const marketplace =
        document.getElementById("marketplace").value;

    const result =
        document.getElementById("result");


    /* =========================
       VALIDATION
    ========================= */

    if (product === "") {

        alert("Please enter Product Name.");
        return;

    }


    if (keyword === "") {

        alert("Please enter Main Keyword.");
        return;

    }


    result.value =
        "⏳ AI SEO keywords बना रहा है...";


    /* =========================
       AI PROMPT
    ========================= */

    const prompt = `
You are a professional eCommerce SEO keyword specialist.

Generate useful SEO keywords for the supplied product information.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Category:
${category || "Not specified"}

Brand:
${brand || "Not specified"}

Main Keyword:
${keyword}

Target Marketplace:
${marketplace}


STRICT RULES
------------

1. Use ONLY the information provided.

2. Do NOT invent information.

3. Do NOT invent:
- colors
- materials
- sizes
- features
- benefits
- quality claims
- product specifications
- prices
- discounts
- offers
- delivery information

4. Do NOT add another brand.

5. If Brand is provided, use ONLY that exact brand.

6. Do NOT add brands such as:
Nike, Adidas, Puma, Apple, Samsung, etc.

7. Keep the exact product type.

8. Do NOT change the product into another product.

9. Keywords must be directly related to:
- Product Name
- Category
- Brand
- Main Keyword

10. Do NOT create fake search claims.

11. Do NOT use words such as:
Best
Amazing
Premium
Cheap
No.1
Top
Bestseller
Guaranteed

unless they were explicitly supplied.

12. Do NOT create duplicate keywords.

13. Do NOT create the same keyword with only minor
punctuation or capitalization changes.

For example, these count as duplicates:

Black Cotton T-Shirt
black cotton t-shirt
Black Cotton Tshirt

Only one should be used.

14. Do NOT create keyword variations by randomly
changing word order.

15. Do NOT add:
Online
Buy
Shop
Store
Sale
Offer

unless these words are genuinely relevant to the
provided information and marketplace context.

16. Keep keywords natural and searchable.

17. Do not add explanations.

18. Do not add numbering.

19. Return keywords only.

20. Generate up to 20 keywords.

21. Quality is more important than quantity.

22. If only 8 unique useful keywords are possible,
return only 8.

23. Do NOT force the result to 20 keywords.

24. Every keyword must be directly supported by the
provided information.

25. Do not repeat the exact same information unnecessarily.


KEYWORD PRIORITY
----------------

Use information in this order:

1. Main Keyword
2. Product Name
3. Category
4. Brand
5. Valid combinations of the above

Do not combine fields in a way that creates a
meaning not present in the supplied information.


OUTPUT FORMAT
-------------

Return ONLY the keywords.

Example:

Black Cotton T-Shirt
Cotton T-Shirt
Black T-Shirt
Cotton Clothing
Fashion Hud
Fashion Hud T-Shirt

No numbers.
No bullets.
No explanations.
`;


    /* =========================
       API REQUEST
    ========================= */

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


        /* =========================
           READ API RESPONSE
        ========================= */

        let data;

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Backend ने valid response नहीं दिया।"
            );

        }


        /* =========================
           API ERROR
        ========================= */

        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Server error: " + response.status
            );

        }


        /* =========================
           CHECK RESULT
        ========================= */

        if (
            !data.result ||
            typeof data.result !== "string" ||
            data.result.trim() === ""
        ) {

            throw new Error(
                "AI ने कोई keyword नहीं बनाया।"
            );

        }


        /* =========================
           CLEAN + FILTER
        ========================= */

        const keywords =
            cleanAndFilterKeywords(
                data.result,
                product,
                category,
                brand,
                keyword
            );


        if (keywords.length === 0) {

            throw new Error(
                "AI ने कोई valid SEO keyword नहीं बनाया।"
            );

        }


        /* =========================
           SHOW RESULT
        ========================= */

        result.value =
            keywords
                .map(
                    function(item, index) {
                        return (
                            (index + 1) +
                            ". " +
                            item
                        );
                    }
                )
                .join("\n");


    } catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );


        result.value =
            "❌ SEO keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================================
   CLEAN + STRICT FILTER
   ========================================= */

function cleanAndFilterKeywords(
    text,
    product,
    category,
    brand,
    mainKeyword
) {

    let lines =
        text
            .split(/\r?\n/)
            .map(function(line) {

                return line
                    .trim()
                    .replace(
                        /^\d+[\.\)\-:\s]+/,
                        ""
                    )
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim();

            })
            .filter(Boolean);


    const result = [];

    const seen = new Set();


    /* =========================
       Forbidden words
    ========================= */

    const forbiddenWords = [

        "amazing",
        "premium",
        "best",
        "cheap",
        "no.1",
        "no1",
        "top",
        "bestseller",
        "guaranteed",
        "guarantee",
        "excellent",
        "high quality",
        "super quality",
        "must buy",
        "viral",
        "trending",
        "offer",
        "discount",
        "sale"

    ];


    lines.forEach(function(line) {

        let value =
            line
                .replace(/^["']|["']$/g, "")
                .trim();


        if (!value) {
            return;
        }


        /* Remove accidental numbering */

        value =
            value.replace(
                /^\d+[\.\)\-:\s]+/,
                ""
            ).trim();


        /* Remove bullets */

        value =
            value.replace(
                /^[-•*]\s*/,
                ""
            ).trim();


        /* Too long = probably sentence */

        if (
            value.length > 100
        ) {
            return;
        }


        /* Remove punctuation at end */

        value =
            value.replace(
                /[.,;:!?]+$/g,
                ""
            ).trim();


        if (!value) {
            return;
        }


        /* =========================
           Forbidden claim filter
        ========================= */

        const lower =
            value.toLowerCase();


        for (
            const word of forbiddenWords
        ) {

            if (
                lower.includes(word)
            ) {

                return;

            }

        }


        /* =========================
           Reject hashtag
        ========================= */

        if (
            value.startsWith("#")
        ) {

            return;

        }


        /* =========================
           Reject sentence-like text
        ========================= */

        if (
            lower.startsWith("this ") ||
            lower.startsWith("the product") ||
            lower.startsWith("our ") ||
            lower.startsWith("it is ")
        ) {

            return;

        }


        /* =========================
           Normalized duplicate key
        ========================= */

        const normalized =
            normalizeKeyword(value);


        if (
            normalized === ""
        ) {

            return;

        }


        if (
            seen.has(normalized)
        ) {

            return;

        }


        /* =========================
           Check supported words
        ========================= */

        const sourceWords =
            getSourceWords(
                product,
                category,
                brand,
                mainKeyword
            );


        const keywordWords =
            normalized
                .split(" ")
                .filter(Boolean);


        /*
         * Every important word in the keyword
         * must come from supplied information.
         */

        const unsupported =
            keywordWords.some(
                function(word) {

                    return !sourceWords.has(
                        word
                    );

                }
            );


        if (unsupported) {

            return;

        }


        seen.add(normalized);

        result.push(value);


    });


    /* Maximum 20 */

    return result.slice(0, 20);

}


/* =========================================
   NORMALIZE KEYWORD
   ========================================= */

function normalizeKeyword(text) {

    return text
        .toLowerCase()
        .replace(
            /[-_/]+/g,
            " "
        )
        .replace(
            /[^a-z0-9\s]/gi,
            ""
        )
        .replace(
            /\b(tshirt|tshirts)\b/g,
            "tshirt"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================
   SOURCE WORDS
   ========================================= */

function getSourceWords(
    product,
    category,
    brand,
    mainKeyword
) {

    const source =
        [
            product,
            category,
            brand,
            mainKeyword
        ]
            .filter(Boolean)
            .join(" ");


    const words =
        normalizeKeyword(source)
            .split(" ")
            .filter(Boolean);


    return new Set(words);

}


/* =========================================
   COPY SEO KEYWORDS
   ========================================= */

function copySEO() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (
        text === ""
    ) {

        alert(
            "पहले SEO Keywords generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ SEO keywords generate नहीं हो सके"
        )
    ) {

        alert(
            "पहले SEO Keywords successfully generate करें।"
        );

        return;

    }


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)

            .then(function() {

                alert(
                    "✅ SEO Keywords copied successfully!"
                );

            })

            .catch(function() {

                fallbackCopySEO(text);

            });

    } else {

        fallbackCopySEO(text);

    }

}


/* =========================================
   COPY FALLBACK
   ========================================= */

function fallbackCopySEO(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value =
        text;


    textarea.style.position =
        "fixed";


    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );

        alert(
            "✅ SEO Keywords copied successfully!"
        );

    } catch (error) {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    document.body.removeChild(
        textarea
    );

    }
