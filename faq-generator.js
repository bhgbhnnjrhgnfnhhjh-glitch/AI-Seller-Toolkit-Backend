function generateFAQ() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let material = document.getElementById("material").value.trim();
let gender = document.getElementById("gender").value.trim();

if(product === ""){
    alert("Please enter Product Name");
    return;
}

let faq = `Q1. What is this product?
A. ${product} by ${brand}.

Q2. What material is used?
A. ${material}.

Q3. Who is this product suitable for?
A. ${gender}.

Q4. Is it suitable for daily use?
A. Yes, it is comfortable and perfect for daily use.

Q5. Is it easy to wash?
A. Yes, it is easy to wash and maintain.

Q6. Is the product durable?
A. Yes, it is made with premium quality materials.

Q7. Where can I buy this product?
A. You can buy it online from Amazon, Flipkart, Meesho, Shopify and other marketplaces.

Q8. Why should I choose this product?
A. It offers premium quality, stylish design and excellent value for money.`;

document.getElementById("result").value = faq;

}

function copyFAQ() {

let text = document.getElementById("result");

text.select();
text.setSelectionRange(0, 99999);

document.execCommand("copy");

alert("FAQ Copied Successfully!");

}
