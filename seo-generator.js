/* =========================================
   AI SEO KEYWORD GENERATOR
   FINAL VERSION
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


    /* ==============================
       VALIDATION
    ============================== */

    if (product === "") {

        alert("Please enter Product Name.");
        return;

    }

    if (mainKeyword === "") {

        alert("Please enter Main Keyword.");
        return;

    }


    result.value =
        "⏳ AI SEO Keywords बनाए जा रहे हैं...\n\nPlease wait...";


    /* ==============================
       AI PROMPT
    ============================== */

    const prompt = `
You are a professional eCommerce SEO keyword specialist.

Create useful SEO keywords from the exact information provided.

PRODUCT:
${product}

CATEGORY:
${category || "Not specified"}

BRAND:
${brand || "Not specified"}

MAIN KEYWORD:
${mainKeyword}

MARKETPLACE:
${marketplace}


STRICT RULES:

1. Return maximum 20 keywords.

2. Do NOT force 20 keywords.

3. If only 8 valid keywords are possible,
return only 8.

4. Use ONLY words and phrases supported by
the information provided.

5. Do NOT invent information.

6. Do NOT invent colors.

7. Do NOT invent materials.

8. Do NOT invent sizes.

9. Do NOT invent features.

10. Do NOT invent benefits.

11. Do NOT invent quality claims.

12. Do NOT invent price or offers.

13. Do NOT invent another brand.

14. Do NOT use Nike, Adidas, Puma,
Apple, Samsung or any other brand
unless explicitly provided.

15. Keep exact gender wording.

If the input says:
Men's Clothing

do NOT change it to:
Man Clothing
Men Clothing
Male Clothing
Mens Clothing

16. Keep the exact product meaning.

17. Do NOT create random word combinations.

18. Do NOT create unnatural keywords.

19. Do NOT use these words unless
they were explicitly provided:

Buy
Shop
Online
Store
Sale
Offer
Deal
Best
Premium
Amazing
Excellent
Trending
Viral
Cheap
Top
Bestseller

20. Do NOT return the brand alone.

For example, if brand is:
Fashion Hud

DO NOT return:
Fashion Hud

21. Do NOT return the category alone
as a standalone keyword.

22. Product-related keywords are preferred.

23. Brand + product is allowed.

24. Product + category is allowed only
when natural.

25. Brand + product + category is allowed
when natural.

26. Do not create:
Man Clothing

if the actual category is:
Men's Clothing

27. Do not change:
T-Shirt
into unrelated words.

28. These should be treated as duplicates:

T-Shirt
Tshirt
T Shirt

Return only one version.

29. Do not return duplicate keywords.

30. Return keywords only.

31. One keyword per line.

32. Do not number the keywords.

33. Do not add explanations.


EXAMPLE INPUT:

Product:
Cotton T-Shirt

Category:
Men's Clothing

Brand:
Fashion Hud

Main Keyword:
Black Cotton T-Shirt


GOOD EXAMPLES:

Black Cotton T-Shirt
Cotton T-Shirt
Black T-Shirt
Fashion Hud T-Shirt
Fashion Hud Cotton T-Shirt
Fashion Hud Black Cotton T-Shirt
Men's Cotton T-Shirt
Men's Black Cotton T-Shirt
Men's Black T-Shirt
Fashion Hud Men's T-Shirt


BAD EXAMPLES:

Fashion Hud
Men's Clothing
Man Clothing
Men Clothing
Buy Black Cotton T-Shirt
Best Black Cotton T-Shirt
Black Cotton T-Shirt Online
Premium Black Cotton T-Shirt


Return only valid SEO keywords.
`;


    /* ==============================
       API REQUEST
    ============================== */

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


        /* ==============================
           RESPONSE
        ============================== */

        let data;

        try {

            data = await response.json();

        } catch (error) {

            throw new Error(
                "Backend ने सही response नहीं दिया।"
            );

        }


        /* ==============================
           SERVER ERROR
        ============================== */

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.details ||
                "Server Error: " + response.status
            );

        }


        if (
            !data.result ||
            typeof data.result !== "string"
        ) {

            throw new Error(
                "AI ने कोई keyword नहीं दिया।"
            );

        }


        /* ==============================
           STRICT FILTER
        ============================== */

        const keywords =
            filterSEOKeywords(
                data.result,
                product,
                category,
                brand,
                mainKeyword
            );


        if (keywords.length === 0) {

            throw new Error(
                "AI के keywords strict filtering में valid नहीं मिले।"
            );

        }


        /* ==============================
           SHOW RESULT
        ============================== */

        result.value =
            keywords
                .map(function(keyword, index) {

                    return (
                        (index + 1) +
                        ". " +
                        keyword
                    );

                })
                .join("\n");


    } catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );


        result.value =
            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================================
   STRICT SEO FILTER
========================================= */

function filterSEOKeywords(
    aiText,
    product,
    category,
    brand,
    mainKeyword
) {


    /* ==============================
       SOURCE WORDS
    ============================== */

    const productWords =
        tokenize(product);

    const categoryWords =
        tokenize(category);

    const brandWords =
        tokenize(brand);

    const mainKeywordWords =
        tokenize(mainKeyword);


    const allowedWords =
        new Set([
            ...productWords,
            ...categoryWords,
            ...brandWords,
            ...mainKeywordWords
        ]);


    /* ==============================
       IMPORTANT PRODUCT WORDS
    ============================== */

    const importantProductWords =
        productWords.filter(function(word) {

            return word.length > 2;

        });


    /* ==============================
       CATEGORY
    ============================== */

    const normalizedCategory =
        normalize(category);

    const normalizedBrand =
        normalize(brand);

    const normalizedProduct =
        normalize(product);

    const normalizedMainKeyword =
        normalize(mainKeyword);


    /* ==============================
       SPLIT AI RESPONSE
    ============================== */

    let lines =
        aiText.split(/\r?\n/);


    const finalKeywords = [];

    const duplicateSet = new Set();


    lines.forEach(function(line) {

        let keyword =
            line.trim();


        /* Remove numbering */

        keyword =
            keyword.replace(
                /^\s*\d+[\.\)\-:]\s*/,
                ""
            );


        /* Remove bullet */

        keyword =
            keyword.replace(
                /^\s*[-•*]\s*/,
                ""
            );


        /* Remove quotes */

        keyword =
            keyword.replace(
                /^["']+|["']+$/g,
                ""
            );


        keyword =
            keyword.trim();


        if (!keyword) {
            return;
        }


        /* ==============================
           LENGTH CHECK
        ============================== */

        if (
            keyword.length < 3 ||
            keyword.length > 100
        ) {

            return;

        }


        /* ==============================
           REMOVE SENTENCES
        ============================== */

        if (
            keyword.includes(".") ||
            keyword.includes("!") ||
            keyword.includes("?") ||
            keyword.includes(":")
        ) {

            return;

        }


        /* ==============================
           REMOVE HASHTAGS
        ============================== */

        if (
            keyword.includes("#")
        ) {

            return;

        }


        /* ==============================
           NORMALIZED VERSION
        ============================== */

        const normalized =
            normalize(keyword);


        if (!normalized) {
            return;
        }


        /* ==============================
           DUPLICATE CHECK
        ============================== */

        if (
            duplicateSet.has(normalized)
        ) {

            return;

        }


        /* ==============================
           FORBIDDEN MARKETING WORDS
        ============================== */

        const forbiddenWords = [

            "buy",
            "shop",
            "online",
            "store",
            "sale",
            "offer",
            "deal",
            "best",
            "premium",
            "amazing",
            "excellent",
            "trending",
            "viral",
            "cheap",
            "top",
            "bestseller",
            "guaranteed",
            "guarantee",
            "must buy",
            "no 1",
            "number 1"

        ];


        let hasForbidden =
            false;


        forbiddenWords.forEach(
            function(word) {

                if (
                    containsPhrase(
                        normalized,
                        normalize(word)
                    )
                ) {

                    hasForbidden = true;

                }

            }
        );


        if (hasForbidden) {

            return;

        }


        /* ==============================
           WORD CHECK
        ============================== */

        const keywordWords =
            tokenize(keyword);


        let invalidWord =
            false;


        keywordWords.forEach(
            function(word) {

                if (
                    !allowedWords.has(word)
                ) {

                    invalidWord = true;

                }

            }
        );


        if (invalidWord) {

            return;

        }


        /* ==============================
           PRODUCT RELEVANCE
        ============================== */

        let hasProductWord =
            false;


        importantProductWords.forEach(
            function(word) {

                if (
                    keywordWords.includes(word)
                ) {

                    hasProductWord = true;

                }

            }
        );


        if (!hasProductWord) {

            return;

        }


        /* ==============================
           BRAND ALONE
        ============================== */

        if (
            normalizedBrand &&
            normalized === normalizedBrand
        ) {

            return;

        }


        /* ==============================
           CATEGORY ALONE
        ============================== */

        if (
            normalizedCategory &&
            normalized === normalizedCategory
        ) {

            return;

        }


        /* ==============================
           GENDER SAFETY
        ============================== */

        if (
            normalizedCategory.includes(
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


        /* ==============================
           MEN / WOMEN WORD SAFETY
        ============================== */

        const categoryHasMen =
            categoryWords.includes("men") ||
            categoryWords.includes("men's");


        if (
            normalized.includes("man") &&
            !categoryWords.includes("man") &&
            !productWords.includes("man") &&
            !mainKeywordWords.includes("man")
        ) {

            return;

        }


        /* ==============================
           ALLOW ONLY SUPPLIED WORDS
        ============================== */

        for (
            let i = 0;
            i < keywordWords.length;
            i++
        ) {

            const word =
                keywordWords[i];


            if (
                !allowedWords.has(word)
            ) {

                return;

            }

        }


        /* ==============================
           SAVE KEYWORD
        ============================== */

        duplicateSet.add(
            normalized
        );

        finalKeywords.push(
            keyword
        );

    });


    /* ==============================
       FINAL SAFETY FILTER
    ============================== */

    const finalResult =
        finalKeywords.filter(
            function(keyword) {

                const normalized =
                    normalize(keyword);


                /* Brand alone */

                if (
                    normalizedBrand &&
                    normalized === normalizedBrand
                ) {

                    return false;

                }


                /* Category alone */

                if (
                    normalizedCategory &&
                    normalized === normalizedCategory
                ) {

                    return false;

                }


                /*
                 * Must contain at least one
                 * product word.
                 */

                const keywordWords =
                    tokenize(keyword);


                const hasProduct =
                    importantProductWords.some(
                        function(word) {

                            return keywordWords.includes(word);

                        }
                    );


                if (!hasProduct) {

                    return false;

                }


                return true;

            }
        );


    /* ==============================
       MAXIMUM 20
    ============================== */

    return finalResult.slice(0, 20);

}


/* =========================================
   NORMALIZE
========================================= */

function normalize(text) {

    if (!text) {
        return "";
    }


    return text

        .toLowerCase()

        .replace(
            /['’]/g,
            " "
        )

        .replace(
            /[-_/]/g,
            " "
        )

        .replace(
            /[^a-z0-9\s]/gi,
            ""
        )

        /*
         * T-Shirt
         * T Shirt
         * Tshirt
         *
         * all become tshirt
         */

        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        /*
         * Mens variations
         */

        .replace(
            /\bmens\b/g,
            "men"
        )

        .replace(
            /\bmen s\b/g,
            "men"
        )

        /*
         * Extra spaces
         */

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================
   TOKENIZE
========================================= */

function tokenize(text) {

    const normalized =
        normalize(text);


    if (!normalized) {
        return [];
    }


    return normalized
        .split(" ")
        .filter(function(word) {

            return word !== "";

        });

}


/* =========================================
   WHOLE PHRASE CHECK
========================================= */

function containsPhrase(
    text,
    phrase
) {

    if (
        !text ||
        !phrase
    ) {

        return false;

    }


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
   COPY SEO KEYWORDS
========================================= */

function copySEO() {

    const result =
        document.getElementById("result");


    const text =
        result.value.trim();


    if (
        !text
    ) {

        alert(
            "पहले SEO Keywords generate करें।"
        );

        return;

    }


    if (
        text.startsWith(
            "❌"
        )
    ) {

        alert(
            "पहले सही SEO Keywords generate करें।"
        );

        return;

    }


    /* Modern Clipboard */

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

                fallbackCopy(text);

            });

    } else {

        fallbackCopy(text);

    }

}


/* =========================================
   COPY FALLBACK
========================================= */

function fallbackCopy(text) {

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


    textarea.focus();

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
