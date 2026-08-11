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


    const result =
        document.getElementById("result");

    result.value =
        "⏳ Generating Privacy Policy...";


    const prompt = `
You are a professional website privacy policy drafting assistant.

Create a clear, professional and easy-to-read Privacy Policy
using ONLY the information provided below.

========================
WEBSITE INFORMATION
========================

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


========================
STRICT ACCURACY RULES
========================

1. Use ONLY the information provided above.

2. NEVER invent company information.

3. NEVER invent a physical address.

4. NEVER invent a phone number.

5. NEVER invent a business registration number.

6. NEVER invent a data protection officer.

7. NEVER invent specific laws or legal registrations.

8. NEVER claim that the website collects a particular
type of personal data unless that information has been
explicitly provided.

9. NEVER claim that the website uses:
- Cookies
- Google Analytics
- Google Ads
- Facebook Pixel
- Advertising networks
- Payment processors
- Third-party APIs
- Social media plugins
- Newsletter services
- Cloud services

unless explicitly provided.

10. Do not claim that users can create accounts,
make payments, upload files, subscribe to newsletters,
or contact support through forms unless explicitly provided.

11. If a section requires information that was not provided,
write a neutral statement such as:

"The website may process information as necessary to provide
its services. Users should review the website's actual
data practices and update this section accordingly."

12. Do not falsely state that specific data is collected.

13. Do not make guarantees about security or legal compliance.

14. Do not claim that this Privacy Policy provides
legal compliance in every country.

15. Do not mention AI.

16. Do not add fake contact information.

17. Keep the policy professional and easy to understand.

18. Use the supplied Website Name, URL, Company Name,
Contact Email and Country accurately.

19. Do not change the supplied email address.

20. Do not change the supplied website URL.

21. Do not invent a different company name.


========================
IMPORTANT LEGAL NOTICE
========================

This document is a general template and should not be
presented as legal advice.

Include a short statement near the beginning saying that
the policy is a general informational template and should
be reviewed and customized according to the website's
actual data practices and applicable laws.


========================
PRIVACY POLICY SECTIONS
========================

Create these sections:

1. Privacy Policy
2. Effective Date
3. Introduction
4. Information We May Process
5. How Information May Be Used
6. Cookies and Similar Technologies
7. Third-Party Services
8. Data Security
9. Data Retention
10. User Rights
11. Children's Privacy
12. Changes to This Privacy Policy
13. Contact Us
14. Important Disclaimer


IMPORTANT:

Do not falsely state that cookies, analytics,
third-party services or specific personal information
are definitely used or collected.

Where information has not been supplied, use neutral
conditional wording.

For example:

"Depending on how the website is configured, certain
technical information may be processed."

Do not turn this into a claim that such information
is definitely collected.


========================
OUTPUT FORMAT
========================

Return ONLY the Privacy Policy.

Use clear headings.

Do not add markdown code fences.

Do not add an introduction outside the policy.

Do not add a conclusion outside the policy.
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
            cleanPolicyOutput(
                data.result
            );


    } catch (error) {

        console.error(
            "Privacy Policy AI Error:",
            error
        );


        result.value =
            "❌ Privacy Policy generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================
   CLEAN POLICY OUTPUT
========================= */

function cleanPolicyOutput(text) {

    let cleaned =
        text.trim();


    // Remove accidental code fences
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
   COPY POLICY
========================= */

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
            "पहले Privacy Policy successfully generate करें।"
        );

        return;

    }


    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ Privacy Policy copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

            }
