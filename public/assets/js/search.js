
document.addEventListener('DOMContentLoaded',function() {


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
                                                
                        <div class="heart-icon ">
                            <a aria-label="Add to Wishlist" href="#"><i class="fi-rs-heart"></i></a>
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



    function updateShowcase(target_products_parent,products){

        target_products_parent.innerHTML = products.map(item => makeProductCard(item)).join('');
    }

    function updateSearch(targetGroup,selections){
      
        const selectedBrands = selections.brands;
        const selectedCategories = selections.category;
        const sortValue = selections.sortvalue;
    
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
      
        if((brands.length === 0) && (categories.length === 0) && sortValue === 0 ){
            window.location.href = `http://localhost:2000/showcase?group=${targetGroup}`;
            return;
        }

        const target_products_parent = document.getElementById('target-products');

        fetch(`http://localhost:2000/showcase?group=${targetGroup}&brands=${encodeURIComponent(brandQuerypara)}&categories=${encodeURIComponent(categoryQuerypara)}&sortValue=${sortValue}`,{
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
                updateShowcase(target_products_parent,data.products);
            }else{

                target_products_parent.innerHTML = "";
                target_products_parent.textContent = data.message;
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
            updateSearch(targetGroup,selections);
    
       })
   }

})//DOMContentLoaded ends here