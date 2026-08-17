/* =========================================
   AI PRODUCT TITLE GENERATOR
   FINAL FIXED VERSION
========================================= */


/* =========================================
   GENERATE AI TITLES
========================================= */

async function generateTitle() {

    const productInput =
        document.getElementById("product");

    const categoryInput =
        document.getElementById("category");

    const brandInput =
        document.getElementById("brand");

    const keywordInput =
        document.getElementById("keyword");

    const result =
        document.getElementById("result");


    /* =====================================
       CHECK ELEMENTS
    ===================================== */

    if (
        !productInput ||
        !categoryInput ||
        !brandInput ||
        !keywordInput ||
        !result
    ) {

        console.error(
            "Title Generator: Required HTML element not found."
        );

        return;
    }


    /* =====================================
       GET VALUES
    ===================================== */

    const product =
        productInput.value.trim();

    const category =
        categoryInput.value.trim();

    const brand =
        brandInput.value.trim();

    const keyword =
        keywordInput.value.trim();


    /* =====================================
       VALIDATION
    ===================================== */

    if (
        product === "" ||
        category === "" ||
        brand === "" ||
        keyword === ""
    ) {

        alert(
            "कृपया सभी जानकारी भरें।"
        );

        return;
    }


    /* =====================================
       LOADING
    ===================================== */

    result.value =
        "⏳ AI titles बनाए जा रहे हैं...";


    /* =====================================
       AI PROMPT
    ===================================== */

    const prompt = `

You are a professional eCommerce SEO product title generator.

Create exactly 5 different product titles.

PRODUCT INFORMATION:

Product Name:
${product}

Category:
${category}

Brand:
${brand}

Main Keyword:
${keyword}


STRICT RULES:

1. Use ONLY the information provided above.

2. Do NOT invent product information.

3. Do NOT invent material.

4. Do NOT invent size.

5. Do NOT invent measurements.

6. Do NOT invent weight.

7. Do NOT invent features.

8. Do NOT invent specifications.

9. Do NOT invent benefits.

10. Do NOT invent comfort claims.

11. Do NOT invent durability claims.

12. Do NOT invent quality claims.

13. Do NOT invent price.

14. Do NOT invent discount.

15. Do NOT invent offers.

16. Do NOT invent delivery information.

17. Do NOT invent warranty.

18. Do NOT invent certification.

19. Do NOT invent customer reviews.

20. Do NOT invent another brand.

21. Keep the exact product name.

22. Keep the exact brand name.

23. Keep the exact category.

24. Use the main keyword naturally.

25. Do not add information that was not provided.

26. Do not use fake claims.

27. Do not use words such as:
Premium, Best, Amazing, Excellent,
Superior, Luxury, Perfect, Guaranteed,
Comfortable, Breathable, Lightweight,
Durable, Stylish, Trendy,
unless that information was explicitly provided.

28. Do not use unnecessary symbols.

29. Keep titles professional and readable.

30. Each title must be different.

31. Suitable for Amazon, Flipkart, Meesho
and Shopify.

OUTPUT:

Return exactly 5 numbered titles.

Use this format:

1. Title
2. Title
3. Title
4. Title
5. Title

Return ONLY the 5 titles.
Do not write any explanation.
Do not write any introduction.

`;


    /* =====================================
       API REQUEST
    ===================================== */

    try {

        const response =
            await fetch(
                "https://ai-seller-toolkit-backend-1.onrender.com/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        prompt: prompt
                    })
                }
            );


        /* =================================
           SERVER RESPONSE
        ================================= */

        let data = null;

        try {

            data =
                await response.json();

        }

        catch (jsonError) {

            throw new Error(
                "Backend ने सही response नहीं दिया।"
            );

        }


        /* =================================
           ERROR CHECK
        ================================= */

        if (!response.ok) {

            throw new Error(
                data &&
                data.error
                    ? data.error
                    : "Backend Error: " +
                      response.status
            );

        }


        if (
            !data ||
            !data.result
        ) {

            throw new Error(
                "AI ने कोई title नहीं दिया।"
            );

        }


        /* =================================
           CLEAN RESPONSE
        ================================= */

        let text =
            String(data.result)
                .trim();


        /* Remove code blocks */

        text =
            text.replace(
                /^```[\w]*\s*/i,
                ""
            );

        text =
            text.replace(
                /\s*```$/i,
                ""
            );


        /* =================================
           REMOVE COMMON INTRODUCTIONS
        ================================= */

        text =
            text.replace(
                /^Sure[,!\s]+/i,
                ""
            );

        text =
            text.replace(
                /^Here are (the|your) titles[:\s]*/i,
                ""
            );

        text =
            text.replace(
                /^Here is (the|your) titles?[:\s]*/i,
                ""
            );


        /* =================================
           SPLIT TITLES
        ================================= */

        let lines =
            text
                .split(/\r?\n/)
                .map(function(line) {

                    return line.trim();

                })
                .filter(function(line) {

                    return line.length > 0;

                });


        /* =================================
           REMOVE EMPTY / HEADING LINES
        ================================= */

        lines =
            lines.filter(function(line) {

                const lower =
                    line.toLowerCase();

                return !(
                    lower === "titles" ||
                    lower === "product titles" ||
                    lower === "generated titles" ||
                    lower === "ai product titles" ||
                    lower === "titles:"
                );

            });


        /* =================================
           CLEAN NUMBERING
        ================================= */

        let titles =
            lines.map(function(line) {

                return line
                    .replace(
                        /^\s*\d+\s*[\.\):\-]\s*/,
                        ""
                    )
                    .replace(
                        /^\s*[-•*]\s*/,
                        ""
                    )
                    .trim();

            });


        /* =================================
           REMOVE EMPTY TITLES
        ================================= */

        titles =
            titles.filter(function(title) {

                return title.length > 0;

            });


        /* =================================
           REMOVE DUPLICATES
        ================================= */

        const uniqueTitles = [];

        titles.forEach(function(title) {

            const exists =
                uniqueTitles.some(
                    function(existing) {

                        return (
                            existing.toLowerCase() ===
                            title.toLowerCase()
                        );

                    }
                );

            if (!exists) {

                uniqueTitles.push(title);

            }

        });


        titles =
            uniqueTitles.slice(0, 5);


        /* =================================
           SAFETY CHECK
        ================================= */

        if (titles.length < 5) {

            throw new Error(
                "AI ने 5 अलग-अलग titles नहीं दिए। कृपया फिर से Generate करें।"
            );

        }


        /* =================================
           FINAL NUMBERED OUTPUT
        ================================= */

        result.value =
            titles
                .map(function(title, index) {

                    return (
                        (index + 1) +
                        ". " +
                        title
                    );

                })
                .join("\n\n");


    }

    catch (error) {

        console.error(
            "AI Title Generator Error:",
            error
        );


        result.value =
            "❌ Title generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================================
   COPY TITLES
   NO POPUP
   NO ALERT
========================================= */

async function copyTitle() {

    const result =
        document.getElementById("result");


    if (!result) {

        return;

    }


    const text =
        result.value.trim();


    /* =====================================
       EMPTY RESULT CHECK
    ===================================== */

    if (
        text === "" ||
        text ===
        "Your AI generated titles will appear here..." ||
        text ===
        "⏳ AI titles बनाए जा रहे हैं..."
    ) {

        return;

    }


    /* Do not copy an error message */

    if (
        text.startsWith("❌")
    ) {

        return;

    }


    /* =====================================
       MODERN CLIPBOARD
    ===================================== */

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return;

        }

    }

    catch (error) {

        console.log(
            "Clipboard API unavailable."
        );

    }


    /* =====================================
       FALLBACK COPY
    ===================================== */

    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();

    }

    catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }

}


/* =========================================
   ENTER KEY SUPPORT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const productInput =
            document.getElementById("product");


        if (!productInput) {

            return;

        }


        productInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    generateTitle();

                }

            }
        );

    }
);
