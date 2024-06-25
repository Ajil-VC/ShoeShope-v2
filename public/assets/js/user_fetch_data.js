

$(document).ready(function(){

    $('.zoom_image').each(function() { 

        $(this).ezPlus({
            scrollZoom: true
        });
    })
});


// function moveToNext (current,nextField){
//     console.log(current)
//     console.log("hello there")

//     if(current.value.length >= current.maxlength){
//         document.getElementById(nextField).focus();
//     }

// }

// const otp_submit_parent = document.getElementById('otp-submit-parent');
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
            otp_success_msg.remove();
            otp_submit_btn.setAttribute('hidden',true)
            verify_otp.remove();
            resend_otp.removeAttribute('hidden')
            
        }
    }
    setTimeout(updateTimer,1000)
}




resend_otp.addEventListener('click',() => {
    console.log("This is add eventlistener")

    fetch('/resend_otp')
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
        otp_submit_btn.removeAttribute('hidden')

        // const new_otp_submit_btn = document.createElement('button');
        // new_otp_submit_btn.id = 'otp-submit-bn';
        // new_otp_submit_btn.type = 'submit';
        // new_otp_submit_btn.className = 'btn btn-fill-out btn-block hover-up';
        // new_otp_submit_btn.name = 'login';
        // new_otp_submit_btn.textContent = 'Submit'; 
        // otp_submit_parent.appendChild(new_otp_submit_btn)
        startTimer();

        }
    })
    .catch(error => {
        console.log("There was a problem While resending otp",error)
    });

})

