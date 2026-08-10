async function generateSpecification() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const size =
        document.getElementById("size").value.trim();

    const weight =
        document.getElementById("weight").value.trim();

    const country =
        document.getElementById("country").value.trim();

    const result =
        document.getElementById("result");


    if (product === "") {

        alert("Please enter Product Name.");
        return;

    }


    result.value =
        "⏳ Generating product specification...";


    const prompt = `
You are a professional eCommerce product specification writer.

Create a clear and accurate product specification using ONLY
the information provided below.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Brand:
${brand || "Not specified"}

Material:
${material || "Not specified"}

Color:
${color || "Not specified"}

Size:
${size || "Not specified"}

Weight:
${weight || "Not specified"}

Country of Origin:
${country || "Not specified"}


STRICT ACCURACY RULES
---------------------

1. Use ONLY the information provided above.

2. NEVER invent missing specifications.

3. NEVER guess:
- Material
- Color
- Size
- Weight
- Country of Origin
- Dimensions
- Fit
- Pattern
- Design
- Warranty
- Price
- Package contents
- Product benefits
- Certifications
- Manufacturing details

4. If a field says "Not specified", do NOT create
a value for that field.

5. Keep the exact product name.

6. Do not change the product type.

7. Do not mix information between fields.

Example:

Brand:
Fashion Hud

Material:
100% Cotton

Correct:
Brand: Fashion Hud
Material: 100% Cotton

Incorrect:
Brand: Fashion Hud 100% Cotton

8. Do not make medical, guaranteed, exaggerated
or misleading claims.

9. Do not add marketing language.

10. Do not mention AI.

11. Keep the specification professional and easy to read.

12. Do not repeat the same information.

13. Every specification must match the original input.


OUTPUT FORMAT
-------------

Return ONLY the product specification.

Use exactly this format:

PRODUCT SPECIFICATION

Product Name: [value]

Brand: [value]

Material: [value]

Color: [value]

Size: [value]

Weight: [value]

Country of Origin: [value]

Important:
If a value was not provided, write:

Not specified

Do not add any additional specifications.
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
            cleanSpecification(
                data.result
            );


    } catch (error) {

        console.error(
            "Specification AI Error:",
            error
        );


        result.value =
            "❌ Specification generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================
   CLEAN AI RESPONSE
========================= */

function cleanSpecification(text) {

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
   COPY SPECIFICATION
========================= */

function copySpecification() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले specification generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ Specification generate नहीं हो सकी"
        )
    ) {

        alert(
            "पहले specification successfully generate करें।"
        );

        return;

    }


    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ Specification copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

    }
