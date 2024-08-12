
document.addEventListener('DOMContentLoaded',function() {


    function addDynamicCardsToWishlist(){
        const heart_icon = document.querySelectorAll('.heart-icon');
        if(heart_icon){

            heart_icon.forEach(heart => {

                heart.addEventListener('click',function() {
                    
                    const wishlist_toggle = heart.querySelector('.wishlist-toggle');
                    const productId = this.dataset.id;
                    const isRemoveCard = this.dataset.card;

                    fetch(`http://localhost:2000/wishlist?productId=${productId}`,{method : "PATCH",headers : {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }})
                    .then(response => {

                        if(!response.ok){

                            if(response.status == 401){
                                return window.location.href = '/login';
                            }

                            throw new Error('Network response was not ok while adding product to the wishlist.')
                        }
                        return response.json();
                    })
                    .then(data => {

                        if(data.redirect){
                            window.location.href = data.redirect;
                            return
                        }
                        if(data.status && data.add == 1){
                            wishlist_toggle.classList.add('active');
                        }else if(data.status && data.add == -1){
                            wishlist_toggle.classList.remove('active');
                            if(isRemoveCard == 'remove'){
                                const itemCardInWishlist = document.getElementById(productId);
                                itemCardInWishlist.remove();

                                const totalItemsInWishlist = document.getElementById('totalItemsInWishlist');
                                totalItemsInWishlist.innerText =  `Total ${data.itemsLeftInWishlist} items in your wishlist`
                            }
                        }
                        
                    })
                    .catch(error =>{
                        console.log("Error while trying add product to wishlist",error)
                    })
                })
            })
        }
    }

    function makeProductCard(product){
        
        return `
            <div class="col-lg-4 col-md-4 col-12 col-sm-6">
                <div class="product-cart-wrap mb-30">
                    <div class="product-img-action-wrap">
                        <div class="product-img product-img-zoom">
                            <a href="/product_details/?product_id=${product._id}">
                                <img class="default-img" src="/ProductImage/${product.image[0]}" alt="">
                                <img class="hover-img" src="/ProductImage/${product.image[1]}" alt="">
                            </a>
                        </div>
                                                
                        
                        <div class="heart-icon" data-id=${product._id}>
                         
                            <div class="wishlist-toggle" aria-label="Add to Wishlist">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </div>


                        </div>

                        <div class="product-badges product-badges-position product-badges-mrg">

                            <span class="hot d-flex align-items-center">4.4<img src="/assets/imgs/star.svg" class="mx-1" style="width: 15px;" alt="">| 1k </span>
                        </div>
                    </div>
                    <div class="product-content-wrap">
                                              
                        <h2><a>${product.ProductName}</a></h2>
                                            
                        <div class="product-price">
                            <span>₹ ${product.salePrice} </span>
                            <span class="old-price" style="color: rgb(255, 123, 0);" >₹ ${product.salePrice}</span>
                        </div>
                                               
                    </div>
                </div>
            </div>
        `
    }


    function createPagination(i, curPage, ulElement,targetGroup){

        const li = document.createElement('li');
        li.classList.add('page-item', 'showcase-page-number');
        if(i == curPage){
            li.classList.add('active');
        }else{
            li.setAttribute('data-group',targetGroup);
            li.setAttribute('data-page_num',`${i}`);
        }

        const a = document.createElement('a');
        a.classList.add('page-link');
        a.innerText = `${i}`;

        li.appendChild(a);
        li.addEventListener('click',function() {

            const pageNum = this.getAttribute('data-page_num');
            const targetGroup = this.getAttribute('data-group');

            if(pageNum){

                selections.pageNumber = pageNum;
                updateSearch(targetGroup,selections);
            }
            
        });
        ulElement.appendChild(li);

    }
    
    // const searchProducts = async(home_product_grid, searchKey) =>{

    //     try{

    //         const response = await fetch(`http://localhost:2000/search_products?searchkey=${searchKey}`);
    //         if(!response.ok){
    //             throw new Error('Network response was not ok while fetching products.'); 
    //         }
    //         const data = await response.json();
    //         if(data.status){

    //             home_product_grid.innerHTML = data.products.map(item => makeProductCard(item)).join('');

    //         }else{
    //             home_product_grid.innerHTML = data.message;
    //         }
    //         console.log(data);

    //     }catch(error){
    //         console.log("Error occured while fetching products.",error);
    //     }
    // }

    // const user_product_search = document.getElementById('user_product_search');
    // if(user_product_search){
    //     const home_product_grid = document.getElementById('home-product-grid');
    //     user_product_search.addEventListener('keypress',(e)=> {

    //         if(e.key = 'Enter'){
    //             const query = e.target.value.trim();
    //             window.location.href = `http://localhost:2000/search_products?searchkey=${query}`;
    //         }
    //         const searchKey = user_product_search.value.trim();
    //         searchProducts(home_product_grid, searchKey);
    //     } )
    // }

    function updateShowcase(target_products_parent,products,totalPages,currentPage,targetGroup){

        const showcase_ul = document.getElementById('showcase-ul');
        const showcase_page_number = document.querySelectorAll('.showcase-page-number');
        showcase_page_number.forEach(list => {
            list.remove()
        });

        target_products_parent.innerHTML = products.map(item => makeProductCard(item)).join('');
        addDynamicCardsToWishlist();

        for(let i = 1 ; i <= totalPages; i++){

            createPagination(i,currentPage,showcase_ul,targetGroup);
        }
    }

    function updateSearch(targetGroup,selections){
      
        const selectedBrands = selections.brands;
        const selectedCategories = selections.category;
        const sortValue = selections.sortvalue;
        const pageNumber = selections.pageNumber;
    
        let brands = [];
        let categories = [];
        if(selectedBrands){
            brands = Object.keys(selectedBrands);
            var brandQuerypara = brands.join(',');
        }
        if(selectedCategories){
            categories = Object.keys(selectedCategories);
            var categoryQuerypara = categories.join(',');
        }
      
        const target_products_parent = document.getElementById('target-products');

        fetch(`http://localhost:2000/showcase?group=${targetGroup}&brands=${encodeURIComponent(brandQuerypara)}&categories=${encodeURIComponent(categoryQuerypara)}&sortValue=${sortValue}&page=${pageNumber}`,{
            headers:{  'Accept': 'application/json' }
        })
        .then(response => {
            if(!response.ok){
    
                throw new Error("Network response was not ok for while performing advanced search")
            }
            return response.json();
        })
        .then(data => {
    
            if(data.status){

                target_products_parent.innerHTML = ""; 
                updateShowcase(target_products_parent,data.products,data.totalPages,data.currentPage, targetGroup);
            }else{

                target_products_parent.innerHTML = "";
                target_products_parent.textContent = data.message;

                const showcase_page_number = document.querySelectorAll('.showcase-page-number');
                    showcase_page_number.forEach(list => {
                    list.remove()
                });
            }
                             
        })
        .catch(error => {
            console.log("There was a problem while performing Advanced search",error)
        });

    }


    const checkedBrands = {};
    const checkedCategory = {};
    const selections = {};
    let targetGroup = '';
    const brandCheckBox = document.querySelectorAll('.showcase-brand');
    const categoryCheckBox = document.querySelectorAll('.showcase-category');
    brandCheckBox.forEach(checkbox => {

        checkbox.addEventListener('change',function() {

            const brand = this.getAttribute('data-brand');
            const isChecked = this.checked;
            targetGroup = this.getAttribute('data-group');                

            if(isChecked){
                checkedBrands[brand] = true;
            }else{
                delete checkedBrands[brand];
            }

            selections.brands = checkedBrands;
            selections.pageNumber = 1;
            updateSearch(targetGroup,selections);
        })
   })

   categoryCheckBox.forEach(checkbox => {

        checkbox.addEventListener('change',function() {

            const category = this.getAttribute('data-category');
            const isChecked = this.checked;
            targetGroup = this.getAttribute('data-group');

            if(isChecked){
                checkedCategory[category] = true;
            }else{
                delete checkedCategory[category];
            }

            selections.category = checkedCategory;
            selections.pageNumber = 1;
            updateSearch(targetGroup,selections);
        })
   })

   const sortLtoH = document.getElementById('sortLtoH');
   const sortHtoL = document.getElementById('sortHtoL');

   if(sortLtoH){

       sortLtoH.addEventListener('change',function() {
    
            if(sortLtoH.checked){
                sortHtoL.checked = false;
                selections.sortvalue = 1;
            }else{
                selections.sortvalue = 0;
    
            }
            targetGroup = this.getAttribute('data-group');
            selections.pageNumber = 1;
            updateSearch(targetGroup,selections);
            
       })
   }
   if(sortHtoL){

       sortHtoL.addEventListener('change',function() {
    
            if(sortHtoL.checked){
                sortLtoH.checked = false;
                selections.sortvalue = -1;
            }else{
                selections.sortvalue = 0;
            }
            targetGroup = this.getAttribute('data-group');
            selections.pageNumber = 1;
            updateSearch(targetGroup,selections);
    
       })
   }

   const showcase_page_number = document.querySelectorAll('.showcase-page-number');
   if(showcase_page_number){

        showcase_page_number.forEach(element => {
            
            element.addEventListener('click',function() {

                const pageNum = this.getAttribute('data-page_num');
                const targetGroup = this.getAttribute('data-group');

                if(pageNum){

                    selections.pageNumber = pageNum;
                    updateSearch(targetGroup,selections);
                }
                
            })
        });
   }

})//DOMContentLoaded ends here