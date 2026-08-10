async function generateEmail() {

    const emailType =
        document.getElementById("emailType").value.trim();

    const recipient =
        document.getElementById("recipient").value.trim();

    const product =
        document.getElementById("product").value.trim();

    const company =
        document.getElementById("company").value.trim();

    const offer =
        document.getElementById("offer").value.trim();

    const result =
        document.getElementById("result");


    if (product === "") {

        alert("Please enter Product / Subject.");
        return;

    }


    result.value =
        "⏳ Generating professional email...";


    const prompt = `
You are a professional business email writer.

Create one professional email using ONLY the information provided below.

EMAIL INFORMATION
-----------------

Email Type:
${emailType}

Recipient Name:
${recipient || "Not specified"}

Product / Subject:
${product}

Company Name:
${company || "Not specified"}

Special Offer:
${offer || "Not specified"}


STRICT RULES
------------

1. Use ONLY the information provided.

2. Do NOT invent facts.

3. Do NOT invent prices, discounts, product features,
delivery dates, guarantees, policies or company information.

4. If Special Offer is "Not specified", do not create
a discount or promotional offer.

5. If Company Name is "Not specified", do not invent a company name.

6. If Recipient Name is "Not specified", use a professional
generic greeting such as "Dear Customer" or "Hello".

7. Keep the email professional, natural and easy to understand.

8. Keep the email concise.

9. Match the tone to the selected Email Type.

10. Do not mention AI.

11. Do not use emojis.

12. Do not add fake claims.

13. Do not repeat the same information unnecessarily.

14. Do not add a fake phone number, email address,
website URL or physical address.

15. Do not create information that was not supplied.


EMAIL TYPE GUIDELINES
---------------------

Product Promotion:
Create a professional promotional email using only
the supplied product and offer information.

Order Confirmation:
Create a confirmation-style email without inventing
order number, price, shipping date or delivery date.

Customer Support:
Create a helpful support email without inventing
specific solutions or policies.

Thank You:
Create a polite thank-you email related to the supplied product
or subject.

Follow Up:
Create a professional follow-up email related to the supplied subject.


OUTPUT FORMAT
-------------

Return ONLY the email.

Use this structure:

Subject: [Professional subject]

Dear [Recipient or Customer],

[Email body]

Regards,
[Company Name if provided]
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
            cleanEmailOutput(
                data.result
            );


    } catch (error) {

        console.error(
            "Email AI Error:",
            error
        );


        result.value =
            "❌ Email generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================
   CLEAN EMAIL OUTPUT
========================= */

function cleanEmailOutput(text) {

    let cleaned =
        text.trim();


    // Remove accidental markdown code fences
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
   COPY EMAIL
========================= */

function copyEmail() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले email generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ Email generate नहीं हो सकी"
        )
    ) {

        alert(
            "पहले email successfully generate करें।"
        );

        return;

    }


    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ Email copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

        }
