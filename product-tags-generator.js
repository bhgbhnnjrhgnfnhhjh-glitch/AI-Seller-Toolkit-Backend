function generateTags() {

    const product =
        document.getElementById("product").value.trim();

    const result =
        document.getElementById("result");

    if (product === "") {
        alert("Please enter Product Name.");
        return;
    }

    const tags = [
        product,
        product + " Online",
        product + " Shopping",
        "Buy " + product,
        "Shop " + product,
        product + " Store",
        product + " Shop",
        product + " India",
        product + " Clothing",
        product + " Apparel",
        product + " Fashion",
        product + " Wear",
        product + " Collection",
        product + " Product",
        product + " Online Shopping",
        "Buy " + product + " Online",
        "Shop " + product + " Online",
        product + " for Shopping",
        product + " Online Store",
        product + " Marketplace"
    ];

    result.innerText =
        tags.map(function(tag, index) {
            return (index + 1) + ". " + tag;
        }).join("\n");
}


async function copyTags() {

    const result =
        document.getElementById("result");

    const text =
        result.innerText.trim();

    if (
        text === "" ||
        text === "Enter a product name and click Generate."
    ) {
        alert("पहले Product Tags generate करें।");
        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        alert("✅ Product Tags copied successfully!");

    } catch (error) {

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        alert("✅ Product Tags copied successfully!");
    }
    }
