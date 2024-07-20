
const listCoupons = async(couponId) =>{

    const response = await fetch(`http://localhost:2000/admin/coupons?coupon=${couponId}`,{method : 'PATCH'});
    
    if(!response.ok){
        throw new Error('Network repsonse was not ok while changing coupon status.');
    }

    const data = await response.json();
}

// document.addEventListener('DOMContentLoaded',() => {
   


// });



