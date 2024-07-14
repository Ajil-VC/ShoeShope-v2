
document.addEventListener('DOMContentLoaded', function() {
    
    const formDataForAddNewProduct = new FormData();

    let openModalBtn = document.getElementById('openModalBtn');
    const modal_close_button = document.getElementById('modal-close-button');

    const imageCroper = document.getElementById('imageCroper');
    const form = document.getElementById('formForAddNewProduct');
    let currentInputField = null;
    let imageBlobs = {};


                //**reader fn start here
                function ReadFileAndCropper(file,reader,imageCroper,openModalBtn,chooseimageElement){
                    
                    reader.onload = (event) => {
                      
                        var imageUrl = event.target.result;
                        
                        chooseimageElement.src = imageUrl;              
                        imageCroper.src = imageUrl ;
                        
                        openModalBtn.click();//Modal opening
                        
                        if(window.cropperInstance){
                            window.cropperInstance.destroy();
                        }
                        
                        
                        //Cropper Initializing here
                        window.cropperInstance = new Cropper(imageCroper,{
                            aspectRatio: 1,
                            full: true, // Cover the whole image
                            autoCropArea: false // Allow free expansion
                        })
                        
                        
                        currentInputField = chooseimageElement;
                    }
                    reader.readAsDataURL(file);
                }


        document.querySelectorAll('.addProduct-image-input').forEach(inputField => {
            
            inputField.addEventListener('change',(e) => {
                console.log("Thisise",e)
                let file = e.target.files[0];
                if(!file){
                    return;
                }
                let reader = new FileReader();
                ReadFileAndCropper(file,reader,imageCroper,openModalBtn,e.target.dataset.field);
            })

        })

    
    const btn_crop =  document.querySelector('#btn-crop');
    if(btn_crop){

        btn_crop.addEventListener('click', () => {
     
            if (window.cropperInstance) {
    
                const croppedImages = window.cropperInstance.getCroppedCanvas();
                croppedImages.toBlob((blob) => {
    
                    if(blob){
                        console.log(blob)
                        console.log(currentInputField,"This is the input ha")
                        console.log(formDataForAddNewProduct);
                        imageBlobs[currentInputField] = blob;
                        modal_close_button.click();

                        console.log(imageBlobs,"\nUpper one is arrya of blobs ");
                    }
    
                });
            }
        });
    }

    // const product_name = document.getElementById('product_name');
    // const product_name_error = document.getElementById('product_name-error');

    // let validation = false;
    // let alreadyExistName = false;
    // if(product_name){
    //     product_name.addEventListener('input',()=> {
    //         product_name_error.classList.add('d-none');
    //                 product_name_error.textContent = ""
    //         validation = true;         
    //         alreadyExistName = false;     
    //         let newValue = product_name.value;
    //         if(newValue.trim() === ''){
    //             product_name_error.classList.remove('d-none');
    //             product_name_error.textContent = "Give a product name"
    //             validation = false;
              
    //         }else{

    //             fetch(`http://localhost:2000/admin/productslist/add_new_product?product_name=${newValue.trim()}`,{method : 'post'})
    //             .then(response => {
    //                 if(!response.ok){
    //                     throw new Error("Network response was not ok while fetching data.");
    //                 }
    //                 return response.json();
    //             })
    //             .then(data =>{
    
    //                 if(!data.status){
                       
    //                     product_name_error.classList.remove('d-none');
    //                     product_name_error.textContent = data.message
    //                     validation = false;
    //                     alreadyExistName = true;
           
    //                 }
                                 
    //             })
    //         }

    //         console.log(validation)

    //     })
    // }
    
    
    const regularPrice_error = document.getElementById('regularPrice-error');
    const salePrice_error = document.getElementById('salePrice-error');
    const stockQuantity_error = document.getElementById('stockQuantity-error');
    // const descriptionOfProduct_error = document.getElementById('descriptionOfProduct-error');

    
    const publishBtnForAddProduct = document.getElementById('publishBtnForAddProduct');
    const productId = publishBtnForAddProduct.dataset.id;
    
    if(publishBtnForAddProduct){
        const form = document.getElementById('formForAddNewProduct');

        publishBtnForAddProduct.addEventListener('click',() => {

            let formValidation = true;
            regularPrice_error.textContent = "";
            salePrice_error.textContent = "";
            stockQuantity_error.textContent = "";
            // product_name_error.textContent = "";
            // descriptionOfProduct_error.textContent = "";
            // product_name_error.classList.add('d-none');

            let regularPrice = document.getElementById('regularPrice').value.trim();
            let salePrice = document.getElementById('salePrice').value.trim();
            let stockQuantity = document.getElementById('stockQuantity').value.trim();
            // let productName = product_name.value.trim();
            // let descriptionOfProduct = document.getElementById('descriptionOfProduct').value.trim();

            if(!/^[1-9]\d*$/.test(regularPrice)){
                
                regularPrice_error.textContent = "Must be a positive number.";
                formValidation = false;
            }
            if(!/^[1-9]\d*$/.test(salePrice)){
                
                salePrice_error.textContent = "Must be a positive number.";
                formValidation = false;
            }
            if(!/^[1-9]\d*$/.test(stockQuantity)){

                stockQuantity_error.textContent = "Must be a positive number.";
                formValidation = false;
            }
            // if(productName === ""){
                
            //     product_name_error.textContent = "This field should not be empty.";
            //     product_name_error.classList.remove('d-none');
            //     formValidation = false;
            // }else if(alreadyExistName){

            //     product_name_error.classList.remove('d-none');
            //     product_name_error.textContent = "A product is already exist in this name"
            // }

            // if(descriptionOfProduct === ""){
                
            //     descriptionOfProduct_error.textContent = "Please type something here";
            //     formValidation = false;
            // }
            

            
            if(formValidation){
                const category = document.getElementById('category').value;
                const brand = document.getElementById('brand').value;
              
                
                Array.from(form.elements).forEach(element => {
    
                    if(element.name && element.type !== 'file'){
                        formDataForAddNewProduct.append(element.name, element.value);
                    }
                })
    
    
                const hiddenCategory = document.createElement('input');
                const hiddenBrand = document.createElement('input');
    
                
                //Adding the hidden field to the form.
                hiddenCategory.type = 'hidden';
                hiddenCategory.name = 'category';
                hiddenCategory.value = category;
                
                hiddenBrand.type = 'hidden';
                hiddenBrand.name = 'brand';
                hiddenBrand.value = brand;
                
                formDataForAddNewProduct.append(hiddenCategory.name, hiddenCategory.value);
                formDataForAddNewProduct.append(hiddenBrand.name, hiddenBrand.value);
                
                Object.entries(imageBlobs).forEach(([key, blob], index) => {
                    formDataForAddNewProduct.append('image', blob, `croppedimage${index + 1}.png`);
                });

                
                fetch(`http://localhost:2000/admin/productslist/edit_product?productId=${productId}`,{
                    method : 'PUT',
                    body : formDataForAddNewProduct
                })
                .then(response => {
                    if(!response.ok){
    
                        Swal.fire({
                            title: 'Error!',
                            text: "Something Went wrong",
                            icon: 'error'
                        });
                        throw new Error('Network response was not ok in submission of new product.')
                    }
                    return response.json();
                })
                .then(data => {
                    
                    if(!data.status){
    
                        Swal.fire({
                            title: 'Error!',
                            text: data.message,
                            icon: 'error'
                        });
    
                    }else{
    
                        // Swal.fire({
                        //     title: '',
                        //     text: data.message,
                        //     icon: 'success'
                        // });
                        window.location.href = data.redirect;
                    }
                                     
                })
                .catch(error => {
                    console.log("There was a problem with submission of add new pRoduct operation",error)
                });
            }
 

        })
    
    }
    


 

}) //DOMContentLoaded
