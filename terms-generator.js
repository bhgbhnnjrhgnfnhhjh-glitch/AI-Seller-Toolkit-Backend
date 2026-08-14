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


    // ==============================
    // VALIDATION
    // ==============================

    if (!website) {
        alert("Please enter Website Name.");
        return;
    }

    if (!url) {
        alert("Please enter Website URL.");
        return;
    }

    if (!email) {
        alert("Please enter Contact Email.");
        return;
    }

    if (!country) {
        alert("Please enter Country.");
        return;
    }


    // ==============================
    // LOADING
    // ==============================

    button.disabled = true;

    button.innerText =
        "⏳ Generating AI Terms...";

    status.innerText =
        "AI Terms & Conditions बना रहा है...";

    result.value =
        "⏳ Please wait...";


    // ==============================
    // STRICT AI PROMPT
    // ==============================

    const prompt = `

You are a professional website Terms and Conditions
drafting assistant.

Create a simple GENERAL Terms and Conditions draft.

IMPORTANT:
This is an informational template only.
Do not provide legal advice.

USER PROVIDED INFORMATION:

Website Name:
${website}

Website URL:
${url}

Company Name:
${company || "Not provided"}

Contact Email:
${email}

Country:
${country}


VERY STRICT RULES:

1. Use ONLY information explicitly provided above.

2. Never invent any information.

3. Never guess missing information.

4. Never create a physical address.

5. Never create a phone number.

6. Never create a GST number.

7. Never create a registration number.

8. Never create a license number.

9. Never create a tax number.

10. Never create a legal entity type.

11. Never create a company registration detail.

12. Never create a payment method.

13. Never create a refund policy.

14. Never create a cancellation policy.

15. Never create a shipping policy.

16. Never create a delivery promise.

17. Never create a warranty.

18. Never create a guarantee.

19. Never create a price.

20. Never create a discount.

21. Never create an offer.

22. Never create a governing law.

23. Never create a jurisdiction.

24. Never create a court name.

25. Never say that the Terms comply with
any specific country's law.

26. Never say that a lawyer reviewed these Terms.

27. Never claim legal compliance.

28. Never claim legal validity.

29. Never invent intellectual property ownership.

30. Do not say that all website content is owned
by the company unless ownership was explicitly
provided by the user.

31. Do not create a copyright claim.

32. Do not create a trademark claim.

33. Do not create a privacy policy.

34. Do not create a cookie policy.

35. Do not create a data protection policy.

36. Do not create sections that require
information that was not provided.

37. Do not mention another company or brand.

38. Keep the exact Website Name.

39. Keep the exact Website URL.

40. Keep the exact Company Name if provided.

41. Keep the exact Contact Email.

42. Country may be shown only as the
provided business information.

43. Do NOT use Country to automatically
create a governing-law section.

44. Use simple professional English.

45. Do not use emojis.

46. Do not use promotional language.

47. Do not mention AI.

48. Do not include instructions to the user.

49. Do not explain how the document was created.

50. Return only the Terms and Conditions draft.


CREATE ONLY THESE GENERAL SECTIONS:

1. Introduction

2. Use of Website

3. User Responsibilities

4. Prohibited Activities

5. Website Availability

6. Changes to Terms

7. Contact Information


SECTION RULES:

Introduction:
Mention only the Website Name and Website URL.

Use of Website:
State only that users should use the website
lawfully and responsibly.
Do not invent specific laws.

User Responsibilities:
Keep this general.
Do not invent account requirements,
payment requirements, or personal-data rules.

Prohibited Activities:
Mention only general prohibited misuse such as
attempting to damage or disrupt the website.

Website Availability:
State that website availability may change
because of maintenance or technical reasons.
Do not create guarantees.

Changes to Terms:
State that the Terms may be updated.
Do not create a specific effective date.

Contact Information:
Show only:

Company Name: ${company || "Not provided"}

Website Name: ${website}

Website URL: ${url}

Contact Email: ${email}

Country: ${country}


OUTPUT FORMAT:

# Terms and Conditions

## Introduction

[Text]

## Use of Website

[Text]

## User Responsibilities

[Text]

## Prohibited Activities

[Text]

## Website Availability

[Text]

## Changes to Terms

[Text]

## Contact Information

Company Name: ...
Website Name: ...
Website URL: ...
Contact Email: ...
Country: ...

Return ONLY the document.

`;


    try {

        // ==============================
        // BACKEND API
        // ==============================

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
                data.error ||
                "Backend API Error"
            );

        }


        let text =
            String(data.result || "").trim();


        if (!text) {

            throw new Error(
                "AI ने Terms & Conditions नहीं बनाए।"
            );

        }


        // ==============================
        // CLEAN MARKDOWN CODE BLOCK
        // ==============================

        text =
            text.replace(
                /^```(?:markdown|text)?\s*/i,
                ""
            );

        text =
            text.replace(
                /\s*```$/i,
                ""
            );


        // ==============================
        // REMOVE AI INTRODUCTION
        // ==============================

        text =
            text.replace(
                /^Here is.*?:\s*/i,
                ""
            );


        text =
            text.replace(
                /^Sure[,:\s].*?\n/i,
                ""
            );


        // ==============================
        // STRICT LOCAL FILTER
        // ==============================

        const dangerousPatterns = [

            /governing law/gi,

            /jurisdiction/gi,

            /court of/gi,

            /legal compliance/gi,

            /legally compliant/gi,

            /law of india/gi,

            /laws of india/gi,

            /applicable law/gi,

            /applicable laws/gi,

            /registration number/gi,

            /gst number/gi,

            /license number/gi,

            /lawyer reviewed/gi,

            /legal advice/gi

        ];


        /*
        Remove sections that AI should
        never create automatically.
        */

        text =
            text.replace(
                /##\s*Governing Law[\s\S]*?(?=##\s|$)/gi,
                ""
            );


        text =
            text.replace(
                /##\s*Intellectual Property[\s\S]*?(?=##\s|$)/gi,
                ""
            );


        text =
            text.replace(
                /##\s*Limitation of Liability[\s\S]*?(?=##\s|$)/gi,
                ""
            );


        /*
        Remove dangerous individual lines.
        */

        const lines =
            text.split(/\r?\n/);


        const cleanLines =
            lines.filter(line => {

                return !dangerousPatterns.some(
                    pattern => pattern.test(line)
                );

            });


        text =
            cleanLines.join("\n");


        // ==============================
        // NORMALIZE SPACING
        // ==============================

        text =
            text.replace(
                /\n{3,}/g,
                "\n\n"
            );


        text =
            text.trim();


        // ==============================
        // FINAL SAFETY CHECK
        // ==============================

        if (
            /governing law/i.test(text) ||
            /jurisdiction/i.test(text) ||
            /court of/i.test(text) ||
            /laws of india/i.test(text)
        ) {

            throw new Error(
                "AI output में unsupported legal information मिली। कृपया फिर से Generate करें।"
            );

        }


        // ==============================
        // SHOW RESULT
        // ==============================

        result.value =
            text;


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


// ==========================================
// COPY TERMS
// ==========================================

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

        const textarea =
            document.createElement("textarea");


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        alert(
            "✅ Terms & Conditions copied successfully!"
        );

    }

}
