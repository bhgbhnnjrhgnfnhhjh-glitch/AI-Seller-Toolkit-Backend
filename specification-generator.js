function generateSpecification() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let material = document.getElementById("material").value.trim();
let color = document.getElementById("color").value.trim();
let size = document.getElementById("size").value.trim();
let weight = document.getElementById("weight").value.trim();
let country = document.getElementById("country").value.trim();

if(product === ""){
    alert("Please enter Product Name");
    return;
}

let specification = "";

specification += "📋 PRODUCT SPECIFICATION\n";
specification += "========================\n\n";

specification += "Product Name : " + product + "\n";
specification += "Brand : " + (brand || "N/A") + "\n";
specification += "Material : " + (material || "N/A") + "\n";
specification += "Color : " + (color || "N/A") + "\n";
specification += "Size : " + (size || "N/A") + "\n";
specification += "Weight : " + (weight || "N/A") + "\n";
specification += "Country of Origin : " + (country || "N/A") + "\n\n";

specification += "Features:\n";
specification += "✔ Premium Quality\n";
specification += "✔ Durable & Long Lasting\n";
specification += "✔ Comfortable to Use\n";
specification += "✔ Stylish Design\n";
specification += "✔ Suitable for Daily Use\n";
specification += "✔ Ideal for Amazon, Flipkart, Meesho & Shopify Listings";

document.getElementById("result").value = specification;

}

function copySpecification() {

let result = document.getElementById("result");

if(result.value === ""){
    alert("Generate specification first.");
    return;
}

navigator.clipboard.writeText(result.value);

alert("Specification Copied Successfully!");

}
