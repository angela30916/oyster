const db = firebase.firestore()
const userData = db.collection('users')
// const countryData = db.collection('countries')

function addVisitedCountry(uid, country) {
    userData.doc(`${uid}`).update({
        visited: firebase.firestore.FieldValue.arrayUnion(`${country}`),
    })
}

function addWishlistCountry(uid, country) {
    userData.doc(`${uid}`).update({
        wishlist: firebase.firestore.FieldValue.arrayUnion(`${country}`),
    })
}

function removeVisitedCountry(uid, country) {
    userData.doc(`${uid}`).update({
        visited: firebase.firestore.FieldValue.arrayRemove(`${country}`),
    })
}

function removeWishlistCountry(uid, country) {
    userData.doc(`${uid}`).update({
        wishlist: firebase.firestore.FieldValue.arrayRemove(`${country}`),
    })
}

const vistedBtn = document.querySelector('#visted')
vistedBtn.addEventListener('click', (e) => {
    const user = firebase.auth().currentUser
    if (user) {
        const uid = user.uid
        const countryName =
            e.currentTarget.parentNode.previousElementSibling.firstElementChild
                .textContent
        if (e.currentTarget.getAttribute('data') === '0') {
            e.currentTarget.setAttribute('data', '1')
            e.target.style.fill = '#5bd4cf'
            const countriesNode = d3.selectAll('path title')._groups[0]
            const countriesList = Object.keys(countriesNode)
                .map((key) => [countriesNode[key]])
                .map((item) => item[0].textContent)
            const index = countriesList.findIndex(
                (country) => country === countryName
            )
            const target = countriesNode[index].parentNode
            target.style.fill = '#5bd4cf'
            addVisitedCountry(uid, countryName)
        } else {
            e.currentTarget.setAttribute('data', '0')
            e.target.style.fill = '#fff'
            removeVisitedCountry(uid, countryName)
        }
    } else {
        Swal.fire({
            title: 'Please log in first!',
            confirmButtonColor: '#566492',
        })
    }
})

const wishlistBtn = document.querySelector('#wishlist')
wishlistBtn.addEventListener('click', (e) => {
    const user = firebase.auth().currentUser
    if (user) {
        const uid = user.uid
        const countryName =
            e.currentTarget.parentNode.previousElementSibling.firstElementChild
                .textContent
        if (e.currentTarget.getAttribute('data') === '0') {
            e.currentTarget.setAttribute('data', '1')
            e.target.style.fill = '#ff7979'
            const countriesNode = d3.selectAll('path title')._groups[0]
            const countriesList = Object.keys(countriesNode)
                .map((key) => [countriesNode[key]])
                .map((item) => item[0].textContent)
            const index = countriesList.findIndex(
                (country) => country === countryName
            )
            const target = countriesNode[index].parentNode
            target.style.fill = '#ff7979'
            addWishlistCountry(uid, countryName)
        } else {
            e.currentTarget.setAttribute('data', '0')
            e.target.style.fill = '#fff'
            removeWishlistCountry(uid, countryName)
        }
    } else {
        Swal.fire({
            title: 'Please log in first!',
            confirmButtonColor: '#566492',
        })
    }
})

// TODO
const exploreBtn = document.querySelector('#exploreBtn')
const exploreArea = document.querySelector('.exploreArea')
exploreBtn.addEventListener('click', () => {
    const user = firebase.auth().currentUser
    if (user) {
        if (exploreArea.style.display === 'none') {
            exploreArea.style.display = 'block'
        } else {
            exploreArea.style.display = 'none'
        }
    } else {
        Swal.fire({
            title: 'Please log in first!',
            confirmButtonColor: '#566492',
        })
    }
})

// // ANCHOR
// let data = []
// function updateData(database) {
//     database.onSnapshot((res) => {
//         res.docChanges().forEach((change) => {
//             const doc = { ...change.doc.data(), id: change.doc.id }

//             switch (change.type) {
//                 case 'added':
//                     data.push(doc)
//                     break
//                 case 'modified':
//                     const index = data.findIndex((item) => item.id === doc.id)
//                     data[index] = doc
//                     break
//                 case 'removed':
//                     data = data.filter((item) => item.id !== doc.id)
//                     break
//                 default:
//                     break
//             }
//         })
//     })
// }
