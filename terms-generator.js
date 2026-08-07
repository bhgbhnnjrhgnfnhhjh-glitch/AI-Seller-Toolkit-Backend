function generateTerms() {

let website = document.getElementById("website").value.trim();
let url = document.getElementById("url").value.trim();
let company = document.getElementById("company").value.trim();
let email = document.getElementById("email").value.trim();
let country = document.getElementById("country").value.trim();

if (website === "") {
    alert("Please enter Website Name");
    return;
}

let terms = "";

terms += "TERMS & CONDITIONS\n";
terms += "==============================\n\n";

terms += "Effective Date: " + new Date().toLocaleDateString() + "\n\n";

terms += "Welcome to " + website + ". By accessing and using this website, you agree to comply with the following Terms & Conditions.\n\n";

terms += "Website Name: " + website + "\n";
terms += "Website URL: " + (url || "Not Provided") + "\n";
terms += "Company: " + (company || website) + "\n";
terms += "Country: " + (country || "Not Specified") + "\n";
terms += "Contact Email: " + (email || "Not Provided") + "\n\n";

terms += "1. Use of Website\n";
terms += "Users must use this website only for lawful purposes.\n\n";

terms += "2. Products & Services\n";
terms += "We reserve the right to modify, update or discontinue any product or service without prior notice.\n\n";

terms += "3. Payments\n";
terms += "All payments are subject to applicable terms and verification.\n\n";

terms += "4. Intellectual Property\n";
terms += "All content, logos, images and text available on this website are the property of " + (company || website) + ".\n\n";

terms += "5. Limitation of Liability\n";
terms += "We are not responsible for any indirect or consequential damages arising from the use of this website.\n\n";

terms += "6. Changes to Terms\n";
terms += "We may update these Terms & Conditions at any time without prior notice.\n\n";

terms += "7. Contact Us\n";
terms += "For any questions regarding these Terms & Conditions, please contact us at:\n";
terms += (email || "your@email.com");

document.getElementById("result").value = terms;

}

function copyTerms() {

let result = document.getElementById("result");

if (result.value === "") {
    alert("Generate Terms & Conditions first.");
    return;
}

navigator.clipboard.writeText(result.value);

alert("Terms & Conditions Copied Successfully!");

}
