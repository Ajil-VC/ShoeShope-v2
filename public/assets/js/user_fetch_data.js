


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
        console.log("This is add eventlistener")
    
        fetch('http://localhost:2000/resend_otp')
        .then(response =>{
            console.log(response)
            if(!response.ok){
                throw new Error('Network Response was not ok while sending otp');
            }
            console.log("This is the response")
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

   
    
    


//Form validation for registration and submission
const firstNameError = document.getElementById('firstNameError');
const emailError = document.getElementById('emailError');
const mobError = document.getElementById('mobError');
const passwordError = document.getElementById('passwordError');
Reg_pass = document.getElementById('Reg-pass')
let Reg_pass_value;
let valid = true;
const passwordCheck = {condition : false,msg : ""};
if(Reg_pass){

    Reg_pass.addEventListener('input',(event) => {
        Reg_pass_value = Reg_pass.value;
      
        if(!/[A-Z]/.test(Reg_pass_value)){
            
            passwordError.textContent = "Password Should Contain atleast 1 Uppercase"
            passwordCheck.msg = "Password Should Contain atleast 1 Uppercase"
            passwordCheck.condition = false;
        }else if(!/[a-z]/.test(Reg_pass_value)){
            
            passwordError.textContent = "Password Should Contain atleast 1 Lowercase"
            passwordCheck.msg = "Password Should Contain atleast 1 Lowercase"
            passwordCheck.condition = false;
        }else if(!/\d/.test(Reg_pass_value)){
            
            passwordError.textContent = "Password Should Contain a number"
            passwordCheck.msg = "Password Should Contain a number"
            passwordCheck.condition = false;
        }else if(!/^.{5,}$/.test(Reg_pass_value)){
            
            passwordError.textContent = "Password Should Contain 5 charecters minimum"
            passwordCheck.msg = "Password Should Contain 5 charecters minimum"
            passwordCheck.condition = false;
        }else if(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(Reg_pass_value)){
            
            passwordError.textContent = ""
            passwordCheck.msg = ""
            passwordCheck.condition = true; 
        }
        
        
        
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
        Reg_pass_value = Reg_pass.value.trim();
        
        firstNameError.textContent = "";
        emailError.textContent = "";
        mobError.textContent = "";
        passwordError.textContent = ""
    
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
            valid = false
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
    console.log(AddressId);

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


function swalConfirm() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
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
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                resolve(true);
            } else {
                Swal.fire(
                    'Cancelled',
                    'Your address is safe :)',
                    'error'
                )
                resolve(false);
            }
        })
    });
}

async function deleteAddress(addressID){

    try{

        let confirmDeletion = await swalConfirm();
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
        newPasswordValue = newPassword.value;
        console.log("First",newPasswordValue,confirmPasswordValue)
        if(/^$/.test(newPasswordValue)){
            
            newPasswordError.textContent = "This field should not be empty"
            changePasswordBtn.disabled = true;
            
        }
        else if(!/[A-Z]/.test(newPasswordValue)){
            
            newPasswordError.textContent = "Password Should Contain atleast 1 Uppercase"
            changePasswordBtn.disabled = true;
           

        }else if(!/[a-z]/.test(newPasswordValue)){
            
            newPasswordError.textContent = "Password Should Contain atleast 1 Lowercase"
            changePasswordBtn.disabled = true;
         

        }else if(!/\d/.test(newPasswordValue)){
            
            newPasswordError.textContent = "Password Should Contain a number"
            changePasswordBtn.disabled = true;
          

        }else if(!/^.{5,}$/.test(newPasswordValue)){
            
            newPasswordError.textContent = "Password Should Contain 5 charecters minimum"
            changePasswordBtn.disabled = true;

        }else if(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(newPasswordValue)){
            
            newPasswordError.textContent = ""
    
        }
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
        console.log("Second",newPasswordValue,confirmPasswordValue)

        if(confirmPasswordValue != newPasswordValue){
            confirmPasswordError.textContent = "Password Must be same as above"
            changePasswordBtn.disabled = true;
        }else{
            confirmPasswordError.textContent = "";
            changePasswordBtn.disabled = false;
        }
    })
}



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
        console.log("DonEEEE");
        const IdForaddToCartFn = document.getElementById('IdForaddToCartFn');
        const IdForGoToCartFn = document.getElementById('IdForGoToCartFn');
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

async function removeProductFromCart(productId){
    
    let confirmDeletion = await swalConfirm();
    try{
        if(confirmDeletion){

            const response = await fetch(`http://localhost:2000/cart?productId=${productId}`,{method : "delete"});
            if(!response.ok)                  {
                throw new Error('Network response was not ok while removing product from cart');
            }
            const data = await response.json();
            if(data.status){
                console.log(data.productId,"This is from fron")
                const itemTileId = document.getElementById(`itemTileId-${productId}`);
                itemTileId.remove();
                if(data.totalCartItems > 0){

                    totalItemsInCart.textContent = `Total ${data.totalCartItems} inyour cart`;
                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;  
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`
                }else{
                    totalItemsInCart.textContent = "Your Cart is empty";
                    orderSummary_subTotal.textContent = `₹ 0`;
                    orderSummary_GST.textContent = `₹ 0`;  
                    orderSummary_totalAmount.textContent = `₹ 0`;
                    orderSummary_quantity.textContent = "No items item added"
                }
               
            }

        }

    }catch(error){

        console.log("Error while fetching operation of remove product from cart");
    }
}

async function loadCheckout() {
    
    try{

        const response = await fetch(`http://localhost:2000/checkout`,{ redirect: 'manual' });

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

document.addEventListener('DOMContentLoaded', function() {

    // Checkboxes
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const productId = this.dataset.productId;
            const isChecked = this.checked;

            fetch(`http://localhost:2000/cart?productId=${productId}`,{method : "PUT"})
            .then(response => {
                
                if(!response.ok){
                    throw new Error('Network response was not ok while selecting product.');
                }
                return response.json();
            })
            .then(data => {

                if(data.status){

                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;  
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`
                }else{
             
                    console.log("Something wrong with selecting product there is no data")
                 
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
            console.log(`Quantity for product ${productId} changed to ${newQuantity}`);

            fetch(`http://localhost:2000/cart?productId=${productId}&newQuantity=${newQuantity}`,{method : "PATCH"})
            .then(response => {
                
                if(!response.ok){
                    throw new Error('Network response was not ok while selecting product.');
                }
                return response.json();
            })
            .then(data => {

                if(data.status){

                    orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                    orderSummary_GST.textContent = `₹ ${data.gst}`;  
                    orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                    orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`
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


    const place_order = document.getElementById('place-order')
    if(place_order){

        place_order.addEventListener('click',() => {

            console.log("place_order clicked")
        })
    }

})