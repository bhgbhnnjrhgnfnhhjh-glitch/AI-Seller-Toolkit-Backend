function generateCaption() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let offer = document.getElementById("offer").value.trim();
let platform = document.getElementById("platform").value;

if (product === "") {
    alert("Please enter Product Name");
    return;
}

let caption =
"✨ " + product + " by " + (brand || "Our Brand") + "\n\n" +
"🔥 Premium Quality\n" +
"💯 Best for Everyday Use\n" +
"🛍 Perfect Choice for Smart Shopping\n\n";

if (offer !== "") {
    caption += "🎉 Offer: " + offer + "\n\n";
}

caption +=
"📱 Platform: " + platform + "\n\n" +
"👉 Order Now!\n\n" +
"#" + product.replace(/\s+/g,"") +
" #" + (brand.replace(/\s+/g,"") || "Brand") +
" #Shopping #Sale #Trending #Amazon #Flipkart #Meesho #India";

document.getElementById("result").value = caption;

}

function copyCaption() {

let text = document.getElementById("result");

if (text.value === "") {
    alert("Generate a caption first.");
    return;
}

navigator.clipboard.writeText(text.value);

alert("Caption Copied Successfully!");

}
