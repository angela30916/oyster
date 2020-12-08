// var firebaseConfig = {
//     apiKey: 'AIzaSyB_u7VRtuCAfVSIBhwYcYLJwiZBJpH9-qo',
//     authDomain: 'oyster-anping.firebaseapp.com',
//     projectId: 'oyster-anping',
//     storageBucket: 'oyster-anping.appspot.com',
//     messagingSenderId: '473930989738',
//     appId: '1:473930989738:web:cd62ac993e7f1b875950d3',
// }
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig)
// firebase.analytics()

// // Initialize the FirebaseUI Widget using Firebase.
// var ui = new firebaseui.auth.AuthUI(firebase.auth())
// ui.start('#firebaseui-auth-container', {
//     signInOptions: [
//         firebase.auth.EmailAuthProvider.PROVIDER_ID,
//         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//         firebase.auth.FacebookAuthProvider.PROVIDER_ID,
//     ],
//     requireDisplayName: false,
// })
// var uiConfig = {
//     callbacks: {
//         signInSuccessWithAuthResult: function (authResult, redirectUrl) {
//             // User successfully signed in.
//             // Return type determines whether we continue the redirect automatically
//             // or whether we leave that to developer to handle.
//             return true
//         },
//         uiShown: function () {
//             // The widget is rendered.
//             // Hide the loader.
//             document.getElementById('loader').style.display = 'none'
//         },
//     },
//     // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
//     signInFlow: 'popup',
//     signInSuccessUrl: '<url-to-redirect-to-on-success>',
//     signInOptions: [
//         // Leave the lines as is for the providers you want to offer your users.
//         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//         firebase.auth.FacebookAuthProvider.PROVIDER_ID,
//         firebase.auth.EmailAuthProvider.PROVIDER_ID,
//     ],
//     // Terms of service url.
//     tosUrl: '<your-tos-url>',
//     // Privacy policy url.
//     privacyPolicyUrl: '<your-privacy-policy-url>',
// }
// // The start method will wait until the DOM is loaded.
// ui.start('#firebaseui-auth-container', uiConfig)

// //FB
// var provider = new firebase.auth.FacebookAuthProvider()
// firebase
//     .auth()
//     .signInWithPopup(provider)
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

// /* login */
// var user = firebase.auth().currentUser

// if (user) {
//     // User is signed in.
// } else {
//     // No user is signed in.
// }

// var name, email, photoUrl, uid, emailVerified

// if (user != null) {
//     name = user.displayName
//     email = user.email
//     photoUrl = user.photoURL
//     emailVerified = user.emailVerified
//     uid = user.uid // The user's ID, unique to the Firebase project. Do NOT use
//     // this value to authenticate with your backend server, if
//     // you have one. Use User.getToken() instead.
//     user.providerData.forEach(function (profile) {
//         console.log('Sign-in provider: ' + profile.providerId)
//         console.log('  Provider-specific UID: ' + profile.uid)
//         console.log('  Name: ' + profile.displayName)
//         console.log('  Email: ' + profile.email)
//         console.log('  Photo URL: ' + profile.photoURL)
//     })
// }
// // 註冊
// firebase
//     .auth()
//     .createUserWithEmailAndPassword(email, password)
//     .then((user) => {
//         // Signed in
//         // ...
//     })
//     .catch((error) => {
//         var errorCode = error.code
//         var errorMessage = error.message
//         // ..
//     })

// // 登入
// firebase
//     .auth()
//     .signInWithEmailAndPassword(email, password)
//     .then((user) => {
//         // Signed in
//         // ...
//     })
//     .catch((error) => {
//         var errorCode = error.code
//         var errorMessage = error.message
//     })

// firebase.auth().onAuthStateChanged((user) => {
//     if (user) {
//         // User is signed in, see docs for a list of available properties
//         // https://firebase.google.com/docs/reference/js/firebase.User
//         var uid = user.uid
//         // ...
//     } else {
//         // User is signed out
//         // ...
//     }
// })

// //sign out
// firebase
//     .auth()
//     .signOut()
//     .then(function () {
//         // Sign-out successful.
//     })
//     .catch(function (error) {
//         // An error happened.
//     })
