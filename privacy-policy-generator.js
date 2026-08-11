async function generatePolicy() {

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


    // =========================
    // VALIDATION
    // =========================

    if (
        website === "" ||
        url === "" ||
        company === "" ||
        email === "" ||
        country === ""
    ) {

        alert("Please fill all fields.");
        return;

    }


    // Basic email validation

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");
        return;

    }


    // =========================
    // LOADING
    // =========================

    result.value =
        "⏳ Generating Privacy Policy...\n\nPlease wait.";


    // =========================
    // AI PROMPT
    // =========================

    const prompt = `
You are a professional eCommerce and website privacy policy
drafting assistant.

Create a clean, professional and easy-to-read Privacy Policy
for the website using ONLY the information provided below.

WEBSITE DETAILS
===============

Website Name:
${website}

Website URL:
${url}

Company Name:
${company}

Contact Email:
${email}

Country:
${country}


IMPORTANT ACCURACY RULES
========================

1. Never invent facts.

2. Never invent a physical address.

3. Never invent a phone number.

4. Never invent a company registration number.

5. Never invent a Data Protection Officer.

6. Never invent payment processors.

7. Never invent analytics services.

8. Never invent advertising services.

9. Never invent cookies.

10. Never invent third-party services.

11. Never invent newsletter subscriptions.

12. Never invent user accounts.

13. Never invent forms.

14. Never invent file uploads.

15. Never invent specific personal information
that the website collects.

16. Never claim legal compliance with a specific law
unless that law has been explicitly provided by the user.

17. Never make security guarantees.

18. Never make promises about data retention periods
unless the user has provided them.

19. Never create fake contact information.

20. Do not change the supplied website URL.

21. Do not change the supplied contact email.

22. Do not change the supplied company name.

23. Do not mention that the policy was created by AI.

24. Do not repeat the same paragraph across multiple sections.

25. Keep every section useful and relevant.

26. If a specific practice has not been provided,
use careful wording such as:

"The website's actual use of this technology should be
reviewed and this section updated accordingly."

Do NOT say that the website definitely uses that technology.

27. Do not use the phrase
"the website may process information as necessary to
provide its services" repeatedly.

28. Each section should have its own purpose.

29. Keep the Privacy Policy suitable as a general website
template, but clearly state that it must be reviewed and
customized according to actual practices and applicable laws.


LEGAL DISCLAIMER
================

Near the beginning of the document, include:

"This Privacy Policy is a general informational template
and is not legal advice. It should be reviewed and
customized according to the website's actual data
practices and applicable laws."


REQUIRED SECTIONS
=================

Create the following sections:

1. Privacy Policy
2. Effective Date
3. Introduction
4. Information We Collect
5. How We Use Information
6. Cookies and Similar Technologies
7. Third-Party Services
8. Data Security
9. Data Retention
10. User Privacy Rights
11. Children's Privacy
12. International Data Transfers
13. Changes to This Privacy Policy
14. Contact Us
15. Important Disclaimer


SECTION GUIDANCE
================

SECTION 1 — Privacy Policy

Clearly identify the document as the Privacy Policy
for the supplied website.

SECTION 2 — Effective Date

Do not invent a date.

Write:

"Effective Date: [Insert effective date]"

SECTION 3 — Introduction

Mention:
- Website Name
- Company Name
- Website URL
- Country

Do not invent any other company information.

SECTION 4 — Information We Collect

Explain that the actual categories of information
collected depend on how the website is configured.

Do not claim specific personal data is definitely collected.

Give a short note explaining that the website owner
should update this section according to actual practices.

SECTION 5 — How We Use Information

Explain general possible purposes carefully,
without claiming that every purpose definitely applies.

Examples may include:
- operating the website
- responding to inquiries
- improving services

Use conditional wording where necessary.

SECTION 6 — Cookies and Similar Technologies

Do not claim that cookies are definitely used.

State that the website owner should update this section
if cookies or similar technologies are actually used.

SECTION 7 — Third-Party Services

Do not name Google, Meta, payment providers,
analytics providers or any other third party.

State that this section should be updated if
third-party services are actually used.

SECTION 8 — Data Security

Explain generally that reasonable measures may be used
to protect information, but do not guarantee security.

SECTION 9 — Data Retention

Do not invent a retention period.

Explain that retention depends on actual business
and legal requirements and should be specified by
the website owner.

SECTION 10 — User Privacy Rights

Use general wording.

Do not guarantee a specific legal right in every country.

Explain that applicable privacy rights depend on
the user's location and applicable law.

SECTION 11 — Children's Privacy

Do not invent an age restriction.

Use neutral wording and advise the website owner
to customize this section according to actual practices
and applicable laws.

SECTION 12 — International Data Transfers

Do not claim that international transfers occur.

Explain that this section should be reviewed if
information is transferred across countries.

SECTION 13 — Changes

Explain that the policy may be updated from time to time.

Do not invent a notification method.

SECTION 14 — Contact Us

Use ONLY:

Company Name:
${company}

Email:
${email}

Website:
${url}

Do not add a physical address or phone number.

SECTION 15 — Important Disclaimer

Clearly state that this is a general informational template,
not legal advice, and should be reviewed by the website owner
according to actual practices and applicable laws.


OUTPUT RULES
============

Return ONLY the Privacy Policy.

Do not use code fences.

Do not add commentary before the Privacy Policy.

Do not add commentary after the Privacy Policy.

Use clear headings.

Keep the document professional.

Avoid unnecessary repetition.

Do not use fake information.

Do not invent legal compliance.

Do not invent data collection practices.
`;


    // =========================
    // API REQUEST
    // =========================

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


        let data;

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        // =========================
        // SERVER ERROR
        // =========================

        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                `Server error (${response.status})`
            );

        }


        // =========================
        // EMPTY RESPONSE
        // =========================

        if (
            !data.result ||
            typeof data.result !== "string" ||
            data.result.trim() === ""
        ) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        // =========================
        // CLEAN RESULT
        // =========================

        result.value =
            cleanPolicyOutput(data.result);


    } catch (error) {

        console.error(
            "Privacy Policy Generator Error:",
            error
        );


        result.value =
            "❌ Privacy Policy generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =====================================================
   CLEAN AI OUTPUT
===================================================== */

function cleanPolicyOutput(text) {

    let cleaned =
        text.trim();


    // Remove markdown code fences

    cleaned =
        cleaned.replace(
            /^```(?:text|markdown)?\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /\s*```$/i,
            ""
        );


    // Remove accidental leading/trailing whitespace

    cleaned =
        cleaned.trim();


    return cleaned;

}


/* =====================================================
   COPY PRIVACY POLICY
===================================================== */

function copyPolicy() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले Privacy Policy generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ Privacy Policy generate नहीं हो सकी"
        )
    ) {

        alert(
            "पहले एक valid Privacy Policy generate करें।"
        );

        return;

    }


    // Clipboard API

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)

            .then(function () {

                alert(
                    "✅ Privacy Policy copied successfully!"
                );

            })

            .catch(function () {

                fallbackCopy(text);

            });

    } else {

        fallbackCopy(text);

    }

}


/* =====================================================
   FALLBACK COPY
===================================================== */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();


    try {

        document.execCommand("copy");

        alert(
            "✅ Privacy Policy copied successfully!"
        );

    } catch (error) {

        alert(
            "❌ Copy नहीं हो सका। कृपया manually copy करें।"
        );

    }


    document.body.removeChild(textarea);

        }
