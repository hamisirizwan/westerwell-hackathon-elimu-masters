export const isValidKenyanPhoneNumber = (phoneNumber:string) => {
    const kenyanPhoneNumberRegex = /^(07\d{8}|01\d{8}|2547\d{8}|2541\d{8}|\+2547\d{8}|\+2541\d{8})$/;
    return kenyanPhoneNumberRegex.test(phoneNumber);
  };
  


  export const normalizeKenyanPhoneNumber = (phoneNumber:string) =>{
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    return `254${cleanedNumber.slice(-9)}`;
}