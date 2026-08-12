async function generateLogoPrompt() {

    const brand =
        document.getElementById("brand").value.trim();

    const business =
        document.getElementById("business").value.trim();

    const style =
        document.getElementById("style").value;

    const primary =
        document.getElementById("primary").value.trim();

    const secondary =
        document.getElementById("secondary").value.trim();

    const background =
        document.getElementById("background").value;

    const result =
        document.getElementById("result");


    if (brand === "") {

        alert("Please enter Brand Name.");

        return;
    }


    result.value =
        "⏳ AI logo prompt बनाया जा रहा है...";


    const prompt = `
You are a professional logo design prompt writer.

Create ONE detailed professional AI logo-generation prompt.

BRAND INFORMATION
-----------------

Brand Name:
${brand}

Business Type:
${business || "Not specified"}

Logo Style:
${style}

Primary Color:
${primary || "Not specified"}

Secondary Color:
${secondary || "Not specified"}

Background:
${background}


STRICT RULES
------------

1. Use ONLY the information provided.

2. Do NOT invent business information.

3. Do NOT invent brand information.

4. Do NOT add colors that were not supplied.

5. Do NOT add a different logo style.

6. Keep the exact brand name.

7. The brand name must be clearly readable.

8. Create a professional logo design suitable for the specified business.

9. Use clean and balanced composition.

10. Use appropriate typography for the selected logo style.

11. The logo should be scalable and suitable for:
- Website
- Social media
- Packaging
- Business cards
- eCommerce branding

12. Follow the selected background.

13. Include the selected primary and secondary colors
only when they are provided.

14. Do not add fake claims.

15. Do not mention AI.

16. Do not use emojis.

17. Do not provide explanations.

18. Return ONLY the final logo-generation prompt.


LOGO QUALITY
------------

The prompt should describe:

- Logo composition
- Typography
- Brand name placement
- Color usage
- Visual style
- Background
- Clean professional presentation
- Vector-style scalability where appropriate

Avoid unnecessary objects and visual clutter.


OUTPUT
------

Return ONLY ONE final professional logo prompt.
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
                data.details ||
                data.error ||
                "Server error"
            );

        }


        if (
            !data.result ||
            !data.result.trim()
        ) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        result.value =
            cleanLogoPrompt(
                data.result
            );


    } catch (error) {

        console.error(
            "Logo Prompt AI Error:",
            error
        );


        result.value =
            "❌ AI logo prompt नहीं बन सका.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================
   CLEAN AI RESPONSE
========================= */

function cleanLogoPrompt(text) {

    let cleaned =
        text.trim();


    // Remove markdown code fences
    cleaned =
        cleaned.replace(
            /^```[a-zA-Z]*\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /\s*```$/i,
            ""
        );


    return cleaned.trim();

}


/* =========================
   COPY PROMPT
========================= */

function copyPrompt() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले Logo Prompt generate करें।"
        );

        return;
    }


    if (
        text.includes(
            "❌ AI logo prompt नहीं बन सका"
        )
    ) {

        alert(
            "पहले successfully Logo Prompt generate करें।"
        );

        return;
    }


    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ Logo Prompt copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

}
