async function generateTerms() {

    const website =
        document.getElementById("website").value.trim();

    const url =
        document.getElementById("url").value.trim();

    const company =
        document.getElementById("company").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const country =
        document.getElementById("country").value.trim();

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("generateBtn");


    // Basic validation
    if (website === "") {

        alert("Please enter Website Name.");

        return;
    }


    if (url === "") {

        alert("Please enter Website URL.");

        return;
    }


    if (email === "") {

        alert("Please enter Contact Email.");

        return;
    }


    if (country === "") {

        alert("Please enter Country.");

        return;
    }


    button.disabled = true;

    button.innerText =
        "⏳ Generating AI Terms...";

    status.innerText =
        "AI Terms & Conditions बना रहा है...";

    result.value =
        "⏳ Please wait...";


    /*
    ==========================================
    STRICT AI PROMPT
    ==========================================
    */

    const prompt = `

You are a professional website Terms and Conditions
drafting assistant.

Create a clear and simple Terms & Conditions document
using ONLY the information provided below.

WEBSITE INFORMATION:

Website Name:
${website}

Website URL:
${url}

Company Name:
${company || "Not specified"}

Contact Email:
${email}

Country:
${country}


STRICT RULES:

1. Use ONLY the information provided above.

2. Never invent company information.

3. Never invent a physical address.

4. Never invent a phone number.

5. Never invent a registration number.

6. Never invent a GST number.

7. Never invent a license number.

8. Never invent a legal entity.

9. Never invent another brand name.

10. Never mention another company.

11. Never invent payment methods.

12. Never invent refund policies.

13. Never invent shipping policies.

14. Never invent delivery times.

15. Never invent prices.

16. Never invent guarantees.

17. Never invent warranties.

18. Never claim that a lawyer reviewed the document.

19. Never claim that this document guarantees legal compliance.

20. Do not invent specific laws or legal sections.

21. Do not invent court names.

22. Do not invent jurisdiction details
that were not provided.

23. Use the exact Website Name.

24. Use the exact Website URL.

25. Use the exact Company Name if provided.

26. Use the exact Contact Email.

27. Use the exact Country.

28. Keep the language simple and professional.

29. Do not use emojis.

30. Do not add promotional language.

31. Do not make false legal claims.

32. Do not create fake contact information.

33. If information is missing, do not guess it.

34. Use placeholders such as
"Not specified" only when necessary.

35. The document should be a general informational
Terms & Conditions draft, not personalized legal advice.

36. Include these general sections where appropriate:

- Introduction
- Use of Website
- User Responsibilities
- Intellectual Property
- Prohibited Activities
- Website Availability
- Limitation of Liability
- Changes to Terms
- Contact Information

37. Do not create sections that require information
that was not provided.

38. Do not invent specific refund, cancellation,
shipping or payment rules.

39. Do not invent a physical business address.

40. Do not invent an effective date.

OUTPUT:

Write a clean Terms & Conditions document.

Use headings and short paragraphs.

Return ONLY the Terms & Conditions document.

Do not explain your process.

Do not mention AI.

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
                "AI ने Terms & Conditions नहीं बनाए।"
            );

        }


        /*
        ==========================================
        BASIC CLEANING
        ==========================================
        */

        text =
            text.replace(
                /^```[a-zA-Z]*\s*/i,
                ""
            );

        text =
            text.replace(
                /\s*```$/i,
                ""
            );


        /*
        ==========================================
        REMOVE AI META TEXT
        ==========================================
        */

        text =
            text.replace(
                /^Here is.*?:\s*/i,
                ""
            );


        text =
            text.replace(
                /^Sure.*?:\s*/i,
                ""
            );


        /*
        ==========================================
        FINAL OUTPUT
        ==========================================
        */

        result.value =
            text.trim();


        status.innerText =
            "✅ Terms & Conditions successfully generated.";


    }


    catch (error) {

        console.error(
            "Terms Generator Error:",
            error
        );


        result.value =
            "❌ Terms & Conditions generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;


        status.innerText =
            "Please try again.";

    }


    finally {

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Terms & Conditions";

    }

}


/*
==========================================
COPY TERMS
==========================================
*/

async function copyTerms() {

    const result =
        document.getElementById("result");


    const text =
        result.value.trim();


    if (
        !text ||
        text ===
        "Your AI generated Terms & Conditions will appear here..."
    ) {

        alert(
            "पहले Terms & Conditions generate करें."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        alert(
            "✅ Terms & Conditions copied successfully!"
        );


    }


    catch (error) {

        /*
        Fallback copy
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
            "✅ Terms & Conditions copied successfully!"
        );

    }

}
