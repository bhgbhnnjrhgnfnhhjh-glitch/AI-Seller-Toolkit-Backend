function generateLogoPrompt() {

let brand = document.getElementById("brand").value.trim();
let business = document.getElementById("business").value.trim();
let style = document.getElementById("style").value;
let primary = document.getElementById("primary").value.trim();
let secondary = document.getElementById("secondary").value.trim();
let background = document.getElementById("background").value;

if (brand === "") {
    alert("Please enter Brand Name");
    return;
}

let prompt =
"Create a " + style + " logo for the brand '" + brand + "'. " +
"The business is a " + business + ". " +
"Use " + (primary || "black") + " and " + (secondary || "gold") + " colors. " +
"Background: " + background + ". " +
"Clean vector design, premium typography, modern branding, professional, scalable, transparent version included, ultra HD, suitable for website, social media, packaging, business cards and eCommerce branding.";

document.getElementById("result").value = prompt;

}

function copyPrompt() {

let text = document.getElementById("result");

if (text.value === "") {
    alert("Generate a logo prompt first.");
    return;
}

navigator.clipboard.writeText(text.value);

alert("Logo Prompt Copied Successfully!");

          }
