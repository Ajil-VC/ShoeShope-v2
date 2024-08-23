document.addEventListener('DOMContentLoaded', ()=> {


    async function fetchRecentProducts(){

        let products = [
            {id: 1, name: 'Product 1'},
            {id: 2, name: 'Product 2'},
            {id: 3, name: 'Product 3'},
            {id: 4, name: 'Product 4'},
            {id: 5, name: 'Product 5'}
        ];

        displayProducts(products, 'recentProd');
     
    }

    // async function fetchRecentCategories(){

    //     let products = [
    //         {id: 1, name: 'Product 6'},
    //         {id: 2, name: 'Product 7'},
    //         {id: 3, name: 'Product 8'},
    //         {id: 4, name: 'Product 9'},
    //         {id: 5, name: 'Product 10'}
    //     ];

    //     displayProducts(products, 'recentCat');

    // }



    // Function to display products
    /// This function will used for both.
    function displayProducts(products, updateOn) {

        if(updateOn === 'recentProd'){

            prodProductsContainer.innerHTML = products.map(product => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${product.id}" id="product${product.id}">
                    <label class="form-check-label" for="product${product.id}">
                        ${product.name}
                    </label>
                </div>
            `).join('');

        }else if(updateOn === 'recentCat'){

            catProductsContainer.innerHTML = products.categories.map(product => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${product.name}" id="product${product._id}">
                    <label class="form-check-label" for="product${product._id}">
                        ${product.name}
                    </label>
                </div>
            `).join('');

        }
    }



    const prodOffSearchInput = document.getElementById('offStProductSearch');
    const prodOffpopup = document.getElementById('offStProductPopup');
    const prodProductsContainer = document.getElementById('offStProdRecentProducts');

    // Show prodOffpopup when the search input is focused
    prodOffSearchInput.addEventListener('focus', function() {
        prodOffpopup.style.display = 'block';
        if (!prodOffSearchInput.value) {
            fetchRecentProducts();
        }
    });

    // Hide prodOffpopup when clicking outside
    document.addEventListener('click', function(event) {
        if (!prodOffSearchInput.contains(event.target) && !prodOffpopup.contains(event.target)) {
            prodOffpopup.style.display = 'none';
        }
    });



    // Add search functionality
    prodOffSearchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            fetchRecentProducts();
        } else {
            prodSearchProducts(this.value);
        }
    });

    // Function to search products
    async function prodSearchProducts(query) {
        // Here you would typically send the search query to your backend
        // For this example, we'll use a dummy search function
        const allProducts = [
            {id: 1, name: 'Product 1'},
            {id: 2, name: 'Product 2'},
            {id: 3, name: 'Product 3'},
            {id: 4, name: 'Product 4'},
            {id: 5, name: 'Product 5'},
            {id: 6, name: 'Another Product'},
            {id: 7, name: 'Special Item'},
            {id: 8, name: 'Unique Thing'}
        ];

        const searchResults = allProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );

        displayProducts(searchResults, 'recentProd');
    }

    /////////////////////////////////////////

    const catOffSearchInput = document.getElementById('offStCategorySearch');
    const catOffpopup = document.getElementById('offStCategoryPopup');
    const catProductsContainer = document.getElementById('offStCatRecentProducts');

    // Show catOffpopup when the search input is focused
    catOffSearchInput.addEventListener('focus', function() {
        catOffpopup.style.display = 'block';
        if (!catOffSearchInput.value) {
            catSearchProducts('');
        }
    });

    // Hide catOffpopup when clicking outside
    document.addEventListener('click', function(event) {
        if (!catOffSearchInput.contains(event.target) && !catOffpopup.contains(event.target)) {
            catOffpopup.style.display = 'none';
        }
    });

    // Add search functionality
    catOffSearchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            catSearchProducts('');
        } else {
            catSearchProducts(this.value);
        }
    });

    // Function to search products
    async function catSearchProducts(query) {
        // Here you would typically send the search query to your backend
        // For this example, we'll use a dummy search function

        try{

            const response = await fetch(`/admin/offers/category?searchCat=${query}`);
            if(!response.ok){
                throw new Error('Network response was not ok while trying to fetch search categories');
            }
    
            const data = await response.json();
            if(!data.status){
    
                catOffpopup.style.display = 'none';
                console.log("Data not found.");
                return;
            }
    
            console.log("This is the data:\n",data);

            catOffpopup.style.display = 'block';
            displayProducts(data, 'recentCat');

            
        }catch(error){
            console.error("Error occured while trying to get category search results.",error);
        }

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
        }else if(offer_discount_value < 1){

            offer_disvalue_error.innerText = "Minimum value is 1";
            validation = false;
        }else if((offer_discount_type == 'percentage') && (offer_discount_value <1 || offer_discount_value > 100)){

            offer_disvalue_error.innerText = "Discount percentage must be between 0% and 100%";
            validation = false;
        }

        if (!offer_applicable_on) {

            offer_applicable_error.innerText = "Please select an option";
            validation = false;
        }

        if (offer_min_purchase < 0) {

            offer_min_purchase_error.innerText = "Minimum value is 0. ";
            validation = false;
        }

        if (!offer_start_date) {

            offer_startdate_error.innerText = "Please select a offer starting date.";
            validation = false;
        }

        if (!offer_end_date) {

            offer_enddate_error.innerText = "Please select a offer ending date.";
            validation = false;
        }else if(startDate > endDate){

            offer_enddate_error.innerText = "Please select a date greater than starting date.";
            validation = false;
        }

        return validation;

    }

    const offer_start_date = document.getElementById('off-start-date');
    if(offer_start_date){
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
    const offer_applicable_error = document.getElementById('offer-applicable-error');
    const offer_min_purchase_error = document.getElementById('offer-min-purchase-error');
    const offer_startdate_error = document.getElementById('offer-startdate-error');
    const offer_enddate_error = document.getElementById('offer-enddate-error');

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

            const formIsValidated = offerFormValidation();

            if (formIsValidated) {
                this.submit();
            }
        }))
    }


})