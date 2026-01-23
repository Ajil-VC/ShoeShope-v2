const RESPONSE_MESSAGES = {

    AUTH: {
        LOGIN_SUCCESS: 'Login successful.',
        INVALID_CREDENTIALS: 'Invalid email or password.',
        UNAUTHORIZED: 'You are not authorized.',

        OTP_VALIDATED: "otp Validated",
        OTP_INVALID: "Invalid otp"
    },
    COMMON: {
        SERVER_ERROR: 'Internal Error Occured. Please try again.',
        SUCCESS: 'Success',
        FAILED: 'Failed'
    }
};

module.exports = RESPONSE_MESSAGES;