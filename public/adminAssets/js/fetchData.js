

function swalConfirm() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Heads Up !!!',
            text: "This Action Cannot be undone.Please make sure",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, do it!',
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
                    title: 'Updated!',
                    text: 'Delivery status updated.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                resolve(true);
            } else {
                Swal.fire(
                    'Cancelled',
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

            console.log('data recieved : ',data)
                             
        })
        .catch(error => {
            console.log("There was a problem while performing listcategory fetch operation",error)
        });
}



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
    

    

    const publishBtnForAddProduct = document.getElementById('publishBtnForAddProduct');
    if(publishBtnForAddProduct){

        const form = document.getElementById('formForAddNewProduct');

        publishBtnForAddProduct.addEventListener('click',() => {

            const category = document.getElementById('category').value;
            const brand = document.getElementById('brand').value;
          
            
            Array.from(form.elements).forEach(element => {

                if(element.name && element.type !== 'file'){
                    formDataForAddNewProduct.append(element.name, element.value);
                    console.log(formDataForAddNewProduct)
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
           
            
            fetch('http://localhost:2000/admin/productslist/add_new_product',{
                method : 'post',
                body : formDataForAddNewProduct
            })
            .then(response => {
                if(!response.ok){

                    Swal.fire({
                        title: 'Error!',
                        text: "Looks like You have already added the product",
                        icon: 'error'
                    });
                    throw new Error('Network response was not ok in submission of new product.')
                }
                return response.json();
            })
            .then(data => {
                console.log('data recieved : ',data,data.message)
                Swal.fire({
                    title: '',
                    text: data.message,
                    icon: 'success'
                });
                                 
            })
            .catch(error => {
                console.log("There was a problem with submission of add new pRoduct operation",error)
            });
    

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
           
            console.log(categoryUpdationCurrentInput)
            new_modal_close_button.click();

            fetch(`http://localhost:2000/admin/category?id=${categoryUpdationCurrentInput}&category_name=${categoryNameUpdate.value}&description=${categoryDescriptionUpdate.value}`,{method:"PUT"})
            .then(response => {
                if(!response.ok){
                    throw new Error("Network response was not ok")
                }
                return response.json()
            })
            .then(data => {

                // let td_des;
                // let td_id;
                // let td_name;
                console.log("Data",data.name)
                td_name.textContent = data.name;
                console.log("This is ",data)
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

        if(selectStatus === 'Delivered'){

            let takeConfirmation = await swalConfirm()
            if(!takeConfirmation){
                return
            }
        }
        console.log("Hahaaha")
        const response = await fetch(`http://localhost:2000/admin/order-list/order-details?orderId=${orderId}&orderStatus=${selectStatus}`,{method : 'PATCH'});
        if(!response.ok){
            throw new Error('Network response was not ok while fetching operation of update order status.');
        }

        const data = await response.json();
        console.log(data);
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

