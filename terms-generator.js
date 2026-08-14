async function generateTerms() {

    const website = document.getElementById("website").value.trim();
    const url = document.getElementById("url").value.trim();
    const company = document.getElementById("company").value.trim();
    const email = document.getElementById("email").value.trim();
    const country = document.getElementById("country").value.trim();

    const result = document.getElementById("result");
    const status = document.getElementById("status");
    const button = document.getElementById("generateBtn");


    // =========================
    // VALIDATION
    // =========================

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


    // =========================
    // LOADING
    // =========================

    button.disabled = true;
    button.innerText = "⏳ Generating...";
    status.innerText = "AI Terms तैयार कर रहा है...";
    result.value = "⏳ Please wait...";


    // =========================
    // VERY STRICT PROMPT
    // =========================

    const prompt = `

Create a SIMPLE GENERAL website Terms and Conditions draft.

This is an informational template only.
It is NOT legal advice.

USER INFORMATION:

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


IMPORTANT:

Use ONLY the information explicitly provided above.

Do NOT invent information.

Do NOT infer information.

Do NOT make legal assumptions.

Do NOT create legal claims.

Do NOT create country-specific legal claims.

Do NOT create any legal jurisdiction.

Do NOT create governing law.

Do NOT mention Indian law.

Do NOT mention applicable law.

Do NOT mention courts.

Do NOT mention lawyers.

Do NOT mention legal compliance.

Do NOT mention legal validity.

Do NOT mention registration.

Do NOT mention GST.

Do NOT mention licenses.

Do NOT mention physical address.

Do NOT mention phone numbers.

Do NOT mention payment methods.

Do NOT mention refunds.

Do NOT mention cancellation policies.

Do NOT mention shipping.

Do NOT mention delivery.

Do NOT mention warranty.

Do NOT mention guarantees.

Do NOT mention prices.

Do NOT mention discounts.

Do NOT mention offers.

Do NOT create Intellectual Property ownership claims.

Do NOT create copyright ownership claims.

Do NOT create trademark ownership claims.

Do NOT create Limitation of Liability sections.

Do NOT create Privacy Policy sections.

Do NOT create Cookie Policy sections.

Do NOT create Data Protection sections.

Do NOT create sections that were not requested.

IMPORTANT:
The Country field is ONLY contact/business information.
Never use the Country to create a legal statement.


CREATE ONLY THESE 7 SECTIONS:

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
Write a simple statement that users should use the website responsibly.

User Responsibilities:
Write only a general responsibility statement.

Prohibited Activities:
Mention only general website misuse such as attempting to damage,
disrupt, or misuse the website.

Website Availability:
Mention only that the website may sometimes be unavailable
because of maintenance or technical issues.

Changes to Terms:
Mention only that the Terms may be updated from time to time.

Contact Information:
Show exactly the following information:

Company Name: ${company || "Not provided"}
Website Name: ${website}
Website URL: ${url}
Contact Email: ${email}
Country: ${country}


OUTPUT RULES:

Return ONLY the document.

Use exactly these headings:

# Terms and Conditions

## Introduction

## Use of Website

## User Responsibilities

## Prohibited Activities

## Website Availability

## Changes to Terms

## Contact Information

Do not create any other heading.

Do not add explanations before or after the document.

Do not mention AI.

Do not use emojis.

`;


    try {

        // =========================
        // BACKEND API
        // =========================

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
                data.error || "Backend API Error"
            );

        }


        let text = String(
            data.result || ""
        ).trim();


        if (!text) {

            throw new Error(
                "AI ने कोई Terms & Conditions नहीं बनाया।"
            );

        }


        // =========================
        // REMOVE CODE BLOCKS
        // =========================

        text = text.replace(
            /^```(?:markdown|text)?\s*/i,
            ""
        );

        text = text.replace(
            /\s*```$/i,
            ""
        );


        // =========================
        // REMOVE UNWANTED SECTIONS
        // =========================

        const forbiddenSections = [

            "Governing Law",
            "Jurisdiction",
            "Intellectual Property",
            "Limitation of Liability",
            "Privacy Policy",
            "Cookie Policy",
            "Data Protection",
            "Refund Policy",
            "Cancellation Policy",
            "Shipping Policy",
            "Payment Policy",
            "Warranty"

        ];


        for (const section of forbiddenSections) {

            const regex = new RegExp(
                "##\\s*" +
                section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                "[\\s\\S]*?(?=##\\s|$)",
                "gi"
            );

            text = text.replace(regex, "");

        }


        // =========================
        // REMOVE DANGEROUS SENTENCES
        // =========================

        const forbiddenPatterns = [

            /governing law/gi,
            /jurisdiction/gi,
            /laws of india/gi,
            /indian law/gi,
            /applicable law/gi,
            /applicable laws/gi,
            /court/gi,
            /lawyer/gi,
            /legal advice/gi,
            /legal compliance/gi,
            /legal validity/gi,
            /registration number/gi,
            /gst number/gi,
            /license number/gi,
            /physical address/gi,
            /limitation of liability/gi,
            /intellectual property/gi,
            /copyright ownership/gi,
            /trademark ownership/gi

        ];


        const cleanLines = text
            .split(/\r?\n/)
            .filter(line => {

                return !forbiddenPatterns.some(
                    pattern => pattern.test(line)
                );

            });


        text = cleanLines.join("\n");


        // =========================
        // REMOVE EXTRA BLANK LINES
        // =========================

        text = text.replace(
            /\n{3,}/g,
            "\n\n"
        );


        text = text.trim();


        // =========================
        // FINAL SAFETY CHECK
        // =========================

        const stillUnsafe = [

            /governing law/i,
            /jurisdiction/i,
            /laws of india/i,
            /indian law/i,
            /intellectual property/i,
            /limitation of liability/i,
            /legal compliance/i,
            /registration number/i,
            /gst number/i,
            /license number/i

        ];


        const unsafeFound =
            stillUnsafe.some(
                pattern => pattern.test(text)
            );


        if (unsafeFound) {

            throw new Error(
                "AI output में अनचाही legal information मिली। कृपया फिर से Generate करें।"
            );

        }


        // =========================
        // SHOW RESULT
        // =========================

        result.value = text;

        status.innerText =
            "✅ Terms & Conditions successfully generated.";


    } catch (error) {

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

    } finally {

        button.disabled = false;

        button.innerText =
            "🤖 Generate AI Terms & Conditions";

    }

}


// =====================================
// COPY TERMS
// =====================================

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

    } catch (error) {

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

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
