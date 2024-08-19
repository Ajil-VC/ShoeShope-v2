
$(document).ready(function () {

    $('.zoom_image').each(function () {

        $(this).ezPlus({
            scrollZoom: true
        });
    })
});




function moveToNext(current, nextField) {

    if (current.value.length >= current.maxlength) {
        document.getElementById(nextField).focus();
    }

}


function disableScroll() {

    //Current page scroll position.
    scrollTop = window.scrollY || document.documentElement.scrollTop;
    scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    //If any scroll is attempted set this to previous value.
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    }
}

function enableScroll() {
    window.onscroll = function () { };
}

$('#addNewAddressModalCenter').on('hidden.bs.modal', function () {
    enableScroll();
});


const otp_submit_btn = document.getElementById('otp-submit-bn');
const otp_success_msg = document.getElementById('otp-success-msg');
const otp_timer = document.getElementById('otp-timer');
const resend_otp = document.getElementById('resend-otp')

function startTimer() {
    let timeLeft = 55;
    function updateTimer() {
        if (timeLeft > 1) {
            timeLeft--;
            otp_timer.textContent = timeLeft + 'sec';
            setTimeout(updateTimer, 1000)
        } else {
            otp_timer.textContent = 'Time is up'
            // otp_success_msg.remove();
            otp_success_msg.textContent = ""
            otp_submit_btn.setAttribute('hidden', true)

            resend_otp.removeAttribute('hidden');
            resend_otp.disabled = false;
        }
    }
    setTimeout(updateTimer, 1000)
}



if (resend_otp) {

    resend_otp.addEventListener('click', () => {

        fetch('/resend_otp')
            .then(response => {
              
                if (!response.ok) {
                    throw new Error('Network Response was not ok while sending otp');
                }

                return response.json();

            })
            .then(data => {

                if (data.success) {

                    resend_otp.setAttribute('hidden', true);
                    otp_submit_btn.removeAttribute('hidden');

                    otp_success_msg.textContent = data.message;
                    otp_success_msg.classList.remove('text-danger')
                    otp_success_msg.classList.add('text-success')

                    startTimer();

                }
            })
            .catch(error => {
                console.error("There was a problem While resending otp", error.stack)
            });
        resend_otp.disabled = true;
    })
}



const otp_form = document.getElementById('otp-form');
if (otp_submit_btn) {

    otp_submit_btn.addEventListener('click', (e) => {

        e.preventDefault();

        let otp = '';
        for (let i = 1; i <= 5; i++) {
            otp += document.getElementById('otp' + i).value;
        }
       
        let intOTP = parseInt(otp);
      
        let hidden_otp = document.createElement('input');
        hidden_otp.type = 'hidden';
        hidden_otp.name = 'otp';
        hidden_otp.value = intOTP;
   
        const otpformData = new FormData(otp_form);
       
        otp_form.appendChild(hidden_otp);
        let urlEncodedData = new URLSearchParams(otpformData);

        fetch('/signup/verify-otp', {
            method: 'POST', headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }, body: urlEncodedData
        })
            .then(response => {

                if (!response.ok) {

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

               
                if (!data.status) {

                    otp_success_msg.classList.remove('text-success')
                    otp_success_msg.classList.add('text-danger')
                    otp_success_msg.textContent = data.message;
                } else {

                    window.location.href = "/"
                }

            })
            .catch(error => {
                console.error("Error while trying to submit otp", error.stack)
            })
        otp_form.removeChild(hidden_otp);
    })
}



function passwordValidation(password) {

    const validatedPassword = {}

    if (!password) {

        validatedPassword.message = "Please give password";
        validatedPassword.status = false;
        return validatedPassword;

    } else if (!/[A-Z]/.test(password)) {

        validatedPassword.message = "Password Should Contain atleast 1 Uppercase";
        validatedPassword.status = false;
        return validatedPassword;

    } else if (!/[a-z]/.test(password)) {

        validatedPassword.message = "Password Should Contain atleast 1 Lowercase";
        validatedPassword.status = false;
        return validatedPassword;

    } else if (!/\d/.test(password)) {

        validatedPassword.message = "Password Should Contain a number";
        validatedPassword.status = false;
        return validatedPassword;

    } else if (!/^.{5,}$/.test(password)) {

        validatedPassword.message = "Password Should Contain 5 charecters minimum";
        validatedPassword.status = false;
        return validatedPassword;

    } else if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(password)) {

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
const passwordCheck = { condition: false, msg: "" };
if (Reg_pass) {

    Reg_pass.addEventListener('input', (event) => {

        Reg_pass_value = Reg_pass.value.trim();

        const validatedResult = passwordValidation(Reg_pass_value);
        passwordError.textContent = validatedResult.message;
        passwordCheck.msg = validatedResult.message;
        passwordCheck.condition = validatedResult.status;

    })
}


const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {

    registrationForm.addEventListener('submit', function (event) {

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

        valid = true;

        if (!Reg_firstName) {

            firstNameError.textContent = "This field cant be empty"
            valid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(Reg_firstName)) {

            firstNameError.textContent = "Only letters and spaces"
            valid = false;
        }

        if (!Reg_email) {

            emailError.textContent = "This field can't be empty"
            valid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Reg_email)) {

            emailError.textContent = "Enter a valid email id"
            valid = false;
        }

        if (!Reg_mob) {

            mobError.textContent = "This field can't be empty"
            valid = false;
        } else if (!/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(Reg_mob)) {

            mobError.textContent = "Please give a proper mobile number"
            valid = false;
        }

        if (!Reg_pass_value) {

            passwordError.textContent = "This field cant be empty"
            valid = false;
        } else if (!passwordCheck.condition) {
            passwordError.textContent = passwordCheck.msg
            valid = false;
        }

        if (!Confirm_Reg_pass) {
            confirm_passwordError.textContent = "This field cant be empty"
            valid = false;
        } else if (Reg_pass_value != Confirm_Reg_pass) {
            confirm_passwordError.textContent = "Password must be same as above"
            valid = false;
        }

        if (valid) {

            this.submit();
        }

    })
}



async function makeDefaultAddress(AddressId) {

    if (!AddressId) {
      
        return;
    }


    try {

        const response = await fetch(`/profile/address?AddressID=${AddressId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok while making default address');
        }

        const data = await response.json();
   
        let currentUrl = window.location.href;
        let currentFragment = window.location.hash;

        if (!currentFragment) {
            currentFragment = '#address'
        }

        window.location.href = currentUrl;
        window.location.hash = currentFragment;

        Swal.fire({
            title: '',
            text: "Successfully made as new address",
            icon: 'success'
        });


    } catch (error) {
        console.error("There was a problem with making default address", error.stack)
    }

}


function swalConfirm(alertMsg, confirmMsg, commitedMsg, commitedHead, safeMsg) {
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
                    'Safe',
                    safeMsg,
                    'error'
                )
                resolve(false);
            }
        })
    });
}

async function deleteAddress(addressID) {

    try {

        let alertMsg = "You won't be able to revert this!";
        let confirmMsg = 'Yes, delete it!';
        let commitedMsg = 'Your file has been deleted.';
        let commitedHead = 'Deleted!';
        let safeMsg = 'Your address is safe :)'

        let confirmDeletion = await swalConfirm(alertMsg, confirmMsg, commitedMsg, commitedHead, safeMsg);
        if (confirmDeletion) {

            const response = await fetch(`/profile/address?AddressID=${addressID}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error('Network response was not ok while deleting the address');
            }
            const data = await response.json();

            if (data.status) {

                Swal.fire({
                    title: '',
                    text: "Successfully Deleted",
                    icon: 'success'
                });
                let currentURL = window.location.href;
                window.location.href = currentURL;
            }

        }

    } catch (error) {
        console.error("There wa a problem while deleting address.", error.stack)
    }
}


const newPassword = document.getElementById("newPassword");
const newPasswordConfirm = document.getElementById('newPasswordConfirm');
const changePasswordBtn = document.getElementById('changePasswordBtn');
let confirmPasswordError = document.getElementById('confirmPasswordError');
if (changePasswordBtn) {

    changePasswordBtn.disabled = true;
}
let newPasswordValue;
if (newPassword) {
    let newPasswordError = document.getElementById('newPasswordError');
    let confirmPasswordValue
    newPassword.addEventListener('input', () => {
        confirmPasswordValue = newPasswordConfirm.value;
        newPasswordValue = newPassword.value.trim();

        const validatedResult = passwordValidation(newPasswordValue);
        newPasswordError.textContent = validatedResult.message;
        changePasswordBtn.disabled = !validatedResult.status;

        if (newPasswordValue != confirmPasswordValue) {
            confirmPasswordError.textContent = "Password Must be same as above"
            changePasswordBtn.disabled = true;
        } else {
            confirmPasswordError.textContent = "";
            changePasswordBtn.disabled = false;
        }


    })
}
if (newPasswordConfirm) {

    newPasswordConfirm.addEventListener('input', () => {
        let confirmPasswordValue = newPasswordConfirm.value;

        if (confirmPasswordValue != newPasswordValue) {
            confirmPasswordError.textContent = "Password Must be same as above"
            changePasswordBtn.disabled = true;
        } else {
            confirmPasswordError.textContent = "";
            changePasswordBtn.disabled = false;
        }
    })
}



//form validation for Add new Address
const addNewAddressForm = document.getElementById('addNewAddressForm');
if (addNewAddressForm) {

    const addressName_error = document.getElementById('addressName-error');
    const addressPincode_error = document.getElementById('addressPincode-error');
    const addressState_error = document.getElementById('addressState-error');
    const addressDistrict_error = document.getElementById('addressDistrict-error');
    const addressCity_error = document.getElementById('addressCity-error');
    const addressPlace_error = document.getElementById('addressPlace-error');
    const addressMobile_error = document.getElementById('addressMobile-error');
    const addressLandmark_error = document.getElementById('addressLandmark-error');

    addNewAddressForm.addEventListener('submit', function (e) {

        e.preventDefault();
        let valid = true;

        const addressName = document.getElementById('addressName').value.trim();
        const addressPincode = document.getElementById('addressPincode').value.trim();
        const addressState = document.getElementById('addressState').value.trim();
        const addressDistrict = document.getElementById('addressDistrict').value.trim();
        const addressCity = document.getElementById('addressCity').value.trim();
        const addressPlace = document.getElementById('addressPlace').value.trim();
        const addressMobile = document.getElementById('addressMobile').value.trim();
        const addressLandmark = document.getElementById('addressLandmark').value.trim();


        addressName_error.textContent = '';
        addressPincode_error.textContent = '';
        addressState_error.textContent = '';
        addressDistrict_error.textContent = '';
        addressCity_error.textContent = '';
        addressPlace_error.textContent = '';
        addressMobile_error.textContent = '';
        addressLandmark_error.textContent = '';

        if (!addressName) {
            addressName_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (!addressPincode) {
            addressPincode_error.textContent = "This field can't be empty";
            valid = false;
        } else if (/[^0-9]/.test(addressPincode)) {
            addressPincode_error.textContent = "Please give proper value.";
            valid = false;
        }

        if (!addressState) {
            addressState_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (!addressDistrict) {
            addressDistrict_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (!addressCity) {
            addressCity_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (!addressPlace) {
            addressPlace_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (!addressMobile) {
            addressMobile_error.textContent = "This field can't be empty";
            valid = false;
        } else if (!/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(addressMobile)) {
            addressMobile_error.textContent = "Give a proper mobile number";
            valid = false;
        }

        if (!addressLandmark) {
            addressLandmark_error.textContent = "This field can't be empty";
            valid = false;
        }

        if (valid) {

            this.submit();
        }

    })
}

$('#editAddressModalCenter').on('hidden.bs.modal', function () {
    enableScroll();
});

$('#editAddressModalCenter').on('show.bs.modal', function () {
    disableScroll();
});

const editAddress_modal_close_button = document.getElementById('editAddress-modal-close-button');
if (editAddress_modal_close_button) {

    editAddress_modal_close_button.addEventListener('click', () => {

        $('#editAddressModalCenter').modal('hide');
    })
}
async function updateAddress(addressID) {

    const editAddressId = document.getElementById('editAddressId');
    const editAddressName = document.getElementById('editAddressName');
    const editAddressPincode = document.getElementById('editAddressPincode');
    const editAddressState = document.getElementById('editAddressState');
    const editAddressDistrict = document.getElementById('editAddressDistrict');
    const editAddressCity = document.getElementById('editAddressCity');
    const editAddressPlace = document.getElementById('editAddressPlace');
    const editAddressMobile = document.getElementById('editAddressMobile');
    const editAddressLandmark = document.getElementById('editAddressLandmark');

    try {
        $('#editAddressModalCenter').modal('show');

        const response = await fetch(`/profile/address/edit?addressId=${addressID}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok while trying to fetch the address detilas.')
        }
        const data = await response.json();

        if (data.status) {

            editAddressId.value = addressID;
            editAddressName.value = data.addressDetails.addressType;
            editAddressPincode.value = data.addressDetails.pinCode;
            editAddressState.value = data.addressDetails.state;
            editAddressDistrict.value = data.addressDetails.district;
            editAddressCity.value = data.addressDetails.city;
            editAddressPlace.value = data.addressDetails.place;
            editAddressMobile.value = data.addressDetails.mobile_no;
            editAddressLandmark.value = data.addressDetails.landmark;
        } 

    } catch (error) {
        console.error("Error occured while editing address", error.stack)
    }
}

const editAddressForm = document.getElementById('editAddressForm');
if (editAddressForm) {

    const editAddressPincode_error = document.getElementById('editAddressPincode-error');
    const editAddressMobile_error = document.getElementById('editAddressMobile-error');

    editAddressForm.addEventListener('submit', function (e) {

        e.preventDefault();
        let valid = true;

        const editAddressPincode = document.getElementById('editAddressPincode').value.trim();
        const editAddressMobile = document.getElementById('editAddressMobile').value.trim();

        if (!editAddressPincode) {

            editAddressPincode_error.textContent = "This Field can't be empty.";
            valid = false;
        } else if (/[^0-9]/.test(editAddressPincode)) {

            editAddressPincode_error.textContent = "Give a proper value.";
            valid = false;
        }

        if (!editAddressMobile) {
            editAddressMobile_error.textContent = "This Field can't be empty";
            valid = false;
        } else if (!/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(editAddressMobile)) {
            editAddressMobile_error.textContent = "Give a proper value";
            valid = false;
        }

        if (valid) {
            this.submit();
        }
    })
}


async function addProductToCart(productId, flag) {

    let wishlistControl = flag ?? false;

    const response = await fetch(`/product_details?product_id=${productId}`, {
        method: "post", headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    },);

    if (!response.ok) {

        if (response.status == 401) {
            return window.location.href = '/login';
        }

        throw new Error('Network response was not ok while adding product to cart');
    }

    const data = await response.json();
    if (data.redirect) {
        return window.location.href = data.redirect;
    } else if (data.status) {

        const IdForaddToCartFn = document.getElementById('IdForaddToCartFn');
        // const IdForGoToCartFn = document.getElementById('IdForGoToCartFn');
        if (IdForaddToCartFn) {
            IdForaddToCartFn.textContent = "Go to cart"
            IdForaddToCartFn.removeAttribute('onclick');
            IdForaddToCartFn.addEventListener('click', () => {
                window.location.href = "/cart"
            })
        } else if (wishlistControl) {

            document.getElementById(productId).remove();

            fetch(`/wishlist?productId=${productId}`, {
                method: "PATCH", headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {

                    if (!response.ok) {
                        throw new Error('Network response was not ok while adding product to the wishlist.')
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status) {

                        const totalItemsInWishlist = document.getElementById('totalItemsInWishlist');
                        totalItemsInWishlist.innerText = `Total ${data.itemsLeftInWishlist} items in your wishlist`
                    }
                })
                .catch(error => {
                    console.error('Error occured while trying to fetch wishlist items.', error.stack);
                })

        }
    }
}

function goToCart() {
    window.location.href = "/cart"
}


const totalItemsInCart = document.getElementById('totalItemsInCart');
const orderSummary_quantity = document.getElementById('orderSummary-quantity');
const orderSummary_subTotal = document.getElementById('orderSummary-subTotal');
const orderSummary_GST = document.getElementById('orderSummary-GST');
const orderSummary_totalAmount = document.getElementById('orderSummary-totalAmount');
const orderSummary_discount = document.getElementById('orderSummary-discount');
const orderSummary_discountOffer = document.getElementById('orderSummary-discountOffer');

async function removeProductFromCart(productId) {

    let alertMsg = "You won't be able to revert this!";
    let confirmMsg = 'Yes, remove it!';
    let commitedMsg = '1 item has been removed from cart.';
    let commitedHead = 'Removed!';
    let safeMsg = 'Item is safe in cart :)';

    const selectedCoupon = document.getElementById('addedCoupon').value;

    let confirmDeletion = await swalConfirm(alertMsg, confirmMsg, commitedMsg, commitedHead, safeMsg);
    try {
        if (confirmDeletion) {

            const response = await fetch(`/cart?productId=${productId}&coupon=${selectedCoupon}`, { method: "delete" });
            if (!response.ok) {
                throw new Error('Network response was not ok while removing product from cart');
            }
            const data = await response.json();
            if (data.status) {

                const itemTileId = document.getElementById(`itemTileId-${productId}`);
                itemTileId.remove();
                if (data.totalCartItems > 0) {

                    if ((data.status && data.discountAmount == 0) && selectedCoupon) {
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

                    } else if (data.status) {

                        totalItemsInCart.textContent = `Total ${data.totalCartItems} inyour cart`;
                        orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                        orderSummary_GST.textContent = `₹ ${data.gst}`;
                        orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                        orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                        orderSummary_discount.textContent = `Discount ${data.discount}%`
                        orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                    }
                } else {
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

    } catch (error) {

        console.error("Error while fetching operation of remove product from cart",error.stack);
    }
}


// Add Coupon
var selectedCoupon = null;
const car_form_check_input = document.querySelectorAll('.cart-form-check-input');
if (car_form_check_input) {

    car_form_check_input.forEach(radio => {

        radio.addEventListener('change', (e) => {

            selectedCoupon = e.target.value;
            document.getElementById('btn-addCoupon-save').disabled = false;
        })
    })
}


async function addCoupon(selectedCoupon) {


    try {

        const response = await fetch(`/cart/addcoupon?coupon=${selectedCoupon}`, { method: 'PATCH' });
        if (!response.ok) {
            throw new Error("Network response was not ok while adding coupon.");
        }

        const data = await response.json();
       
        if (data.status && data.discountAmount == 0) {
            Swal.fire(
                'Oops',
                `Selected offer available only on ₹${data.minimumAmount}+ purchase`,
                'error'
            )
            orderSummary_discount.textContent = `Discount 0%`;
        } else if (data.status && data.discountAmount > 0) {

            orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
            orderSummary_GST.textContent = `₹ ${data.gst}`;
            orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
            orderSummary_discount.textContent = `Discount ${data.discount}%`;
            orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`;
        }

    } catch (error) {
        console.error("Error while trying to add coupn", error.stack)
    }

}


const btn_addCoupon_save = document.getElementById('btn-addCoupon-save');
const addCoupon_modal_close_button = document.getElementById('addCoupon-modal-close-button');
if (btn_addCoupon_save) {

    btn_addCoupon_save.disabled = true;
    btn_addCoupon_save.addEventListener('click', () => {

        if (selectedCoupon) {

            addCoupon(selectedCoupon);
            document.getElementById('addedCoupon').value = selectedCoupon;
            addCoupon_modal_close_button.click();

        }
    });

}

async function loadCheckout() {

    try {
        const selectedCoupon = document.getElementById('addedCoupon').value;
        const response = await fetch(`/checkout?coupon=${selectedCoupon}`, { redirect: 'manual' });

        if (!response.ok) {
            throw new Error('Network response was not ok while removing product from cart');
        }
        const responseClone = response.clone();
        const data = await response.json();
        const textData = await responseClone.text();
        if (!data.status) {
            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
        } else if (data.redirect) {

            window.location.href = data.redirect;
        }

    } catch (error) {
        console.error("Error while going to checkout page",error.stack)
        Swal.fire('Error', 'There was a problem loading the checkout page', 'error');
    }
}


const cancelProduct = async (productOrderId, orderId, itemOrderId) => {

    let alertMsg = "Are you sure you want to cancel this product?";
    let confirmMsg = 'Yes, cancel it!';
    let commitedMsg = `You have cancelled the the product with id : ${productOrderId}`;
    let commitedHead = 'Cancelled!';
    let safeMsg = 'Order is on the way :)'

    let confirmCancellation = await swalConfirm(alertMsg, confirmMsg, commitedMsg, commitedHead, safeMsg);

    if (confirmCancellation) {
        // Swal.fire(`You selected: ${reason}`);
        const response = await fetch(`/profile/cancelproduct?return_item_id=${productOrderId}&order_id=${orderId}`, { method: 'post' });

        if (!response.ok) {

            throw new Error('Network response was not ok while initiating the return');
        }
        const data = await response.json();
        if (!data.status) {

            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
            return;
        } else {

            const botCancelBtn = document.querySelector(`.btn-${itemOrderId}`);
            botCancelBtn.remove();

            const itemStatus = document.querySelector(`.status-${itemOrderId}`);
            itemStatus.classList.remove('bot-status-pending');
            itemStatus.classList.add(`bot-status-${data.itemStatus.toLowerCase()}`);
            itemStatus.innerText = data.itemStatus;

            const wallet_balance = document.getElementById('wallet-balance');
            wallet_balance.innerText = `Wallet Balance: ₹${data.walletData.balance.toFixed(2)}`;

            const walletTable = document.querySelector('.walletc-table');
            const newRow = walletTable.insertRow(1);//Inserting a new row at the top.
            //Adding cells to the new row.
            const dateCell = newRow.insertCell(0);
            const typeCell = newRow.insertCell(1);
            const amntCell = newRow.insertCell(2);
            const statusCell = newRow.insertCell(3);
            const descripCell = newRow.insertCell(4);
            const payMethodCell = newRow.insertCell(5);

            dateCell.innerText = new Date(data.trasactionData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            typeCell.innerText = data.trasactionData.type;
            amntCell.innerText = `₹${data.trasactionData.amount.toFixed(2)}`;
            statusCell.innerHTML = statusCell.innerHTML = `<span class="walletc-status walletc-${data.trasactionData.status.toLowerCase()}">${data.trasactionData.status}</span>`;
            descripCell.innerText = data.trasactionData.description;
            payMethodCell.innerText = data.trasactionData.paymentMethod;

            Swal.fire(
                'Success',
                `${data.message}`,
                'success'
            )
            return;

        }
    }

}


const returnProduct = async (productOrderId, orderId) => {


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
        const response = await fetch(`/profile/returnproduct?return_item_id=${productOrderId}&order_id=${orderId}&reason=${reason}`, { method: 'post' });

        if (!response.ok) {

            throw new Error('Network response was not ok while initiating the return');
        }
        const data = await response.json();
        if (!data.status) {

            Swal.fire(
                'Oops',
                `${data.message}`,
                'error'
            )
            return;
        } else {

            Swal.fire(
                'Success',
                `${data.message}`,
                'success'
            )
            return;

        }
    }

}

document.addEventListener('DOMContentLoaded', function () {

    //Add to wishlist starts here.
    const heart_icon = document.querySelectorAll('.heart-icon');
    if (heart_icon) {

        heart_icon.forEach(heart => {

            heart.addEventListener('click', function () {

                const wishlist_toggle = heart.querySelector('.wishlist-toggle');
                const productId = this.dataset.id;
                const isRemoveCard = this.dataset.card;

                fetch(`/wishlist?productId=${productId}`, {
                    method: "PATCH", headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .then(response => {

                        if (!response.ok) {

                            if (response.status == 401) {
                                return window.location.href = '/login';
                            }

                            throw new Error('Network response was not ok while adding product to the wishlist.')
                        }
                        return response.json();
                    })
                    .then(data => {

                        if (data.redirect) {
                            window.location.href = data.redirect;
                            return
                        }
                        if (data.status && data.add == 1) {
                            wishlist_toggle.classList.add('active');
                        } else if (data.status && data.add == -1) {
                            wishlist_toggle.classList.remove('active');
                            if (isRemoveCard == 'remove') {
                                const itemCardInWishlist = document.getElementById(productId);
                                itemCardInWishlist.remove();

                                const totalItemsInWishlist = document.getElementById('totalItemsInWishlist');
                                totalItemsInWishlist.innerText = `Total ${data.itemsLeftInWishlist} items in your wishlist`
                            }
                        }

                    })
                    .catch(error => {
                        console.error("Error while trying add product to wishlist", error.stack)
                    })
            })
        })
    }

    //Add to wishlist from product details.
    const product_to_wishlist = document.getElementById('product-to-wishlist');
    const go_to_wishlist = document.getElementById('go-to-wishlist');
    if(product_to_wishlist){
        product_to_wishlist.addEventListener('click',function() {

            const productId = this.dataset.productid;

            fetch(`/wishlist?productId=${productId}`, {
                method: "PATCH", headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {

                    if (!response.ok) {

                        if (response.status == 401) {
                            return window.location.href = '/login';
                        }

                        throw new Error('Network response was not ok while adding product to the wishlist.')
                    }
                    return response.json();
                })
                .then(data => {

                    if (data.redirect) {
                        window.location.href = data.redirect;
                        return
                    }
                    if (data.status && data.add == 1) {
                        //Need to set from here.
                        product_to_wishlist.classList.add('d-none');
                        go_to_wishlist.classList.remove('d-none');
                    } 

                })
                .catch(error => {
                    console.error("Error while trying add product to wishlist", error.stack)
                })
            
        })
    }

    if(go_to_wishlist){
        go_to_wishlist.addEventListener('click',function(){
            
            window.location.href = `/wishlist`;
        })
    }


    // Checkboxes
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const productId = this.dataset.productId;
            selectedCoupon = document.getElementById('addedCoupon').value;

            // const isChecked = this.checked;

            fetch(`/cart?productId=${productId}&coupon=${selectedCoupon}`, { method: "PUT" })
                .then(response => {

                    if (!response.ok) {
                        throw new Error('Network response was not ok while selecting product.');
                    }
                    return response.json();
                })
                .then(data => {

                    if ((data.status && data.discountAmount == 0) && selectedCoupon) {
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
                    } else if (data.status) {

                        orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                        orderSummary_GST.textContent = `₹ ${data.gst}`;
                        orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                        orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                        orderSummary_discount.textContent = `Discount ${data.discount}%`
                        orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                    }

                })

                .catch(error => {
                    console.error("Error while trying select the product", error.stack)
                })

        });
    });


    //Quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function () {
            const productId = this.dataset.productId;
            const newQuantity = this.value;
            selectedCoupon = document.getElementById('addedCoupon').value;

            fetch(`/cart?productId=${productId}&newQuantity=${newQuantity}&coupon=${selectedCoupon}`, { method: "PATCH" })
                .then(response => {

                    if (!response.ok) {
                        throw new Error('Network response was not ok while selecting product.');
                    }
                    return response.json();
                })
                .then(data => {

                    if ((data.status && data.discountAmount == 0) && selectedCoupon) {
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
                    } else if (data.status) {

                        orderSummary_subTotal.textContent = `₹ ${data.subTotal}`;
                        orderSummary_GST.textContent = `₹ ${data.gst}`;
                        orderSummary_totalAmount.textContent = `₹ ${data.totalAmount}`;
                        orderSummary_quantity.textContent = `${data.totalSelectedItems} item added`;
                        orderSummary_discount.textContent = `Discount ${data.discount}%`
                        orderSummary_discountOffer.textContent = `₹ ${data.discountAmount}`
                    } else {

                        if (data.message == "Max 4 items per product") {
                            Swal.fire(
                                'Oops',
                                `${data.message}`,
                                'error'
                            )
                            this.value = 4

                        } else if (data.message == "Item quantity cannot be less than 1") {

                            this.value = 1
                            Swal.fire(
                                'Oops',
                                `${data.message}`,
                                'error'
                            )

                        } else {

                            this.value = data.stock
                            Swal.fire(
                                'Oops',
                                `${data.message}`,
                                'error'
                            )

                        }
                      

                    }

                })
                .catch(error => {
                    console.error("Error while trying change item quantity", error.stack)
                })

        });
    });


    //Size inputs
    document.querySelectorAll('.cart-item-size').forEach(input => {
        input.addEventListener('change', function () {
            const productId = this.dataset.productId;
            const shoeSize = this.value;

            fetch(`/cart?productId=${productId}&shoeSize=${shoeSize}`, { method: "PATCH" })
                .then(response => {

                    if (!response.ok) {
                        throw new Error('Network response was not ok while changing the size.');
                    }
                })
                .catch(error => {
                    console.error("Error while trying change item size", error.stack)
                })

        })
    })



    const dAddress_adType = document.getElementById('dAddress-adType');
    const dAddress_ldMark = document.getElementById('dAddress-ldMark');
    const dAddress_place = document.getElementById('dAddress-place');
    const dAddress_city_pin = document.getElementById('dAddress-city-pin');
    const dAddress_dt_st = document.getElementById('dAddress-dt-st');
    const dAddress_mob = document.getElementById('dAddress-mob');
    let selectedAddressId;

    const addressContainer = document.querySelector('.address-container');
    if (addressContainer) {

        addressContainer.addEventListener('click', function (event) {
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


        });
    }

    const btn_changeAddress_save = document.getElementById('btn-changeAddress-save');
    const changeAddress_modal_close_button = document.getElementById('changeAddress-modal-close-button');
    if (btn_changeAddress_save) {

        btn_changeAddress_save.addEventListener('click', () => {

            if (selectedAddressId) {

                fetch(`/checkout_page?addressId=${selectedAddressId}`, { method: "PATCH" })
                    .then(response => {

                        if (!response.ok) {
                            throw new Error('Network response was not ok while changing the size.');
                        }
                        return response.json();
                    })
                    .then(data => {
                  
                        dAddress_adType.textContent = data.address.addressType;
                        dAddress_ldMark.textContent = `LandMark: ${data.address.landmark},`;
                        dAddress_place.textContent = `Place: ${data.address.place},`;
                        dAddress_city_pin.textContent = `${data.address.city} city, PIN : ${data.address.pinCode}`;
                        dAddress_dt_st.textContent = `${data.address.district} Dt, ${data.address.state}`;
                        dAddress_mob.textContent = `Mobile: +91 ${data.address.mobile_no}`;

                        changeAddress_modal_close_button.click();
                    })
                    .catch(error => {
                        console.error("Error while trying change item size", error.stack)
                    })
            }

        })
    }

    let paymentMethod = '';
    const payment_options = document.querySelectorAll('.payment-option');
    if (payment_options) {

        payment_options.forEach(methodButton => {

            methodButton.addEventListener('click', (e) => {

                e.stopPropagation();

                payment_options.forEach(option => option.classList.remove('selected'));
                e.currentTarget.classList.add('selected');

                paymentMethod = e.currentTarget.querySelector('input').value;

            })
        })
    }


    const razorPayment = async (razorpay_key, orderResultAmount, orderResultId, orderErrorMessage) => {

        const options = {

            key: razorpay_key,
            amount: orderResultAmount,
            currency: 'INR',
            name: 'ShoeShope',
            description: 'Test Transaction',
            order_id: orderResultId,
            handler: async function (response) {

                try {

                    const result = await fetch('/verify-payment', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            amount: orderResultAmount / 100,
                        }),
                    });

                    const data = await result.json();
                    // alert(data.status === true ? 'Payment Successful' : 'Payment Failed');
                    if (data.status) {
                        window.location.href = data.redirect
                    } else {
                        Swal.fire({
                            title: "Order not placed",
                            text: orderErrorMessage,
                            icon: 'error'
                        });
                    }

                } catch (error) {
                    console.error('Error during payment verification:', error);
                    Swal.fire({
                        title: "Order not placed",
                        text: error.message || "An error occurred during payment verification",
                        icon: 'error'
                    });
                }
            },
        };

        let rzp = new Razorpay(options);

        rzp.on('payment.failed', async function (response) {


            try {

                const result = await fetch('/payment-failed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: response.error.metadata.order_id,
                        paymentId: response.error.metadata.payment_id,
                        reason: response.error.reason
                    })
                });

                if (!result.ok) {
                    throw new Error('Network response was not ok while updating failed status.')
                }

                const data = await result.json();
                if (!data.status) {
                    console.error('Failed to update status on server.');
                }

            } catch (error) {
                console.error("Error occured while trying to save failed status on server.", error);
            }
        })

        rzp.open();

    }


    const placeOrderByCheckingAddress = async () => {

        try {

            const response = await fetch(`/checkout_page/check_address`);
            if (!response.ok) {
                throw new Error('Network response was not ok while checking address is selected.');
            }

            const data = await response.json();
            if (!data.status) {

                Swal.fire({
                    title: "Order not placed",
                    text: data.message,
                    icon: 'error'
                });
                return false;
            }

        } catch (error) {
            console.error("Error occured while trying to check address is selected.",error.stack)
        }

        try {

            const response = await fetch(`/checkout_page?paymentMethod=${paymentMethod}`, { method: 'post' });
            if (!response.ok) {
                throw new Error('Network response was not ok while making order.');
            }

            const order = await response.json();
            if (order.status && order.razorpay_key) {

                const razorpay_key = order.razorpay_key;
                const orderResultAmount = order.orderResult.amount;
                const orderResultId = order.orderResult.id;
                const orderErrorMessage = order?.message ?? 'Error Occured';

                razorPayment(razorpay_key, orderResultAmount, orderResultId, orderErrorMessage);

            } else if (order.status && order.redirect) {

                window.location.href = order.redirect

            } else {

                Swal.fire({
                    title: "Order not placed",
                    text: order.message,
                    icon: 'error'
                });

            }
        }
        catch (error) {
            console.error("Error occured while making order", error.stack)
        }
    }


    const place_order = document.getElementById('place-order')
    if (place_order) {

        place_order.addEventListener('click', () => {
            if (paymentMethod) {

                placeOrderByCheckingAddress();

            } else {
          
                Swal.fire({
                    title: "Payment Method Required",
                    text: "Please select a payment method to proceed.s",
                    icon: 'error'
                });
            }

        })
    }

    function createOrderDetailsRow(products, addres, orderDate, orderId, deliveryDate) {

        const isoDate = orderDate;
        const date = new Date(isoDate);


        // Formatting to a more readable format
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        //Checking If already over the time to return product.
        const currentDate = new Date();
        const parsedDate = new Date(deliveryDate);
        const twoDaysLater = new Date(parsedDate);
        twoDaysLater.setDate(parsedDate.getDate() + 2);

        let derliveredOn = 'Not Delivered';
        if (products?.status == 'Delivered') {

            derlivery = new Date(deliveryDate);

            derliveredOn = derlivery.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

        }


        let returnBtn = '';
        if ((products?.status == 'Delivered') && (twoDaysLater >= currentDate)) {
            returnBtn = `<button onclick="returnProduct('${products?.product?.id}','${orderId}')"  class=" btn-${products?._id} bot-return-btn mt-2">Return</button>`
        } else if (products?.status == 'Pending') {
            returnBtn = `<button onclick="cancelProduct('${products?.product?.id}','${orderId}','${products?._id}')"  class=" btn-${products?._id} bot-return-btn mt-2">Cancel</button>`
        }

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
                    <p><span class="bot-bold">Ordered:</span> ${formattedDate}</p>
                    <p><span class="bot-bold">Delivered:</span> ${derliveredOn}</p>
                </div>
                </div>

                <!-- Address and Order ID -->
                <div class="col-md-6 bot-address-info mt-3 mt-md-0">
                <p><span class="bot-bold">product Order ID:</span> ${products?._id}</p>
                    <div class=" status-${products?._id} bot-status ods-status bot-status-${products?.status.toLowerCase()}">${products?.status}</div>
                </div>

                <!-- Price, Quantity, and Status -->
                <div class="col-md-6 bot-price-info mt-3 mt-md-0">
                <p><span class="bot-bold">Price:</span> ₹${products?.product.price} <span class="bot-bold">| Qty:</span> ${products?.quantity}</p>
                <p><span class="bot-bold">Net Total:</span> ₹${products?.itemNetTotal} (gst & decs included)</p>
                <div class="bot-return-status" >
                    
                    ${returnBtn}
                        
                </div>
                </div>
            </div>
        </div>`

    }


    const createInvoice = async (orderId, invoiceBtn) => {

        try {

            const response = await fetch(`/profile/invoice?order_id=${orderId}`);

            if (!response.ok) {
                throw new Error("Network response was not ok whilte trying to create invoice.");
            }

            const fileType = response.headers.get('X-File-Type');
            let filename = 'invoice.pdf';

            const data = await response.blob();
            if (data) {

                const url = await window.URL.createObjectURL(data);
                Swal.fire({

                    title: "<strong>Your file is ready</strong>",
                    icon: "info",
                    html: `
                      <a href="${url}" id="download-link" download="${filename}" >Click here to download</a>
                    `,
                    showConfirmButton: false,
                    didOpen: () => {
                        document.getElementById('download-link').onclick = () => {
                            Swal.close();
                        }
                    }
                });
                invoiceBtn.disabled = false;
            } else {
                invoiceBtn.disabled = false;
          
            }


        } catch (error) {
            console.error("Error occured while trying to create and  download invoice.", error.stack);
        }
    }


    const makePaymentForFailed = async (paymentMethod, orderId) => {

        try {

            const response = await fetch(`/checkout_page/retry/make-payment?paymentMethod=${paymentMethod}&order_id=${orderId}`, {
                method: 'post'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok while making order.');
            }

            const order = await response.json();
            if (order.status && order.razorpay_key) {

                const razorpay_key = order.razorpay_key;
                const orderResultAmount = order.orderResult.amount;
                const orderResultId = order.orderResult.id;
                const orderErrorMessage = order?.message ?? 'Error Occured';

                razorPayment(razorpay_key, orderResultAmount, orderResultId, orderErrorMessage);

            } else {

                Swal.fire({
                    title: "Order not placed",
                    text: order.message,
                    icon: 'error'
                });

            }
        }
        catch (error) {
            console.error("Error occured while making order", error.stack)
        }
    }

    const make_payment = document.getElementById('make-payment');
    if (make_payment) {

        make_payment.addEventListener('click', () => {
            if (paymentMethod) {

                const orderId = make_payment.dataset.order_id;
                makePaymentForFailed(paymentMethod, orderId);

            } else {
           
                Swal.fire({
                    title: "Payment Method Required",
                    text: "Please select a payment method to proceed.s",
                    icon: 'error'
                });
            }

        })
    }



    const invoiceBtn = document.getElementById('invoiceBtn');
    const retryPaymentBtn = document.getElementById('retryPaymentBtn');

    if (invoiceBtn) {
        invoiceBtn.addEventListener('click', () => {

            const orderId = invoiceBtn.dataset.orderId;
            invoiceBtn.disabled = true;
            createInvoice(orderId, invoiceBtn);

        })
    }
    if (retryPaymentBtn) {
        retryPaymentBtn.addEventListener('click', () => {

            const orderId = invoiceBtn.dataset.orderId;
            window.location.href = `/checkout_page/retry/${orderId}`

        })
    }
    function updateOrderDataTable(produts, addres, orderDate, orderId, deliveryDate, orderPaymentStatus, paymentMethod) {

        const tableBody = document.getElementById('order-detail-table');
        tableBody.innerHTML = produts.map(item => createOrderDetailsRow(item, addres, orderDate, orderId, deliveryDate)).join('');


        const order_address_type = document.getElementById('order-address-type');
        const order_address_place_city = document.getElementById('order-address-place_city');
        const order_address_landmark_pincode = document.getElementById('order-address-landmark_pincode');

        order_address_type.innerText = addres.addressType;
        order_address_place_city.innerText = `${addres.place}, ${addres.city} city`;
        order_address_landmark_pincode.innerText = `${addres.landmark}, Pin: ${addres.pinCode}`;

        invoiceBtn.dataset.orderId = orderId;
      
        if ((orderPaymentStatus == 'FAILED') || ((orderPaymentStatus == 'PENDING') && (paymentMethod == 'UPI Method'))) {
            retryPaymentBtn.classList.remove('display-order-details')
        } else {
            invoiceBtn.classList.remove('display-order-details');
        }

    }

    //Order-Details
    const order_history_table = document.getElementById('order-history-table');
    const toggle_order_history = document.getElementById('toggle-order-history');
    const show_all_btn = document.getElementById('show-all-btn');

    const payment_status = document.getElementById('payment-status');
    const order_total_items = document.getElementById('order-total-items');
    const order_header = document.getElementById('order-header');
    const order_details = document.getElementById('order-details');

    let orderPaymentStatus;
    if (order_history_table) {

        order_history_table.addEventListener('click', (e) => {

            const orderButton = e.target.closest('.odsIdUnifiedRow');
            if (orderButton) {

                fetch(`/profile/get-order-details?order_id=${orderButton.dataset.id}`)
                    .then(response => {

                        if (!response.ok) {
                            throw new Error('Network response was not ok while getting order details.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.status) {

                            orderPaymentStatus = data.orderPaymentStatus;
                            payment_status.classList.remove('display-order-details');
                            payment_status.innerText = `Overall Payment Status : ${orderPaymentStatus}`
                            order_total_items.classList.remove('display-order-details');
                            order_header.innerText = `Order Id: ${data.orderId}`;
                            order_header.classList.add('setfont');
                            order_total_items.innerText = `Total ${data.products.length} items`;

                            updateOrderDataTable(data.products, data.address, data.orderDate, data.orderId, data.deliveryDate, orderPaymentStatus, data.paymentMethod);

                            toggle_order_history.style.display = 'none';
                            order_details.classList.remove('display-order-details');
                            show_all_btn.classList.remove('display-order-details');

                        } else {

                            console.error('Failed to get the data from backend');

                        }

                    })

                    .catch(error => {
                        console.error("Error occured while getting order details.", error.stack)
                    })

            }
        })

        show_all_btn.addEventListener('click', () => {

            order_details.classList.add('display-order-details');
            show_all_btn.classList.add('display-order-details');
            payment_status.classList.add('display-order-details');
            payment_status.innerText = '';
            order_total_items.classList.add('display-order-details');
            order_total_items.innerText = '';
            order_header.innerText = 'Your Order History';
            order_header.classList.remove('setfont');
            toggle_order_history.style.display = 'block';

            if (!retryPaymentBtn.classList.contains('display-order-details')) {

                retryPaymentBtn.classList.add('display-order-details')
            }
            if (!invoiceBtn.classList.contains('display-order-details')) {

                invoiceBtn.classList.add('display-order-details');
            }

        })

    }

})