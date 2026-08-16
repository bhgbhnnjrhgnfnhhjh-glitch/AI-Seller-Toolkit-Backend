/* =========================================
   AI PRODUCT DESCRIPTION GENERATOR
   FINAL VERSION
   Copy Popup Fixed
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const productInput = document.getElementById("product");
const brandInput = document.getElementById("brand");
const categoryInput = document.getElementById("category");
const materialInput = document.getElementById("material");
const audienceInput = document.getElementById("audience");
const colorInput = document.getElementById("color");
const featuresInput = document.getElementById("features");
const extraInput = document.getElementById("extra");
const marketplaceInput = document.getElementById("marketplace");

const result = document.getElementById("result");
const status = document.getElementById("status");
const generateBtn = document.getElementById("generateBtn");
const charCount = document.getElementById("charCount");


/* =========================================
   GENERATE DESCRIPTION
========================================= */

async function generateDescription() {

    const product = productInput.value.trim();
    const brand = brandInput.value.trim();
    const category = categoryInput.value.trim();
    const material = materialInput.value.trim();
    const audience = audienceInput.value.trim();
    const color = colorInput.value.trim();
    const features = featuresInput.value.trim();
    const extra = extraInput.value.trim();
    const marketplace = marketplaceInput.value;

    if (product === "") {

        alert("Please enter Product Name.");

        productInput.focus();

        return;
    }


    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating Description...";

    status.innerText =
        "AI professional product description बना रहा है...";

    result.value =
        "⏳ Please wait...";

    updateCharacterCount();


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
12. NEVER invent comfort claims unless provided.
13. NEVER invent price.
14. NEVER invent discount.
15. NEVER invent delivery information.
16. NEVER invent warranty.
17. NEVER invent return policy.
18. NEVER invent certification.
19. NEVER invent stock availability.
20. NEVER invent customer reviews.
21. NEVER invent another brand.
22. Do not mention brands that were not provided.
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
39. Do not make exaggerated claims.
40. Do not use misleading marketing claims.
41. Avoid unnecessary repetition.

FORMAT:

Product Title

Short Description

Key Features

Product Details

Use only sections supported by the provided information.

Do NOT create empty sections.

Do NOT add explanations outside the description.

Return ONLY the final product description.

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
                "Backend Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data || !data.result) {

            throw new Error(
                "AI ने कोई description नहीं दिया।"
            );

        }


        let text =
            data.result.trim();


        text = strictDescriptionFilter(
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


        if (!text || text.length < 20) {

            throw new Error(
                "AI description बहुत छोटा या invalid है।"
            );

        }


        result.value = text;

        status.innerText =
            "✅ Product description generated successfully.";

        updateCharacterCount();


    } catch (error) {

        console.error(
            "Description Generator Error:",
            error
        );

        result.value =
            "❌ Product description generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

        status.innerText =
            "Please try again.";

        updateCharacterCount();

    }


    finally {

        generateBtn.disabled = false;

        generateBtn.innerText =
            "🤖 Generate AI Description";

    }

}


/* =========================================
   STRICT DESCRIPTION FILTER
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

    let output = text.trim();


    output = output.replace(
        /^```[\w]*\s*/i,
        ""
    );

    output = output.replace(
        /\s*```$/i,
        ""
    );


    const unwantedStarts = [

        "Sure, here is",
        "Sure! Here is",
        "Here is your",
        "Here’s your",
        "Here is the",
        "Below is",
        "Certainly,"

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


    output =
        output.replace(
            /^[\s]*[-•*]\s*$/gm,
            ""
        );


    output =
        output.replace(
            /^#+\s*$/gm,
            ""
        );


    return output.trim();

}


/* =========================================
   COPY DESCRIPTION
   NO SUCCESS ALERT
========================================= */

async function copyDescription() {

    const text =
        result.value.trim();


    if (
        !text ||
        text === "⏳ Please wait..."
    ) {

        showCopyMessage(
            "⚠️ पहले description generate करें।",
            false
        );

        return;

    }


    if (text.startsWith("❌")) {

        showCopyMessage(
            "⚠️ पहले सही description generate करें।",
            false
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

            showCopyMessage(
                "✅ Product Description copied!",
                true
            );

        }

        else {

            fallbackCopy(text);

        }

    }

    catch (error) {

        console.error(
            "Copy Error:",
            error
        );

        fallbackCopy(text);

    }

}


/* =========================================
   COPY FALLBACK
========================================= */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value = text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    textarea.style.top =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        const successful =
            document.execCommand("copy");


        if (successful) {

            showCopyMessage(
                "✅ Product Description copied!",
                true
            );

        }

        else {

            showCopyMessage(
                "❌ Copy नहीं हो सका।",
                false
            );

        }

    }

    catch (error) {

        console.error(
            "Copy Error:",
            error
        );

        showCopyMessage(
            "❌ Copy नहीं हो सका।",
            false
        );

    }


    document.body.removeChild(
        textarea
    );

}


/* =========================================
   SMALL COPY MESSAGE
========================================= */

function showCopyMessage(
    message,
    success
) {

    const oldMessage =
        document.getElementById(
            "descriptionCopyMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const messageBox =
        document.createElement("div");


    messageBox.id =
        "descriptionCopyMessage";


    messageBox.innerText =
        message;


    messageBox.style.position =
        "fixed";

    messageBox.style.left =
        "50%";

    messageBox.style.bottom =
        "25px";

    messageBox.style.transform =
        "translateX(-50%)";

    messageBox.style.padding =
        "12px 20px";

    messageBox.style.borderRadius =
        "8px";

    messageBox.style.fontSize =
        "15px";

    messageBox.style.fontWeight =
        "bold";

    messageBox.style.color =
        "#ffffff";

    messageBox.style.background =
        success
            ? "#16a34a"
            : "#dc2626";

    messageBox.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.25)";

    messageBox.style.zIndex =
        "999999";

    messageBox.style.textAlign =
        "center";


    document.body.appendChild(
        messageBox
    );


    setTimeout(function () {

        if (messageBox) {

            messageBox.remove();

        }

    }, 1800);

}


/* =========================================
   CLEAR DESCRIPTION
========================================= */

function clearDescription() {

    productInput.value = "";
    brandInput.value = "";
    categoryInput.value = "";
    materialInput.value = "";
    audienceInput.value = "";
    colorInput.value = "";
    featuresInput.value = "";
    extraInput.value = "";

    marketplaceInput.value =
        "Amazon";

    result.value = "";

    status.innerText = "";

    updateCharacterCount();

}


/* =========================================
   CHARACTER COUNT
========================================= */

function updateCharacterCount() {

    const length =
        result.value.length;


    charCount.innerText =
        length +
        " characters";

}


/* =========================================
   LIVE CHARACTER COUNT
========================================= */

result.addEventListener(
    "input",
    updateCharacterCount
);


/* =========================================
   ENTER KEY SUPPORT
========================================= */

productInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            generateDescription();

        }

    }
);


/* =========================================
   INITIALIZE
========================================= */

updateCharacterCount();
