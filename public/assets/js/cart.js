document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cart-item-size').forEach(select => {

        updateCartItem(select);
        select.dispatchEvent(new Event('change'));
    });
});

document.addEventListener('change', function (e) {
    if (!e.target.classList.contains('cart-item-size')) return;

    const select = e.target;
    const selectedOption = select.options[select.selectedIndex];

    const stock = Number(selectedOption.dataset.stock);

    const container = select.closest('.cart-item-options');
    const qtyInput = container.querySelector('.quantity-input');
    const stockInfo = container.querySelector('.stock-info');

    qtyInput.max = Math.min(stock, 4);

    if (Number(qtyInput.value) > qtyInput.max) {
        qtyInput.value = qtyInput.max;
    }

    stockInfo.textContent = stock > 0
        ? `${stock} left`
        : 'Out of stock';
});


function updateCartItem(select) {
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    const stock = Number(selectedOption.dataset.stock || 0);

    const container = select.closest('.cart-item-options');
    if (!container) return;

    const qtyInput = container.querySelector('.quantity-input');
    const stockInfo = container.querySelector('.stock-info');

    // set max quantity (example: limit to 4)
    const maxQty = Math.min(stock, 4);
    qtyInput.max = maxQty;

    // adjust quantity if invalid
    if (stock === 0) {
        qtyInput.value = 0;
        qtyInput.disabled = true;
        stockInfo.textContent = 'Out of stock';
    } else {
        qtyInput.disabled = false;

        if (Number(qtyInput.value) < 1) {
            qtyInput.value = 0;
        }

        if (Number(qtyInput.value) > maxQty) {
            qtyInput.value = maxQty;
        }

        stockInfo.textContent = `${stock} left`;
    }
}




async function loadCheckout() {

    try {
        const selectedCoupon = document.getElementById('addedCoupon').value;
        const response = await fetch(`/checkout?coupon=${selectedCoupon}`, { redirect: 'manual' });

        if (!response.ok) {
            throw new Error('Network response was not ok while removing product from cart');
        }
        const responseClone = response.clone();
        const data = await response.json();
        const textData = await responseClone.text();
        if (!data.status) {
            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
        } else if (data.redirect) {

            window.location.href = data.redirect;
        }

    } catch (error) {
        console.error("Error while going to checkout page", error.stack)
        Swal.fire('Error', 'There was a problem loading the checkout page', 'error');
    }
}




document.addEventListener('DOMContentLoaded', () => {
    // initialize stock & qty on load
    document.querySelectorAll('.cart-item-size').forEach(select => {
        updateStockAndQty(select);
    });
});

// event delegation
document.addEventListener('change', (e) => {
    if (
        e.target.classList.contains('cart-item-size') ||
        e.target.classList.contains('quantity-input')
    ) {
        handleCartChange(e.target);
    }
});

async function handleCartChange(element) {
    const container = element.closest('.cart-item-options');
    if (!container) return;

    const productId = container.dataset.productId;
    const sizeSelect = container.querySelector('.cart-item-size');
    const qtyInput = container.querySelector('.quantity-input');

    const selectedSize = sizeSelect.value;
    const quantity = Number(qtyInput.value);

    // update stock display if size changed
    if (element.classList.contains('cart-item-size')) {
        updateStockAndQty(sizeSelect);
    }

    const payload = {
        productId,
        size: selectedSize,
        quantity
    };

    selectedCoupon = document.getElementById('addedCoupon').value;

    fetch(`/cart?productId=${payload.productId}&size=${payload.size}&newQuantity=${payload.quantity}&coupon=${selectedCoupon}`, { method: "PATCH" })
        .then(response => {

            if (!response.ok) {
                throw new Error('Network response was not ok while selecting product.');
            }
            return response.json();
        })
        .then(data => {

            if ((data.status && data.discountAmount == 0) && selectedCoupon) {
                Swal.fire(
                    'Oops',
                    `Selected offer available only on ₹${data.minimumAmount}+ purchase`,
                    'error'
                )
                totalItemsInCart.textContent = `Total ${data.totalCartItems} inyour cart`;
                orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                orderSummary_GST.textContent = `₹ ${data.gst}`;
                orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                orderSummary_discount.textContent = `Discount 0%`;
                orderSummary_discountOffer.textContent = `₹ 0`
            } else if (data.status) {

                orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                orderSummary_GST.textContent = `₹ ${data.gst}`;
                orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                orderSummary_discount.textContent = `Discount ${data.discount}%`
                orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
            } else {

                if (data.message == "Max 4 items per product") {
                    Swal.fire(
                        'Oops',
                        `${data.message}`,
                        'error'
                    )
                    this.value = 4

                } else if (data.message == "Item quantity cannot be less than 1") {

                    this.value = 1
                    Swal.fire(
                        'Oops',
                        `${data.message}`,
                        'error'
                    )

                } else {

                    this.value = data.stock
                    Swal.fire(
                        'Oops',
                        `${data.message}`,
                        'error'
                    )

                }


            }

        })
        .catch(error => {
            console.error("Error while trying change item quantity", error.stack)
        })

}

function updateStockAndQty(select) {
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    const stock = Number(selectedOption.dataset.stock || 0);
    const container = select.closest('.cart-item-options');
    const qtyInput = container.querySelector('.quantity-input');
    const stockInfo = container.querySelector('.stock-info');

    const maxQty = Math.min(stock, 4);
    qtyInput.max = maxQty;

    if (stock === 0) {
        qtyInput.value = 0;
        qtyInput.disabled = true;
        stockInfo.textContent = 'Out of stock';
    } else {
        qtyInput.disabled = false;

        if (qtyInput.value < 1) qtyInput.value = 1;
        if (qtyInput.value > maxQty) qtyInput.value = maxQty;

        stockInfo.textContent = `${stock} left`;
    }
}



// Checkboxes
document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const productId = this.dataset.productId;
        selectedCoupon = document.getElementById('addedCoupon').value;

        // const isChecked = this.checked;

        fetch(`/cart?productId=${productId}&coupon=${selectedCoupon}`, { method: "PUT" })
            .then(response => {

                if (!response.ok) {
                    throw new Error('Network response was not ok while selecting product.');
                }
                return response.json();
            })
            .then(data => {

                if ((data.status && data.discountAmount == 0) && selectedCoupon) {
                    Swal.fire(
                        'Oops',
                        `Selected offer available only on ₹${data.minimumAmount}+ purchase`,
                        'error'
                    )
                    totalItemsInCart.textContent = `Total ${data.totalCartItems} inyour cart`;
                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                    orderSummary_discount.textContent = `Discount 0%`;
                    orderSummary_discountOffer.textContent = `₹ 0`
                } else if (data.status) {

                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                    orderSummary_discount.textContent = `Discount ${data.discount}%`
                    orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                }

            })

            .catch(error => {
                console.error("Error while trying select the product", error.stack)
            })

    });
});
