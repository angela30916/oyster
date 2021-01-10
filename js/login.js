/* global usersDB, get */
const loginBtn = get('#login')
const logoutBtn = get('#logout')
const signInArea = get('#signInArea')
const signUpArea = get('#signUpArea')
const toSignUp = get('#toSignUp')
const toSignIn = get('#toSignIn')
const signInBtn = get('#signInBtn')
const signUpBtn = get('#signUpBtn')
const eye = get('.eye img')
const rememberCheck = get('#rememberMe')
const emailInput = get('#signInArea input[type="email"]')

function initLogin() {
    checkLoginStatus()
    toggleLoginArea()
    closeLoginAreaIfClickOutside()
    toggleToShowPassword()
    toggleToSignUp()
    toggleToSignIn()
    checkRememberMe()
    signUpNewUsers()
    signInExistingUsers()
    FBLogin()
    GoogleSignIn()
    signOut()
}

function toggleLoginArea() {
    loginBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (
            signInArea.style.display === 'none' &&
            signUpArea.style.display === 'none'
        ) {
            signInArea.style.display = 'block'
        } else {
            signInArea.style.display = 'none'
            signUpArea.style.display = 'none'
        }
    })
}

function closeLoginAreaIfClickOutside() {
    document.addEventListener('click', (e) => {
        const isClickInside =
            signInArea.contains(e.target) || signUpArea.contains(e.target)
        if (!isClickInside) {
            signInArea.style.display = 'none'
            signUpArea.style.display = 'none'
        }
    })
}
function toggleToShowPassword() {
    eye.addEventListener('click', () => {
        const signInPasswordInput = get('#signInPassword')
        if (signInPasswordInput.type === 'password') {
            signInPasswordInput.type = 'text'
            eye.style.content = 'url(../images/visible.png)'
        } else {
            signInPasswordInput.type = 'password'
            eye.style.content = 'url(../images/invisible.png)'
        }
    })
}

function toggleToSignUp() {
    toSignUp.addEventListener('click', () => {
        signInArea.style.display = 'none'
        signUpArea.style.display = 'block'
    })
}

function toggleToSignIn() {
    toSignIn.addEventListener('click', () => {
        signUpArea.style.display = 'none'
        signInArea.style.display = 'block'
    })
}

function checkRememberMe() {
    if (localStorage.checkbox && localStorage.checkbox !== '') {
        rememberCheck.setAttribute('checked', 'checked')
        emailInput.value = localStorage.username
    } else {
        rememberCheck.removeAttribute('checked')
        emailInput.value = ''
    }
}

function setRememberMe() {
    if (rememberCheck.checked && emailInput.value !== '') {
        localStorage.username = emailInput.value
        localStorage.checkbox = rememberCheck.value
    } else {
        localStorage.username = ''
        localStorage.checkbox = ''
    }
}

function signUpNewUsers() {
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault()
        const username = get('#signUpArea input[type="text"]').value.trim()
        const email = get('#signUpArea input[type="email"]').value.trim()
        const password = get('#signUpPassword').value.trim()
        const confirmPassword = get('#confirmPassword').value.trim()

        const emailRegex = /^([a-z0-9_-]+)@([\da-z-]+)\.([a-z]{2,6})$/
        if (!username) {
            Swal.fire({
                title: 'Please fill in your name!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        } else if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Please check your email address!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        } else if (!password) {
            Swal.fire({
                title: 'Please set up your password!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        } else if (confirmPassword !== password) {
            Swal.fire({
                title: 'Please check your password again!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        }

        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((results) => {
                firebase
                    .auth()
                    .currentUser.updateProfile({
                        displayName: `${username}`,
                    })
                    .then(() => {
                        usersDB.doc(`${results.user.uid}`).set({
                            name: `${username}`,
                            visited: [],
                            wishlist: [],
                        })
                        signUpArea.style.display = 'none'
                        Swal.fire({
                            title: 'Signed up successfully!',
                            text: `Hello, ${username}!`,
                            icon: 'success',
                            confirmButtonColor: '#003d5b',
                            confirmButtonText: 'OK',
                        })
                    })
            })
            .catch((error) => {
                const errorMessage = error.message
                Swal.fire({
                    title: 'Oops...',
                    text: `${errorMessage}`,
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
    })
}

function signInExistingUsers() {
    signInBtn.addEventListener('click', (e) => {
        e.preventDefault()
        setRememberMe()
        const email = get('#signInArea input[type="email"]').value.trim()
        const password = get('#signInArea input[type="password"]').value.trim()

        const emailRegex = /^([a-z0-9_-]+)@([\da-z-]+)\.([a-z]{2,6})$/
        if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Please check your email address!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        } else if (!password) {
            Swal.fire({
                title: 'Please fill in your password!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
            return
        }

        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((result) => {
                signInArea.style.display = 'none'
                const user = result.user
                Swal.fire({
                    title: 'Logged in successfully!',
                    text: user.displayName
                        ? `Welcome back, ${user.displayName}!`
                        : 'Welcome back!',
                    icon: 'success',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
            .catch((error) => {
                const errorMessage = error.message
                Swal.fire({
                    title: 'Oops...',
                    text: `${errorMessage}`,
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
    })
}

function FBLogin() {
    get('#FBLogin').addEventListener('click', (e) => {
        e.preventDefault()
        const provider = new firebase.auth.FacebookAuthProvider()
        firebase
            .auth()
            .signInWithPopup(provider)
            .then((result) => {
                signUpArea.style.display = 'none'
                signInArea.style.display = 'none'
                const user = result.user
                Swal.fire({
                    title: 'Successfully logged in with Facebook!',
                    text: `Hello, ${user.displayName}!`,
                    icon: 'success',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
                usersDB
                    .doc(`${user.uid}`)
                    .get()
                    .then(function (doc) {
                        if (doc.exists) {
                            return
                        } else {
                            usersDB.doc(`${result.user.uid}`).set({
                                name: `${user.displayName}`,
                                visited: [],
                                wishlist: [],
                            })
                        }
                    })
            })
            .catch(function (error) {
                const errorMessage = error.message
                Swal.fire({
                    title: 'Oops...',
                    text: `${errorMessage}`,
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
    })
}

function GoogleSignIn() {
    get('#GoogleLogin').addEventListener('click', (e) => {
        e.preventDefault()
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase
            .auth()
            .signInWithPopup(provider)
            .then((result) => {
                signInArea.style.display = 'none'
                const user = result.user
                Swal.fire({
                    title: 'Successfully logged in with Google!',
                    text: `Hello, ${user.displayName}!`,
                    icon: 'success',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
                usersDB
                    .doc(`${user.uid}`)
                    .get()
                    .then(function (doc) {
                        if (doc.exists) {
                            return
                        } else {
                            usersDB.doc(`${result.user.uid}`).set({
                                name: `${user.displayName}`,
                                visited: [],
                                wishlist: [],
                            })
                        }
                    })
            })
            .catch((error) => {
                const errorMessage = error.message
                Swal.fire({
                    title: 'Oops...',
                    text: `${errorMessage}`,
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
    })
}

function signOut() {
    logoutBtn.addEventListener('click', () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                Swal.fire({
                    title: 'You are logged out!',
                    icon: 'success',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                }).then(() => location.reload())
            })
            .catch((error) => {
                const errorMessage = error.message
                Swal.fire({
                    title: 'Oops...',
                    text: `${errorMessage}`,
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
            })
    })
}

function checkLoginStatus() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loginBtn.style.display = 'none'
            logoutBtn.style.display = 'inline-block'
        } else {
            loginBtn.style.display = 'inline-block'
            logoutBtn.style.display = 'none'
        }
    })
}

window.addEventListener('DOMContentLoaded', initLogin)
