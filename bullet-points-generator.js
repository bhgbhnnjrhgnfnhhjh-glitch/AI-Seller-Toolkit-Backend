async function generateBulletPoints() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const audience =
        document.getElementById("audience").value;

    const features =
        document.getElementById("features").value.trim();

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("generateBtn");


    if (product === "") {

        alert("Please enter Product Name.");

        return;

    }


    button.disabled = true;

    button.innerText =
        "⏳ Generating AI Bullet Points...";

    status.innerText =
        "AI bullet points बना रहा है...";

    result.innerText =
        "⏳ Please wait...";


    /*
    ==========================================
    STRICT AI PROMPT
    ==========================================
    */

    const prompt = `

You are a professional eCommerce product listing writer.

Create exactly 5 short product bullet points.

PRODUCT INFORMATION:

Product Name:
${product}

Brand:
${brand || "Not specified"}

Category:
${category || "Not specified"}

Material:
${material || "Not specified"}

Color:
${color || "Not specified"}

Target Audience:
${audience || "Not specified"}

Known Features:
${features || "Not specified"}


VERY STRICT RULES:

1. Use ONLY the information provided above.

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

16. Never add customer experience.

17. Never claim that the product is comfortable
unless comfort was explicitly provided.

18. Never claim that the product is durable
unless durability was explicitly provided.

19. Never claim that the product is premium.

20. Never claim that the product is high quality.

21. Never claim that the product is best.

22. Never claim that the product is amazing.

23. Never claim that the product is perfect.

24. Never mention another brand.

25. Never add Nike, Adidas, Puma, Reebok,
Samsung, Apple or any other brand
unless it was explicitly provided.

26. Keep the exact brand name.

27. Keep the exact product name.

28. Keep the exact material if provided.

29. Keep the exact color if provided.

30. Keep the exact category if provided.

31. Do not unnecessarily repeat the same information.

32. Do not write explanations.

33. Do not write a heading.

34. Do not use emojis.

35. Do not use hashtags.

36. Do not use promotional language.

37. Do not use words such as:
Best, Premium, Amazing, Excellent,
Superior, Luxury, Perfect, Guaranteed.

38. Do not add information just to make
the bullet point longer.

39. If information is missing, simply leave
that information out.

40. Create exactly 5 useful factual bullet points.

OUTPUT FORMAT:

- Product name and brand
- Category
- Material
- Color
- Known features

Return ONLY 5 bullet points.

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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Backend API Error"
            );

        }


        let text =
            String(data.result || "").trim();


        if (!text) {

            throw new Error(
                "AI ने कोई bullet points नहीं बनाए।"
            );

        }


        /*
        ==========================================
        CLEAN AI RESPONSE
        ==========================================
        */

        let lines =
            text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);


        /*
        Remove headings
        */

        lines =
            lines.filter(line => {

                const lower =
                    line.toLowerCase();

                return !(
                    lower === "bullet points" ||
                    lower === "product features" ||
                    lower === "features:" ||
                    lower === "bullet points:"
                );

            });


        /*
        Remove numbering and bullet symbols
        */

        let bullets =
            lines.map(line => {

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

            });


        /*
        Remove empty lines
        */

        bullets =
            bullets.filter(
                bullet => bullet.length > 0
            );


        /*
        Remove duplicates
        */

        bullets =
            [...new Set(bullets)];


        /*
        Maximum 5
        */

        bullets =
            bullets.slice(0, 5);


        /*
        ==========================================
        STRICT LOCAL FILTER
        ==========================================
        */

        const forbiddenPhrases = [

            "best",
            "premium",
            "amazing",
            "excellent",
            "high quality",
            "high-quality",
            "superior",
            "luxury",
            "perfect",
            "guaranteed",
            "guarantee",
            "comfortable",
            "comfort",
            "durable",
            "durability",
            "soft",
            "lightweight",
            "stylish",
            "trendy",
            "fashionable",
            "premium quality",
            "best quality",
            "best seller",
            "bestseller",
            "special offer",
            "limited offer",
            "discount",
            "sale",
            "deal",
            "free delivery",
            "fast delivery",
            "cash on delivery",
            "warranty",
            "certified"

        ];


        /*
        IMPORTANT:
        Some words may actually be provided
        by the user. Therefore we only block
        them if they were NOT provided.
        */

        const providedText = (

            product +
            " " +
            brand +
            " " +
            category +
            " " +
            material +
            " " +
            color +
            " " +
            features

        ).toLowerCase();


        bullets =
            bullets.filter(bullet => {

                const lower =
                    bullet.toLowerCase();

                for (
                    const phrase
                    of forbiddenPhrases
                ) {

                    if (
                        lower.includes(phrase) &&
                        !providedText.includes(phrase)
                    ) {

                        return false;

                    }

                }

                return true;

            });


        /*
        ==========================================
        REMOVE COMMON AI FILLER
        ==========================================
        */

        bullets =
            bullets.filter(bullet => {

                const lower =
                    bullet.toLowerCase();

                if (
                    lower.startsWith(
                        "this product"
                    )
                ) {
                    return false;
                }

                if (
                    lower.startsWith(
                        "this t-shirt"
                    )
                ) {
                    return false;
                }

                if (
                    lower.startsWith(
                        "the product"
                    )
                ) {
                    return false;
                }

                return true;

            });


        /*
        ==========================================
        SAFETY FALLBACK
        ==========================================
        */

        if (bullets.length < 5) {

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
                    category
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


            /*
            Add only unique safe values
            */

            safeBullets.forEach(item => {

                if (
                    !bullets.some(
                        existing =>
                        existing.toLowerCase() ===
                        item.toLowerCase()
                    )
                ) {

                    bullets.push(item);

                }

            });

        }


        /*
        Maximum 5 final points
        */

        bullets =
            [...new Set(bullets)]
            .slice(0, 5);


        /*
        If still fewer than 5,
        do not invent information.
        */

        if (bullets.length < 5) {

            throw new Error(
                "दी गई जानकारी से 5 सुरक्षित bullet points नहीं बनाए जा सके।"
            );

        }


        /*
        ==========================================
        FINAL OUTPUT
        ==========================================
        */

        result.innerText =
            bullets
            .map(
                bullet => "- " + bullet
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

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Bullet Points";

    }

}


/*
==========================================
COPY BULLET POINTS
==========================================
*/

async function copyBulletPoints() {

    const result =
        document.getElementById("result");


    const text =
        result.innerText.trim();


    if (
        !text ||
        text ===
        "Your AI generated bullet points will appear here..."
    ) {

        alert(
            "पहले Bullet Points generate करें."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        alert(
            "✅ Bullet Points copied successfully!"
        );


    }

    catch (error) {

        /*
        Fallback copy
        */

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


        document.execCommand(
            "copy"
        );


        textarea.remove();


        alert(
            "✅ Bullet Points copied successfully!"
        );

    }

        }
