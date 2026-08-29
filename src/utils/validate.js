import validator from "validator";

const validateSignUpDate = (req) => {
  
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("Firstname and Lastname are required ");
  }

  if (firstName?.trim().length < 3 || lastName?.trim().length < 1) {
    throw new Error("Name must contain atleast 3 characters");
  }

  if (!validator.isEmail(emailId) || "") {
    throw new Error("Email address is not valid");
  }

  if (!validator.isStrongPassword(password) || "") {
    throw new Error("Enter a strong password");
  }

  return true;
};

export default validateSignUpDate;
