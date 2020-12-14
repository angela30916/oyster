// const db = firebase.firestore()
// const ref = db.collection('users')

// function addCountry() {
//     firebase.auth().onAuthStateChanged((user) => {
//         if (user) {
//             // User is signed in
//             var uid = user.uid
//             ref.doc(`${uid}`)
//                 .update({

//                 })
//                 .then(function (docRef) {
//                     console.log('Document written with ID: ', docRef.id)
//                 })
//                 .catch(function (error) {
//                     console.error('Error adding document: ', error)
//                 })
//         } else {
//             console.log('User is not signed-in!')
//         }
//     })
// }

const vistedBtn = document.querySelector('#visted')
const wishlistBtn = document.querySelector('#wishlist')
vistedBtn.addEventListener('click', (e) => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // const uid = user.uid
            if (e.currentTarget.getAttribute('data') === '0') {
                e.currentTarget.setAttribute('data', '1')
                e.target.style.fill = '#ddca03'
                // ANCHOR
                // const q = event.currentTarget.previousElementSibling.value
                //     .toLowerCase()
                //     .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
                // let countriesNode = d3.selectAll('path title')._groups[0]
                // let countriesList = Object.keys(countriesNode)
                //     .map((key) => [countriesNode[key]])
                //     .map((item) => item[0].textContent)
                // let index = countriesList.findIndex((country) => country === q)
                // let target = countriesNode[index].parentNode
            } else {
                e.currentTarget.setAttribute('data', '0')
                e.target.style.fill = '#fff'
            }
        } else {
            console.log('User is signed out!')
        }
    })
})

// TODO
wishlistBtn.addEventListener('click', (e) => {
    if (e.currentTarget.getAttribute('data') === '0') {
        e.currentTarget.setAttribute('data', '1')
        e.target.style.fill = '#ddca03'
    } else {
        e.currentTarget.setAttribute('data', '0')
        e.target.style.fill = '#fff'
    }
})

const exploreBtn = document.querySelector('#exploreBtn')
const exploreArea = document.querySelector('.exploreArea')
exploreBtn.addEventListener('click', () => {
    if (exploreArea.style.display === 'none') {
        exploreArea.style.display = 'block'
    } else {
        exploreArea.style.display = 'none'
    }
})
