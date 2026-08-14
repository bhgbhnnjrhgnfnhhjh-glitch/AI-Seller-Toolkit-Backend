async function generatePrivacyPolicy() {

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
        "⏳ Generating Privacy Policy...";

    status.innerText =
        "AI Privacy Policy बना रहा है...";

    result.value =
        "⏳ Please wait...";


    // ==============================
    // STRICT AI PROMPT
    // ==============================

    const prompt = `

Create a SIMPLE GENERAL Privacy Policy draft.

This is an informational template only.
It is NOT legal advice.

IMPORTANT:

Use ONLY information explicitly provided below.

WEBSITE INFORMATION:

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

1. Never invent information.

2. Never guess information.

3. Never assume what personal data the website collects.

4. Never say that the website collects names,
emails, phone numbers, addresses, IP addresses,
device information, cookies, or any other data
unless the user explicitly provided that information.

5. Never invent cookies.

6. Never invent Google Analytics.

7. Never invent advertising services.

8. Never invent payment services.

9. Never invent social media integrations.

10. Never invent third-party services.

11. Never invent data retention periods.

12. Never invent security systems.

13. Never claim that data is encrypted.

14. Never claim that the website is secure.

15. Never invent data sharing practices.

16. Never invent international data transfers.

17. Never invent children's data practices.

18. Never invent privacy rights.

19. Never mention GDPR.

20. Never mention CCPA.

21. Never mention any specific privacy law.

22. Never claim legal compliance.

23. Never claim legal validity.

24. Never claim that a lawyer reviewed this policy.

25. Never create a physical address.

26. Never create a phone number.

27. Never create a GST number.

28. Never create a registration number.

29. Never create a license number.

30. Never create a fake effective date.

31. Never create another company or brand name.

32. Never create a governing law.

33. Never create a jurisdiction.

34. Never create a court name.

35. Never create a legal section that was not requested.

36. Never create a Privacy Officer unless provided.

37. Never create a Data Protection Officer unless provided.

38. Never create a security officer unless provided.

39. Country is only general contact/business information.
Do not use Country to create a legal statement.

40. Keep the exact Website Name.

41. Keep the exact Website URL.

42. Keep the exact Company Name if provided.

43. Keep the exact Contact Email.

44. Keep the exact Country.

45. Use simple professional English.

46. Do not use emojis.

47. Do not use promotional language.

48. Do not mention AI.

49. Do not add notes for the website owner.

50. Do not add placeholders such as
[Insert date] or [Add information].

51. Do not tell the user to customize individual sections.

52. Return only the Privacy Policy document.


CREATE ONLY THESE SECTIONS:

1. Introduction

2. Information We Collect

3. How We Use Information

4. Cookies and Similar Technologies

5. Third-Party Services

6. Data Security

7. Data Retention

8. Changes to This Privacy Policy

9. Contact Us


SECTION RULES:

Introduction:
Mention only Website Name and Website URL.

Information We Collect:
Because no data collection information was provided,
state clearly that this template does not specify
particular categories of personal information collected.

Do not invent any data categories.

How We Use Information:
State only that actual uses depend on the website's
real services and practices.

Do not invent purposes.

Cookies and Similar Technologies:
State only that this policy does not confirm whether
cookies or similar technologies are used.

Do not claim that cookies are used.

Third-Party Services:
State only that no specific third-party services
are identified in the provided information.

Do not name any service.

Data Security:
Do not claim specific security measures.
State only that actual security practices depend
on the website's real implementation.

Data Retention:
Do not create a retention period.
State only that actual retention depends on
the website's real practices.

Changes to This Privacy Policy:
State that this Privacy Policy may be updated
from time to time.

Do not create an effective date.

Contact Us:
Show exactly:

Company Name: ${company || "Not provided"}

Website Name: ${website}

Website URL: ${url}

Contact Email: ${email}

Country: ${country}


OUTPUT:

# Privacy Policy

## Introduction

## Information We Collect

## How We Use Information

## Cookies and Similar Technologies

## Third-Party Services

## Data Security

## Data Retention

## Changes to This Privacy Policy

## Contact Us

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
                data.error || "Backend API Error"
            );

        }


        let text =
            String(data.result || "").trim();


        if (!text) {

            throw new Error(
                "AI ने Privacy Policy नहीं बनाई।"
            );

        }


        // ==============================
        // REMOVE CODE BLOCKS
        // ==============================

        text = text.replace(
            /^```(?:markdown|text)?\s*/i,
            ""
        );

        text = text.replace(
            /\s*```$/i,
            ""
        );


        // ==============================
        // REMOVE AI INTRO
        // ==============================

        text = text.replace(
            /^Here is.*?:\s*/i,
            ""
        );

        text = text.replace(
            /^Sure[,:\s].*?\n/i,
            ""
        );


        // ==============================
        // REMOVE FORBIDDEN SECTIONS
        // ==============================

        const forbiddenSections = [

            "Effective Date",
            "Children's Privacy",
            "International Data Transfers",
            "User Privacy Rights",
            "Governing Law",
            "Jurisdiction",
            "Limitation of Liability",
            "Intellectual Property",
            "Legal Disclaimer",
            "Privacy Officer",
            "Data Protection Officer"

        ];


        for (const section of forbiddenSections) {

            const escaped =
                section.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            const regex =
                new RegExp(
                    "##\\s*" +
                    escaped +
                    "[\\s\\S]*?(?=##\\s|$)",
                    "gi"
                );

            text =
                text.replace(regex, "");

        }


        // ==============================
        // REMOVE DANGEROUS LINES
        // ==============================

        const forbiddenPatterns = [

            /effective date/gi,

            /gdpr/gi,

            /ccpa/gi,

            /governing law/gi,

            /jurisdiction/gi,

            /laws of india/gi,

            /indian law/gi,

            /applicable law/gi,

            /legal compliance/gi,

            /legal validity/gi,

            /lawyer reviewed/gi,

            /privacy officer/gi,

            /data protection officer/gi,

            /registration number/gi,

            /gst number/gi,

            /license number/gi,

            /physical address/gi,

            /phone number/gi,

            /google analytics/gi

        ];


        const cleanLines =
            text
                .split(/\r?\n/)
                .filter(line => {

                    return !forbiddenPatterns.some(
                        pattern =>
                            pattern.test(line)
                    );

                });


        text =
            cleanLines.join("\n");


        // ==============================
        // CLEAN SPACING
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

        const unsafePatterns = [

            /effective date/i,

            /gdpr/i,

            /ccpa/i,

            /governing law/i,

            /jurisdiction/i,

            /laws of india/i,

            /indian law/i,

            /legal compliance/i,

            /legal validity/i,

            /google analytics/i

        ];


        const unsafeFound =
            unsafePatterns.some(
                pattern =>
                    pattern.test(text)
            );


        if (unsafeFound) {

            throw new Error(
                "AI output में अनचानी privacy/legal information मिली। फिर से Generate करें।"
            );

        }


        // ==============================
        // SHOW RESULT
        // ==============================

        result.value =
            text;

        status.innerText =
            "✅ Privacy Policy successfully generated.";


    }

    catch (error) {

        console.error(
            "Privacy Policy Generator Error:",
            error
        );


        result.value =
            "❌ Privacy Policy generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;


        status.innerText =
            "Please try again.";

    }

    finally {

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Privacy Policy";

    }

}


// ==========================================
// COPY PRIVACY POLICY
// ==========================================

async function copyPrivacyPolicy() {

    const result =
        document.getElementById("result");


    const text =
        result.value.trim();


    if (
        !text ||
        text ===
        "Your AI generated Privacy Policy will appear here..."
    ) {

        alert(
            "पहले Privacy Policy generate करें."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        alert(
            "✅ Privacy Policy copied successfully!"
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
            "✅ Privacy Policy copied successfully!"
        );

    }

}
