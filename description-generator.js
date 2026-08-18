/* =========================================
   AI PRODUCT DESCRIPTION GENERATOR
   NO-POPUP VERSION
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const productInput =
    document.getElementById("product");

const brandInput =
    document.getElementById("brand");

const categoryInput =
    document.getElementById("category");

const materialInput =
    document.getElementById("material");

const audienceInput =
    document.getElementById("audience");

const colorInput =
    document.getElementById("color");

const featuresInput =
    document.getElementById("features");

const extraInput =
    document.getElementById("extra");

const marketplaceInput =
    document.getElementById("marketplace");

const result =
    document.getElementById("result");

const status =
    document.getElementById("status");

const generateBtn =
    document.getElementById("generateBtn");

const copyBtn =
    document.getElementById("copyBtn");

const clearBtn =
    document.getElementById("clearBtn");


/* =========================================
   STATUS MESSAGE
   NO POPUP
========================================= */

function showStatus(message, type = "normal") {

    status.textContent = message;

    if (type === "success") {

        status.style.color = "#16a34a";

    }

    else if (type === "error") {

        status.style.color = "#dc2626";

    }

    else {

        status.style.color = "#555";

    }

}


/* =========================================
   GENERATE DESCRIPTION
========================================= */

async function generateDescription() {


    const product =
        productInput.value.trim();

    const brand =
        brandInput.value.trim();

    const category =
        categoryInput.value.trim();

    const material =
        materialInput.value.trim();

    const audience =
        audienceInput.value.trim();

    const color =
        colorInput.value.trim();

    const features =
        featuresInput.value.trim();

    const extra =
        extraInput.value.trim();

    const marketplace =
        marketplaceInput.value;


    /* =====================================
       VALIDATION
    ===================================== */

    if (!product) {

        showStatus(
            "Please enter Product Name.",
            "error"
        );

        productInput.focus();

        return;

    }


    /* =====================================
       LOADING
    ===================================== */

    generateBtn.disabled = true;

    generateBtn.textContent =
        "⏳ Generating Description...";

    showStatus(
        "AI professional product description बना रहा है..."
    );

    result.value =
        "⏳ Please wait...";


    /* =====================================
       PROMPT
    ===================================== */

    const prompt = `

You are a professional eCommerce product description writer.

Create ONE clear, natural and professional product description.

PRODUCT INFORMATION:

Product Name:
${product}

Brand:
${brand || "Not specified"}

Category:
${category || "Not specified"}

Material:
${material || "Not specified"}

Target Audience:
${audience || "Not specified"}

Color:
${color || "Not specified"}

Features:
${features || "Not specified"}

Extra Information:
${extra || "Not specified"}

Marketplace:
${marketplace}


STRICT INFORMATION RULES:

1. Use ONLY information provided above.

2. NEVER invent product information.

3. NEVER invent material.

4. NEVER invent color.

5. NEVER invent size.

6. NEVER invent measurements.

7. NEVER invent weight.

8. NEVER invent features.

9. NEVER invent benefits.

10. NEVER invent quality claims.

11. NEVER invent durability claims.

12. NEVER invent comfort claims unless explicitly provided.

13. NEVER invent price.

14. NEVER invent discount.

15. NEVER invent delivery information.

16. NEVER invent warranty.

17. NEVER invent return policy.

18. NEVER invent certification.

19. NEVER invent stock availability.

20. NEVER invent customer reviews.

21. NEVER invent another brand.

22. Do not mention Nike, Adidas, Puma, Apple,
Samsung or any brand that was not provided.

23. Do not add fake specifications.

24. Do not add fake technical information.

25. Do not add information from your own knowledge.

PRODUCT NAME RULES:

26. Keep the exact Product Name.

27. Do not change the product into another product.

28. Do not unnecessarily repeat the Product Name.

BRAND RULES:

29. Keep the exact Brand Name.

30. If Brand is not provided, do not invent a brand.

31. Do not create a fake brand.

WRITING RULES:

32. Write natural English.

33. Keep the description easy to understand.

34. Use professional eCommerce language.

35. Do not use emojis.

36. Do not mention AI.

37. Do not mention these instructions.

38. Do not use fake customer experience.

39. Do not write:
"I bought this product"
"I used this product"
"I loved this product"
unless customer experience was explicitly provided.

40. Do not make exaggerated claims.

41. Do not use misleading marketing claims.

42. Avoid unnecessary repetition.

FORMAT:

Product Title

Short Description

Key Features

Product Details

Use only sections that can be supported
by the provided information.

Do NOT create empty sections.

Do NOT add explanations outside the description.

Return ONLY the final product description.

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
           RESPONSE
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
            typeof data.result !== "string"
        ) {

            throw new Error(
                "AI ने कोई description नहीं दिया।"
            );

        }


        let text =
            data.result.trim();


        /* =================================
           FILTER
        ================================= */

        text =
            strictDescriptionFilter(
                text,
                product,
                brand,
                category,
                material,
                audience,
                color,
                features,
                extra
            );


        if (
            !text ||
            text.length < 20
        ) {

            throw new Error(
                "AI description बहुत छोटा या invalid है।"
            );

        }


        /* =================================
           SHOW RESULT
        ================================= */

        result.value =
            text;


        showStatus(
            "✅ Product description generated successfully.",
            "success"
        );


    }

    catch (error) {


        console.error(
            "Description Generator Error:",
            error
        );


        result.value =
            "";


        showStatus(
            "❌ Description generate नहीं हो सकी: " +
            error.message,
            "error"
        );

    }


    finally {


        generateBtn.disabled =
            false;


        generateBtn.textContent =
            "🤖 Generate AI Description";

    }

}


/* =========================================
   STRICT FILTER
========================================= */

function strictDescriptionFilter(
    text,
    product,
    brand,
    category,
    material,
    audience,
    color,
    features,
    extra
) {


    let output =
        String(text || "").trim();


    /* =====================================
       REMOVE CODE BLOCK
    ===================================== */

    output =
        output.replace(
            /^```(?:text|markdown)?\s*/i,
            ""
        );


    output =
        output.replace(
            /\s*```$/i,
            ""
        );


    /* =====================================
       REMOVE AI INTRO
    ===================================== */

    const unwantedStarts = [

        "Sure, here is",
        "Sure! Here is",
        "Sure, here's",
        "Sure! Here's",
        "Here is your",
        "Here’s your",
        "Here's your",
        "Here is the",
        "Below is",
        "Certainly,",
        "Certainly!"

    ];


    unwantedStarts.forEach(
        function(start) {

            if (
                output
                    .toLowerCase()
                    .startsWith(
                        start.toLowerCase()
                    )
            ) {

                output =
                    output
                        .substring(start.length)
                        .trim();

            }

        }
    );


    /* =====================================
       REMOVE FORBIDDEN CLAIMS
    ===================================== */

    const forbiddenPatterns = [

        /best[-\s]?selling/gi,

        /bestseller/gi,

        /award[-\s]?winning/gi,

        /premium quality/gi,

        /luxury quality/gi,

        /guaranteed quality/gi,

        /100% satisfaction/gi,

        /customer satisfaction/gi,

        /perfect choice/gi,

        /must[-\s]?have/gi,

        /highly recommended/gi,

        /top[-\s]?quality/gi,

        /world[-\s]?class/gi,

        /unbeatable/gi,

        /amazing quality/gi,

        /excellent quality/gi

    ];


    forbiddenPatterns.forEach(
        function(pattern) {

            output =
                output.replace(
                    pattern,
                    ""
                );

        }
    );


    /* =====================================
       REMOVE AI WORDS
    ===================================== */

    output =
        output.replace(
            /\bAI[-\s]?generated\b/gi,
            ""
        );


    output =
        output.replace(
            /\bAI\b/gi,
            ""
        );


    /* =====================================
       CLEAN SPACES
    ===================================== */

    output =
        output.replace(
            /[ \t]+/g,
            " "
        );


    output =
        output.replace(
            /\n{3,}/g,
            "\n\n"
        );


    /* =====================================
       REMOVE EMPTY BULLETS
    ===================================== */

    output =
        output.replace(
            /^[\s]*[-•*]\s*$/gm,
            ""
        );


    /* =====================================
       REMOVE EMPTY HEADINGS
    ===================================== */

    output =
        output.replace(
            /^#+\s*$/gm,
            ""
        );


    return output.trim();

}


/* =========================================
   COPY DESCRIPTION
   NO POPUP
========================================= */

async function copyDescription() {


    const text =
        result.value.trim();


    if (
        !text ||
        text === "⏳ Please wait..."
    ) {

        showStatus(
            "पहले description generate करें।",
            "error"
        );

        return;

    }


    try {


        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

        }

        else {

            fallbackCopy(text);

            return;

        }


        showStatus(
            "✅ Description copied successfully.",
            "success"
        );


    }

    catch (error) {


        fallbackCopy(text);

    }

}


/* =========================================
   FALLBACK COPY
   NO POPUP
========================================= */

function fallbackCopy(text) {


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


    let copied = false;


    try {

        copied =
            document.execCommand(
                "copy"
            );

    }

    catch (error) {

        copied = false;

    }


    textarea.remove();


    if (copied) {

        showStatus(
            "✅ Description copied successfully.",
            "success"
        );

    }

    else {

        showStatus(
            "❌ Copy नहीं हो सका। Text को manually select करके copy करें।",
            "error"
        );

    }

}


/* =========================================
   CLEAR
========================================= */

function clearDescription() {


    productInput.value =
        "";

    brandInput.value =
        "";

    categoryInput.value =
        "";

    materialInput.value =
        "";

    audienceInput.value =
        "Men";

    colorInput.value =
        "";

    featuresInput.value =
        "";

    extraInput.value =
        "";

    marketplaceInput.value =
        "Amazon";

    result.value =
        "";

    showStatus(
        "Form cleared.",
        "normal"
    );

}


/* =========================================
   ENTER KEY
========================================= */

productInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            generateDescription();

        }

    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

generateBtn.addEventListener(
    "click",
    generateDescription
);


copyBtn.addEventListener(
    "click",
    copyDescription
);


clearBtn.addEventListener(
    "click",
    clearDescription
);


/* =========================================
   INITIAL STATUS
========================================= */

showStatus(
    "Description तैयार करने के लिए Product Name भरें।"
);
