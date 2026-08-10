async function generateFAQ() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const material = document.getElementById("material").value.trim();
    const gender = document.getElementById("gender").value.trim();

    if (product === "") {
        alert("Please enter Product Name");
        return;
    }

    const result = document.getElementById("result");

    result.value = "⏳ Generating FAQs...";

    const prompt = `
You are a professional eCommerce FAQ specialist.

Create useful customer FAQs for the product using ONLY the information provided below.

PRODUCT INFORMATION
-------------------
Product Name: ${product}
Brand: ${brand || "Not specified"}
Material: ${material || "Not specified"}
Suitable For: ${gender || "Not specified"}

STRICT ACCURACY RULES
---------------------

1. Use ONLY information explicitly provided above.

2. NEVER invent product specifications.

3. NEVER assume:
- Size
- Color
- Weight
- Fit
- Sleeve type
- Neck type
- Pattern
- Design
- Price
- Discount
- Warranty
- Return policy
- Delivery time
- Washing instructions
- Durability
- Comfort
- Breathability
- Quality
- Certifications
- Package contents
- Country of origin

unless that information is explicitly provided.

4. NEVER change the product type.

For example:
If the product is "Cotton T-Shirt", always call it "Cotton T-Shirt".
Do NOT change it to "shirt", "top", "tee", "apparel" or another product type.

5. Do not make medical, guaranteed, exaggerated or misleading claims.

6. Do not repeat the same fact in multiple questions.

7. Do not create multiple questions that have essentially the same answer.

8. Questions must be genuinely useful to a customer.

9. If there is not enough information to create another unique FAQ, create FEWER FAQs.

10. Quality is more important than quantity.

11. NEVER invent information just to reach a fixed number of FAQs.

12. Do not mention AI or this prompt.

13. Keep answers short, clear and professional.

14. Do not use emojis.

15. Use natural customer-friendly English.

FAQ PRIORITY
------------

Prioritize available information in this order:

1. Product identity
2. Brand
3. Material
4. Suitable audience
5. Other explicitly provided product information

Only create questions for information that actually exists.

IMPORTANT:
If only 4 unique facts are available, create approximately 4 useful FAQs instead of repeating those facts to reach 8.

OUTPUT FORMAT
-------------

Return ONLY the FAQs.

Use this exact format:

1. Q: [Question]
   A: [Answer]

2. Q: [Question]
   A: [Answer]

3. Q: [Question]
   A: [Answer]

Continue only while there are useful, non-repetitive FAQs.

Do not add an introduction.
Do not add a conclusion.
Do not add extra headings.
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

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Server error"
            );
        }

        if (!data.result || !data.result.trim()) {

            throw new Error(
                "AI returned an empty response."
            );
        }

        result.value = cleanFAQOutput(
            data.result
        );

    } catch (error) {

        console.error(
            "FAQ AI Error:",
            error
        );

        result.value =
            "❌ FAQ generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;
    }
}


/* =========================
   CLEAN FAQ OUTPUT
========================= */

function cleanFAQOutput(text) {

    let cleaned = text.trim();

    // Remove accidental markdown headings
    cleaned = cleaned.replace(
        /^#+\s*(FAQs?|Frequently Asked Questions)\s*:?\s*/i,
        ""
    );

    // Remove accidental code fences
    cleaned = cleaned.replace(
        /^```[a-zA-Z]*\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /\s*```$/i,
        ""
    );

    return cleaned.trim();
}


/* =========================
   COPY FAQ
========================= */

function copyFAQ() {

    const result =
        document.getElementById("result");

    const text = result.value.trim();

    if (text === "") {

        alert(
            "पहले FAQ generate करें।"
        );

        return;
    }

    if (
        text.includes(
            "❌ FAQ generate नहीं हो सकी"
        )
    ) {

        alert(
            "पहले FAQ successfully generate करें।"
        );

        return;
    }

    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ FAQ copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });
        }
