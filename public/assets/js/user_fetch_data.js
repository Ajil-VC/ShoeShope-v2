

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
                // console.log(otp_success_msg)
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
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                )
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
    }
}
 