


function swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Heads Up !!!',
            text: alertMsg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmMsg,
            cancelButtonText: 'No, cancel!',
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true,
            reverseButtons: true,
            padding: '2em',
            width: '32em'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: commitedHead,
                    text: commitedMsg,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                resolve(true);
            } else {
                Swal.fire(
                    safeMsg,
                    '',
                    'error'
                )
                resolve(false);
            }
        })
    });
}


function blockUser(userID){
    
    fetch(`http://localhost:2000/admin/customers/?id=${userID}`, {method : 'PATCH'})
    .then(response => {
    if(!response.ok){
        throw new Error("Network response was not ok")
    }
   
    return response.json();  
})
.then(data => {
    console.log('data recieved : ',data.userID);
    const btnId = document.getElementById(`blockBtn-${userID}`);
    console.log(btnId)
    console.log(data.isBlocked)
    if(data.isBlocked){
        btnId.textContent = 'Block';
        btnId.classList.add('blockBtn');
        btnId.classList.remove('unblockBtn');
        btnId.classList.remove('btn-success');
        btnId.classList.add('btn-warning')
    }else{
        btnId.textContent = 'unblock';
        btnId.classList.add('unblockBtn');
        btnId.classList.remove('blockBtn');
        btnId.classList.remove('btn-warning');
        btnId.classList.add('btn-success')

    }
                             
})
.catch(error => {
    console.log("There was a problem with the fetch operation of blocking user",error)
});

}



function deletUser(userID){

    console.log("Inside delete user");

    if(confirm("Are you sure you want to delete this user??")){
        
        fetch( `http://localhost:2000/admin/customers/?id=${userID}`, {method : 'delete'} )
        .then(response => {

            if(!response.ok){
                throw new Error("Network response was not ok")
            }

            return response.json();
        })
        .then(data => {

            console.log('data recieved : ',data)
                             
        })
        .catch(error => {
            console.log("There was a problem with the Deleting fetch operation",error)
        });
       
    }  
}


const btnForAddBrand = document.getElementById('btnForAddBrand');
if(btnForAddBrand){

    btnForAddBrand.addEventListener('click',() => {
    
        const inputForBrand = document.getElementById('inputForBrand').value ;
        if(inputForBrand){
            
            fetch(`http://localhost:2000/admin/category/?brand=${inputForBrand}`, {method : 'post'})
            .then(response => {
    
                if(!response.ok){
                    throw new Error("Network reponse was not ok")
                }
    
                return response.json();
            })
            .then(data => {
    
                console.log('data recieved : ',data)
                                 
            })
            .catch(error => {
                console.log("There was a problem while adding brand fetch operation",error)
            });
        
        }
    })
    


}


const category_form = document.getElementById('category-form');
if(category_form){

    category_form.addEventListener('submit',function(e){

        e.preventDefault();
        const formdata = new FormData(this);
        
        
        fetch(`http://localhost:2000/admin/category`,{
            method : 'post',
            body : new URLSearchParams(formdata) 
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Network response was not ok for post request of category submission");
            }
            return response.json();
        })
        .then(data => {
            if(data.status){
                window.location.href = "http://localhost:2000/admin/category"
            }else{

                Swal.fire({
                    title: 'Error!',
                    text: data.message,
                    icon: 'error'
                });
            }
            console.log("data recieved :",data)
        })
        .catch(error => {
            console.log("There was a problem while performing category submission.",error);
        })
    })
}


function listProduct(productID){

    fetch(`http://localhost:2000/admin/productslist?productID=${productID}`, {method : 'PATCH'})
    .then(response => {
        if(!response.ok){

            throw new Error("Network response was no ok for patch request of listProducts")
        }
        return response.json();
    })
    .then(data => {

        console.log('data recieved : ',data)
                         
    })
    .catch(error => {
        console.log("There was a problem while performing listProducts fetch operation",error)
    });
}




function listCategory(categoryID){

        fetch(`http://localhost:2000/admin/category/?categoryID=${categoryID}`, {method : 'PATCH'})
        .then(response => {
            if(!response.ok){

                throw new Error("Network response was no ok for patch request of listcategory")
            }
            return response.json();
        })
        .then(data => {

            if(data.status){

                Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success'
                });

            }else{
                Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success'
                });
            }
           
        })
        .catch(error => {
            console.log("There was a problem while performing listcategory fetch operation",error)
        });
}



document.addEventListener('DOMContentLoaded', function() {

    let openModalBtn = document.getElementById('openModalBtn');
    const modal_close_button = document.getElementById('modal-close-button');
    const imageCroper = document.getElementById('imageCroper');

    function openCropModal(index){
        
        document.querySelector('#btn-crop').dataset.index = index;
        
        const imgURL = URL.createObjectURL(selectedFiles[index]);
        imageCroper.src = imgURL;
        openModalBtn.click();

        if(window.cropperInstance){
            window.cropperInstance.destroy();
        }
        
        //Cropper Initializing here
        window.cropperInstance = new Cropper(imageCroper,{
            aspectRatio: 1,
            full: true, // Cover the whole image
            autoCropArea: false // Allow free expansion
        })
    }

    let selectedFiles = [];

    function updatePreview(){

        const previewContainer = document.getElementById('adImPreviewContainer');
        
        previewContainer.innerHTML = '';

        selectedFiles.forEach((file,index) => {

            if(file.type.startsWith('image/')){
                const reader = new FileReader();
                reader.onload = function(e){
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('adImPreviewImageContainer');

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('adImPreviewImage');
                    img.style.cursor = 'pointer';
                    img.onclick = () => openCropModal(index);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.classList.add('adImRemoveBtn');
                    removeBtn.onclick = () => removeFile(index);

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(removeBtn);
                    previewContainer.appendChild(imgContainer);
                }
                reader.readAsDataURL(file);
            }
        })        
    }

    function removeFile(index){
        selectedFiles.splice(index,1);
        updatePreview();
    }

    const adImFileInput = document.getElementById('adImFileInput');
    if(adImFileInput){
        adImFileInput.addEventListener('change',function(event){

            const newFiles = Array.from(event.target.files);
            Promise.all(newFiles.map(file => 
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(new Blob([e.target.result], {type: file.type}));
                    reader.readAsArrayBuffer(file);
                })
            )).then(blobFiles => {
                console.log(blobFiles);
                
                // Add new files to the selectedFiles array
                selectedFiles = [...selectedFiles, ...blobFiles];
                updatePreview();
            });
        });
    }
 
    const formDataForAddNewProduct = new FormData();

    const form = document.getElementById('formForAddNewProduct');
    
    const btn_crop =  document.querySelector('#btn-crop');
    if(btn_crop){

        btn_crop.addEventListener('click', () => {
     
            if (window.cropperInstance) {
    
                const croppedImages = window.cropperInstance.getCroppedCanvas();
                croppedImages.toBlob((blob) => {
    
                    if(blob){

                        // console.log(formDataForAddNewProduct);
                    
                        selectedFiles[btn_crop.dataset.index] = blob;
                        console.log(selectedFiles)
                        updatePreview();
                        modal_close_button.click();
                    }
    
                });
            }
        });
    }

    const product_name = document.getElementById('product_name');
    const product_name_error = document.getElementById('product_name-error');

    let validation = false;
    let alreadyExistName = false;
    async function isProductExist(productExist){
        
        product_name_error.classList.add('d-none');
        product_name_error.textContent = ""
        validation = true;         
        alreadyExistName = false;     
        let newValue = product_name.value;
        if(newValue.trim() === ''){
            product_name_error.classList.remove('d-none');
            product_name_error.textContent = "Give a product name"
            validation = false;
          
        }else{
            
            try{

                const response = await fetch(`http://localhost:2000/admin/productslist/add_new_product?product_name=${newValue.trim()}`,{method : 'post'});
                if(!response.ok){
                    throw new Error("Network response was not ok while fetching data to check product is exist.");
                }
    
                const data = await response.json();
                if(!data.status){
                   
                    product_name_error.classList.remove('d-none');
                    product_name_error.textContent = data.message
                    validation = false;
                    alreadyExistName = true;
                    
                    console.log(productExist,"This Product exist value in function jjj")
                    if(productExist){
                        return true;
                    }
                }
            }
            catch(error){
                console.log("Error while trying to fetch data to check if product is there.",error);
            }
        }
    }
    if(product_name){
        product_name.addEventListener('input',()=> {

            isProductExist(0);
        })
    }
    
    
    const regularPrice_error = document.getElementById('regularPrice-error');
    const salePrice_error = document.getElementById('salePrice-error');
    const stockQuantity_error = document.getElementById('stockQuantity-error');
    const descriptionOfProduct_error = document.getElementById('descriptionOfProduct-error');
    const targetGroup_error = document.getElementById('targetGroup-error');
    const category_error = document.getElementById('category-error');
    const brand_error = document.getElementById('brand-error');
    const img_adding_area = document.getElementById('img-adding-area');

    const publishNewProduct = async()=>{
        
            const isProduct = await isProductExist(1);
            
            if(!isProduct){
                
                let formValidation = true;
                regularPrice_error.textContent = "";
                salePrice_error.textContent = "";
                stockQuantity_error.textContent = "";
                product_name_error.textContent = "";
                descriptionOfProduct_error.textContent = "";
                targetGroup_error.textContent = "";
                category_error.textContent = "";
                brand_error.textContent = "";

                img_adding_area.style.color = 'grey';
                img_adding_area.innerText = 'Add product images here, Only image files(jpeg,png,webp) are allowed';

                product_name_error.classList.add('d-none');
    
                let regularPrice = document.getElementById('regularPrice').value.trim();
                let salePrice = document.getElementById('salePrice').value.trim();
                let stockQuantity = document.getElementById('stockQuantity').value.trim();
                let productName = product_name.value.trim();
                let descriptionOfProduct = document.getElementById('descriptionOfProduct').value.trim();
                let targetGroup = document.getElementById('targetGroup').value;
                let category = document.getElementById('category').value;
                let brand = document.getElementById('brand').value;
                
                if(selectedFiles.length === 0){
                    img_adding_area.style.color = 'red';
                    img_adding_area.innerText = "Please Select Product images by clicking here."
                    formValidation = false;
                }else if(selectedFiles.length < 3){
                    img_adding_area.style.color = 'red';
                    img_adding_area.innerText = "Please Select atleast 3 images."
                    formValidation = false;
                }
                if(!brand){
                    brand_error.textContent = "Select brand";
                    formValidation = false;
                }
                if(!category){
                    category_error.textContent = "Select category";
                    formValidation = false;
                }
                if(!targetGroup){
                    targetGroup_error.textContent = "Select target group";
                    formValidation = false;
                }
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
                if(productName === ""){
                    
                    product_name_error.textContent = "This field should not be empty.";
                    product_name_error.classList.remove('d-none');
                    formValidation = false;
                }else if(alreadyExistName){
    
                    product_name_error.classList.remove('d-none');
                    product_name_error.textContent = "A product is already exist in this name"
                }
    
                if(descriptionOfProduct === ""){
                    
                    descriptionOfProduct_error.textContent = "Please type something here";
                    formValidation = false;
                }
                
    
              
                if(validation && formValidation && !alreadyExistName){
    
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
                    
                    selectedFiles.forEach((blob, index) => {
                        formDataForAddNewProduct.append('image', blob, `croppedimage${index + 1}.png`);
                    });
                   
                    try{

                        const response = await fetch(`http://localhost:2000/admin/productslist/add_new_product`,{
                            method : 'post',
                            body : formDataForAddNewProduct
                        });
    
                        if(!response.ok){
        
                            Swal.fire({
                                title: 'Error!',
                                text: "Something Went wrong",
                                icon: 'error'
                            });
                            throw new Error('Network response was not ok in submission of new product.')
                        }
                        const data = await response.json();
                        if(!data.status){
    
                            Swal.fire({
                                title: 'Error!',
                                text: data.message,
                                icon: 'error'
                            });
    
                        }else{
        
                            Swal.fire({
                                title: '',
                                text: data.message,
                                icon: 'success'
                            });
                        }
                    }
                    catch(error){
                        console.log("There was a problem with submission of add new pRoduct operation",error)
                    };
                    
                }
            }else{
                
                Swal.fire({
                    title: 'Error!',
                    text: "Product is Already added!!",
                    icon: 'error'
                });
            }

           
    }


    const publishBtnForAddProduct = document.getElementById('publishBtnForAddProduct');
    if(publishBtnForAddProduct){
        const form = document.getElementById('formForAddNewProduct');

        publishBtnForAddProduct.addEventListener('click',() => {
            
            publishNewProduct();

        })
    
    }
    


    const categoryNameUpdate = document.getElementById('categoryNameUpdate'); 
    const categoryDescriptionUpdate = document.getElementById('categoryDescriptionUpdate'); 
    const btn_new_save = document.getElementById('btn-new-save');
    new_modal_close_button = document.getElementById('new-modal-close-button');
    let categoryUpdationCurrentInput = '';
    let td_des;
    let td_id;
    let td_name;
    
    //using event delegation  technique to select the button
    const tbodyCheckForCategories = document.getElementById('tbodyCheckForCategories');
    if(tbodyCheckForCategories){
        tbodyCheckForCategories.addEventListener('click',(e)=>{

            const button = e.target.closest('.catUpdateBtnParent .btn');
            if(button){
                categoryUpdationCurrentInput = button.id;
                categoryNameUpdate.value = button.dataset.category;
                categoryDescriptionUpdate.value = button.dataset.description;
                td_des = document.getElementById(`td-des-${categoryUpdationCurrentInput}`)
                td_id = document.getElementById(`td-id-${categoryUpdationCurrentInput}`)
                td_name = document.getElementById(`td-n-${categoryUpdationCurrentInput}`)
                
            }
        })
    }
    
  
    if(btn_new_save){
        btn_new_save.addEventListener('click',(e)=> {
           
            new_modal_close_button.click();

            fetch(`http://localhost:2000/admin/category?id=${categoryUpdationCurrentInput}&category_name=${categoryNameUpdate.value}&description=${categoryDescriptionUpdate.value}`,{method:"PUT"})
            .then(response => {
                if(!response.ok){
                    throw new Error("Network response was not ok")
                }
                return response.json()
            })
            .then(data => {

                if(data.status){
                    window.location.href = "http://localhost:2000/admin/category";
                }else{
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error'
                    });
                }
            })
        })
    }


    async function confirmReturnCommit(returnId,returnStatus) {

        let alertMsg = "This Action Cannot be undone.Please make sure!";
        let confirmMsg = 'Yes, do it!';
        let commitedMsg = "Fetch request sent";
        let commitedHead = false;
        let safeMsg = 'Cancelled';

        let takeConfirmation = await swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg)

        if(takeConfirmation){

            const response = await fetch(`http://localhost:2000/admin/returned-order`,{
                method : 'put',
                headers : {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({returnId,returnStatus})
            });

            if(!response.ok){
                throw new Error('Network response was not ok while updating the return status.');
            }

            const data = await response.json();

            if(data.status){
                
                Swal.fire({
                    title: '',
                    text: data.message,
                    icon: 'success'
                });

            }else{
             
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error'
                });
            }
        }

    }

    const selectReturnStatus = document.querySelectorAll('.selectReturnStatus');
    if(selectReturnStatus){

        selectReturnStatus.forEach(select => {

            select.addEventListener('change',(e)=> {

                const returnId = e.target.getAttribute('data-returnId');
                const returnStatus = e.target.value;
                console.log(returnId,"\n",returnStatus)
                if(returnStatus){
                    confirmReturnCommit(returnId,returnStatus);
                }
            })
        })
    }


}) //DOMContentLoaded


function getOrderDetails(orderid){

    window.location.href = `/admin/order-list/order-details?orderId=${orderid}`;
}
async function updateOrderStatus(orderId){

    const selectStatus = document.getElementById('selectStatus').value;

    try{
        
        if((selectStatus === 'Delivered') || (selectStatus === 'Cancelled')){

            let alertMsg = "This Action Cannot be undone.Please make sure!";
            let confirmMsg = 'Yes, do it!';
            let commitedMsg = 'Delivery status updated.';
            let commitedHead = 'Updated!';
            let safeMsg = 'Cancelled';

            let takeConfirmation = await swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg)
            if(!takeConfirmation){
                return
            }
        }
   
        const response = await fetch(`http://localhost:2000/admin/order-list/order-details?orderId=${orderId}&orderStatus=${selectStatus}`,{method : 'PATCH'});
        if(!response.ok){
            throw new Error('Network response was not ok while fetching operation of update order status.');
        }

        const data = await response.json();
     
        if(data.status && (data.orderstatus !== 'Delivered')){
            
            Swal.fire({
                title: '',
                text: data.message,
                icon: 'success'
            });

        }


    }catch(error){
        console.log("Error while fetching operation of update order status.",error);
    }
}



// function clearExistingRows() {
//     $('#UsersTable').empty(); // Remove all child elements from the element with ID 'Users'
//     //This is JQUERY
// }



// function fetchData(page){
//     console.log("Hellloo",page)
//     fetch(`http://localhost:2000/admin/customers/?page=${page}`)
//     .then(response => {
//     if(!response.ok){
//         throw new Error("Network response was not ok")
//     }
   
//     return response.json();  
// })
// .then(data => {
//     console.log('data recieved : ',data)
                             
// })
// .catch(error => {
//     console.log("There was a problem with the fetch operation",error)
// });

// }

// document.addEventListener('DOMContentLoaded',() => {
//     console.log("How are you")
//     fetchData(1);
// });

// const customerSearch = document.getElementById('customerSearch');
// customerSearch.addEventListener('input',(event) => {

//     const query = event.target.value;
//     fetchData(query)
// })

