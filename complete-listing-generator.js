async function generateListing() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const audience =
        document.getElementById("audience").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const features =
        document.getElementById("features").value.trim();

    const marketplace =
        document.getElementById("marketplace").value;

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
        "⏳ Generating Listing...";

    status.innerText =
        "⏳ AI complete product listing बना रहा है...";

    result.value = "";


    const prompt = `

You are a professional eCommerce product listing writer.

Create a complete product listing using ONLY the information provided below.

PRODUCT INFORMATION

Product Name:
${product}

Brand:
${brand || "Not provided"}

Category:
${category || "Not provided"}

Material:
${material || "Not provided"}

Target Audience:
${audience || "Not provided"}

Color:
${color || "Not provided"}

Extra Features:
${features || "Not provided"}

Marketplace:
${marketplace}


VERY IMPORTANT STRICT RULES:

1. Use ONLY the information provided above.

2. Do NOT invent any information.

3. Do NOT invent product specifications.

4. Do NOT invent size.

5. Do NOT invent weight.

6. Do NOT invent dimensions.

7. Do NOT invent price.

8. Do NOT invent discount.

9. Do NOT invent offers.

10. Do NOT invent delivery information.

11. Do NOT invent warranty.

12. Do NOT invent return information.

13. Do NOT invent manufacturer information.

14. Do NOT change the brand name.

15. Do NOT add another brand.

16. Do NOT claim that the brand is the manufacturer unless explicitly provided.

17. Do NOT use unsupported words such as:
Premium, Best, Amazing, High Quality, Superior, Luxury, Guaranteed.

18. Do NOT make health or performance claims.

19. Do NOT claim comfort, durability or quality unless explicitly provided.

20. Do NOT create fake customer experience.

21. Do NOT create fake reviews.

22. Do NOT repeat the same keyword unnecessarily.

23. Keep the exact Product Name.

24. Keep the exact Brand Name.

25. Keep the exact Material.

26. Keep the exact Color.

27. Keep the exact Target Audience.

28. If information is missing, simply do not include that information.

29. The listing must be factual and easy to understand.

30. Do not mention AI.

31. Do not explain these rules.

32. Return ONLY the requested product listing.


OUTPUT FORMAT:

SEO PRODUCT TITLES:

1. [Title]
2. [Title]
3. [Title]


PRODUCT DESCRIPTION:

[Write a factual description using only provided information.]


BULLET POINTS:

1. [Fact]
2. [Fact]
3. [Fact]
4. [Fact]
5. [Fact]


PRODUCT FEATURES:

1. [Feature]
2. [Feature]
3. [Feature]
4. [Feature]
5. [Feature]


SEO KEYWORDS:

1. [Keyword]
2. [Keyword]
3. [Keyword]
4. [Keyword]
5. [Keyword]
6. [Keyword]
7. [Keyword]
8. [Keyword]
9. [Keyword]
10. [Keyword]


HASHTAGS:

1. #[Hashtag]
2. #[Hashtag]
3. #[Hashtag]
4. #[Hashtag]
5. #[Hashtag]


PRODUCT TAGS:

1. [Tag]
2. [Tag]
3. [Tag]
4. [Tag]
5. [Tag]
6. [Tag]
7. [Tag]
8. [Tag]
9. [Tag]
10. [Tag]

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
                "Server Error: " + response.status
            );

        }


        const data =
            await response.json();


        // Backend से answer लेना
        let answer =
            data.response ||
            data.text ||
            data.result ||
            data.output;


        if (!answer) {

            throw new Error(
                "AI response नहीं मिला।"
            );

        }


        // Result दिखाएँ
        result.value =
            answer.trim();


        status.innerText =
            "✅ Complete Product Listing successfully generated.";


    } catch (error) {

        console.error(
            "Complete Listing Error:",
            error
        );


        result.value =
            "❌ Listing generate नहीं हो सकी.\n\n" +
            "कृपया कुछ देर बाद फिर कोशिश करें।";


        status.innerText =
            "❌ Error: Backend API से response नहीं मिला.";


    } finally {

        button.disabled = false;

        button.innerText =
            "🚀 Generate Complete Listing";

    }

}


// Copy Complete Listing
async function copyListing() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले Complete Product Listing generate करें।"
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(text);

        alert(
            "✅ Complete Product Listing copied!"
        );

    } catch (error) {

        // पुराने browser के लिए fallback
        result.select();

        document.execCommand("copy");

        alert(
            "✅ Complete Product Listing copied!"
        );

    }

}
