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


    // Product Name जरूरी है
    if (product === "") {

        alert("Please enter Product Name.");

        return;
    }


    // Loading
    button.disabled = true;

    button.innerText =
        "⏳ Generating AI Bullet Points...";

    status.innerText =
        "AI product information तैयार कर रहा है...";

    result.innerText =
        "⏳ Please wait...";


    /*
     * AI Prompt
     *
     * केवल user द्वारा दी गई information
     * का उपयोग करने के लिए strict rules.
     */

    const prompt = `

You are a professional eCommerce product listing writer.

Create exactly 5 short and professional product bullet points.

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
${audience}

Known Features:
${features || "Not specified"}


STRICT RULES:

1. Generate exactly 5 bullet points.

2. Use ONLY the information provided above.

3. Do NOT invent any information.

4. Do NOT invent product specifications.

5. Do NOT invent comfort claims.

6. Do NOT invent durability claims.

7. Do NOT invent quality claims.

8. Do NOT invent performance claims.

9. Do NOT invent size information.

10. Do NOT invent design details.

11. Do NOT invent features that were not provided.

12. Do NOT invent price.

13. Do NOT invent discount.

14. Do NOT invent offers.

15. Do NOT invent delivery information.

16. Do NOT invent warranty information.

17. Do NOT invent certifications.

18. Do NOT invent material information.

19. Do NOT invent color information.

20. Do NOT mention another brand.

21. Do NOT mention Nike, Adidas, Puma, Samsung,
Apple or any other brand unless it is provided by the user.

22. Keep the exact Product Name.

23. Keep the exact Brand Name if provided.

24. Use simple eCommerce language.

25. Keep each bullet point short.

26. Do not use emojis.

27. Do not add explanations.

28. Do not add headings.

29. Do not number the bullet points.

30. Each line must start with "-".

31. Do not create fake customer experiences.

32. Do not use words such as:
Best, Premium, Amazing, Excellent, High Quality,
Guaranteed, Perfect, Luxury, Superior
unless the user explicitly provided them.

33. If information is missing, simply do not mention it.

34. Never guess missing information.

OUTPUT FORMAT:

- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
- Bullet point 5

Return ONLY the 5 bullet points.

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
                data.error || "Server error"
            );

        }


        let text =
            data.result || "";


        /*
         * साफ करें
         */

        text =
            text.replace(/\r/g, "");


        /*
         * केवल lines लें
         */

        let lines =
            text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);


        /*
         * Markdown bullets को साफ करें
         */

        let bullets = [];

        lines.forEach(line => {

            line =
                line.replace(
                    /^[-•*]\s*/,
                    ""
                );

            line =
                line.replace(
                    /^\d+[\.\)]\s*/,
                    ""
                );

            if (line.length > 0) {

                bullets.push(line);

            }

        });


        /*
         * Duplicate हटाएँ
         */

        bullets =
            [...new Set(bullets)];


        /*
         * Maximum 5
         */

        bullets =
            bullets.slice(0, 5);


        /*
         * Strict validation
         */

        const forbiddenWords = [

            "best",
            "premium",
            "amazing",
            "excellent",
            "high quality",
            "guaranteed",
            "perfect",
            "luxury",
            "superior",
            "discount",
            "offer",
            "free delivery",
            "fast delivery",
            "warranty"

        ];


        bullets =
            bullets.filter(bullet => {

                const lower =
                    bullet.toLowerCase();

                return !forbiddenWords.some(
                    word => lower.includes(word)
                );

            });


        /*
         * अगर 5 valid bullets नहीं हैं
         * तो AI को दोबारा call करने के बजाय
         * सुरक्षित तरीके से error दिखाएँ।
         */

        if (bullets.length !== 5) {

            throw new Error(
                "AI ने 5 valid और सुरक्षित bullet points नहीं बनाए। कृपया फिर से Generate करें।"
            );

        }


        /*
         * Final output
         */

        result.innerText =
            bullets
            .map(bullet => "- " + bullet)
            .join("\n");


        status.innerText =
            "✅ 5 safe AI bullet points generated.";


    } catch (error) {

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

    } finally {

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Bullet Points";

    }

}


/*
 * Copy Bullet Points
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
            "पहले AI Bullet Points generate करें."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(text);

        alert(
            "✅ Bullet Points copied successfully!"
        );

    } catch (error) {

        /*
         * Clipboard fallback
         */

        const textarea =
            document.createElement("textarea");

        textarea.value =
            text;

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        alert(
            "✅ Bullet Points copied successfully!"
        );

    }

}
