function generateEmail() {

let emailType = document.getElementById("emailType").value;
let recipient = document.getElementById("recipient").value.trim();
let product = document.getElementById("product").value.trim();
let company = document.getElementById("company").value.trim();
let offer = document.getElementById("offer").value.trim();

if (recipient === "" || product === "") {
    alert("Please enter Recipient Name and Product/Subject.");
    return;
}

let email = "";

if (emailType === "Product Promotion") {

email =
"Subject: Special Offer on " + product + "\n\n" +

"Dear " + recipient + ",\n\n" +

"We are excited to introduce our premium " + product + ". ";

if (offer !== "") {
email += "Enjoy our limited-time offer: " + offer + ". ";
}

email +=

"\n\nThank you for choosing " + (company || "our company") + ". We look forward to serving you.\n\nBest Regards,\n" + (company || "Our Team");

}

else if (emailType === "Order Confirmation") {

email =
"Subject: Order Confirmation - " + product + "\n\n" +

"Dear " + recipient + ",\n\n" +

"Thank you for your order. Your order for " + product + " has been successfully confirmed.\n\nWe appreciate your trust in " + (company || "our company") + ".\n\nBest Regards,\n" + (company || "Support Team");

}

else if (emailType === "Customer Support") {

email =
"Subject: Support for " + product + "\n\n" +

"Dear " + recipient + ",\n\n" +

"Thank you for contacting us. We have received your request regarding " + product + " and our support team will get back to you shortly.\n\nBest Regards,\nCustomer Support\n" + (company || "");

}

else if (emailType === "Thank You") {

email =
"Subject: Thank You!\n\n" +

"Dear " + recipient + ",\n\n" +

"Thank you for choosing " + (company || "our company") + ". We truly appreciate your support and hope you enjoy your " + product + ".\n\nBest Regards,\n" + (company || "Our Team");

}

else {

email =
"Subject: Follow-up Regarding " + product + "\n\n" +

"Dear " + recipient + ",\n\n" +

"We hope you are enjoying your " + product + ". We would love to hear your feedback and answer any questions you may have.\n\nBest Regards,\n" + (company || "Our Team");

}

document.getElementById("result").value = email;

}

function copyEmail() {

let result = document.getElementById("result");

if (result.value === "") {
alert("Generate an email first.");
return;
}

navigator.clipboard.writeText(result.value);

alert("Email Copied Successfully!");

    }
