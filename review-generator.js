function generateReview() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let customer = document.getElementById("customer").value.trim();
let rating = document.getElementById("rating").value;

if (product === "") {
    alert("Please enter Product Name");
    return;
}

let review = "";

if(customer !== ""){
review += "Review by: " + customer + "\n\n";
}

review += rating + "\n\n";

review +=
"I purchased the " + product + " by " +
(brand || "this brand") +
" and I am very satisfied with its quality.\n\n";

review +=
"The product is made with premium quality materials. It is comfortable, durable, stylish and perfect for everyday use. The finishing is excellent and the value for money is outstanding.\n\n";

review +=
"Pros:\n";
review += "✔ Premium Quality\n";
review += "✔ Comfortable & Durable\n";
review += "✔ Stylish Design\n";
review += "✔ Value for Money\n";
review += "✔ Highly Recommended\n\n";

review += "Overall Rating: " + rating;

document.getElementById("result").value = review;

}

function copyReview() {

let text = document.getElementById("result");

if(text.value === ""){
alert("Generate a review first.");
return;
}

navigator.clipboard.writeText(text.value);

alert("Review Copied Successfully!");

}
