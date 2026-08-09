async function generateListing() {

    const product = document.getElementById("product").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const category = document.getElementById("category").value.trim();
    const material = document.getElementById("material").value.trim();
    const color = document.getElementById("color").value.trim();
    const audience = document.getElementById("audience").value;
    const extra = document.getElementById("extra").value.trim();

    if (product === "" || category === "") {
        alert("कृपया Product Name और Category भरें।");
        return;
    }

    const titleResult = document.getElementById("titleResult");
    const descriptionResult = document.getElementById("descriptionResult");
    const bulletResult = document.getElementById("bulletResult");
    const featureResult = document.getElementById("featureResult");
    const keywordResult = document.getElementById("keywordResult");
    const hashtagResult = document.getElementById("hashtagResult");
    const tagResult = document.getElementById("tagResult");

    titleResult.value = "⏳ Generating...";
    descriptionResult.value = "⏳ Generating...";
    bulletResult.value = "⏳ Generating...";
    featureResult.value = "⏳ Generating...";
    keywordResult.value = "⏳ Generating...";
    hashtagResult.value = "⏳ Generating...";
    tagResult.value = "⏳ Generating...";

    const prompt = `
You are an expert eCommerce product listing specialist.

Create a professional marketplace listing using ONLY the facts supplied by the user.

========================
PRODUCT INFORMATION
========================

Product Name: ${product}
Brand: ${brand || "Not specified"}
Category: ${category}
Material: ${material || "Not specified"}
Color: ${color || "Not specified"}
Target Audience: ${audience}
Extra Information: ${extra || "Not specified"}

========================
CRITICAL ACCURACY RULES
========================

1. NEVER invent product information.

2. NEVER assume specifications.

3. NEVER add benefits that were not supplied.

4. NEVER add:
   - Premium
   - Best
   - Excellent
   - Superior
   - Luxury
   - Durable
   - Long-lasting
   - Soft
   - Comfortable
   - Breathable
   - Lightweight
   - Waterproof
   - Guaranteed
   - High Quality

   unless the user explicitly provided that information.

5. Keep the exact product type.

   Example:
   If Product Name says "T-Shirt", always use "T-Shirt".
   NEVER change "T-Shirt" to "Shirt", "Top", "Tee" or another product type
   unless that exact alternative is part of the supplied product information.

6. Do not create synonyms that can change the actual product type.

7. Do not create unsupported specifications such as:
   size, weight, fit, sleeve type, neck type, pattern, washing instructions,
   warranty, certification, country of origin, package contents, etc.

8. Do not create fake claims.

9. Do not repeat the same sentence or fact unnecessarily.

10. The description must sound natural and professional.

11. SEO keywords must describe the actual product.

12. Do NOT create keywords for a different product.

   Example:
   For "Cotton T-Shirt", do NOT create:
   "cotton shirt"
   "formal shirt"
   "dress shirt"
   unless those exact terms are part of the supplied product information.

13. Do not use keyword stuffing.

14. Do not mention AI or content generation.

15. Do not use emojis inside the generated listing.

========================
SEO PRODUCT TITLE
========================

Create exactly 3 different SEO-friendly product titles.

Rules:
- Keep the exact product type.
- Include brand when available.
- Include material when available.
- Include color when available.
- Include target audience when relevant.
- Do not add unsupported features.
- Titles must sound natural.
- Avoid keyword stuffing.

========================
PRODUCT DESCRIPTION
========================

Write one natural product description of approximately 100-150 words.

Rules:
- Do not repeat the same information again and again.
- Mention the brand, product type, category, material, color and audience naturally.
- Do not invent benefits.
- Do not add unsupported specifications.
- Do not use exaggerated marketing language.
- Keep it suitable for marketplace listings.

========================
BULLET POINTS
========================

Create exactly 5 concise bullet points.

Each bullet must contain a useful factual attribute.

Do not repeat the same fact unnecessarily.

========================
PRODUCT FEATURES
========================

Create exactly 10 product features.

Use actual supplied facts first.

If fewer than 10 independent facts are available, create additional entries only by presenting the same supplied information in a different factual attribute format.

Do NOT invent new features.

Do NOT use fake benefits.

========================
SEO KEYWORDS
========================

Create exactly 20 SEO keywords.

Rules:
- Every keyword must be directly relevant to the exact product.
- Preserve the exact product type.
- Use combinations of supplied brand, product, category, material, color and audience.
- Avoid unrelated product types.
- Avoid keyword stuffing.
- Do not use unsupported claims.

========================
HASHTAGS
========================

Create exactly 10 relevant hashtags.

Only use the supplied product information.

========================
PRODUCT TAGS
========================

Create exactly 15 relevant product tags.

Only use supplied information.

Do not create unrelated product types.

========================
OUTPUT FORMAT
========================

Return ONLY these headings:

SEO PRODUCT TITLE:

PRODUCT DESCRIPTION:

BULLET POINTS:

PRODUCT FEATURES:

SEO KEYWORDS:

HASHTAGS:

PRODUCT TAGS:
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

        const text = data.result || "";

        if (!text.trim()) {
            throw new Error("AI returned an empty response.");
        }

        titleResult.value = extractSection(
            text,
            "SEO PRODUCT TITLE:",
            "PRODUCT DESCRIPTION:"
        );

        descriptionResult.value = extractSection(
            text,
            "PRODUCT DESCRIPTION:",
            "BULLET POINTS:"
        );

        bulletResult.value = extractSection(
            text,
            "BULLET POINTS:",
            "PRODUCT FEATURES:"
        );

        featureResult.value = extractSection(
            text,
            "PRODUCT FEATURES:",
            "SEO KEYWORDS:"
        );

        keywordResult.value = extractSection(
            text,
            "SEO KEYWORDS:",
            "HASHTAGS:"
        );

        hashtagResult.value = extractSection(
            text,
            "HASHTAGS:",
            "PRODUCT TAGS:"
        );

        tagResult.value = extractSection(
            text,
            "PRODUCT TAGS:",
            null
        );

    } catch (error) {

        console.error("Listing AI Error:", error);

        const message =
            "❌ AI listing नहीं बन सकी.\n\n" +
            "Error: " +
            error.message;

        titleResult.value = message;
        descriptionResult.value = message;
        bulletResult.value = message;
        featureResult.value = message;
        keywordResult.value = message;
        hashtagResult.value = message;
        tagResult.value = message;
    }
}


function extractSection(text, startHeading, endHeading) {

    const start = text.indexOf(startHeading);

    if (start === -1) {
        return "";
    }

    const contentStart =
        start + startHeading.length;

    let end;

    if (endHeading) {
        end = text.indexOf(
            endHeading,
            contentStart
        );
    } else {
        end = text.length;
    }

    if (end === -1) {
        end = text.length;
    }

    return text
        .substring(contentStart, end)
        .trim();
}


function copyAll() {

    const title =
        document.getElementById("titleResult").value;

    const description =
        document.getElementById("descriptionResult").value;

    const bullets =
        document.getElementById("bulletResult").value;

    const features =
        document.getElementById("featureResult").value;

    const keywords =
        document.getElementById("keywordResult").value;

    const hashtags =
        document.getElementById("hashtagResult").value;

    const tags =
        document.getElementById("tagResult").value;


    if (title.trim() === "") {
        alert("पहले Complete Listing generate करें।");
        return;
    }


    const completeListing =
`SEO PRODUCT TITLE:
${title}

PRODUCT DESCRIPTION:
${description}

BULLET POINTS:
${bullets}

PRODUCT FEATURES:
${features}

SEO KEYWORDS:
${keywords}

HASHTAGS:
${hashtags}

PRODUCT TAGS:
${tags}`;


    navigator.clipboard
        .writeText(completeListing)

        .then(function () {

            alert(
                "✅ Complete Listing copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });
}


function clearAll() {

    document.getElementById("product").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("category").value = "";
    document.getElementById("material").value = "";
    document.getElementById("color").value = "";
    document.getElementById("extra").value = "";

    document.getElementById("audience").selectedIndex = 0;

    document.getElementById("titleResult").value = "";
    document.getElementById("descriptionResult").value = "";
    document.getElementById("bulletResult").value = "";
    document.getElementById("featureResult").value = "";
    document.getElementById("keywordResult").value = "";
    document.getElementById("hashtagResult").value = "";
    document.getElementById("tagResult").value = "";
}
