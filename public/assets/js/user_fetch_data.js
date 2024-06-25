
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

function startTimer(){
    
    const otp_submit_btn = document.getElementById('otp-submit-bn');
    const otp_timer = document.getElementById('otp-timer');
    const resend_otp = document.getElementById('resend-otp' )
    let timeLeft = 55 ;

    function updateTimer() {
        if(timeLeft > 0 ){
            timeLeft-- ;
            otp_timer.textContent = timeLeft + 'sec'; 
            setTimeout(updateTimer,1000)
        }else{
            otp_timer.textContent = 'Time is up'
            otp_submit_btn.remove();
            resend_otp.removeAttribute('hidden')
        }
    }
    setTimeout(updateTimer,1000)
}

document.addEventListener('DOMContentLoaded', function() {

    startTimer()

})

