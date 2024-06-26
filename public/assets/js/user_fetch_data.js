

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
const verify_otp = document.getElementById('verify-otp');
const otp_timer = document.getElementById('otp-timer');
const resend_otp = document.getElementById('resend-otp' )

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
            verify_otp.setAttribute('hidden',true);
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
            verify_otp.removeAttribute('hidden');
            otp_success_msg.textContent = data.message;
    
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
if(otp_form){

    otp_form.addEventListener('submit',function(event) {
    
        event.preventDefault();
    
        let otp = '';
        for(let i = 1 ; i <= 5 ; i++ ){
            otp += document.getElementById('otp'+i).value;
        }
    
        let hidden_otp = document.createElement('input');
        hidden_otp.type = 'hidden';
        hidden_otp.name = 'otp';
        hidden_otp.value = otp ;
        this.appendChild(hidden_otp);
    
        this.submit();
    })
}



//Eventlistener for password
// Reg_pass = document.getElementById('Reg-pass')


//Form validation for registration and submission
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const mobError = document.getElementById('mobError');
const passwordError = document.getElementById('passwordError');

document.getElementById('registrationForm').addEventListener('submit',function(event) {
    console.log("This is registration")
    event.preventDefault();

    Reg_firstName = document.getElementById('Reg-firstName').value.trim();
    Reg_lastName = document.getElementById('Reg-lastName').value.trim();
    Reg_email = document.getElementById('Reg-email').value.trim();
    Reg_mob = document.getElementById('Reg-mob').value.trim();
    Reg_pass = document.getElementById('Reg-pass').value.trim();

    firstNameError.textContent = "";
    emailError.textContent = "";
    mobError.textContent = "";
    passwordError.textContent = ""

    let valid = true;
    
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

    if(!Reg_pass){

        passwordError.textContent = "This field cant be empty"
        valid = false;
    }else if(!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(Reg_pass)){

        passwordError.textContent = "Password Should Contain atleast 1 Uppercase, 1 lower case 1 digit and minimum 5 charecters length"
        valid = false;
    }

    if(valid){
        this.submit();
    }

})