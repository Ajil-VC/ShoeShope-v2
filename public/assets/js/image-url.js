window.productImageUrl = function (image) {
    if (!image) {
        return '';
    }

    return /^https?:\/\//i.test(image)
        ? image
        : `/ProductImage/${encodeURIComponent(image)}`;
};
