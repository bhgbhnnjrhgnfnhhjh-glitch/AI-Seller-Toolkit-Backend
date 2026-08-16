/* =========================================
   AI BULLET POINTS GENERATOR
   FINAL WORKING VERSION
========================================= */

async function generateBulletPoints() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value.trim();
    const material = document.getElementById("material").value.trim();
    const color = document.getElementById("color").value.trim();
    const audience = document.getElementById("audience").value.trim();
    const features = document.getElementById("features").value.trim();

    const result = document.getElementById("result");
    const status = document.getElementById("status");
    const button = document.getElementById("generateBtn");

    /* ==============================
       CHECK ELEMENTS
    ============================== */

    if (!result || !status || !button) {
        alert("Tool में कुछ जरूरी element नहीं मिला।");
        return;
    }

    /* ==============================
       VALIDATION
    ============================== */

    if (product === "") {

        alert("कृपया Product Name भरें।");

        document.getElementById("product").focus();

        return;
    }

    /* ==============================
       LOADING
    ============================== */

    button.disabled = true;

    button.innerText =
        "⏳ Generating...";

    status.innerText =
        "AI bullet points बना रहा है...";

    result.innerText =
        "⏳ Please wait...";

    /* ==============================
       PROMPT
    ============================== */

    const prompt = `
You are a professional eCommerce product listing writer.

Create exactly 5 factual product bullet points.

PRODUCT INFORMATION:

Product Name: ${product}
Brand: ${brand || "Not specified"}
Category: ${category || "Not specified"}
Material: ${material || "Not specified"}
Color: ${color || "Not specified"}
Target Audience: ${audience || "Not specified"}
Known Features: ${features || "Not specified"}

STRICT RULES:

- Use ONLY the information provided above.
- Do not invent any information.
- Do not invent specifications.
- Do not invent size.
- Do not invent weight.
- Do not invent price.
- Do not invent discount.
- Do not invent offers.
- Do not invent warranty.
- Do not invent delivery information.
- Do not invent certifications.
- Do not invent reviews.
- Do not mention another brand.
- Do not use promotional claims.
- Do not use words like Best, Premium, Amazing, Excellent, Perfect or Guaranteed.
- Do not add features that were not provided.
- Keep the exact product name.
- Keep the exact brand name.
- Keep the exact material.
- Keep the exact color.
- Keep the exact category.
- Do not use emojis.
- Do not use hashtags.
- Do not write explanations.
- Do not write a heading.

Create exactly 5 short factual bullet points.

Return ONLY the 5 bullet points.
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
           SERVER CHECK
        ============================== */

        if (!response.ok) {

            throw new Error(
                "Server Error: " + response.status
            );
        }

        const data = await response.json();

        if (!data || !data.result) {

            throw new Error(
                "AI ने कोई result नहीं दिया।"
            );
        }

        let text =
            String(data.result).trim();

        /* ==============================
           CLEAN RESPONSE
        ============================== */

        text = text
            .replace(/```[\s\S]*?```/g, "")
            .replace(/^Bullet Points:?/i, "")
            .trim();

        let bullets = text
            .split(/\r?\n/)
            .map(function(line) {

                return line
                    .replace(/^[-•*]\s*/, "")
                    .replace(/^\d+[\.\):\-]\s*/, "")
                    .trim();

            })
            .filter(function(line) {

                return line.length > 0;

            });

        /* ==============================
           REMOVE DUPLICATES
        ============================== */

        bullets = [...new Set(bullets)];

        /* ==============================
           REMOVE UNSAFE CLAIMS
        ============================== */

        const forbidden = [

            "best",
            "premium",
            "amazing",
            "excellent",
            "perfect",
            "superior",
            "luxury",
            "guaranteed",
            "bestseller",
            "best seller",
            "high quality",
            "high-quality",
            "stylish",
            "trendy",
            "fashionable",
            "durable",
            "durability",
            "comfortable",
            "comfort",
            "discount",
            "offer",
            "sale",
            "free delivery",
            "fast delivery",
            "warranty",
            "certified"

        ];

        const providedText = (

            product + " " +
            brand + " " +
            category + " " +
            material + " " +
            color + " " +
            features

        ).toLowerCase();

        bullets = bullets.filter(function(bullet) {

            const lower =
                bullet.toLowerCase();

            for (const word of forbidden) {

                if (
                    lower.includes(word) &&
                    !providedText.includes(word)
                ) {

                    return false;
                }
            }

            return true;
        });

        /* ==============================
           SAFE FALLBACK
        ============================== */

        const safeBullets = [];

        if (brand && product) {

            safeBullets.push(
                brand + " " + product
            );

        } else if (product) {

            safeBullets.push(
                product
            );
        }

        if (category) {

            safeBullets.push(
                "Category: " + category
            );
        }

        if (material) {

            safeBullets.push(
                "Material: " + material
            );
        }

        if (color) {

            safeBullets.push(
                "Color: " + color
            );
        }

        if (features) {

            safeBullets.push(
                "Features: " + features
            );
        }

        /* ==============================
           ADD SAFE INFORMATION
        ============================== */

        safeBullets.forEach(function(item) {

            if (
                !bullets.some(function(existing) {

                    return existing.toLowerCase() ===
                        item.toLowerCase();

                })
            ) {

                bullets.push(item);
            }

        });

        /* ==============================
           FINAL 5
        ============================== */

        bullets =
            [...new Set(bullets)]
            .slice(0, 5);

        if (bullets.length < 5) {

            throw new Error(
                "दी गई जानकारी से 5 सुरक्षित bullet points नहीं बन सके।"
            );
        }

        /* ==============================
           SHOW RESULT
        ============================== */

        result.innerText =
            bullets
                .map(function(bullet) {

                    return "- " + bullet;

                })
                .join("\n");

        status.innerText =
            "✅ 5 bullet points successfully generated.";

    }

    catch (error) {

        console.error(
            "Bullet Points Error:",
            error
        );

        result.innerText =
            "❌ Bullet Points generate नहीं हो सके।\n\n" +
            "Error: " +
            error.message;

        status.innerText =
            "Please try again.";

    }

    finally {

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Bullet Points";

    }
}


/* =========================================
   COPY BULLET POINTS
========================================= */

async function copyBulletPoints() {

    const result =
        document.getElementById("result");

    if (!result) {

        alert("Result box नहीं मिला।");

        return;
    }

    const text =
        result.innerText.trim();

    if (
        !text ||
        text ===
        "Your AI generated bullet points will appear here..."
    ) {

        alert(
            "पहले Bullet Points Generate करें।"
        );

        return;
    }

    if (text.startsWith("❌")) {

        alert(
            "पहले सही Bullet Points Generate करें।"
        );

        return;
    }

    /* ==============================
       MODERN COPY
    ============================== */

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(text);

            alert(
                "✅ Bullet Points copied successfully!"
            );

            return;
        }

        /* ==============================
           FALLBACK COPY
        ============================== */

        fallbackCopy(text);

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
   FALLBACK COPY
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

    textarea.style.top =
        "0";

    document.body.appendChild(
        textarea
    );

    textarea.focus();

    textarea.select();

    try {

        const success =
            document.execCommand("copy");

        if (success) {

            alert(
                "✅ Bullet Points copied successfully!"
            );

        } else {

            alert(
                "❌ Copy नहीं हो सका।"
            );
        }

    }

    catch (error) {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }

    textarea.remove();
}


/* =========================================
   PAGE LOADED
========================================= */

console.log(
    "✅ Bullet Points Generator Ready"
);
