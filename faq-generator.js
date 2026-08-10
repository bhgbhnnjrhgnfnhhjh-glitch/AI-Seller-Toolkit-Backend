async function generateFAQ() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const gender =
        document.getElementById("gender").value.trim();


    if (product === "") {

        alert("Please enter Product Name");
        return;

    }


    const result =
        document.getElementById("result");

    result.value =
        "⏳ Generating FAQs...";


    const prompt = `
You are a professional eCommerce FAQ writer.

Create accurate, useful and non-repetitive customer FAQs
using ONLY the product information provided below.

========================
PRODUCT INFORMATION
========================

PRODUCT NAME:
${product}

BRAND:
${brand || "Not specified"}

MATERIAL:
${material || "Not specified"}

SUITABLE FOR:
${gender || "Not specified"}


========================
VERY IMPORTANT DATA RULES
========================

1. NEVER invent information.

2. NEVER assume missing information.

3. NEVER add:
- Color
- Size
- Weight
- Fit
- Pattern
- Sleeve type
- Neck type
- Price
- Discount
- Warranty
- Return policy
- Delivery information
- Washing instructions
- Durability
- Comfort
- Breathability
- Quality
- Certifications
- Package contents

unless explicitly provided.

4. Keep the EXACT product type.

If Product Name is "Cotton T-Shirt",
always call it "Cotton T-Shirt".

Do NOT change it to:
- Shirt
- Top
- Tee
- Polo
- Clothing item

unless that exact wording is part of the supplied product information.


========================
FIELD SEPARATION RULE
========================

THIS RULE IS EXTREMELY IMPORTANT.

Never mix information from different fields.

PRODUCT NAME must contain only product-name information.

BRAND must contain only brand information.

MATERIAL must contain only material information.

SUITABLE FOR must contain only audience information.

Example:

Product Name:
Cotton T-Shirt

Brand:
Fashion Hud

Material:
100% Cotton

Suitable For:
Men


CORRECT:

Q: What is the brand of this Cotton T-Shirt?

A: This Cotton T-Shirt is from the brand Fashion Hud.


CORRECT:

Q: What material is used to make this Cotton T-Shirt?

A: This Cotton T-Shirt is made of 100% Cotton.


CORRECT:

Q: Who is this Cotton T-Shirt suitable for?

A: This Cotton T-Shirt is suitable for men.


INCORRECT:

A: This Cotton T-Shirt is from Fashion Hud 100% Cotton.

Reason:
Brand and Material have been incorrectly combined.


INCORRECT:

A: This Cotton T-Shirt is Fashion Hud Men.

Reason:
Brand and Suitable For have been incorrectly combined.


========================
FAQ QUALITY RULES
========================

1. Create only useful customer questions.

2. Do not repeat the same fact unnecessarily.

3. Do not ask multiple questions that have the same answer.

4. Do not create duplicate FAQs.

5. Quality is more important than quantity.

6. If only 3 unique useful facts are available,
create 3 FAQs.

7. Do NOT create 8 FAQs just to reach a number.

8. Do NOT repeat Brand, Material or Suitable For
just to increase the FAQ count.

9. Keep answers short and natural.

10. Keep answers factual.

11. Do not use marketing claims.

12. Do not mention AI.

13. Do not use emojis.

14. Do not add information that is not supplied.


========================
FAQ SELECTION
========================

Use the available information in this order:

1. Product identity
2. Brand
3. Material
4. Suitable For
5. Any additional information explicitly supplied

Create one useful FAQ per unique fact.

If two facts naturally belong together in one question,
they may be combined only when the question specifically
asks for both facts.

Otherwise keep them separate.


========================
ANSWER VALIDATION
========================

Before returning each FAQ:

1. Check the question against PRODUCT INFORMATION.

2. Check the answer against PRODUCT INFORMATION.

3. Make sure Brand information has not been mixed with Material.

4. Make sure Material information has not been mixed with Brand.

5. Make sure Suitable For information has not been mixed
with Brand or Material.

6. Make sure Product Name remains accurate.

7. Remove any unsupported claim.

8. Remove duplicate questions.

9. Remove duplicate answers.


========================
OUTPUT FORMAT
========================

Return ONLY the FAQs.

Use exactly this format:

1. Q: [Question]
   A: [Answer]

2. Q: [Question]
   A: [Answer]

3. Q: [Question]
   A: [Answer]

Continue only when another unique and useful FAQ
can be created from the supplied information.

Do NOT add:
- Introduction
- Conclusion
- Extra headings
- Notes
- Explanations
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
            cleanFAQOutput(
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


/* =================================
   CLEAN AI RESPONSE
================================= */

function cleanFAQOutput(text) {

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


    // Remove unwanted heading
    cleaned =
        cleaned.replace(
            /^#+\s*(FAQs?|Frequently Asked Questions)\s*:?\s*/i,
            ""
        );


    return cleaned.trim();

}


/* =================================
   COPY FAQ
================================= */

function copyFAQ() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


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
