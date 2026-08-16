
/* ==========================================
   AI SELLER TOOLKIT
   GLOBAL COPY POPUP REMOVER
   ========================================== */

(function () {

    const originalAlert = window.alert;

    window.alert = function (message) {

        const text = String(message || "").toLowerCase();

        /*
         * Copy से जुड़े सभी success popup बंद करें
         */

        const copyMessages = [
            "copied successfully",
            "titles copied",
            "description copied",
            "product description copied",
            "bullet points copied",
            "complete product listing copied",
            "copied!"
        ];

        const isCopyMessage =
            copyMessages.some(function (item) {
                return text.includes(item);
            });

        /*
         * अगर Copy वाला message है
         * तो Popup मत दिखाओ
         */

        if (isCopyMessage) {

            console.log(
                "✅ Copy successful — Popup hidden."
            );

            return;
        }

        /*
         * बाकी सभी alert पहले की तरह काम करेंगे
         */

        originalAlert(message);

    };

})();
