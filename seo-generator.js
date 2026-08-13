/* =========================================
   AI SEO KEYWORD GENERATOR - FINAL
========================================= */

async function generateSEO() {

    const product =
        document.getElementById("product").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const mainKeyword =
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

    if (mainKeyword === "") {

        alert("Please enter Main Keyword.");
        return;

    }


    result.value =
        "⏳ AI SEO keywords बना रहा है...";


    /* =========================
       AI PROMPT
    ========================= */

    const prompt = `
You are a strict eCommerce SEO keyword generator.

Create useful SEO keywords using ONLY the exact information
provided below.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Category:
${category || "Not specified"}

Brand:
${brand || "Not specified"}

Main Keyword:
${mainKeyword}

Marketplace:
${marketplace}


VERY IMPORTANT
--------------

The information above is the ONLY source of truth.

Do NOT guess.

Do NOT paraphrase important product words.

Do NOT replace words with synonyms.

Do NOT change singular/plural meaning.

Do NOT change gender/audience meaning.

For example:

"Men's Clothing"

MUST NOT become:

"Man Clothing"
"Men Clothing"
"Male Clothing"
"Mens Wear"

unless that exact wording was supplied.


STRICT RULES
------------

1. Generate up to 20 SEO keywords.

2. Quality is more important than quantity.

3. It is completely acceptable to return fewer than 20
keywords.

4. Every keyword must contain words taken directly from
the supplied Product Name, Category, Brand or Main Keyword.

5. Do NOT invent words.

6. Do NOT use synonyms.

7. Do NOT change:
Men's -> Man
Men's -> Mens
Women's -> Woman
Women's -> Womens

8. Keep product terminology accurate.

9. Do NOT invent:
color
material
size
feature
benefit
quality
price
discount
offer
delivery
warranty
specification

10. Do NOT add unrelated brands.

11. Do NOT add:
Nike
Adidas
Puma
Apple
Samsung
etc.

12. Do NOT create marketing claims such as:

Best
Premium
Amazing
Cheap
Top
No.1
Bestseller
Guaranteed
Excellent
Trending
Viral

13. Do NOT add words such as:

Buy
Online
Shop
Store
Sale
Offer
Deal

unless that exact word was supplied in the input.

14. Do NOT create search-intent phrases by guessing.

15. Do NOT reverse words randomly.

16. Do NOT create awkward phrases.

17. Do NOT create duplicate keywords.

18. These should be considered duplicates:

Black Cotton T-Shirt
Black Cotton Tshirt
Black Cotton T Shirt

Only ONE may be returned.

19. Do NOT create duplicate keywords by changing
capitalization.

20. Do NOT create duplicate keywords by changing hyphens.

21. Brand alone is NOT useful as an SEO product keyword.

Therefore do NOT return:

${brand || "Brand"}

as a standalone keyword.

22. Category alone is NOT useful unless it is directly
connected to the supplied product.

23. Do NOT create:

Man Clothing

when the supplied category is:

Men's Clothing

24. Do NOT create:

Fashion Hud Man Clothing

if "Man Clothing" was not supplied.

25. Brand + exact supplied product combinations are allowed.

26. Product + exact supplied category combinations are allowed
only when they form a natural keyword.

27. Return keywords only.

28. Do not add numbers.

29. Do not add bullets.

30. Do not add explanations.

OUTPUT
------

Return one keyword per line.
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
           READ RESPONSE
        ========================= */

        let data;

        try {

            data = await response.json();

        } catch (error) {

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
           CHECK AI RESULT
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
           STRICT FILTER
        ========================= */

        const keywords =
            strictKeywordFilter(
                data.result,
                product,
                category,
                brand,
                mainKeyword
            );


        if (keywords.length === 0) {

            throw new Error(
                "AI ने दिए गए information से कोई valid keyword नहीं बनाया।"
            );

        }


        /* =========================
           SHOW RESULT
        ========================= */

        result.value =
            keywords
                .map(
                    function(keyword, index) {

                        return (
                            (index + 1) +
                            ". " +
                            keyword
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
   STRICT KEYWORD FILTER
========================================= */

function strictKeywordFilter(
    text,
    product,
    category,
    brand,
    mainKeyword
) {

    /* =========================
       INPUT PHRASES
    ========================= */

    const sourcePhrases = [
        product,
        category,
        brand,
        mainKeyword
    ].filter(Boolean);


    /*
     * Build exact source vocabulary.
     */

    const sourceWords =
        new Set();


    sourcePhrases.forEach(
        function(phrase) {

            tokenizeExact(phrase)
                .forEach(
                    function(word) {

                        sourceWords.add(word);

                    }
                );

        }
    );


    /* =========================
       SPECIAL EXACT PHRASES
    ========================= */

    const exactCategory =
        normalizePhrase(category);

    const exactProduct =
        normalizePhrase(product);

    const exactBrand =
        normalizePhrase(brand);

    const exactMainKeyword =
        normalizePhrase(mainKeyword);


    /* =========================
       SPLIT AI RESPONSE
    ========================= */

    let lines =
        text.split(/\r?\n/);


    const finalKeywords = [];

    const seen = new Set();


    lines.forEach(
        function(line) {

            let value =
                line.trim();


            /* Remove numbering */

            value =
                value.replace(
                    /^\s*\d+[\.\)\-:]\s*/,
                    ""
                );


            /* Remove bullets */

            value =
                value.replace(
                    /^\s*[-•*]\s*/,
                    ""
                );


            value =
                value.trim();


            if (!value) {
                return;
            }


            /* Remove quotes */

            value =
                value.replace(
                    /^["']|["']$/g,
                    ""
                ).trim();


            /* =========================
               BASIC VALIDATION
            ========================= */

            if (
                value.length < 2 ||
                value.length > 80
            ) {

                return;

            }


            /* Reject sentences */

            if (
                value.includes(". ") ||
                value.includes("!") ||
                value.includes("?")
            ) {

                return;

            }


            /* Reject hashtags */

            if (
                value.startsWith("#")
            ) {

                return;

            }


            /* =========================
               FORBIDDEN WORDS
            ========================= */

            const lower =
                value.toLowerCase();


            const forbidden = [

                "best",
                "premium",
                "amazing",
                "excellent",
                "cheap",
                "top",
                "no.1",
                "no1",
                "bestseller",
                "guaranteed",
                "guarantee",
                "trending",
                "viral",
                "must buy",
                "deal",
                "offer",
                "discount",
                "sale",
                "buy",
                "shop",
                "store",
                "online"

            ];


            for (
                const word of forbidden
            ) {

                if (
                    containsWholePhrase(
                        lower,
                        word
                    )
                ) {

                    return;

                }

            }


            /* =========================
               NORMALIZE
            ========================= */

            const normalized =
                normalizeKeyword(value);


            if (!normalized) {
                return;
            }


            /* =========================
               DUPLICATE CHECK
            ========================= */

            if (
                seen.has(normalized)
            ) {

                return;

            }


            /* =========================
               EXACT WORD VALIDATION
            ========================= */

            const words =
                normalized.split(" ");


            let invalidWord =
                false;


            for (
                const word of words
            ) {

                if (
                    !sourceWords.has(word)
                ) {

                    invalidWord = true;
                    break;

                }

            }


            if (invalidWord) {

                return;

            }


            /* =========================
               GENDER SAFETY
            ========================= */

            if (
                exactCategory.includes(
                    "men s clothing"
                )
            ) {

                if (
                    normalized.includes(
                        "man clothing"
                    )
                ) {

                    return;

                }

                if (
                    normalized.includes(
                        "men clothing"
                    )
                ) {

                    return;

                }

                if (
                    normalized.includes(
                        "male clothing"
                    )
                ) {

                    return;

                }

            }


            /* =========================
               IMPORTANT:
               Do not allow changed
               gender wording.
            ========================= */

            if (
                normalized.includes("man")
            ) {

                const categoryHasMan =
                    sourceWords.has("man");

                const productHasMan =
                    tokenizeExact(product)
                        .includes("man");

                const keywordHasMan =
                    tokenizeExact(mainKeyword)
                        .includes("man");


                if (
                    !categoryHasMan &&
                    !productHasMan &&
                    !keywordHasMan
                ) {

                    return;

                }

            }


            /* =========================
               BRAND ALONE FILTER
            ========================= */

            if (
                exactBrand &&
                normalized === exactBrand
            ) {

                return;

            }


            /* =========================
               CATEGORY ALONE FILTER
            ========================= */

            if (
                exactCategory &&
                normalized === exactCategory
            ) {

                return;

            }


            /* =========================
               VERY SHORT GENERIC TERMS
            ========================= */

            if (
                words.length === 1
            ) {

                /*
                 * Single-word keywords are allowed
                 * only when they are directly useful
                 * and not just a standalone brand.
                 */

                if (
                    normalized === exactBrand
                ) {

                    return;

                }

            }


            /* =========================
               SAVE
            ========================= */

            seen.add(normalized);

            finalKeywords.push(value);


        }
    );


    /* Maximum 20 */

    return finalKeywords.slice(0, 20);

}


/* =========================================
   TOKENIZE EXACT SOURCE
========================================= */

function tokenizeExact(text) {

    if (!text) {
        return [];
    }


    return normalizeKeyword(text)
        .split(" ")
        .filter(Boolean);

}


/* =========================================
   NORMALIZE KEYWORD
========================================= */

function normalizeKeyword(text) {

    return text
        .toLowerCase()

        /*
         * Keep apostrophe information
         * temporarily.
         */

        .replace(
            /['’]/g,
            " "
        )

        /*
         * Normalize hyphens.
         */

        .replace(
            /[-_/]+/g,
            " "
        )

        /*
         * Remove punctuation.
         */

        .replace(
            /[^a-z0-9\s]/gi,
            ""
        )

        /*
         * Treat T-Shirt / Tshirt / T Shirt
         * as the same keyword.
         */

        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirts\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        /*
         * Normalize mens/mens.
         */

        .replace(
            /\bmens\b/g,
            "men"
        )

        /*
         * Normalize spaces.
         */

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================
   NORMALIZE PHRASE
========================================= */

function normalizePhrase(text) {

    return normalizeKeyword(
        text || ""
    );

}


/* =========================================
   WHOLE PHRASE CHECK
========================================= */

function containsWholePhrase(
    text,
    phrase
) {

    const escaped =
        phrase.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const regex =
        new RegExp(
            "(^|\\s)" +
            escaped +
            "(\\s|$)",
            "i"
        );


    return regex.test(text);

}


/* =========================================
   COPY SEO
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

            .then(
                function() {

                    alert(
                        "✅ SEO Keywords copied successfully!"
                    );

                }
            )

            .catch(
                function() {

                    fallbackCopySEO(text);

                }
            );

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
