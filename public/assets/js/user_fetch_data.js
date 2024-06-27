

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
        console.log(Reg_pass_value)
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