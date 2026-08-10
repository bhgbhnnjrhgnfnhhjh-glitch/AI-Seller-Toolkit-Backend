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
You are a professional eCommerce FAQ generator.

Create exactly 8 frequently asked questions and answers
for the product using ONLY the information provided below.

PRODUCT INFORMATION:

Product Name: ${product}
Brand: ${brand || "Not specified"}
Material: ${material || "Not specified"}
Suitable For: ${gender || "Not specified"}

STRICT RULES:

1. Use ONLY the information provided by the user.
2. Do NOT invent specifications.
3. Do NOT invent size, weight, warranty, price, delivery time,
   return policy, washing instructions, durability, comfort,
   quality, certifications or other unsupported information.
4. Do NOT make medical or guaranteed claims.
5. Do NOT assume product benefits.
6. Keep the exact product type.
7. If information is not available, do not create an answer for it.
8. Questions and answers should be useful for online shoppers.
9. Keep answers short and clear.
10. Do not mention AI.
11. Do not use emojis.
12. Do not repeat the same question.

Create exactly 8 FAQs.

Use this format:

1. Q: [Question]
   A: [Answer]

2. Q: [Question]
   A: [Answer]

3. Q: [Question]
   A: [Answer]

4. Q: [Question]
   A: [Answer]

5. Q: [Question]
   A: [Answer]

6. Q: [Question]
   A: [Answer]

7. Q: [Question]
   A: [Answer]

8. Q: [Question]
   A: [Answer]
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

        if (!data.result) {
            throw new Error(
                "AI returned an empty response."
            );
        }

        result.value = data.result.trim();

    } catch (error) {

        console.error("FAQ AI Error:", error);

        result.value =
            "❌ FAQ generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;
    }
}


function copyFAQ() {

    const result =
        document.getElementById("result");

    if (result.value.trim() === "") {

        alert("पहले FAQ generate करें।");
        return;
    }

    if (
        result.value.includes(
            "❌ FAQ generate नहीं हो सकी"
        )
    ) {

        alert("पहले FAQ successfully generate करें।");
        return;
    }

    navigator.clipboard
        .writeText(result.value)

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
