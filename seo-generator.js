/* =========================================
   AI SEO KEYWORD GENERATOR
   FINAL VERSION
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const generateBtn =
    document.getElementById("generateBtn");

const copyBtn =
    document.getElementById("copyBtn");

const result =
    document.getElementById("result");

const status =
    document.getElementById("status");


/* =========================================
   GENERATE BUTTON
========================================= */

generateBtn.addEventListener(
    "click",
    generateSEO
);


/* =========================================
   COPY BUTTON
========================================= */

copyBtn.addEventListener(
    "click",
    copySEO
);


/* =========================================
   GENERATE SEO
========================================= */

async function generateSEO(){

    const product =
        document
        .getElementById("product")
        .value
        .trim();


    const category =
        document
        .getElementById("category")
        .value
        .trim();


    const brand =
        document
        .getElementById("brand")
        .value
        .trim();


    const keyword =
        document
        .getElementById("keyword")
        .value
        .trim();


    const marketplace =
        document
        .getElementById("marketplace")
        .value;


    /* =====================================
       VALIDATION
    ===================================== */

    if(product === ""){

        alert(
            "Please enter Product Name."
        );

        return;

    }


    if(keyword === ""){

        alert(
            "Please enter Main Keyword."
        );

        return;

    }


    /* =====================================
       LOADING
    ===================================== */

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    status.innerText =
        "AI keywords बना रहा है...";


    result.value =
        "⏳ Please wait...";


    /* =====================================
       AI PROMPT
    ===================================== */

    const prompt = `

You are a professional eCommerce SEO keyword specialist.

Create relevant SEO keywords using ONLY the information provided.

PRODUCT:
${product}

CATEGORY:
${category || "Not specified"}

BRAND:
${brand || "Not specified"}

MAIN KEYWORD:
${keyword}

MARKETPLACE:
${marketplace}


STRICT RULES:

1. Generate maximum 20 keywords.

2. Do not force 20 keywords.

3. Return only valid keywords.

4. Every keyword must be relevant to the product.

5. Use only information provided by the user.

6. Never invent another brand.

7. Never invent another product.

8. Never invent color.

9. Never invent material.

10. Never invent size.

11. Never invent features.

12. Never invent benefits.

13. Never invent price.

14. Never invent offers.

15. Never invent quality claims.

16. Do not use unrelated keywords.

17. Do not use:

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

18. Do not return the brand alone.

For example:

Fashion Hud

is NOT allowed.

19. Do not return the category alone.

For example:

Men's Clothing

is NOT allowed.

20. Do not change:

Men's Clothing

to:

Man Clothing
Men Clothing
Male Clothing

21. Keep the original meaning of the product.

22. T-Shirt, Tshirt and T Shirt
should be treated as the same keyword.

23. Do not duplicate keywords.

24. Do not number the keywords.

25. Return one keyword per line.

26. Return keywords only.

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
Buy Black Cotton T-Shirt
Black Cotton T-Shirt Online
Best Black Cotton T-Shirt

`;


    /* =====================================
       API CALL
    ===================================== */

    try{

        const response =
            await fetch(
                "https://ai-seller-toolkit-backend-1.onrender.com/generate",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({
                        prompt:prompt
                    })
                }
            );


        /* =================================
           SERVER RESPONSE
        ================================= */

        if(!response.ok){

            throw new Error(
                "Backend Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if(
            !data ||
            !data.result
        ){

            throw new Error(
                "AI ने कोई result नहीं दिया।"
            );

        }


        /* =================================
           FILTER KEYWORDS
        ================================= */

        const keywords =
            filterKeywords(
                data.result,
                product,
                category,
                brand
            );


        if(
            keywords.length === 0
        ){

            throw new Error(
                "कोई valid SEO keyword नहीं मिला।"
            );

        }


        /* =================================
           SHOW RESULT
        ================================= */

        result.value =
            keywords
            .map(
                function(item,index){

                    return (
                        (index + 1) +
                        ". " +
                        item
                    );

                }
            )
            .join("\n");


        status.innerText =
            "✅ " +
            keywords.length +
            " valid SEO keywords generated.";


    }

    catch(error){

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


    finally{

        generateBtn.disabled =
            false;


        generateBtn.innerText =
            "🤖 Generate SEO Keywords";

    }

}


/* =========================================
   FILTER KEYWORDS
========================================= */

function filterKeywords(
    text,
    product,
    category,
    brand
){

    const allowedText = (
        product +
        " " +
        category +
        " " +
        brand
    )
    .toLowerCase();


    const allowedWords =
        normalizeWords(
            allowedText
        );


    const productWords =
        normalizeWords(
            product
        );


    const brandNormalized =
        normalizePhrase(
            brand
        );


    const categoryNormalized =
        normalizePhrase(
            category
        );


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
        "bestseller"

    ];


    const lines =
        text.split(/\r?\n/);


    const finalKeywords = [];

    const seen =
        new Set();


    lines.forEach(
        function(line){

            let keyword =
                line.trim();


            /* Remove numbering */

            keyword =
                keyword.replace(
                    /^\d+[\.\)\-:]\s*/,
                    ""
                );


            /* Remove bullets */

            keyword =
                keyword.replace(
                    /^[-•*]\s*/,
                    ""
                );


            keyword =
                keyword.trim();


            if(
                keyword === ""
            ){

                return;

            }


            /* Length */

            if(
                keyword.length < 3 ||
                keyword.length > 100
            ){

                return;

            }


            /* Hashtag */

            if(
                keyword.includes("#")
            ){

                return;

            }


            /* Sentence */

            if(
                keyword.includes(".") ||
                keyword.includes("!") ||
                keyword.includes("?")
            ){

                return;

            }


            const normalized =
                normalizePhrase(
                    keyword
                );


            /* Duplicate */

            if(
                seen.has(normalized)
            ){

                return;

            }


            /* Brand alone */

            if(
                brandNormalized &&
                normalized ===
                brandNormalized
            ){

                return;

            }


            /* Category alone */

            if(
                categoryNormalized &&
                normalized ===
                categoryNormalized
            ){

                return;

            }


            /* Forbidden words */

            const words =
                normalizeWords(
                    keyword
                );


            let forbiddenFound =
                false;


            forbidden.forEach(
                function(word){

                    if(
                        words.includes(word)
                    ){

                        forbiddenFound =
                            true;

                    }

                }
            );


            if(
                forbiddenFound
            ){

                return;

            }


            /* Wrong gender */

            if(
                normalized.includes(
                    "man clothing"
                )
            ){

                return;

            }


            if(
                normalized.includes(
                    "men clothing"
                )
            ){

                return;

            }


            if(
                normalized.includes(
                    "male clothing"
                )
            ){

                return;

            }


            /* Must contain product word */

            let related =
                false;


            productWords.forEach(
                function(word){

                    if(
                        words.includes(word)
                    ){

                        related =
                            true;

                    }

                }
            );


            if(
                !related
            ){

                return;

            }


            /* Check unknown words */

            let invalidWord =
                false;


            words.forEach(
                function(word){

                    if(
                        !allowedWords.includes(
                            word
                        )
                    ){

                        invalidWord =
                            true;

                    }

                }
            );


            if(
                invalidWord
            ){

                return;

            }


            seen.add(
                normalized
            );


            finalKeywords.push(
                keyword
            );

        }
    );


    return finalKeywords.slice(
        0,
        20
    );

}


/* =========================================
   NORMALIZE WORDS
========================================= */

function normalizeWords(text){

    return normalizePhrase(text)
        .split(" ")
        .filter(
            function(word){

                return word !== "";

            }
        );

}


/* =========================================
   NORMALIZE PHRASE
========================================= */

function normalizePhrase(text){

    if(!text){

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

        /* T-Shirt */

        .replace(
            /\bt\s*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        /* Men's */

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
   COPY SEO
========================================= */

function copySEO(){

    const text =
        result.value.trim();


    if(
        !text ||
        text.startsWith("❌") ||
        text.startsWith("⏳")
    ){

        alert(
            "पहले SEO Keywords generate करें।"
        );

        return;

    }


    if(
        navigator.clipboard &&
        navigator.clipboard.writeText
    ){

        navigator.clipboard
        .writeText(text)

        .then(
            function(){

                alert(
                    "✅ SEO Keywords copied successfully!"
                );

            }
        )

        .catch(
            function(){

                fallbackCopy(
                    text
                );

            }
        );

    }

    else{

        fallbackCopy(
            text
        );

    }

}


/* =========================================
   COPY FALLBACK
========================================= */

function fallbackCopy(text){

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try{

        document.execCommand(
            "copy"
        );


        alert(
            "✅ SEO Keywords copied successfully!"
        );

    }

    catch(error){

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}
