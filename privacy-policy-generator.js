function generatePolicy() {

let website = document.getElementById("website").value.trim();
let url = document.getElementById("url").value.trim();
let company = document.getElementById("company").value.trim();
let email = document.getElementById("email").value.trim();
let country = document.getElementById("country").value.trim();

if (website === "") {
    alert("Please enter Website Name");
    return;
}

let policy = "";

policy += "PRIVACY POLICY\n";
policy += "==============================\n\n";

policy += "Effective Date: " + new Date().toLocaleDateString() + "\n\n";

policy += "Welcome to " + website + ". This Privacy Policy explains how we collect, use and protect your personal information when you use our website.\n\n";

policy += "Website Name: " + website + "\n";
policy += "Website URL: " + (url || "Not Provided") + "\n";
policy += "Company: " + (company || website) + "\n";
policy += "Country: " + (country || "Not Specified") + "\n";
policy += "Contact Email: " + (email || "Not Provided") + "\n\n";

policy += "Information We Collect:\n";
policy += "• Name\n";
policy += "• Email Address\n";
policy += "• Contact Information\n";
policy += "• Device & Browser Information\n";
policy += "• Cookies & Analytics Data\n\n";

policy += "How We Use Your Information:\n";
policy += "• To provide our services\n";
policy += "• To improve website performance\n";
policy += "• To communicate with users\n";
policy += "• To ensure security and prevent fraud\n\n";

policy += "Data Protection:\n";
policy += "We use reasonable security measures to protect your information from unauthorized access.\n\n";

policy += "Third-Party Services:\n";
policy += "We may use trusted third-party services such as analytics and payment providers.\n\n";

policy += "Contact Us:\n";
policy += "If you have any questions regarding this Privacy Policy, please contact us at:\n";
policy += (email || "your@email.com");

document.getElementById("result").value = policy;

}

function copyPolicy() {

let result = document.getElementById("result");

if(result.value === ""){
    alert("Generate a Privacy Policy first.");
    return;
}

navigator.clipboard.writeText(result.value);

alert("Privacy Policy Copied Successfully!");

}
