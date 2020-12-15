const firebaseConfig = {
    apiKey: 'AIzaSyB_u7VRtuCAfVSIBhwYcYLJwiZBJpH9-qo',
    authDomain: 'oyster-anping.firebaseapp.com',
    projectId: 'oyster-anping',
    storageBucket: 'oyster-anping.appspot.com',
    messagingSenderId: '473930989738',
    appId: '1:473930989738:web:cd62ac993e7f1b875950d3',
}
firebase.initializeApp(firebaseConfig)
firebase.analytics()

const memberBtn = document.querySelector('.login')
const signInArea = document.querySelector('.signInArea')
const signUpBtn = document.querySelector('.signUpBtn')
const signUpArea = document.querySelector('.signUpArea')
const signInBtn = document.querySelector('.signInBtn')
const signOutBtn = document.querySelector('.logout')

memberBtn.addEventListener('click', (e) => {
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

document.addEventListener('click', (e) => {
    const isClickInside =
        signInArea.contains(e.target) || signUpArea.contains(e.target)
    if (!isClickInside) {
        signInArea.style.display = 'none'
        signUpArea.style.display = 'none'
    }
})

const eye = document.querySelector('.eye img')
eye.addEventListener('click', () => {
    const input = document.querySelector('.passwordInput')
    if (input.type === 'password') {
        input.type = 'text'
        eye.style.content = 'url(../images/visible.png)'
    } else {
        input.type = 'password'
        eye.style.content = 'url(../images/invisible.png)'
    }
})

signUpBtn.addEventListener('click', () => {
    signInArea.style.display = 'none'
    signUpArea.style.display = 'block'
})

signInBtn.addEventListener('click', () => {
    signUpArea.style.display = 'none'
    signInArea.style.display = 'block'
})

// Remember Me
const rmCheck = document.getElementById('rememberMe')
const emailInput = document.querySelector('.signInArea input[type="email"]')

if (localStorage.checkbox && localStorage.checkbox !== '') {
    rmCheck.setAttribute('checked', 'checked')
    emailInput.value = localStorage.username
} else {
    rmCheck.removeAttribute('checked')
    emailInput.value = ''
}

function lsRememberMe() {
    if (rmCheck.checked && emailInput.value !== '') {
        localStorage.username = emailInput.value
        localStorage.checkbox = rmCheck.value
    } else {
        localStorage.username = ''
        localStorage.checkbox = ''
    }
}

// Sign up new users
document.querySelector('#signUp').addEventListener('click', (e) => {
    e.preventDefault()
    let username = document
        .querySelector('.signUpArea input[type="text"]')
        .value.trim()
    let email = document
        .querySelector('.signUpArea input[type="email"]')
        .value.trim()
    let password = document.querySelectorAll('.passwordInput')[1].value.trim()
    let confirmPassword = document
        .querySelectorAll('.passwordInput')[2]
        .value.trim()

    const emailRegex = /^([a-z0-9_-]+)@([\da-z-]+)\.([a-z]{2,6})$/
    if (!username) {
        Swal.fire({
            title: 'Please fill in your name!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
        return
    } else if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Please check your email address!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
        return
    } else if (!password) {
        Swal.fire({
            title: 'Please set up your password!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
        return
    } else if (confirmPassword !== password) {
        Swal.fire({
            title: 'Please check your password again!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
        return
    }

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
            firebase
                .auth()
                .currentUser.updateProfile({
                    displayName: `${username}`,
                })
                .then(() => {
                    signUpArea.style.display = 'none'
                    Swal.fire({
                        title: 'Signed up sucessfully!',
                        text: `Hello, ${username}!`,
                        icon: 'success',
                        confirmButtonColor: '#566492',
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
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
})

// Sign in existing users
document.querySelector('#signIn').addEventListener('click', (e) => {
    e.preventDefault()
    lsRememberMe()
    let email = document
        .querySelector('.signInArea input[type="email"]')
        .value.trim()
    let password = document
        .querySelector('.signInArea input[type="password"]')
        .value.trim()

    const emailRegex = /^([a-z0-9_-]+)@([\da-z-]+)\.([a-z]{2,6})$/
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Please check your email address!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
        return
    } else if (!password) {
        Swal.fire({
            title: 'Please fill in your password!',
            icon: 'error',
            confirmButtonColor: '#566492',
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
                title: 'Logged in sucessfully!',
                text: user.displayName
                    ? `Welcome back, ${user.displayName}!`
                    : 'Welcome back!',
                icon: 'success',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
        .catch((error) => {
            const errorMessage = error.message
            Swal.fire({
                title: 'Oops...',
                text: `${errorMessage}`,
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
})

// FB Login
document.querySelector('#FBLogin').addEventListener('click', (e) => {
    e.preventDefault()
    const provider = new firebase.auth.FacebookAuthProvider()
    firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
            signInArea.style.display = 'none'
            const user = result.user
            Swal.fire({
                title: 'Sucessfully logged in with Facebook!',
                text: `Hello, ${user.displayName}!`,
                icon: 'success',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
        .catch(function (error) {
            const errorMessage = error.message
            Swal.fire({
                title: 'Oops...',
                text: `${errorMessage}`,
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
})

// Google Sign-In
document.querySelector('#GoogleLogin').addEventListener('click', (e) => {
    e.preventDefault()
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
            signInArea.style.display = 'none'
            const user = result.user
            Swal.fire({
                title: 'Sucessfully logged in with Google!',
                text: `Hello, ${user.displayName}!`,
                icon: 'success',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
        .catch(function (error) {
            const errorMessage = error.message
            Swal.fire({
                title: 'Oops...',
                text: `${errorMessage}`,
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
})

//Sign out
signOutBtn.addEventListener('click', () => {
    firebase
        .auth()
        .signOut()
        .then(function () {
            Swal.fire({
                title: 'You are logged out!',
                icon: 'success',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            }).then(() => location.reload())
        })
        .catch(function (error) {
            const errorMessage = error.message
            Swal.fire({
                title: 'Oops...',
                text: `${errorMessage}`,
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
        })
})

// Authentication state observer
function checkLoginStatus() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            var uid = user.uid
            console.log(uid)
            memberBtn.style.display = 'none'
            signOutBtn.style.display = 'inline-block'
        } else {
            // User is signed out
            console.log('User is signed out!')
            memberBtn.style.display = 'inline-block'
            signOutBtn.style.display = 'none'
        }
    })
}

window.addEventListener('DOMContentLoaded', checkLoginStatus)
