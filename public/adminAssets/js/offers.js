document.addEventListener('DOMContentLoaded', () => {

    //::::::::::::::::::::::::::::::::::::::::::::://
    // Get the modals
    const editOfferModal = document.getElementById('editOfferModal');
    const productListModal = document.getElementById('productListModal');

    // Get the button that opens the product list modal
    const openProductListBtn = document.getElementById('ed-ofr-product-list');

    // Function to apply blur
    function applyBlur() {
        editOfferModal.classList.add('modal-blur');
    }

    // Function to remove blur
    function removeBlur() {
        editOfferModal.classList.remove('modal-blur');
    }

    // Apply blur when opening the product list modal
    if(openProductListBtn){

        openProductListBtn.addEventListener('click', applyBlur);
    }

    // Remove blur when closing the product list modal
    if(productListModal){

        productListModal.addEventListener('hidden.bs.modal', removeBlur);
    }


    $(document).ready(function () {
        $('#ed-ofr-product-list').on('click', function () {
            $('#editOfferModal').addClass('modal-blur');
        });

        $('#productListModal').on('hidden.bs.modal', function () {
            $('#editOfferModal').removeClass('modal-blur');
        });
    });

    //::::::::::::::::::::::::::::::::::::::::::::://


    // Function to display products
    /// This function will used for both.
    function displayProducts(result, updateOn) {

        if (updateOn === 'product') {

            const selectedValues = Array.from(productAddingField).map(option => option.value);
            // ${isSelected}
            prodProductsContainer.innerHTML = result.products.map(product => {

                let isSelected = '';
                let prodIsSelected = '';
                if (selectedValues.length > 0) {

                    checkIsSelected = selectedValues.filter(productId => productId == product._id).length === 1;
                    isSelected = checkIsSelected ? 'checked' : '';
                    prodIsSelected = checkIsSelected ? 'prodIsSelected' : '';
                }

                return `
                <a class="itemside pb-1 ${prodIsSelected} " id="pro-${product._id}" href="#">
                
                    <div class="left">
                        <img src="/ProductImage/${product.image[0]}" class="img-sm img-thumbnail" alt="Item">
                    </div>
                    <div class="info">
                        <h6 class="mb-0"> ${product.ProductName} </h6>
                        <input class="product-checkbox" hidden ${isSelected} type="checkbox" data-id="${product._id}" value="${product.ProductName}" id="pro-check-${product._id}">
                    </div>

                </a>
              
            `}).join('');

        } else if (updateOn === 'category') {

            const selectedValues = Array.from(categoryAddingField).map(option => option.value);

            catProductsContainer.innerHTML = result.categories.map(category => {

                let isSelected = '';
                if (selectedValues.length > 0) {

                    checkIsSelected = selectedValues.filter(categoryId => categoryId == category._id).length === 1;
                    isSelected = checkIsSelected ? 'checked' : '';
                }

                return `<div class="form-check">
                    <input class="form-check-input" ${isSelected} type="checkbox" data-id="${category._id}" value="${category.name}" id="category${category._id}">
                    <label class="form-check-label" for="category${category._id}">
                        ${category.name}
                    </label>
                </div>

            `}).join('');

        }
    }


    const prodOffSearchInput = document.getElementById('offStProductSearch');
    const prodOffpopup = document.getElementById('offStProductPopup');
    const prodProductsContainer = document.getElementById('offStProdRecentProducts');
    const productAddingField = document.getElementById('off-products');

    if (prodProductsContainer) {

        prodProductsContainer.addEventListener('click', function (event) {
            // Check if the event target is an <a> tag or a child of an <a> tag with the class 'itemside'
            const aTag = event.target.closest('a.itemside');

            if (aTag) {
                // Prevent the default action of the <a> tag (if needed)
                event.preventDefault();

                // Find the checkbox within the clicked <a> tag
                const checkbox = aTag.querySelector('.product-checkbox');

                if (checkbox) {

                    // Get the checkbox value
                    const productName = checkbox.value;
                    const productId = checkbox.dataset.id;
                    const isChecked = !checkbox.checked;

                    //Creating option and adding or removing accordingly to the input field.
                    if (isChecked) {
                        const option = document.createElement('option');
                        option.value = productId;
                        option.textContent = productName;
                        option.selected = true;
                        productAddingField.appendChild(option);
                        aTag.classList.add('prodIsSelected');
                    } else {
                        Array.from(productAddingField.options)
                            .forEach(option => {
                                if (option.value == productId) {
                                    productAddingField.removeChild(option);
                                }
                            })
                        aTag.classList.remove('prodIsSelected');
                    }

                    checkbox.checked = isChecked; // Toggle the checkbox state
                }
            }
        });

    }

    // Show prodOffpopup when the search input is focused
    if(prodOffSearchInput){

        prodOffSearchInput.addEventListener('focus', function () {
            prodOffpopup.style.display = 'block';
            if (!prodOffSearchInput.value) {
                prodSearchProducts('');
            }
        });
    }

    // Hide prodOffpopup when clicking outside
    document.addEventListener('click', function (event) {
        if (!prodOffSearchInput.contains(event.target) && !prodOffpopup.contains(event.target)) {
            prodOffpopup.style.display = 'none';
        }
    });

    // Add search functionality
    if(prodOffSearchInput){

        prodOffSearchInput.addEventListener('input', function () {
            if (this.value.trim() === '') {
                prodSearchProducts('');
            } else {
                prodSearchProducts(this.value);
            }
        });
    }

    // Function to search products
    async function prodSearchProducts(query) {
        // Here you would typically send the search query to your backend

        try {

            const response = await fetch(`/admin/offers/category?searchProd=${query}`);
            if (!response.ok) {
                throw new Error('Network response was not ok while trying to fetch search categories');
            }

            const data = await response.json();

            if (data.redirect) {

                window.location.href = data.redirect;
                return;

            } else if (!data.status) {

                prodOffpopup.style.display = 'none';
                return;
            }

            prodOffpopup.style.display = 'block';
            displayProducts(data, 'product');


        } catch (error) {

            console.error("Error occured while trying to get products search results.", error);
        }

    }

    /////////////////Above the product search and belewo the category search////////////////////////

    const catOffSearchInput = document.getElementById('offStCategorySearch');
    const catOffpopup = document.getElementById('offStCategoryPopup');
    const catProductsContainer = document.getElementById('offStCatRecentProducts');
    const categoryAddingField = document.getElementById('off-categories');

    if (catProductsContainer) {
        catProductsContainer.addEventListener('change', function (event) {

            if (event.target.classList.contains('form-check-input')) {
                // Handle the checkbox change event
                const checkbox = event.target;
                const isChecked = checkbox.checked;
                const categoryId = checkbox.dataset.id;
                const categoryName = checkbox.value;

                //Creating option and adding or removing accordingly to the input field.
                if (isChecked) {
                    const option = document.createElement('option');
                    option.value = categoryId;
                    option.textContent = categoryName;
                    option.selected = true;
                    categoryAddingField.appendChild(option);
                } else {
                    Array.from(categoryAddingField.options)
                        .forEach(option => {
                            if (option.value == categoryId) {
                                categoryAddingField.removeChild(option);
                            }
                        })
                }

            }

        })
    }


    // Show catOffpopup when the search input is focused
    if(catOffSearchInput){

        catOffSearchInput.addEventListener('focus', function () {
            catOffpopup.style.display = 'block';
            if (!catOffSearchInput.value) {
                catSearchProducts('');
            }
        });
    }

    // Hide catOffpopup when clicking outside
    document.addEventListener('click', function (event) {
        if (!catOffSearchInput.contains(event.target) && !catOffpopup.contains(event.target)) {
            catOffpopup.style.display = 'none';
        }
    });

    // Add search functionality
    if(catOffSearchInput){

        catOffSearchInput.addEventListener('input', function () {
            if (this.value.trim() === '') {
                catSearchProducts('');
            } else {
                catSearchProducts(this.value.trim());
            }
        });
    }

    // Function to search products
    async function catSearchProducts(query) {
        // Here you would typically send the search query to your backend


        try {

            const response = await fetch(`/admin/offers/category?searchCat=${query}`);
            if (!response.ok) {
                throw new Error('Network response was not ok while trying to fetch search categories');
            }

            const data = await response.json();

            if (data.redirect) {

                window.location.href = data.redirect;
                return;

            } else if (!data.status) {

                catOffpopup.style.display = 'none';
                return;
            }

            catOffpopup.style.display = 'block';
            displayProducts(data, 'category');


        } catch (error) {

            console.error("Error occured while trying to get category search results.", error);
        }

    }


    const offerMinPurchase = document.getElementById('off-min-purchase');
    const offApplicableOn = document.getElementById('off-applicable-on');
    const offer_applicable_error = document.getElementById('offer-applicable-error');
    if (offApplicableOn) {

        offApplicableOn.addEventListener('change', function (e) {

            const applicableOn = this.value;
            offApplicableOn.classList.remove('border-danger');
            offer_applicable_error.innerText = '';

            if (applicableOn === 'product') {

                prodOffSearchInput.removeAttribute('disabled');
                prodOffSearchInput.classList.add('border-info');
                catOffSearchInput.classList.remove('border-info');
                offerMinPurchase.classList.remove('border-info');
                if (!offApplicableOn.classList.contains('border-info')) {

                    offApplicableOn.classList.add('border-info');
                }

                if (!catOffSearchInput.hasAttribute('disabled')) {
                    catOffSearchInput.setAttribute('disabled', 'disabled');
                }
                Array.from(categoryAddingField.options)
                    .forEach(option => categoryAddingField.removeChild(option));

                if (!offerMinPurchase.hasAttribute('disabled')) {
                    offerMinPurchase.setAttribute('disabled', 'disabled');
                    offerMinPurchase.value = 0;
                }

            } else if (applicableOn === 'category') {

                catOffSearchInput.removeAttribute('disabled');
                catOffSearchInput.classList.add('border-info');
                prodOffSearchInput.classList.remove('border-info');
                offerMinPurchase.classList.remove('border-info');
                if (!offApplicableOn.classList.contains('border-info')) {

                    offApplicableOn.classList.add('border-info');
                }

                if (!prodOffSearchInput.hasAttribute('disabled')) {
                    prodOffSearchInput.setAttribute('disabled', 'disabled');
                }
                Array.from(productAddingField.options)
                    .forEach(option => productAddingField.removeChild(option));

                if (!offerMinPurchase.hasAttribute('disabled')) {
                    offerMinPurchase.setAttribute('disabled', 'disabled');
                    offerMinPurchase.value = 0;
                }

            } else if (applicableOn === 'cart') {

                offerMinPurchase.removeAttribute('disabled');
                offerMinPurchase.classList.add('border-info');
                prodOffSearchInput.classList.remove('border-info');
                catOffSearchInput.classList.remove('border-info');
                if (!offApplicableOn.classList.contains('border-info')) {

                    offApplicableOn.classList.add('border-info');
                }

                if (!prodOffSearchInput.hasAttribute('disabled')) {
                    prodOffSearchInput.setAttribute('disabled', 'disabled');
                }
                Array.from(productAddingField.options)
                    .forEach(option => productAddingField.removeChild(option));

                if (!catOffSearchInput.hasAttribute('disabled')) {
                    catOffSearchInput.setAttribute('disabled', 'disabled');
                }
                Array.from(categoryAddingField.options)
                    .forEach(option => categoryAddingField.removeChild(option));
            }
        })
    }

    function offerFormValidation() {

        let validation = true;

        const offer_title = document.getElementById('off-title').value;
        const offer_discount_type = document.getElementById('off-discount-type').value;
        const offer_discount_value = document.getElementById('off-discount-value').value;
        const offer_applicable_on = document.getElementById('off-applicable-on').value;
        const offer_min_purchase = document.getElementById('off-min-purchase').value;

        const offer_start_date = document.getElementById('off-start-date').value;
        const offer_end_date = document.getElementById('off-end-date').value;
        const startDate = new Date(offer_start_date);
        const endDate = new Date(offer_end_date);

        if (!offer_title) {

            offer_title_error.innerText = 'Please enter an offer name';
            validation = false;
        }

        if (!offer_discount_type) {

            offer_discount_error.innerText = "Please select a discount type";
            validation = false;
        }

        if (!offer_discount_value) {

            offer_disvalue_error.innerText = "Please enter a discount value";
            validation = false;
        } else if (offer_discount_value < 1) {

            offer_disvalue_error.innerText = "Minimum value is 1";
            validation = false;
        } else if ((offer_discount_type == 'percentage') && (offer_discount_value < 1 || offer_discount_value > 100)) {

            offer_disvalue_error.innerText = "Discount percentage must be between 0% and 100%";
            validation = false;
        }

        if (!offer_applicable_on) {

            offer_applicable_error.innerText = "Please select an option";
            validation = false;
        }

        if ((offer_min_purchase < 1) && (offer_applicable_on === 'cart')) {

            offer_min_purchase_error.innerText = "Minimum value is 1. ";
            validation = false;
        }

        const productArray = Array.from(productAddingField.options);
        if ((productArray.length < 1) && (offer_applicable_on === 'product')) {

            offer_add_product_error.innerText = 'Please add atleast 1 product';
            validation = false;
        }

        const categoryArray = Array.from(categoryAddingField.options);
        if ((categoryArray.length < 1) && (offer_applicable_on === 'category')) {

            offer_add_category_error.innerText = 'Please add atleast 1 category';
            validation = false;
        }

        if (!offer_start_date) {

            offer_startdate_error.innerText = "Please select a offer starting date.";
            validation = false;
        }

        if (!offer_end_date) {

            offer_enddate_error.innerText = "Please select a offer ending date.";
            validation = false;
        } else if (startDate > endDate) {

            offer_enddate_error.innerText = "Please select a date greater than starting date.";
            validation = false;
        }

        return validation;

    }

    const offer_start_date = document.getElementById('off-start-date');
    if (offer_start_date) {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        offer_start_date.setAttribute('min', minDate);
    }
    const offer_end_date = document.getElementById('off-end-date');
    if (offer_end_date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        offer_end_date.setAttribute('min', minDate);
    }
    const offer_title_error = document.getElementById('offer-title-error');
    const offer_discount_error = document.getElementById('offer-discount-error');
    const offer_disvalue_error = document.getElementById('offer-disvalue-error');

    const offer_min_purchase_error = document.getElementById('offer-min-purchase-error');
    const offer_startdate_error = document.getElementById('offer-startdate-error');
    const offer_enddate_error = document.getElementById('offer-enddate-error');

    const offer_add_category_error = document.getElementById('offer-add-category-error');
    const offer_add_product_error = document.getElementById('offer-add-product-error');

    const offer_create_form = document.getElementById('off-create-form');
    if (offer_create_form) {
        offer_create_form.addEventListener('submit', (function (e) {

            e.preventDefault();

            offer_title_error.innerText = '';
            offer_discount_error.innerText = '';
            offer_disvalue_error.innerText = '';
            offer_applicable_error.innerText = '';
            offer_min_purchase_error.innerText = '';
            offer_startdate_error.innerText = '';
            offer_enddate_error.innerText = '';
            offer_add_category_error.innerText = '';
            offer_add_product_error.innerText = '';

            const formIsValidated = offerFormValidation();

            if (formIsValidated) {

                this.submit();
            }
        }))
    }


})


//Edit offer
//:::::::::::::::::::::::::::::::::::::::::::::://

function listProductsWithOffer(products){

    try{

        const offerProductListContainer = document.getElementById('offer-product-list');

        offerProductListContainer.innerHTML = products.map(product => {

            return `
                <a class="itemside pb-1  " id="pro-${product._id}" href="#">
                
                    <div class="left">
                        <img src="/ProductImage/${product.image[0]}" class="img-sm img-thumbnail" alt="Item">
                    </div>
                    <div class="info">
                        <h6 class="mb-0"> ${product.ProductName} </h6>
                        
                    </div>

                </a>
              
        `}).join('');



    }catch(error){

        console.error('Error occured while trying to fetch the products.',error);
    }
}


async function editOfferDetails(offerId, offerType) {

    const openEditOffer = document.getElementById('openEditOffer');
    const offerTitle = document.getElementById('ed-ofr-title');
    const offerDiscountType = document.getElementById('ed-ofr-discountType');
    const offerDiscountValue = document.getElementById('ed-ofr-discountValue');
    const offerMinPurchase = document.getElementById('ed-ofr-minPurchase');
    const offerStartDate = document.getElementById('ed-ofr-startDate');
    const offerEndDate = document.getElementById('ed-ofr-endDate');
    const offerActivate = document.getElementById('ed-ofr-activate');
    const editOfferModalLongTitle = document.getElementById('editOfferModalLongTitle');

    const offerProductList = document.getElementById('ed-ofr-product-list');

    document.getElementById('ed-ofr-offerid').value = offerId;
    document.getElementById('ed-ofr-offerType').value = offerType;

    try {

        const response = await fetch(`/admin/offers/${offerId}?applicable_on=${offerType}`);
        if (!response.ok) {
            throw new Error("Network response was not ok while fetching offer data.");
        }

        const data = await response.json();
        if (!data.status) {
            console.log("Something went wrong while fetching offer details.");
        } else {

            openEditOffer.click();
           
            // offerProductList.setAttribute('onclick',`listProductsWithOffer('${offerId}')`);
            
            const startDate = new Date(data.offerDetails.startDate);
            const foramatedStartDate = startDate.toISOString().split('T')[0];
            const endDate = new Date(data.offerDetails.endDate);
            const foramatedEndDate = endDate.toISOString().split('T')[0];

            editOfferModalLongTitle.innerText = data.offerDetails.applicableOn + ' offer';
            offerTitle.value = data.offerDetails.title;
            offerDiscountType.value = data.offerDetails.discountType;
            offerDiscountValue.value = data.offerDetails.discountValue;
            offerMinPurchase.value = data.offerDetails.minPurchaseAmount;
            offerStartDate.value = foramatedStartDate;
            offerEndDate.value = foramatedEndDate;
            if (data.offerDetails.isActive) {

                offerActivate.checked = true;
            } else {

                offerActivate.checked = false;
            }

        
            listProductsWithOffer(data.offerDetails.products);

        }

    } catch (error) {

        console.error("Error occured while trying to fetch offer details.", error);
    }


}