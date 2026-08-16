async function generateTitle() {

    const product =
        document.getElementById("product").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const keyword =
        document.getElementById("keyword").value.trim();

    if (
        product === "" ||
        category === "" ||
        brand === "" ||
        keyword === ""
    ) {

        alert("कृपया सभी जानकारी भरें।");

        return;
    }


    const result =
        document.getElementById("result");


    result.value =
        "⏳ AI titles बनाए जा रहे हैं...";


    const prompt = `
You are a professional eCommerce SEO product title generator.

Create 5 high-quality product titles.

Product Name: ${product}
Category: ${category}
Brand: ${brand}
Main Keyword: ${keyword}

Requirements:
- Professional and attractive
- SEO friendly
- Suitable for Amazon, Flipkart, Meesho and Shopify
- Include important product information
- Do not use fake claims
- Do not use unnecessary symbols
- Keep titles clear and readable
- Each title should be different

Return only 5 numbered titles.
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
                data.error || "Server error"
            );

        }


        result.value =
            data.result;


    } catch (error) {

        console.error(
            "AI Error:",
            error
        );


        result.value =
            "❌ AI से response नहीं मिला।\n\n" +
            "Error: " +
            error.message;
    }
}


/* ==========================================
   COPY TITLE
   No browser alert on successful copy
========================================== */

function copyTitle() {

    const result =
        document.getElementById("result");


    if (!result) {

        return;
    }


    const text =
        result.value.trim();


    if (
        text === "" ||
        text.startsWith("⏳") ||
        text.startsWith("❌")
    ) {

        showCopyMessage(
            "⚠️ पहले Title Generate करें।",
            false
        );

        return;
    }


    /* Modern Clipboard API */

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(text)

            .then(function () {

                showCopyMessage(
                    "✅ Titles copied!",
                    true
                );

            })

            .catch(function () {

                fallbackCopy(text);

            });

    }

    else {

        fallbackCopy(text);

    }
}


/* ==========================================
   BACKUP COPY METHOD
========================================== */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    textarea.style.top =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        const successful =
            document.execCommand("copy");


        if (successful) {

            showCopyMessage(
                "✅ Titles copied!",
                true
            );

        }

        else {

            showCopyMessage(
                "❌ Copy नहीं हो सका।",
                false
            );

        }

    }

    catch (error) {

        console.error(
            "Copy Error:",
            error
        );


        showCopyMessage(
            "❌ Copy नहीं हो सका।",
            false
        );

    }


    document.body.removeChild(
        textarea
    );
}


/* ==========================================
   COPY MESSAGE
   Small message instead of browser popup
========================================== */

function showCopyMessage(
    message,
    success
) {

    const oldMessage =
        document.getElementById(
            "copyMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const messageBox =
        document.createElement("div");


    messageBox.id =
        "copyMessage";


    messageBox.innerText =
        message;


    messageBox.style.position =
        "fixed";


    messageBox.style.left =
        "50%";


    messageBox.style.bottom =
        "25px";


    messageBox.style.transform =
        "translateX(-50%)";


    messageBox.style.padding =
        "12px 20px";


    messageBox.style.borderRadius =
        "8px";


    messageBox.style.fontSize =
        "15px";


    messageBox.style.fontWeight =
        "bold";


    messageBox.style.color =
        "#ffffff";


    messageBox.style.background =
        success
            ? "#16a34a"
            : "#dc2626";


    messageBox.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.25)";


    messageBox.style.zIndex =
        "999999";


    messageBox.style.textAlign =
        "center";


    document.body.appendChild(
        messageBox
    );


    setTimeout(function () {

        if (messageBox) {

            messageBox.remove();

        }

    }, 1800);
        }
