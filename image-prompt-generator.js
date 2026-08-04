function generatePrompt() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let color = document.getElementById("color").value.trim();
let material = document.getElementById("material").value.trim();
let background = document.getElementById("background").value;
let style = document.getElementById("style").value;

if (product === "") {
    alert("Please enter Product Name");
    return;
}

let prompt =
"Create a " + style + " product photo of a " +
(color || "Premium") + " " + product +
" by " + (brand || "Generic Brand") + ". " +

"The product is made of " +
(material || "high-quality material") + ". " +

"Use a " + background +
" background with soft lighting, realistic shadows, professional eCommerce photography, ultra HD, 8K quality, highly detailed texture, centered composition, suitable for Amazon, Flipkart, Meesho, Shopify and Etsy.";

document.getElementById("result").value = prompt;

}

function copyPrompt() {

let text = document.getElementById("result");

text.select();
text.setSelectionRange(0, 99999);

navigator.clipboard.writeText(text.value);

alert("AI Prompt Copied Successfully!");

}
