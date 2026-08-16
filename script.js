/* ======================================
   AI Seller Toolkit
   Main script.js
====================================== */


/* ======================================
   START BUTTON
====================================== */

const startBtn = document.getElementById("startBtn");

if (startBtn) {

    startBtn.addEventListener("click", function () {

        window.location.href = "tools.html";

    });

}


/* ======================================
   PAGE LOADED
====================================== */

window.addEventListener("load", function () {

    console.log("AI Seller Toolkit Loaded Successfully");

});


/* ======================================
   SCROLL TO TOP BUTTON
====================================== */

const topBtn = document.createElement("button");

topBtn.id = "topBtn";
topBtn.innerHTML = "⬆";

document.body.appendChild(topBtn);


/* Show / Hide */

window.addEventListener("scroll", function () {

    if (window.scrollY > 300) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});


/* Scroll Top */

topBtn.addEventListener("click", function () {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});


/* ======================================
   TOOL COUNTER
====================================== */

const toolCards = document.querySelectorAll(".card");

console.log("Total Tools : " + toolCards.length);


/* ======================================
   FADE ANIMATION
====================================== */

toolCards.forEach(function (card) {

    card.classList.add("fade");

});


/* ======================================
   WELCOME MESSAGE
====================================== */

setTimeout(function () {

    console.log("Welcome to AI Seller Toolkit");

}, 1000);


/* ======================================
   CURRENT YEAR
====================================== */

const footer = document.querySelector("footer p");

if (footer) {

    footer.innerHTML =
        "© " +
        new Date().getFullYear() +
        " AI Seller Toolkit";

}


/* ======================================
   DARK MODE
====================================== */

const darkBtn = document.getElementById("darkModeBtn");

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

}


if (darkBtn) {

    darkBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

        } else {

            localStorage.setItem("theme", "light");

        }

    });

}


/* ======================================
   TOOL SEARCH
====================================== */

const searchBox = document.getElementById("searchTools");

if (searchBox) {

    searchBox.addEventListener("keyup", function () {

        let value = searchBox.value.toLowerCase();

        let cards = document.querySelectorAll(".card");

        cards.forEach(function (card) {

            let text = card.innerText.toLowerCase();

            if (text.indexOf(value) > -1) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}


/* ======================================
   BUTTON HOVER
====================================== */

const buttons = document.querySelectorAll("button");

buttons.forEach(function (btn) {

    btn.addEventListener("mouseenter", function () {

        btn.style.transform = "scale(1.03)";

    });

    btn.addEventListener("mouseleave", function () {

        btn.style.transform = "scale(1)";

    });

});


/* ======================================
   CARD ANIMATION
====================================== */

const cards = document.querySelectorAll(".card");

cards.forEach(function (card) {

    card.addEventListener("mouseenter", function () {

        card.style.transition = ".3s";

        card.style.transform = "translateY(-8px)";

    });

    card.addEventListener("mouseleave", function () {

        card.style.transform = "translateY(0px)";

    });

});


/* ======================================
   COPY SUCCESS MESSAGE
   No popup alert
====================================== */

function showCopySuccess(message = "✅ Copied successfully!") {

    let oldToast = document.getElementById("copyToast");

    if (oldToast) {

        oldToast.remove();

    }


    const toast = document.createElement("div");

    toast.id = "copyToast";

    toast.className = "copy-toast";

    toast.innerText = message;

    document.body.appendChild(toast);


    setTimeout(function () {

        toast.remove();

    }, 2000);

}


/* ======================================
   COMPLETE LISTING GENERATOR
====================================== */

function generateListing() {

    let product =
        document.getElementById("product").value.trim();

    let brand =
        document.getElementById("brand").value.trim();

    let category =
        document.getElementById("category").value.trim();

    let material =
        document.getElementById("material").value.trim();

    let color =
        document.getElementById("color").value.trim();

    let audience =
        document.getElementById("audience").value;


    if (product === "") {

        alert("Please enter Product Name");

        return;

    }


    /* ==================================
       SEO TITLE
    ================================== */

    document.getElementById("titleResult").innerText =

        product +

        (brand ? " by " + brand : "") +

        (color ? " - " + color : "");


    /* ==================================
       DESCRIPTION
    ================================== */

    document.getElementById("descriptionResult").innerText =

        product +

        (brand
            ? " from " + brand
            : "") +

        " is a " +

        (category || "product") +

        (material
            ? " made of " + material
            : "") +

        (color
            ? " in " + color
            : "") +

        (audience
            ? ". Suitable for " + audience
            : "") +

        ".";


    /* ==================================
       BULLET POINTS
    ================================== */

    document.getElementById("bulletResult").innerText =

        "✔ Brand: " +
        (brand || "Not specified") +

        "\n✔ Product: " +
        product +

        "\n✔ Category: " +
        (category || "Not specified") +

        "\n✔ Material: " +
        (material || "Not specified") +

        "\n✔ Color: " +
        (color || "Not specified") +

        (audience
            ? "\n✔ Suitable for: " + audience
            : "");


    /* ==================================
       PRODUCT FEATURES
    ================================== */

    document.getElementById("featureResult").innerText =

        "1. Brand: " +
        (brand || "Not specified") +

        "\n2. Product: " +
        product +

        "\n3. Category: " +
        (category || "Not specified") +

        "\n4. Material: " +
        (material || "Not specified") +

        "\n5. Color: " +
        (color || "Not specified") +

        (audience
            ? "\n6. Suitable For: " + audience
            : "");


    /* ==================================
       SEO KEYWORDS
    ================================== */

    document.getElementById("keywordResult").innerText =

        product +

        (brand
            ? ", " + brand
            : "") +

        (category
            ? ", " + category
            : "") +

        (material
            ? ", " + material
            : "") +

        (color
            ? ", " + color
            : "") +

        (audience
            ? ", " + audience
            : "");


    /* ==================================
       HASHTAGS
    ================================== */

    let hash = product.replace(/\s+/g, "");

    let brandHash =
        brand.replace(/\s+/g, "");

    document.getElementById("hashtagResult").innerText =

        "#" + hash +

        (brandHash
            ? " #" + brandHash
            : "");


    /* ==================================
       PRODUCT TAGS
    ================================== */

    document.getElementById("tagResult").innerText =

        product +

        (brand
            ? ", " + brand
            : "") +

        (category
            ? ", " + category
            : "") +

        (material
            ? ", " + material
            : "") +

        (color
            ? ", " + color
            : "");

}


/* ======================================
   COPY COMPLETE LISTING
====================================== */

function copyAll() {

    let text =

        document.getElementById("titleResult").innerText +

        "\n\n" +

        document.getElementById("descriptionResult").innerText +

        "\n\n" +

        document.getElementById("bulletResult").innerText +

        "\n\n" +

        document.getElementById("featureResult").innerText +

        "\n\n" +

        document.getElementById("keywordResult").innerText +

        "\n\n" +

        document.getElementById("hashtagResult").innerText +

        "\n\n" +

        document.getElementById("tagResult").innerText;


    navigator.clipboard.writeText(text)

        .then(function () {

            /* बड़ा popup नहीं आएगा */

            showCopySuccess("✅ Complete Listing copied!");

        })

        .catch(function () {

            showCopySuccess("❌ Copy नहीं हो पाया");

        });

}


/* ======================================
   CLEAR COMPLETE LISTING
====================================== */

function clearAll() {

    document.getElementById("product").value = "";

    document.getElementById("brand").value = "";

    document.getElementById("category").value = "";

    document.getElementById("material").value = "";

    document.getElementById("color").value = "";

    document.getElementById("audience").selectedIndex = 0;


    document.getElementById("titleResult").innerText = "";

    document.getElementById("descriptionResult").innerText = "";

    document.getElementById("bulletResult").innerText = "";

    document.getElementById("featureResult").innerText = "";

    document.getElementById("keywordResult").innerText = "";

    document.getElementById("hashtagResult").innerText = "";

    document.getElementById("tagResult").innerText = "";

}


/* ======================================
   CONSOLE
====================================== */

console.log("Dark Mode Ready");

console.log("Search Ready");

console.log("Animation Ready");

console.log("Copy System Ready");
