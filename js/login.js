const firebaseConfig = {
    apiKey: 'AIzaSyB_u7VRtuCAfVSIBhwYcYLJwiZBJpH9-qo',
    authDomain: 'oyster-anping.firebaseapp.com',
    projectId: 'oyster-anping',
    storageBucket: 'oyster-anping.appspot.com',
    messagingSenderId: '473930989738',
    appId: '1:473930989738:web:cd62ac993e7f1b875950d3',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

const memberBtn = document.querySelector('.member')
const signInArea = document.querySelector('.signInArea')
const signUpBtn = document.querySelector('.signUpBtn')
const signUpArea = document.querySelector('.signUpArea')
const signInBtn = document.querySelector('.signInBtn')
const signOutBtn = document.querySelector('.signOut')

signOutBtn.addEventListener('click', signOut)

memberBtn.addEventListener('click', () => {
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

const eyes = document.querySelectorAll('.eye img')
eyes.forEach((eye) =>
    eye.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.passwordInput')
        for (let i = 0; i < 2; i++) {
            if (inputs[i].type === 'password') {
                inputs[i].type = 'text'
                eye.style.content = 'url(../images/invisible.png)'
            } else {
                inputs[i].type = 'password'
                eye.style.content = 'url(../images/visible.png)'
            }
        }
    })
)

signUpBtn.addEventListener('click', () => {
    signInArea.style.display = 'none'
    signUpArea.style.display = 'block'
})

signInBtn.addEventListener('click', () => {
    signUpArea.style.display = 'none'
    signInArea.style.display = 'block'
})

// Sign up new users
document.querySelector('#signUp').addEventListener('click', (e) => {
    e.preventDefault()
    const email = document.querySelector('.signUpArea input[type="email"]')
        .value
    const password = document.querySelector(
        '.signUpArea input[type="password"]'
    ).value
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
            // Signed in
            signUpArea.style.display = 'none'
        })
        .catch((error) => {
            var errorCode = error.code
            var errorMessage = error.message
            console.log(errorCode, errorMessage)
            alert(errorMessage)
        })
})

// Sign in existing users
document.querySelector('#signIn').addEventListener('click', (e) => {
    e.preventDefault()
    const email = document.querySelector('.signInArea input[type="email"]')
        .value
    const password = document.querySelector(
        '.signInArea input[type="password"]'
    ).value
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            // Signed in
            signInArea.style.display = 'none'
        })
        .catch((error) => {
            var errorCode = error.code
            var errorMessage = error.message
            console.log(errorCode, errorMessage)
            alert(errorMessage)
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

// // Get user's profile
// var user = firebase.auth().currentUser
// var name, email, photoUrl, uid, emailVerified

// if (user != null) {
//     name = user.displayName
//     email = user.email
//     photoUrl = user.photoURL
//     emailVerified = user.emailVerified
//     uid = user.uid // The user's ID, unique to the Firebase project. Do NOT use
//     // this value to authenticate with your backend server, if
//     // you have one. Use User.getToken() instead.
// }

// // FB Login
// const providerFB = new firebase.auth.FacebookAuthProvider()
// firebase
//     .auth()
//     .signInWithPopup(providerFB)
//     .then(function (result) {
//         // This gives you a Facebook Access Token. You can use it to access the Facebook API.
//         var token = result.credential.accessToken
//         // The signed-in user info.
//         var user = result.user
//         // ...
//     })
//     .catch(function (error) {
//         // Handle Errors here.
//         var errorCode = error.code
//         var errorMessage = error.message
//         // The email of the user's account used.
//         var email = error.email
//         // The firebase.auth.AuthCredential type that was used.
//         var credential = error.credential
//         // ...
//     })

//Sign out
function signOut() {
    firebase
        .auth()
        .signOut()
        .then(function () {
            console.log('Sign-out successful!')
        })
        .catch(function (error) {
            console.log(error)
        })
}

window.addEventListener('DOMContentLoaded', checkLoginStatus)
