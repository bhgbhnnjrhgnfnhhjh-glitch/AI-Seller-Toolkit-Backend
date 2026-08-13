/* =========================================
   FINAL PRODUCT RELEVANCE FILTER
========================================= */

const filteredKeywords = finalKeywords.filter(function(keyword) {

    const normalized =
        normalizeKeyword(keyword);

    /* Brand अकेला नहीं */
    if (
        exactBrand &&
        normalized === exactBrand
    ) {
        return false;
    }

    /* Category अकेली नहीं */
    if (
        exactCategory &&
        normalized === exactCategory
    ) {
        return false;
    }

    /*
     * Keyword में product का कम से कम
     * एक महत्वपूर्ण हिस्सा होना चाहिए।
     */
    const productWords =
        tokenizeExact(product);

    const keywordWords =
        tokenizeExact(keyword);

    const hasProductWord =
        productWords.some(function(word) {

            return keywordWords.includes(word);

        });

    if (!hasProductWord) {
        return false;
    }

    return true;

});

return filteredKeywords.slice(0, 20);
