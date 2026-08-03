const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", function () {
        window.location.href = "tools.html";
    });
}
/* ======================================
   AI Seller Toolkit
   script.js - Part 1
====================================== */

// Page Loaded
window.addEventListener("load", function () {
    console.log("AI Seller Toolkit Loaded Successfully");
});

// Scroll To Top Button Create
const topBtn = document.createElement("button");

topBtn.id = "topBtn";
topBtn.innerHTML = "⬆";

document.body.appendChild(topBtn);

// Show / Hide Button
window.addEventListener("scroll", function () {

    if (window.scrollY > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }

});

// Scroll Top
topBtn.addEventListener("click", function () {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// Tool Counter
const toolCards = document.querySelectorAll(".card");

console.log("Total Tools : " + toolCards.length);

// Fade Animation
toolCards.forEach(function(card){

    card.classList.add("fade");

});

// Welcome Message
setTimeout(function(){

    console.log("Welcome to AI Seller Toolkit");

},1000);

// Current Year in Footer
const footer = document.querySelector("footer p");

if(footer){

footer.innerHTML =
"© " +
new Date().getFullYear() +
" AI Seller Toolkit";

}
/* ======================================
   AI Seller Toolkit
   script.js - Part 2
   Dark Mode + Search
====================================== */

// ======================
// Dark Mode
// ======================

const darkBtn = document.getElementById("darkModeBtn");

if(localStorage.getItem("theme") === "dark"){

document.body.classList.add("dark-mode");

}

if(darkBtn){

darkBtn.addEventListener("click",function(){

document.body.classList.toggle("dark-mode");

if(document.body.classList.contains("dark-mode")){

localStorage.setItem("theme","dark");

}else{

localStorage.setItem("theme","light");

}

});

}

// ======================
// Tool Search
// ======================

const searchBox = document.getElementById("searchTools");

if(searchBox){

searchBox.addEventListener("keyup",function(){

let value = searchBox.value.toLowerCase();

let cards = document.querySelectorAll(".card");

cards.forEach(function(card){

let text = card.innerText.toLowerCase();

if(text.indexOf(value) > -1){

card.style.display="block";

}else{

card.style.display="none";

}

});

});

}

// ======================
// Button Hover Animation
// ======================

const buttons = document.querySelectorAll("button");

buttons.forEach(function(btn){

btn.addEventListener("mouseenter",function(){

btn.style.transform="scale(1.03)";

});

btn.addEventListener("mouseleave",function(){

btn.style.transform="scale(1)";

});

});

// ======================
// Card Animation
// ======================

const cards = document.querySelectorAll(".card");

cards.forEach(function(card){

card.addEventListener("mouseenter",function(){

card.style.transition=".3s";

card.style.transform="translateY(-8px)";

});

card.addEventListener("mouseleave",function(){

card.style.transform="translateY(0px)";

});

});

// ======================
// Console
// ======================

console.log("Dark Mode Ready");
console.log("Search Ready");
console.log("Animation Ready");
function generateListing(){

let product=document.getElementById("product").value.trim();
let brand=document.getElementById("brand").value.trim();
let category=document.getElementById("category").value.trim();
let material=document.getElementById("material").value.trim();
let color=document.getElementById("color").value.trim();
let audience=document.getElementById("audience").value;

if(product===""){
alert("Please enter Product Name");
return;
}

// SEO Title
document.getElementById("titleResult").innerText =
"Buy Premium " + product +
(brand ? " by " + brand : "") +
" | Best Price Online";

// Description
document.getElementById("descriptionResult").innerText =
(product + " is a premium quality " + (category || "product") +
". Made with " + (material || "high-quality material") +
". Color: " + (color || "Standard") +
". Suitable for " + audience +
". Perfect for daily use.");

// Bullet Points
document.getElementById("bulletResult").innerText =
"✔ Premium Quality\n" +
"✔ Material: " + (material || "High Quality") + "\n" +
"✔ Color: " + (color || "Standard") + "\n" +
"✔ Comfortable & Durable\n" +
"✔ Suitable for " + audience;

// Features
document.getElementById("featureResult").innerText =
"⭐ Premium Build Quality\n" +
"⭐ Lightweight Design\n" +
"⭐ Stylish Look\n" +
"⭐ Easy to Maintain\n" +
"⭐ Long Lasting";

// Keywords
document.getElementById("keywordResult").innerText =
product + ", " +
(category || "Product") + ", " +
(color || "Color") + ", " +
brand + ", Online Shopping";

// Hashtags
let hash = product.replace(/\s+/g,"");
document.getElementById("hashtagResult").innerText =
"#" + hash +
" #OnlineShopping #Sale #Trending #India #BestSeller";

// Tags
document.getElementById("tagResult").innerText =
product + ", " +
brand + ", " +
(category || "Product") + ", " +
(material || "Material") + ", " +
(color || "Color");

}

function copyAll(){

let text =
document.getElementById("titleResult").innerText + "\n\n" +
document.getElementById("descriptionResult").innerText + "\n\n" +
document.getElementById("bulletResult").innerText + "\n\n" +
document.getElementById("featureResult").innerText + "\n\n" +
document.getElementById("keywordResult").innerText + "\n\n" +
document.getElementById("hashtagResult").innerText + "\n\n" +
document.getElementById("tagResult").innerText;

navigator.clipboard.writeText(text);

alert("Complete Listing Copied!");
}

function clearAll(){

document.getElementById("product").value="";
document.getElementById("brand").value="";
document.getElementById("category").value="";
document.getElementById("material").value="";
document.getElementById("color").value="";
document.getElementById("audience").selectedIndex=0;

document.getElementById("titleResult").innerText="";
document.getElementById("descriptionResult").innerText="";
document.getElementById("bulletResult").innerText="";
document.getElementById("featureResult").innerText="";
document.getElementById("keywordResult").innerText="";
document.getElementById("hashtagResult").innerText="";
document.getElementById("tagResult").innerText="";
}
