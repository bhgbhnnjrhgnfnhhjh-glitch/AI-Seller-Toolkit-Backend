/* =========================================
   AI SEO KEYWORD GENERATOR
   FINAL VERSION
========================================= */

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const result = document.getElementById("result");
const status = document.getElementById("status");

generateBtn.addEventListener("click", generateSEO);
copyBtn.addEventListener("click", copySEO);


/* =========================================
   GENERATE SEO
========================================= */

async function generateSEO() {

    const product = document.getElementById("product").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const mainKeyword = document.getElementById("keyword").value.trim();
    const marketplace = document.getElementById("marketplace").value;

    if (product === "") {
        alert("Please enter Product Name.");
        return;
    }

    if (mainKeyword === "") {
        alert("Please enter Main Keyword.");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerText = "⏳ Generating SEO Keywords...";

    status.innerText = "AI SEO keywords बना रहा है...";
    result.value = "⏳ Please wait...";


    const prompt = `
You are an expert eCommerce SEO keyword generator.

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


IMPORTANT:

Generate useful SEO keywords based ONLY on the information above.

The MAIN KEYWORD is extremely important.

The exact main keyword MUST be included in the result.

STRICT RULES:

1. Maximum 20 keywords.

2. Do not force 20 keywords.

3. Main Keyword must be included.

4. Product-related keywords are preferred.

5. Brand + Product keywords are allowed.

6. Category + Product keywords are allowed.

7. Brand + Category + Product keywords are allowed when natural.

8. Never invent another brand.

9. Never invent another product.

10. Never invent color.

11. Never invent material.

12. Never invent size.

13. Never invent features.

14. Never invent benefits.

15. Never invent price.

16. Never invent offers.

17. Never invent quality claims.

18. Do NOT use:
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
Bestseller

19. Do not return the brand alone.

20. Do not return the category alone.

21. Do not change "Men's Clothing" into "Man Clothing".

22. Do not change "Men's" into "Man".

23. Do not create unrelated keywords.

24. Do not create random word combinations.

25. Do not duplicate keywords.

26. T-Shirt, Tshirt and T Shirt should be treated as the same keyword.

27. Return one keyword per line.

28. Do not number the keywords.

29. Return keywords only.

GOOD EXAMPLES:

Black Cotton T-Shirt
Cotton T-Shirt
Black T-Shirt
Fashion Hud Black Cotton T-Shirt
Fashion Hud Cotton T-Shirt
Fashion Hud T-Shirt
Men's Black Cotton T-Shirt
Men's Cotton T-Shirt
Men's Black T-Shirt
Fashion Hud Men's T-Shirt

BAD EXAMPLES:

Fashion Hud
Men's Clothing
Man Clothing
Buy Black Cotton T-Shirt
Black Cotton T-Shirt Online
Best Black Cotton T-Shirt
Premium Cotton T-Shirt
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

            throw new Error(
                "Backend Error: " + response.status
            );

        }


        const data = await response.json();


        if (!data || !data.result) {

            throw new Error(
                "AI ने कोई result नहीं दिया।"
            );

        }


        /*
         * AI result को filter करें
         */

        let keywords = parseKeywords(data.result);


        /*
         * Main Keyword को सबसे पहले रखें
         */

        const mainExact =
            cleanDisplayKeyword(mainKeyword);

        keywords = removeDuplicateKeywords(keywords);


        /*
         * Main keyword पहले
         */

        keywords = prioritizeMainKeyword(
            keywords,
            mainExact
        );


        /*
         * अगर AI ने Main Keyword नहीं दिया,
         * तो हम user द्वारा दिया गया exact
         * Main Keyword जोड़ेंगे।
         */

        const hasMainKeyword =
            keywords.some(function(item) {

                return normalizeKeyword(item) ===
                       normalizeKeyword(mainExact);

            });


        if (!hasMainKeyword) {

            keywords.unshift(mainExact);

        }


        /*
         * Related useful keywords
         */

        const generated = buildSafeKeywords(
            product,
            category,
            brand,
            mainKeyword
        );


        /*
         * AI keywords + safe keywords
         */

        keywords = mergeKeywords(
            keywords,
            generated
        );


        /*
         * Final filtering
         */

        keywords = strictFinalFilter(
            keywords,
            product,
            category,
            brand,
            mainKeyword
        );


        /*
         * Main keyword फिर से सुनिश्चित करें
         */

        const exactMain =
            cleanDisplayKeyword(mainKeyword);


        const exists =
            keywords.some(function(item) {

                return normalizeKeyword(item) ===
                       normalizeKeyword(exactMain);

            });


        if (!exists) {

            keywords.unshift(exactMain);

        }


        /*
         * Maximum 20
         */

        keywords = keywords.slice(0, 20);


        result.value =
            keywords.map(function(item, index) {

                return (index + 1) + ". " + item;

            }).join("\n");


        status.innerText =
            "✅ " +
            keywords.length +
            " relevant SEO keywords generated.";


    } catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );


        result.value =
            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;


        status.innerText =
            "Please try again.";

    }


    generateBtn.disabled = false;

    generateBtn.innerText =
        "🤖 Generate SEO Keywords";
}


/* =========================================
   PARSE AI KEYWORDS
========================================= */

function parseKeywords(text) {

    return text
        .split(/\r?\n/)
        .map(function(line) {

            let value = line.trim();

            value = value.replace(
                /^\d+[\.\)\-:]\s*/,
                ""
            );

            value = value.replace(
                /^[-•*]\s*/,
                ""
            );

            return value.trim();

        })
        .filter(function(value) {

            return value !== "";

        });

}


/* =========================================
   BUILD SAFE KEYWORDS
========================================= */

function buildSafeKeywords(
    product,
    category,
    brand,
    mainKeyword
) {

    const list = [];


    const p =
        cleanDisplayKeyword(product);

    const m =
        cleanDisplayKeyword(mainKeyword);

    const b =
        cleanDisplayKeyword(brand);

    const c =
        cleanDisplayKeyword(category);


    /*
     * Exact Main Keyword
     */

    if (m) {
        list.push(m);
    }


    /*
     * Product
     */

    if (p) {
        list.push(p);
    }


    /*
     * Main Keyword + Product
     * केवल तभी जब अलग हों
     */

    if (
        m &&
        p &&
        normalizeKeyword(m) !==
        normalizeKeyword(p)
    ) {

        /*
         * Main keyword पहले ही काफी specific है,
         * इसलिए unnecessary combination नहीं बनाते।
         */

    }


    /*
     * Brand + Product
     */

    if (b && p) {

        list.push(
            b + " " + p
        );

    }


    /*
     * Brand + Main Keyword
     */

    if (b && m) {

        list.push(
            b + " " + m
        );

    }


    /*
     * Category + Product
     */

    if (c && p) {

        list.push(
            c + " " + p
        );

    }


    /*
     * Category + Main Keyword
     */

    if (c && m) {

        list.push(
            c + " " + m
        );

    }


    /*
     * Brand + Category + Product
     */

    if (b && c && p) {

        list.push(
            b + " " + c + " " + p
        );

    }


    /*
     * Brand + Category + Main Keyword
     */

    if (b && c && m) {

        list.push(
            b + " " + c + " " + m
        );

    }


    /*
     * Main Keyword से useful parts
     */

    const words =
        normalizeWords(mainKeyword);


    if (words.length >= 2) {

        list.push(
            capitalizeWords(
                words.join(" ")
            )
        );

    }


    /*
     * Black + T-Shirt जैसे natural
     * combinations निकालना
     */

    if (
        words.length >= 3
    ) {

        for (
            let i = 0;
            i < words.length;
            i++
        ) {

            if (
                words[i] === "tshirt"
            ) {

                const before =
                    words.slice(
                        0,
                        i
                    );


                if (
                    before.length > 0
                ) {

                    list.push(
                        capitalizeWords(
                            before.join(" ")
                        ) +
                        " T-Shirt"
                    );

                }

            }

        }

    }


    return list;

}


/* =========================================
   STRICT FINAL FILTER
========================================= */

function strictFinalFilter(
    keywords,
    product,
    category,
    brand,
    mainKeyword
) {

    const sourceWords = [
        ...normalizeWords(product),
        ...normalizeWords(category),
        ...normalizeWords(brand),
        ...normalizeWords(mainKeyword)
    ];


    const uniqueSourceWords =
        [...new Set(sourceWords)];


    const productWords =
        normalizeWords(product);


    const forbidden = [
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
        "bestseller",
        "guaranteed",
        "guarantee"
    ];


    const brandOnly =
        normalizeKeyword(brand);


    const categoryOnly =
        normalizeKeyword(category);


    const finalList = [];

    const seen = new Set();


    keywords.forEach(function(item) {

        let keyword =
            cleanDisplayKeyword(item);


        if (!keyword) {
            return;
        }


        /*
         * Too long
         */

        if (keyword.length > 100) {
            return;
        }


        /*
         * Remove punctuation
         */

        if (
            keyword.includes("#") ||
            keyword.includes("!") ||
            keyword.includes("?") ||
            keyword.includes(".")
        ) {

            return;

        }


        const normalized =
            normalizeKeyword(keyword);


        /*
         * Duplicate
         */

        if (seen.has(normalized)) {
            return;
        }


        /*
         * Brand alone
         */

        if (
            brandOnly &&
            normalized === brandOnly
        ) {

            return;

        }


        /*
         * Category alone
         */

        if (
            categoryOnly &&
            normalized === categoryOnly
        ) {

            return;

        }


        /*
         * Forbidden words
         */

        const words =
            normalizeWords(keyword);


        for (
            let i = 0;
            i < forbidden.length;
            i++
        ) {

            if (
                words.includes(
                    forbidden[i]
                )
            ) {

                return;

            }

        }


        /*
         * Wrong "Man Clothing"
         */

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


        /*
         * Must contain product-related word
         */

        let related =
            false;


        productWords.forEach(function(word) {

            if (
                words.includes(word)
            ) {

                related = true;

            }

        });


        /*
         * Main keyword words are also valid
         */

        normalizeWords(mainKeyword)
            .forEach(function(word) {

                if (
                    words.includes(word)
                ) {

                    related = true;

                }

            });


        if (!related) {
            return;
        }


        /*
         * Unknown words check
         */

        let hasUnknown =
            false;


        words.forEach(function(word) {

            if (
                !uniqueSourceWords.includes(
                    word
                )
            ) {

                /*
                 * Allow tshirt normalization
                 */

                if (
                    word !== "tshirt"
                ) {

                    hasUnknown = true;

                }

            }

        });


        if (hasUnknown) {
            return;
        }


        seen.add(normalized);

        finalList.push(keyword);

    });


    return finalList;

}


/* =========================================
   MERGE KEYWORDS
========================================= */

function mergeKeywords(
    first,
    second
) {

    const output = [];

    const seen = new Set();


    [...first, ...second]
        .forEach(function(item) {

            const normalized =
                normalizeKeyword(item);


            if (
                !normalized ||
                seen.has(normalized)
            ) {

                return;

            }


            seen.add(normalized);

            output.push(item);

        });


    return output;

}


/* =========================================
   REMOVE DUPLICATES
========================================= */

function removeDuplicateKeywords(
    keywords
) {

    const output = [];

    const seen = new Set();


    keywords.forEach(function(item) {

        const normalized =
            normalizeKeyword(item);


        if (
            !normalized ||
            seen.has(normalized)
        ) {

            return;

        }


        seen.add(normalized);

        output.push(item);

    });


    return output;

}


/* =========================================
   PRIORITIZE MAIN KEYWORD
========================================= */

function prioritizeMainKeyword(
    keywords,
    mainKeyword
) {

    const target =
        normalizeKeyword(mainKeyword);


    const index =
        keywords.findIndex(function(item) {

            return (
                normalizeKeyword(item) ===
                target
            );

        });


    if (
        index > 0
    ) {

        const item =
            keywords.splice(
                index,
                1
            )[0];


        keywords.unshift(item);

    }


    return keywords;

}


/* =========================================
   CLEAN DISPLAY KEYWORD
========================================= */

function cleanDisplayKeyword(
    text
) {

    if (!text) {
        return "";
    }


    return text
        .replace(
            /^\d+[\.\)\-:]\s*/,
            ""
        )
        .replace(
            /^[-•*]\s*/,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================
   NORMALIZE KEYWORD
========================================= */

function normalizeKeyword(
    text
) {

    if (!text) {
        return "";
    }


    return text
        .toLowerCase()
        .replace(
            /['’]/g,
            ""
        )
        .replace(
            /[-_/]/g,
            " "
        )
        .replace(
            /[^a-z0-9\s]/g,
            ""
        )
        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )
        .replace(
            /\bt shirt\b/g,
            "tshirt"
        )
        .replace(
            /\btshirt\b/g,
            "tshirt"
        )
        .replace(
            /\bmens\b/g,
            "men"
        )
        .replace(
            /\bmen s\b/g,
            "men"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================
   NORMALIZE WORDS
========================================= */

function normalizeWords(
    text
) {

    const normalized =
        normalizeKeyword(text);


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
   CAPITALIZE WORDS
========================================= */

function capitalizeWords(
    text
) {

    return text
        .split(" ")
        .map(function(word) {

            if (
                word === "tshirt"
            ) {

                return "T-Shirt";

            }


            if (
                word === "men"
            ) {

                return "Men's";

            }


            return (
                word.charAt(0)
                    .toUpperCase() +
                word.slice(1)
            );

        })
        .join(" ");

}


/* =========================================
   COPY SEO
========================================= */

function copySEO() {

    const text =
        result.value.trim();


    if (
        !text ||
        text.startsWith("❌") ||
        text.startsWith("⏳")
    ) {

        alert(
            "पहले SEO Keywords generate करें।"
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
        document.createElement(
            "textarea"
        );


    textarea.value = text;

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

    } catch(error) {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}
