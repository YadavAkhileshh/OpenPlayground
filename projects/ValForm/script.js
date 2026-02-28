const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

form.addEventListener("submit", e => {
  e.preventDefault();
  checkInputs();
});

function checkInputs() {
  checkUsername();
  checkEmail();
  checkPhone();
  checkPassword();
  checkConfirmPassword();
}

function setError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "form-control error";
  formControl.querySelector("small").innerText = message;
}

function setSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
}

function checkUsername() {
  const value = username.value.trim();
  if (value === "") {
    setError(username, "Username cannot be empty");
  } else if (value.length < 3) {
    setError(username, "Minimum 3 characters required");
  } else {
    setSuccess(username);
  }
}

function checkEmail() {
  const value = email.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === "") {
    setError(email, "Email cannot be empty");
  } else if (!regex.test(value)) {
    setError(email, "Email is not valid");
  } else {
    setSuccess(email);
  }
}

function checkPhone() {
  const value = phone.value.trim();
  const regex = /^[0-9]{10}$/;

  if (!regex.test(value)) {
    setError(phone, "Enter valid 10-digit phone number");
  } else {
    setSuccess(phone);
  }
}

function checkPassword() {
  const value = password.value.trim();

  if (value.length < 6) {
    setError(password, "Password must be at least 6 characters");
  } else {
    setSuccess(password);
  }
}

function checkConfirmPassword() {
  if (confirmPassword.value !== password.value || confirmPassword.value === "") {
    setError(confirmPassword, "Passwords do not match");
  } else {
    setSuccess(confirmPassword);
  }
}
