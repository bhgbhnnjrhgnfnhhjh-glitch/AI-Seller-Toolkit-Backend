async function copyBulletPoints() {

    const result = document.getElementById("result");

    if (!result) {
        alert("❌ Result box नहीं मिला।");
        return;
    }

    const text = result.innerText.trim();

    if (
        !text ||
        text === "Your AI generated bullet points will appear here..." ||
        text === "⏳ Please wait..."
    ) {
        alert("पहले Bullet Points generate करें।");
        return;
    }

    if (text.startsWith("❌")) {
        alert("पहले सही Bullet Points generate करें।");
        return;
    }

    try {

        // पहले Modern Clipboard API
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(text);

            showCopyMessage("✅ Bullet Points copied successfully!");

            return;
        }

        // अगर Clipboard API काम न करे
        fallbackCopyBulletPoints(text);

    }

    catch (error) {

        console.error("Copy Error:", error);

        // दूसरा तरीका
        fallbackCopyBulletPoints(text);

    }
}


/*
==========================================
FALLBACK COPY
==========================================
*/

function fallbackCopyBulletPoints(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";

    textarea.setAttribute("readonly", "");

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;

    try {

        copied =
            document.execCommand("copy");

    }

    catch (error) {

        console.error(
            "Fallback Copy Error:",
            error
        );

    }

    document.body.removeChild(textarea);

    if (copied) {

        showCopyMessage(
            "✅ Bullet Points copied successfully!"
        );

    }

    else {

        alert(
            "❌ Copy नहीं हो सका। Bullet Points को दबाकर Select करके Copy करें।"
        );

    }
}


/*
==========================================
COPY MESSAGE
==========================================
*/

function showCopyMessage(message) {

    // अगर पहले से message है तो उसे हटाएँ
    const oldMessage =
        document.getElementById("copyMessage");

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

    messageBox.style.bottom =
        "25px";

    messageBox.style.left =
        "50%";

    messageBox.style.transform =
        "translateX(-50%)";

    messageBox.style.background =
        "#16a34a";

    messageBox.style.color =
        "#ffffff";

    messageBox.style.padding =
        "12px 18px";

    messageBox.style.borderRadius =
        "8px";

    messageBox.style.fontSize =
        "15px";

    messageBox.style.fontWeight =
        "bold";

    messageBox.style.zIndex =
        "99999";

    messageBox.style.boxShadow =
        "0 4px 12px rgba(0,0,0,0.2)";

    document.body.appendChild(
        messageBox
    );

    setTimeout(function () {

        messageBox.remove();

    }, 2000);
}
