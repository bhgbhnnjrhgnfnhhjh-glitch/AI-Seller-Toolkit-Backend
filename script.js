/* ============================================
   AI SELLER TOOLKIT
   COMMON script.js
   Version: 2.0

   मुख्य काम:
   ✅ सभी Tools के Copy success popup हटाना
   ✅ छोटा green success message दिखाना
   ✅ Dark Mode
   ✅ Search
   ✅ Scroll To Top
   ✅ Tool animations
   ============================================ */


/* ============================================
   1. COPY SUCCESS TOAST
   ============================================ */

function showCopySuccess(message) {

    // पुराना message हटाएँ
    const oldToast = document.getElementById("copyToast");

    if (oldToast) {
        oldToast.remove();
    }

    // नया message
    const toast = document.createElement("div");

    toast.id = "copyToast";
    toast.className = "copy-toast";

    toast.innerText = message || "✅ Copied successfully!";

    document.body.appendChild(toast);

    // 2 सेकंड बाद हटाएँ
    setTimeout(function () {

        if (toast) {
            toast.remove();
        }

    }, 2000);
}


/* ============================================
   2. OLD ALERT POPUP CONTROL
   ============================================ */

/*
   पुराने Tools में Copy button के अंदर
   alert("Copied successfully!")
   लगा हुआ हो सकता है।

   यह code केवल COPY वाले success alert को
   छोटा message बनाएगा।

   बाकी जरूरी alerts वैसे ही काम करेंगे।
*/

const originalAlert = window.alert;

window.alert = function (message) {

    const text = String(message || "").toLowerCase();

    const isCopyMessage =
        text.includes("copied") ||
        text.includes("copy successfully") ||
        text.includes("copy success") ||
        text.includes("copied successfully");

    if (isCopyMessage) {

        showCopySuccess(
            "✅ Copied successfully!"
        );

        return;
    }

    // बाकी alerts पुराने तरीके से चलेंगे
    originalAlert(message);
};


/* ============================================
   3. PAGE LOADED
   ============================================ */

window.addEventListener("load", function () {

    console.log(
        "✅ AI Seller Toolkit Loaded Successfully"
    );

});


/* ============================================
   4. START BUTTON
   ============================================ */

const startBtn =
    document.getElementById("startBtn");

if (startBtn) {

    startBtn.addEventListener("click", function () {

        window.location.href = "tools.html";

    });

}


/* ============================================
   5. SCROLL TO TOP
   ============================================ */

const topBtn =
    document.createElement("button");

topBtn.id = "topBtn";
topBtn.innerHTML = "⬆";

topBtn.style.display = "none";

document.body.appendChild(topBtn);


/* Show / Hide */

window.addEventListener("scroll", function () {

    if (window.scrollY > 300) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});


/* Scroll */

topBtn.addEventListener("click", function () {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});


/* ============================================
   6. TOOL COUNTER
   ============================================ */

const toolCards =
    document.querySelectorAll(".card");

console.log(
    "Total Tools : " +
    toolCards.length
);


/* ============================================
   7. CARD FADE
   ============================================ */

toolCards.forEach(function (card) {

    card.classList.add("fade");

});


/* ============================================
   8. DARK MODE
   ============================================ */

const darkBtn =
    document.getElementById("darkModeBtn");


/* Load saved theme */

if (
    localStorage.getItem("theme") === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

}


/* Dark button */

if (darkBtn) {

    darkBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );


            if (
                document.body.classList.contains(
                    "dark-mode"
                )
            ) {

                localStorage.setItem(
                    "theme",
                    "dark"
                );

            } else {

                localStorage.setItem(
                    "theme",
                    "light"
                );

            }

        }
    );

}


/* ============================================
   9. TOOL SEARCH
   ============================================ */

const searchBox =
    document.getElementById("searchTools");

if (searchBox) {

    searchBox.addEventListener(
        "keyup",
        function () {

            const value =
                searchBox.value.toLowerCase();

            const cards =
                document.querySelectorAll(".card");


            cards.forEach(function (card) {

                const text =
                    card.innerText.toLowerCase();


                if (
                    text.indexOf(value) > -1
                ) {

                    card.style.display =
                        "block";

                } else {

                    card.style.display =
                        "none";

                }

            });

        }
    );

}


/* ============================================
   10. BUTTON HOVER
   ============================================ */

const buttons =
    document.querySelectorAll("button");

buttons.forEach(function (btn) {

    btn.addEventListener(
        "mouseenter",
        function () {

            btn.style.transform =
                "scale(1.03)";

        }
    );


    btn.addEventListener(
        "mouseleave",
        function () {

            btn.style.transform =
                "scale(1)";

        }
    );

});


/* ============================================
   11. CARD HOVER
   ============================================ */

const cards =
    document.querySelectorAll(".card");

cards.forEach(function (card) {

    card.addEventListener(
        "mouseenter",
        function () {

            card.style.transition =
                ".3s";

            card.style.transform =
                "translateY(-8px)";

        }
    );


    card.addEventListener(
        "mouseleave",
        function () {

            card.style.transform =
                "translateY(0px)";

        }
    );

});


/* ============================================
   12. COMMON COPY FUNCTION
   ============================================ */

/*
   नए Tools में चाहें तो:

   copyText("यह text है", "Title copied!");

   इस्तेमाल कर सकते हैं।
*/

function copyText(text, successMessage) {

    if (!text) {

        showCopySuccess(
            "❌ Copy करने के लिए text नहीं है"
        );

        return;

    }


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard.writeText(text)

            .then(function () {

                showCopySuccess(
                    successMessage ||
                    "✅ Copied successfully!"
                );

            })

            .catch(function () {

                fallbackCopy(text);

            });

    } else {

        fallbackCopy(text);

    }

}


/* ============================================
   13. FALLBACK COPY
   ============================================ */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    document.body.appendChild(
        textarea
    );

    textarea.focus();

    textarea.select();


    try {

        const success =
            document.execCommand("copy");


        if (success) {

            showCopySuccess(
                "✅ Copied successfully!"
            );

        } else {

            showCopySuccess(
                "❌ Copy नहीं हो पाया"
            );

        }

    }

    catch (error) {

        console.error(
            "Copy Error:",
            error
        );

        showCopySuccess(
            "❌ Copy नहीं हो पाया"
        );

    }


    document.body.removeChild(
        textarea
    );

}


/* ============================================
   14. CURRENT YEAR
   ============================================ */

const footer =
    document.querySelector("footer p");

if (footer) {

    footer.innerHTML =
        "© " +
        new Date().getFullYear() +
        " AI Seller Toolkit";

}


/* ============================================
   15. CONSOLE
   ============================================ */

console.log(
    "✅ Dark Mode Ready"
);

console.log(
    "✅ Search Ready"
);

console.log(
    "✅ Animation Ready"
);

console.log(
    "✅ Common Copy System Ready"
);

console.log(
    "✅ Copy Popup Fix Ready"
);
