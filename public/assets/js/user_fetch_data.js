
$(document).ready(function(){

    $('.zoom_image').each(function() { 

        $(this).ezPlus({
            scrollZoom: true
        });
    })
});




function moveToNext (current,nextField){

    if(current.value.length >= current.maxlength){
        document.getElementById(nextField).focus();
    }

}

const otp_submit_btn = document.getElementById('otp-submit-bn');
const otp_success_msg = document.getElementById('otp-success-msg');
const otp_timer = document.getElementById('otp-timer');
const resend_otp = document.getElementById('resend-otp')

function startTimer(){    
    let timeLeft = 55 ;
    function updateTimer() {
        if(timeLeft > 1 ){
            timeLeft-- ;
            otp_timer.textContent = timeLeft + 'sec'; 
            setTimeout(updateTimer,1000)
        }else{
            otp_timer.textContent = 'Time is up'
            // otp_success_msg.remove();
            otp_success_msg.textContent = ""
            otp_submit_btn.setAttribute('hidden',true)
            
            resend_otp.removeAttribute('hidden');
            resend_otp.disabled = false;
        }
    }
    setTimeout(updateTimer,1000)
}



if(resend_otp){

    resend_otp.addEventListener('click',() => {
    
        fetch('http://localhost:2000/resend_otp')
        .then(response =>{
            console.log(response)
            if(!response.ok){
                throw new Error('Network Response was not ok while sending otp');
            }
     
           return response.json();
            
        })
        .then(data => {
    
            if(data.success){
    
            resend_otp.setAttribute('hidden', true);
            otp_submit_btn.removeAttribute('hidden');
           
            otp_success_msg.textContent = data.message;
            otp_success_msg.classList.remove('text-danger')
            otp_success_msg.classList.add('text-success')
    
            startTimer();
    
            }
        })
        .catch(error => {
            console.log("There was a problem While resending otp",error)
        });
        resend_otp.disabled = true;
    })
}



const otp_form = document.getElementById('otp-form');
if(otp_submit_btn){
    
    otp_submit_btn.addEventListener('click',(e) =>{
        
        e.preventDefault();
    
        let otp = '';
        for(let i = 1 ; i <= 5 ; i++ ){
            otp += document.getElementById('otp'+i).value;
        }
        console.log(typeof otp,"Type of otp",otp)
        let intOTP = parseInt(otp);
        console.log(intOTP,typeof intOTP)
        let hidden_otp = document.createElement('input');
            hidden_otp.type = 'hidden';
            hidden_otp.name = 'otp';
            hidden_otp.value = intOTP ;
            console.log("Consoling from frontend",otp)
            const otpformData = new FormData(otp_form);
            //Checking down
            console.log(typeof hidden_otp.value,"Type")
            otp_form.appendChild(hidden_otp);
            let urlEncodedData = new URLSearchParams(otpformData);
                       
            fetch('http://localhost:2000/signup/verify-otp',{method : 'POST',headers: {
                'Content-Type': 'application/x-www-form-urlencoded'},body : urlEncodedData })
            .then(response => {
                
                if(!response.ok){
                    
                    Swal.fire({
                        title: 'Internal Server Error!',
                        text: "Try again later",
                        icon: 'error'
                    });
                    throw new Error('Network response was not ok while submitting otp.');
                }
                return response.json();
            })
            .then(data => {

                console.log("Data recieved: ",data);
                if(!data.status){
        
                    otp_success_msg.classList.remove('text-success')
                    otp_success_msg.classList.add('text-danger')
                    otp_success_msg.textContent = data.message;
                }else{
        
                    window.location.href = "http://localhost:2000/home"
                }
        
            })
            .catch(error =>{
                console.log("Error while trying to submit otp",error)
            })
            otp_form.removeChild(hidden_otp);
    })
}

   
    
function passwordValidation(password) {

    const validatedPassword = {}

    if(!password){
            
        validatedPassword.message = "Please give password";
        validatedPassword.status = false;
        return validatedPassword;

    }else if(!/[A-Z]/.test(password)){
            
        validatedPassword.message = "Password Should Contain atleast 1 Uppercase";
        validatedPassword.status = false;
        return validatedPassword;

    }else if(!/[a-z]/.test(password)){
        
        validatedPassword.message = "Password Should Contain atleast 1 Lowercase";
        validatedPassword.status = false;
        return validatedPassword;

    }else if(!/\d/.test(password)){
        
        validatedPassword.message = "Password Should Contain a number";
        validatedPassword.status = false;
        return validatedPassword;
    
    }else if(!/^.{5,}$/.test(password)){
        
        validatedPassword.message = "Password Should Contain 5 charecters minimum";
        validatedPassword.status = false;
        return validatedPassword;
    
    }else if(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(password)){
        
        validatedPassword.message = "";
        validatedPassword.status = true;
        return validatedPassword;
     
    }

}
    


//Form validation for registration and submission
const firstNameError = document.getElementById('firstNameError');
const emailError = document.getElementById('emailError');
const mobError = document.getElementById('mobError');
const passwordError = document.getElementById('passwordError');
const confirm_passwordError = document.getElementById('confirm-passwordError');
Reg_pass = document.getElementById('Reg-pass');

let Reg_pass_value;
let valid = true;
const passwordCheck = {condition : false,msg : ""};
if(Reg_pass){

    Reg_pass.addEventListener('input',(event) => {

        Reg_pass_value = Reg_pass.value.trim();
        
        const validatedResult = passwordValidation(Reg_pass_value);
        passwordError.textContent = validatedResult.message;    
        passwordCheck.msg = validatedResult.message;
        passwordCheck.condition = validatedResult.status;

    })
}


const registrationForm = document.getElementById('registrationForm');
if(registrationForm){

    registrationForm.addEventListener('submit',function(event) {
        console.log("This is registration")
        event.preventDefault();
    
        let Reg_firstName = document.getElementById('Reg-firstName').value.trim();
        let Reg_email = document.getElementById('Reg-email').value.trim();
        let Reg_mob = document.getElementById('Reg-mob').value.trim();
        let Confirm_Reg_pass = document.getElementById('Confirm-Reg-pass').value.trim();
        Reg_pass_value = Reg_pass.value.trim();
        
        firstNameError.textContent = "";
        emailError.textContent = "";
        mobError.textContent = "";
        passwordError.textContent = "";
        confirm_passwordError.textContent = "";
    
        valid =true;
    
        if (!Reg_firstName ){
            
            firstNameError.textContent = "This field cant be empty"
            valid = false;
        }else if(!/^[a-zA-Z\s]+$/.test(Reg_firstName)){
                    
            firstNameError.textContent = "Only letters and spaces"
            valid = false;
        }
        
        if(!Reg_email){
            
            emailError.textContent = "This field can't be empty"
            valid = false;
        }else if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Reg_email)){
            
            emailError.textContent = "Enter a valid email id"
            valid = false;
        }
        
        if(!Reg_mob){
            
            mobError.textContent = "This field can't be empty"
            valid = false;
        }else if(!/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(Reg_mob)){
            
            mobError.textContent = "Please give a proper mobile number"
            valid = false;
        }
        
        if(!Reg_pass_value){
        
            passwordError.textContent = "This field cant be empty"
            valid = false;
        }else if(!passwordCheck.condition){
            passwordError.textContent = passwordCheck.msg
            valid = false;
        }
      
        if(!Confirm_Reg_pass){
            confirm_passwordError.textContent = "This field cant be empty"
            valid = false;
        }else if(Reg_pass_value != Confirm_Reg_pass){
            confirm_passwordError.textContent = "Password must be same as above"
            valid = false;
        }
    
        if(valid ){
    
            this.submit();
        }
    
    })
}



async function makeDefaultAddress(AddressId){
    
    if(!AddressId){
        console.log("Didnt get the Address Id");
        return ;
    }
  

    try{

        const response = await fetch(`http://localhost:2000/profile/address?AddressID=${AddressId}`,{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
              }
        });

        if(!response.ok){
            throw new Error('Network response was not ok while making default address');
        }

        const data = await response.json();
        console.log(data);
        // window.location.reload();
        let currentUrl = window.location.href;
        let currentFragment = window.location.hash;

        if(!currentFragment){
            currentFragment = '#address'
        }

        window.location.href = currentUrl;
        window.location.hash = currentFragment;

        Swal.fire({
            title: '',
            text: "Successfully made as new address",
            icon: 'success'
        });
        

    }catch(error){
        console.log("There was a problem with making default address",error)
    }

}


function swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Are you sure?',
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
                    'Cancelled',
                    safeMsg,
                    'error'
                )
                resolve(false);
            }
        })
    });
}

async function deleteAddress(addressID){

    try{

        let alertMsg = "You won't be able to revert this!";
        let confirmMsg = 'Yes, delete it!';
        let commitedMsg = 'Your file has been deleted.';
        let commitedHead = 'Deleted!';
        let safeMsg = 'Your address is safe :)'

        let confirmDeletion = await swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg);
        if(confirmDeletion){
            
            const response = await fetch(`http://localhost:2000/profile/address?AddressID=${addressID}`,{method:"DELETE"});
            if(!response.ok){
                throw new Error('Network response was not ok while deleting the address');
            }
            const data = await response.json();
       
            if(data.status){

                Swal.fire({
                    title: '',
                    text: "Successfully Deleted",
                    icon: 'success'
                });
                let currentURL = window.location.href;
                window.location.href = currentURL;
            }

        }
        
    }catch(error){
        console.log("There wa a problem while deleting address.",error)
    }
}


const newPassword = document.getElementById("newPassword");
const newPasswordConfirm = document.getElementById('newPasswordConfirm');
const changePasswordBtn = document.getElementById('changePasswordBtn');
let confirmPasswordError = document.getElementById('confirmPasswordError');
if(changePasswordBtn){

    changePasswordBtn.disabled = true;
}
let newPasswordValue;
if(newPassword){
    let newPasswordError = document.getElementById('newPasswordError');
    let confirmPasswordValue 
    newPassword.addEventListener('input',()=> {
        confirmPasswordValue = newPasswordConfirm.value;
        newPasswordValue = newPassword.value.trim();
        console.log("First",newPasswordValue,confirmPasswordValue)

        const validatedResult = passwordValidation(newPasswordValue);
        newPasswordError.textContent = validatedResult.message;
        changePasswordBtn.disabled = !validatedResult.status;

        if(newPasswordValue != confirmPasswordValue){
            confirmPasswordError.textContent = "Password Must be same as above"
            changePasswordBtn.disabled = true;
        }else{
            confirmPasswordError.textContent = "";
            changePasswordBtn.disabled = false;
        }
        

    })
}
if(newPasswordConfirm){
    
    newPasswordConfirm.addEventListener('input',()=> {
        let confirmPasswordValue = newPasswordConfirm.value;

        if(confirmPasswordValue != newPasswordValue){
            confirmPasswordError.textContent = "Password Must be same as above"
            changePasswordBtn.disabled = true;
        }else{
            confirmPasswordError.textContent = "";
            changePasswordBtn.disabled = false;
        }
    })
}

//Existing password
// const chage_password_form = document.getElementById('chage-password-form');
// if(chage_password_form){

//     chage_password_form.addEventListener('submit',(e)=> {
//         e.preventDefault();
//         console.log(newPassword.value.trim(),"HAHAHAHA")
//     })
// }



async function updateAddress(addressID){
    event.preventDefault();
    const modal = document.getElementById('editAddressModalCenter');
    try{
        $(modal).modal('show')

        //Need to complete this
    }catch(error){
        console.log("Error occured while editing address",error)
    }
}


async function addProductToCart(productId){
    
    console.log("ProductID",productId)
    const response = await fetch(`http://localhost:2000/product_details?product_id=${productId}`,{method : "post",headers : {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }},);

    if(!response.ok){
        throw new Error('Network response was not ok while adding product to cart');
    }

    const data = await response.json();
    if(data.redirect){  
        return window.location.href = data.redirect;
    }else if(data.status){
    
        const IdForaddToCartFn = document.getElementById('IdForaddToCartFn');
        // const IdForGoToCartFn = document.getElementById('IdForGoToCartFn');
        if(IdForaddToCartFn){
            IdForaddToCartFn.textContent = "Go to cart"
            IdForaddToCartFn.removeAttribute('onclick');
            IdForaddToCartFn.addEventListener('click',()=> {
                window.location.href = "http://localhost:2000/cart"
            })
        }
    }
}

function goToCart(){
    window.location.href = "http://localhost:2000/cart"
}
 

const totalItemsInCart = document.getElementById('totalItemsInCart');
const orderSummary_quantity = document.getElementById('orderSummary-quantity');
const orderSummary_subTotal = document.getElementById('orderSummary-subTotal');
const orderSummary_GST = document.getElementById('orderSummary-GST');
const orderSummary_totalAmount = document.getElementById('orderSummary-totalAmount');
const orderSummary_discount = document.getElementById('orderSummary-discount');
const orderSummary_discountOffer = document.getElementById('orderSummary-discountOffer');

async function removeProductFromCart(productId){
    
    let alertMsg = "You won't be able to revert this!";
    let confirmMsg = 'Yes, remove it!';
    let commitedMsg = '1 item has been removed from cart.';
    let commitedHead = 'Removed!';
    let safeMsg = 'Item is safe in cart :)';

    const selectedCoupon = document.getElementById('addedCoupon').value;

    let confirmDeletion = await swalConfirm(alertMsg,confirmMsg,commitedMsg,commitedHead,safeMsg);
    try{
        if(confirmDeletion){

            const response = await fetch(`http://localhost:2000/cart?productId=${productId}&coupon=${selectedCoupon}`,{method : "delete"});
            if(!response.ok)                  {
                throw new Error('Network response was not ok while removing product from cart');
            }
            const data = await response.json();
            if(data.status){
                
                const itemTileId = document.getElementById(`itemTileId-${productId}`);
                itemTileId.remove();
                if(data.totalCartItems > 0){

                    if((data.status && data.discountAmount == 0) && selectedCoupon ){
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
                        orderSummary_discountOffer.textContent = `₹ 0`;

                    }else if(data.status){

                        totalItemsInCart.textContent = `Total ${data.totalCartItems} inyour cart`;
                        orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                        orderSummary_GST.textContent = `₹ ${data.gst}`;  
                        orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                        orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                        orderSummary_discount.textContent = `Discount ${data.discount}%`
                        orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                    }
                }else{
                    totalItemsInCart.textContent = "Your Cart is empty";
                    orderSummary_subTotal.textContent = `₹ 0`;
                    orderSummary_GST.textContent = `₹ 0`;  
                    orderSummary_totalAmount.textContent = `₹ 0`;
                    orderSummary_quantity.textContent = "No items item added";
                    orderSummary_discount.textContent = `Discount 0%`
                    orderSummary_discountOffer.textContent = `₹ 0`
                }
               
            }

        }

    }catch(error){

        console.log("Error while fetching operation of remove product from cart");
    }
}


// Add Coupon
var selectedCoupon = null;
const form_check_input = document.querySelectorAll('.form-check-input');
if(form_check_input){

    form_check_input.forEach(radio => {

        radio.addEventListener('change', (e) => {

            selectedCoupon = e.target.value;
        })
    })
}


async function addCoupon(selectedCoupon){


    try{

        const response = await fetch(`http://localhost:2000/cart/addcoupon?coupon=${selectedCoupon}`,{method : 'PATCH'});
        if(!response.ok){
            throw new Error("Network response was not ok while adding coupon.");
        }
    
        const data = await response.json();
        if(data.status && data.discountAmount == 0 ){
            Swal.fire(
                'Oops',
                `Selected offer available only on ₹${data.minimumAmount}+ purchase`,
                'error'
            )
            orderSummary_discount.textContent = `Discount 0%`;
        }else if(data.status && data.discountAmount > 0 ){
            
            orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
            orderSummary_GST.textContent = `₹ ${data.gst}`;  
            orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
            orderSummary_discount.textContent = `Discount ${data.discount}%`;
            orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`;
        }

    }catch(error){
        console.log("Error while trying to add coupn",error)
    }

}


const btn_addCoupon_save = document.getElementById('btn-addCoupon-save');
const addCoupon_modal_close_button = document.getElementById('addCoupon-modal-close-button');
if(btn_addCoupon_save){

    btn_addCoupon_save.addEventListener('click',()=> {
        
        addCoupon(selectedCoupon);
        document.getElementById('addedCoupon').value = selectedCoupon;
        addCoupon_modal_close_button.click();
    })

}

async function loadCheckout() {
    
    try{
        const selectedCoupon = document.getElementById('addedCoupon').value;
        const response = await fetch(`http://localhost:2000/checkout?coupon=${selectedCoupon}`,{ redirect: 'manual' });

        if(!response.ok)                  {
            throw new Error('Network response was not ok while removing product from cart');
        }
        const responseClone = response.clone();
        const data = await response.json();
        const textData = await responseClone.text();
        if(!data.status){
            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
        }else if(data.redirect){
            
            window.location.href = data.redirect;
        }

    }catch(error){
        console.log("Error while going to checkout page")
        Swal.fire('Error', 'There was a problem loading the checkout page', 'error');
    }
}




const returnProduct = async(productOrderId, orderId) =>{

    console.log("This is productOrderId:",productOrderId,"\norderId: ",orderId,"End");

    const { value: reason } = await Swal.fire({
        title: "Are you sure? Want to return the product?",
        input: "select",
        inputOptions: {
        
            size_issue: 'Shoe size is different.',
            defective_product: 'its damaged',
            uncomfort: 'The shoe is uncomfirtable to wear',
            appearance_issue: "Appearance is not as expected",
            not_liked: 'I didnt like the product'
      
        },
        inputPlaceholder: "Please tell us the reason, click here",
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value === "") {
                resolve("Please select a reason.");
            } else {
                resolve();
            }
          });
        }
      });
      if (reason) {
        // Swal.fire(`You selected: ${reason}`);
        const response = await fetch(`http://localhost:2000/profile/returnproduct?return_item_id=${productOrderId}&order_id=${orderId}&reason=${reason}`,{method : 'post'});
        
        if(!response.ok){

            throw new Error('Network response was not ok while initiating the return');
        }      
        const data = await response.json();
        if(!data.status) {

            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
            return;
        }else{

            Swal.fire(
                'Success',
                `${data.message}`,
                'success'
            )
            return;

        }
      }
   
}

document.addEventListener('DOMContentLoaded', function() {
    

    //Add to wishlist starts here.
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
                        }
                    }
                    
                })
                .catch(error =>{
                    console.log("Error while trying add product to wishlist",error)
                })
            })
        })
    }


    // Checkboxes
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const productId = this.dataset.productId;
            selectedCoupon = document.getElementById('addedCoupon').value;
            
            // const isChecked = this.checked;

            fetch(`http://localhost:2000/cart?productId=${productId}&coupon=${selectedCoupon}`,{method : "PUT"})
            .then(response => {
                
                if(!response.ok){
                    throw new Error('Network response was not ok while selecting product.');
                }
                return response.json();
            })
            .then(data => {

                if((data.status && data.discountAmount == 0) && selectedCoupon ){
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
                }else if(data.status){

                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;  
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                    orderSummary_discount.textContent = `Discount ${data.discount}%`
                    orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                }
        
            })
         
            .catch(error =>{
                console.log("Error while trying select the product",error)
            })
    
        });
    });


    //Quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.dataset.productId;
            const newQuantity = this.value;
            selectedCoupon = document.getElementById('addedCoupon').value;
            console.log(`Quantity for product ${productId} changed to ${newQuantity}`);

            fetch(`http://localhost:2000/cart?productId=${productId}&newQuantity=${newQuantity}&coupon=${selectedCoupon}`,{method : "PATCH"})
            .then(response => {
                
                if(!response.ok){
                    throw new Error('Network response was not ok while selecting product.');
                }
                return response.json();
            })
            .then(data => {

                if((data.status && data.discountAmount == 0) && selectedCoupon ){
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
                }else if(data.status){

                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;  
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                    orderSummary_discount.textContent = `Discount ${data.discount}%`
                    orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                }else{
                    
                    if(data.message == "Max 4 items per product"){
                        Swal.fire(
                            'Oops',
                            `${data.message}`,
                            'error'
                        )
                        this.value = 4

                    }else if(data.message == "Item quantity cannot be less than 1"){

                        this.value = 1
                        Swal.fire(
                            'Oops',
                            `${data.message}`,
                            'error'
                        )

                    }else{

                        this.value = data.stock
                        Swal.fire(
                            'Oops',
                            `${data.message}`,
                            'error'
                        )

                    }
                    console.log("Something wrong with selecting product there is no data")
                 
                }
        
            })
            .catch(error =>{
                console.log("Error while trying change item quantity",error)
            })
            
        });
    });


     //Size inputs
     document.querySelectorAll('.cart-item-size').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.dataset.productId;
            const shoeSize = this.value;
            console.log(`size of  product ${productId} changed to ${shoeSize}`);

            fetch(`http://localhost:2000/cart?productId=${productId}&shoeSize=${shoeSize}`,{method : "PATCH"})
            .then(response => {
                
                if(!response.ok){
                    throw new Error('Network response was not ok while changing the size.');
                }
            })
            .catch(error =>{
                console.log("Error while trying change item size",error)
            })

        })
    })


    
    const dAddress_adType = document.getElementById('dAddress-adType');
    const dAddress_ldMark = document.getElementById('dAddress-ldMark');
    const dAddress_place = document.getElementById('dAddress-place');
    const dAddress_city_pin = document.getElementById('dAddress-city-pin');
    const dAddress_dt_st = document.getElementById('dAddress-dt-st');
    const dAddress_mob = document.getElementById('dAddress-mob');
    let selectedAddressId ;
    
    const addressContainer = document.querySelector('.address-container');
    if(addressContainer){

        addressContainer.addEventListener('click', function(event) {
            const clickedCard = event.target.closest('.address-card');
            if (!clickedCard) return;
    
            const radioInput = clickedCard.querySelector('input[type="radio"]');
            
            // Uncheck all other radio buttons and remove 'selected' class from other cards
            document.querySelectorAll('.address-card').forEach(card => {
                card.classList.remove('selected');
                card.querySelector('input[type="radio"]').checked = false;
            });
    
            // Check the clicked card's radio button and add 'selected' class
            radioInput.checked = true;
            clickedCard.classList.add('selected');
    
            // Get the address ID from the dataset and log it to the console
            selectedAddressId = clickedCard.dataset.addressId;
            console.log('Selected Address ID:', selectedAddressId);
    
            
        });
    }
    
    const btn_changeAddress_save = document.getElementById('btn-changeAddress-save');
    const changeAddress_modal_close_button = document.getElementById('changeAddress-modal-close-button');
    if(btn_changeAddress_save ){

        btn_changeAddress_save.addEventListener('click',()=> {
            
            if(selectedAddressId){

                fetch(`http://localhost:2000/checkout_page?addressId=${selectedAddressId}`,{method : "PATCH"})
                   .then(response => {
                       
                       if(!response.ok){
                           throw new Error('Network response was not ok while changing the size.');
                       }
                       return response.json();
                   })
                   .then(data => {
                       console.log(data)
                       dAddress_adType.textContent = data.address.addressType;
                       dAddress_ldMark.textContent = `LandMark: ${data.address.landmark},`; 
                       dAddress_place.textContent = `Place: ${data.address.place},`;
                       dAddress_city_pin.textContent = `${data.address.city} city, PIN : ${data.address.pinCode}` ; 
                       dAddress_dt_st.textContent = `${data.address.district} Dt, ${data.address.state}`;
                       dAddress_mob.textContent = `Mobile: +91 ${data.address.mobile_no}`;
                       
                       changeAddress_modal_close_button.click();
                   })
                   .catch(error =>{
                       console.log("Error while trying change item size",error)
                   })
            }

        })
    }

    let paymentMethod = '';
    const payment_options = document.querySelectorAll('.payment-option');
    console.log("This is the payment option listner")
    if(payment_options){
     
        payment_options.forEach(methodButton =>{
            
            methodButton.addEventListener('click',(e)=> {
    
                e.stopPropagation();
            
                // const currentSelection = e.currentTarget.id;
                payment_options.forEach(option => option.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                
                paymentMethod = e.currentTarget.querySelector('input').value;
                console.log(paymentMethod,"This is the methods")
                
            })
        })
    }

    const placeOrderByCheckingAddress = async()=>{

        try{

            const response = await fetch(`http://localhost:2000/checkout_page/check_address`);
            if(!response.ok){
                throw new Error('Network response was not ok while checking address is selected.');
            }

            const data = await response.json();
            if(!data.status){
           
                Swal.fire({
                    title: "Order not placed",
                    text: data.message,
                    icon: 'error'
                });
                return false;
            }

        }catch(error){
            console.log("Error occured while trying to check address is selected.")
        }

        try{

            const response = await fetch(`http://localhost:2000/checkout_page?paymentMethod=${paymentMethod}`,{method : 'post'});
            if(!response.ok){
                throw new Error('Network response was not ok while making order.');
            }
            
            const order = await response.json();
            if(order.status && order.razorpay_key){

                const options = {

                    key : order.razorpay_key,
                    amount : order.orderResult.amount,
                    currency : 'INR',
                    name : 'ShoeShope',
                    description : 'Test Transaction',
                    order_id : order.orderResult.id,
                    handler : async function(response){

                        const result = await fetch('/verify-payment',{  
                            method : 'post',
                            headers : {
                                'Content-Type' : 'application/json',    
                            },
                            body : JSON.stringify({
                                orderId : response.razorpay_order_id,
                                paymentId : response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                amount: order.orderResult.amount / 100,
                            }),
                        });

                        const data = await result.json();
                        // alert(data.status === true ? 'Payment Successful' : 'Payment Failed');
                        if(data.status){
                            window.location.href = data.redirect
                        }else{
                            Swal.fire({
                                title: "Order not placed",
                                text: order.message,
                                icon: 'error'
                            });
                        }
                    },
                };

                let rzp = new Razorpay(options);
                rzp.open();
                
            }else if(order.status && order.redirect){
                
                window.location.href = order.redirect

            }else{
    
                Swal.fire({
                    title: "Order not placed",
                    text: order.message,
                    icon: 'error'
                });
    
            }
        }
        catch(error){
            console.log("Error occured while making order",error)
        }
    }


    const place_order = document.getElementById('place-order')
    if(place_order){

        place_order.addEventListener('click',() => {
            if(paymentMethod){
                
                placeOrderByCheckingAddress();
                       
            }else{
                console.log("Please select a payment option")
                Swal.fire({
                    title: "Payment Method Required",
                    text: "Please select a payment method to proceed.s",
                    icon: 'error'
                });
            }

        })
    }

    function createOrderDetailsRow(products,addres,orderDate,orderStatus, orderId){
        
        return `<div class="container-fluid bot-order-container">
  <div class="row">
    <!-- Image, Product Name, and Brand -->
    <div class="col-md-6 bot-image-product-section">
      <div class="d-flex align-items-center">
        <img src="/ProductImage/${products?.product?.images[0]}" alt="Product preview" class="bot-product-image mr-3">
        <div class="brand-size-align" >
          <h6 class="bot-product-name ">${products?.product?.name}</h6>
          <span class="bot-brand  ">${products?.product?.Brand}</span>
          <p><span class="size-style" >size : ${products?.product?.size}</span></p>
        </div>
      </div>
    </div>

    <!-- Date Information -->
    <div class="col-md-6 bot-date-info">
      <div class="bot-date-box">
        <p><span class="bot-bold">Ordered:</span> ${orderDate}</p>
        <p><span class="bot-bold">Delivered:</span> ${products?.deliveredDate || 'Pending'}</p>
      </div>
    </div>

    <!-- Address and Order ID -->
    <div class="col-md-6 bot-address-info mt-3 mt-md-0">
      <p><span class="bot-bold">product Order ID:</span> ${products?._id}</p>
      <p><span class="bot-bold">Address:</span> ${addres?.addressType}</p>
      <p><span class="bot-bold">Place:</span> ${addres?.place}, ${addres?.city} city</p>
      <p><span class="bot-bold">Landmark:</span> ${addres?.landmark}, Pin: ${addres?.pinCode}</p>
    </div>

    <!-- Price, Quantity, and Status -->
    <div class="col-md-6 bot-price-info mt-3 mt-md-0">
      <p><span class="bot-bold">Price:</span> ₹${products?.product.price} <span class="bot-bold">| Qty:</span> ${products?.quantity}</p>
      <p><span class="bot-bold">Total:</span> ₹${products?.subtotal}</p>
      <div class="bot-return-status" >
        <div class="bot-status bot-status-${orderStatus.toLowerCase()}">${orderStatus}</div>
        ${orderStatus.toLowerCase() === 'delivered' ? `<button onclick="returnProduct('${products?.product?.id}','${orderId}')" class="bot-return-btn mt-2">Return</button>` : ''}
      </div>
    </div>
  </div>
</div>`
        
    }
                                                                    

    function updateOrderDataTable(produts,addres,orderDate,orderStatus,orderId){

        const tableBody = document.getElementById('order-detail-table');
        tableBody.innerHTML = produts.map(item => createOrderDetailsRow(item,addres,orderDate,orderStatus,orderId)).join('');

    }

    //Order-Details
    const order_history_table = document.getElementById('order-history-table');
    const toggle_order_history = document.getElementById('toggle-order-history');
    const show_all_btn = document.getElementById('show-all-btn');
    const order_details = document.getElementById('order-details');
    if(order_history_table){

        order_history_table.addEventListener('click',(e) => {

            const orderButton = e.target.closest('.odsIdUnifiedRow');
            if(orderButton){
                console.log(orderButton.dataset.id)
                fetch(`http://localhost:2000/profile/get-order-details?order_id=${orderButton.dataset.id}`)
                .then(response => {
                    
                    if(!response.ok){
                        throw new Error('Network response was not ok while getting order details.');
                    }
                    return response.json();
                })
                .then(data => {
                    if(data.status){
                        console.log(data)
                        updateOrderDataTable(data.products,data.address,data.orderDate,data.orderStatus,data.orderId);
                      
                    }else{

                  

                    }
            
                })
             
                .catch(error =>{
                    console.log("Error occured while getting order details.",error)
                })
                
                toggle_order_history.style.display = 'none';
                order_details.classList.remove('display-order-details');
                show_all_btn.classList.remove('display-order-details');
            }
        })
       
            show_all_btn.addEventListener('click',()=> {
                console.log("worked")
                order_details.classList.add('display-order-details');
                show_all_btn.classList.add('display-order-details');
                toggle_order_history.style.display = 'block';
            })
       
    }

})