/* =========================================================
   AI SELLER TOOLKIT
   AI BULLET POINTS GENERATOR
   FINAL VERSION
========================================================= */


/* =========================================================
   GENERATE AI BULLET POINTS
========================================================= */

async function generateBulletPoints() {

    const product =
        document.getElementById("product");

    const brand =
        document.getElementById("brand");

    const category =
        document.getElementById("category");

    const material =
        document.getElementById("material");

    const color =
        document.getElementById("color");

    const audience =
        document.getElementById("audience");

    const features =
        document.getElementById("features");

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("generateBtn");


    /* =====================================================
       CHECK ELEMENTS
    ===================================================== */

    if (
        !product ||
        !brand ||
        !category ||
        !material ||
        !color ||
        !audience ||
        !features ||
        !result ||
        !status ||
        !button
    ) {

        console.error(
            "Bullet Points Generator: Required HTML element missing."
        );

        return;
    }


    /* =====================================================
       GET VALUES
    ===================================================== */

    const productValue =
        product.value.trim();

    const brandValue =
        brand.value.trim();

    const categoryValue =
        category.value.trim();

    const materialValue =
        material.value.trim();

    const colorValue =
        color.value.trim();

    const audienceValue =
        audience.value.trim();

    const featuresValue =
        features.value.trim();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (productValue === "") {

        status.innerText =
            "⚠️ Please enter Product Name.";

        product.focus();

        return;
    }


    /* =====================================================
       LOADING
    ===================================================== */

    button.disabled = true;

    button.innerText =
        "⏳ Generating AI Bullet Points...";

    status.innerText =
        "AI bullet points बना रहा है...";

    result.innerText =
        "⏳ Please wait...";


    /* =====================================================
       AI PROMPT
    ===================================================== */

    const prompt = `

You are a professional eCommerce product listing writer.

Create exactly 5 short factual product bullet points.

PRODUCT INFORMATION:

Product Name:
${productValue}

Brand:
${brandValue || "Not specified"}

Category:
${categoryValue || "Not specified"}

Material:
${materialValue || "Not specified"}

Color:
${colorValue || "Not specified"}

Target Audience:
${audienceValue || "Not specified"}

Known Features:
${featuresValue || "Not specified"}


STRICT RULES:

1. Use ONLY information provided above.

2. Never invent information.

3. Never guess missing information.

4. Never add a new feature.

5. Never add a new material.

6. Never add a new color.

7. Never add a new size.

8. Never add a new design.

9. Never add a new specification.

10. Never add price.

11. Never add discount.

12. Never add offer.

13. Never add delivery information.

14. Never add warranty.

15. Never add certification.

16. Never add customer reviews.

17. Never add customer experience.

18. Never claim comfort unless comfort is explicitly provided.

19. Never claim durability unless durability is explicitly provided.

20. Never claim premium quality.

21. Never claim best quality.

22. Never claim amazing quality.

23. Never claim perfect quality.

24. Never claim guaranteed results.

25. Never mention another brand.

26. Never invent a brand.

27. Keep the exact Product Name.

28. Keep the exact Brand Name if provided.

29. Keep the exact Category if provided.

30. Keep the exact Material if provided.

31. Keep the exact Color if provided.

32. Use the Known Features only if provided.

33. Do not use emojis.

34. Do not use hashtags.

35. Do not use promotional language.

36. Do not write explanations.

37. Do not write an introduction.

38. Do not write a heading.

39. Do not repeat the same information unnecessarily.

40. Do not add information from your own knowledge.

OUTPUT:

Return exactly 5 short bullet points.

Use this format:

- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
- Bullet point 5

Return ONLY the 5 bullet points.

`;


    /* =====================================================
       API REQUEST
    ===================================================== */

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


        /* =================================================
           RESPONSE CHECK
        ================================================= */

        if (!response.ok) {

            let errorMessage =
                "Backend API Error";

            try {

                const errorData =
                    await response.json();

                errorMessage =
                    errorData.error ||
                    errorMessage;

            }

            catch (e) {
                // Ignore JSON error
            }


            throw new Error(
                errorMessage
            );
        }


        const data =
            await response.json();


        let text =
            String(
                data.result || ""
            ).trim();


        if (!text) {

            throw new Error(
                "AI ने कोई bullet points नहीं बनाए।"
            );
        }


        /* =================================================
           CLEAN RESPONSE
        ================================================= */

        let lines =
            text
                .split(/\r?\n/)
                .map(
                    line =>
                        line.trim()
                )
                .filter(
                    line =>
                        line.length > 0
                );


        /* =================================================
           REMOVE COMMON HEADINGS
        ================================================= */

        lines =
            lines.filter(
                function(line) {

                    const lower =
                        line
                            .toLowerCase()
                            .replace(
                                /[:\-]/g,
                                ""
                            )
                            .trim();

                    return !(
                        lower === "bullet points" ||
                        lower === "bullet point" ||
                        lower === "product features" ||
                        lower === "features" ||
                        lower === "features list"
                    );

                }
            );


        /* =================================================
           REMOVE BULLET / NUMBER SYMBOLS
        ================================================= */

        let bullets =
            lines.map(
                function(line) {

                    return line
                        .replace(
                            /^[-•*]\s*/,
                            ""
                        )
                        .replace(
                            /^\d+[\.\):\-]\s*/,
                            ""
                        )
                        .trim();

                }
            );


        /* =================================================
           REMOVE EMPTY VALUES
        ================================================= */

        bullets =
            bullets.filter(
                function(bullet) {

                    return (
                        bullet.length > 0
                    );

                }
            );


        /* =================================================
           REMOVE DUPLICATES
        ================================================= */

        bullets =
            [
                ...new Set(
                    bullets.map(
                        bullet =>
                            bullet.trim()
                    )
                )
            ];


        /* =================================================
           FORBIDDEN CLAIMS
        ================================================= */

        const forbiddenPhrases = [

            "best",
            "bestseller",
            "best seller",
            "premium",
            "premium quality",
            "amazing",
            "excellent",
            "excellent quality",
            "superior",
            "luxury",
            "perfect",
            "perfect choice",
            "guaranteed",
            "guarantee",
            "high quality",
            "high-quality",
            "top quality",
            "top-quality",
            "world class",
            "world-class",
            "unbeatable",
            "must have",
            "must-have",
            "highly recommended",
            "comfortable",
            "comfort",
            "durable",
            "durability",
            "soft",
            "lightweight",
            "stylish",
            "trendy",
            "fashionable",
            "special offer",
            "limited offer",
            "discount",
            "sale",
            "deal",
            "free delivery",
            "fast delivery",
            "cash on delivery",
            "warranty",
            "certified",
            "certification",
            "customer satisfaction"
        ];


        /* =================================================
           INFORMATION PROVIDED BY USER
        ================================================= */

        const providedText = (

            productValue +
            " " +
            brandValue +
            " " +
            categoryValue +
            " " +
            materialValue +
            " " +
            colorValue +
            " " +
            audienceValue +
            " " +
            featuresValue

        ).toLowerCase();


        /* =================================================
           FILTER FALSE CLAIMS
        ================================================= */

        bullets =
            bullets.filter(
                function(bullet) {

                    const lower =
                        bullet.toLowerCase();


                    for (
                        const phrase
                        of forbiddenPhrases
                    ) {

                        if (
                            lower.includes(
                                phrase
                            ) &&
                            !providedText.includes(
                                phrase
                            )
                        ) {

                            return false;
                        }

                    }


                    return true;

                }
            );


        /* =================================================
           REMOVE AI FILLER
        ================================================= */

        bullets =
            bullets.filter(
                function(bullet) {

                    const lower =
                        bullet.toLowerCase();


                    const unwantedStarts = [

                        "this product",
                        "the product",
                        "this item",
                        "this product offers",
                        "here is",
                        "here's",
                        "sure",
                        "certainly"

                    ];


                    for (
                        const phrase
                        of unwantedStarts
                    ) {

                        if (
                            lower.startsWith(
                                phrase
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        /* =================================================
           MAXIMUM 5
        ================================================= */

        bullets =
            bullets.slice(0, 5);


        /* =================================================
           SAFE LOCAL FALLBACK
        ================================================= */

        const safeBullets = [];


        if (
            brandValue &&
            productValue
        ) {

            safeBullets.push(
                "Brand: " +
                brandValue +
                " | Product: " +
                productValue
            );

        }

        else if (productValue) {

            safeBullets.push(
                "Product: " +
                productValue
            );

        }


        if (categoryValue) {

            safeBullets.push(
                "Category: " +
                categoryValue
            );

        }


        if (materialValue) {

            safeBullets.push(
                "Material: " +
                materialValue
            );

        }


        if (colorValue) {

            safeBullets.push(
                "Color: " +
                colorValue
            );

        }


        if (audienceValue) {

            safeBullets.push(
                "Target Audience: " +
                audienceValue
            );

        }


        if (featuresValue) {

            safeBullets.push(
                "Features: " +
                featuresValue
            );

        }


        /* =================================================
           ADD SAFE VALUES IF AI RETURNED LESS THAN 5
        ================================================= */

        safeBullets.forEach(
            function(item) {

                if (
                    bullets.length >= 5
                ) {
                    return;
                }


                const exists =
                    bullets.some(
                        function(existing) {

                            return (
                                existing
                                    .toLowerCase() ===
                                item
                                    .toLowerCase()
                            );

                        }
                    );


                if (!exists) {

                    bullets.push(
                        item
                    );

                }

            }
        );


        /* =================================================
           FINAL UNIQUE LIST
        ================================================= */

        bullets =
            [
                ...new Set(
                    bullets
                )
            ].slice(0, 5);


        /* =================================================
           FINAL CHECK
        ================================================= */

        if (
            bullets.length < 5
        ) {

            throw new Error(
                "दी गई जानकारी से 5 सुरक्षित bullet points नहीं बनाए जा सके।"
            );

        }


        /* =================================================
           SHOW RESULT
        ================================================= */

        result.innerText =
            bullets
                .map(
                    bullet =>
                        "- " + bullet
                )
                .join("\n");


        status.innerText =
            "✅ 5 factual AI bullet points generated.";


    }


    catch (error) {

        console.error(
            "Bullet Points Generator Error:",
            error
        );


        result.innerText =
            "❌ Bullet points generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;


        status.innerText =
            "Please try again.";

    }


    finally {

        button.disabled =
            false;

        button.innerText =
            "🤖 Generate AI Bullet Points";

    }

}


/* =========================================================
   COPY BULLET POINTS
   IMPORTANT:
   NO POPUP / NO ALERT
========================================================= */

async function copyBulletPoints() {

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");


    if (
        !result ||
        !status
    ) {

        return;

    }


    const text =
        result.innerText.trim();


    /* =====================================================
       CHECK EMPTY RESULT
    ===================================================== */

    if (
        !text ||
        text ===
        "Your AI generated bullet points will appear here..."
    ) {

        status.innerText =
            "⚠️ पहले Bullet Points generate करें।";

        return;

    }


    /* =====================================================
       CHECK ERROR RESULT
    ===================================================== */

    if (
        text.startsWith("❌")
    ) {

        status.innerText =
            "⚠️ पहले सही Bullet Points generate करें।";

        return;

    }


    /* =====================================================
       CLIPBOARD COPY
    ===================================================== */

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

            fallbackCopyBulletPoints(
                text
            );

            return;

        }


        /* =================================================
           SUCCESS MESSAGE
           NO POPUP
        ================================================= */

        showCopyStatus(
            status,
            "✅ Bullet Points copied successfully!"
        );

    }


    catch (error) {

        console.warn(
            "Clipboard API failed:",
            error
        );


        fallbackCopyBulletPoints(
            text
        );

    }

}


/* =========================================================
   FALLBACK COPY
========================================================= */

function fallbackCopyBulletPoints(
    text
) {

    const status =
        document.getElementById("status");


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

    textarea.setSelectionRange(
        0,
        textarea.value.length
    );


    try {

        const successful =
            document.execCommand(
                "copy"
            );


        if (
            successful
        ) {

            showCopyStatus(
                status,
                "✅ Bullet Points copied successfully!"
            );

        }

        else {

            showCopyStatus(
                status,
                "❌ Copy नहीं हो सका।"
            );

        }

    }

    catch (error) {

        console.error(
            "Fallback Copy Error:",
            error
        );


        showCopyStatus(
            status,
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}


/* =========================================================
   COPY STATUS
   AUTO HIDE AFTER 2.5 SECONDS
========================================================= */

function showCopyStatus(
    status,
    message
) {

    if (!status) {
        return;
    }


    status.innerText =
        message;


    /* Remove old timer */

    if (
        window.bulletCopyTimer
    ) {

        clearTimeout(
            window.bulletCopyTimer
        );

    }


    /* Hide after 2.5 seconds */

    window.bulletCopyTimer =
        setTimeout(
            function() {

                status.innerText =
                    "";

            },
            2500
        );

}


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "✅ AI Bullet Points Generator Ready"
        );

    }
);
