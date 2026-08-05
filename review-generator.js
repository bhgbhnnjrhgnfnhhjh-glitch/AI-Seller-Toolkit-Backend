function generateReview() {

let product = document.getElementById("product").value.trim();
let brand = document.getElementById("brand").value.trim();
let rating = document.getElementById("rating").value;
let style = document.getElementById("style").value;

if(product===""){
alert("Please enter Product Name");
return;
}

let review = rating + "\n\n";

review += "Product: " + product + "\n";
review += "Brand: " + brand + "\n\n";

if(style==="Professional"){

review += "I purchased the " + product + " by " + brand + " and I am very satisfied with its quality. The product is comfortable, durable and worth the price. Highly recommended.";

}else if(style==="Customer Experience"){

review += "I have been using this product for a few days and my experience has been excellent. The quality is impressive and I would definitely recommend it.";

}else if(style==="Short Review"){

review += "Excellent quality, stylish design and great value for money. Highly recommended!";

}else{

review += "The " + product + " from " + brand + " exceeded my expectations. It is made with quality materials, offers great comfort, and has an attractive design. Overall, it is an excellent choice for daily use and provides outstanding value for money.";

}

document.getElementById("result").value = review;

}

function copyReview(){

let result=document.getElementById("result");

if(result.value===""){
alert("Generate a review first.");
return;
}

navigator.clipboard.writeText(result.value);

alert("Review Copied Successfully!");

}
