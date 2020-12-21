/* global countries */
const db = firebase.firestore()
const userData = db.collection('users')
const visitedBtn = document.querySelector('#visited path')
const wishlistBtn = document.querySelector('#wishlist path')

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

visitedBtn.addEventListener('click', (e) => {
    const user = firebase.auth().currentUser
    if (user) {
        const uid = user.uid
        const countryName =
            e.currentTarget.parentNode.parentNode.previousElementSibling
                .firstElementChild.textContent
        if (wishlistBtn.getAttribute('data') === '1') {
            Swal.fire({
                title: 'You can only choose one!',
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
            return
        } else if (e.currentTarget.getAttribute('data') === '0') {
            e.currentTarget.setAttribute('data', '1')
            e.currentTarget.style.fill = '#5bd4cf'
            // const countriesNode = d3.selectAll('path title')._groups[0]
            // const countriesList = Object.keys(countriesNode)
            //     .map((key) => [countriesNode[key]])
            //     .map((item) => item[0].textContent)
            // const index = countriesList.findIndex(
            //     (country) => country === countryName
            // )
            // const target = countriesNode[index].parentNode
            // target.style.fill = '#5bd4cf'
            addVisitedCountry(uid, countryName)
        } else {
            e.currentTarget.setAttribute('data', '0')
            e.currentTarget.style.fill = '#fff'
            removeVisitedCountry(uid, countryName)
        }
    } else {
        Swal.fire({
            title: 'Please log in first!',
            confirmButtonColor: '#566492',
        })
    }
})

wishlistBtn.addEventListener('click', (e) => {
    const user = firebase.auth().currentUser
    if (user) {
        const uid = user.uid
        const countryName =
            e.currentTarget.parentNode.parentNode.previousElementSibling
                .firstElementChild.textContent
        if (visitedBtn.getAttribute('data') === '1') {
            Swal.fire({
                title: 'You can only choose one!',
                icon: 'error',
                confirmButtonColor: '#566492',
                confirmButtonText: 'OK',
            })
            return
        } else if (e.currentTarget.getAttribute('data') === '0') {
            e.currentTarget.setAttribute('data', '1')
            e.currentTarget.style.fill = '#ff7979'
            // const countriesNode = d3.selectAll('path title')._groups[0]
            // const countriesList = Object.keys(countriesNode)
            //     .map((key) => [countriesNode[key]])
            //     .map((item) => item[0].textContent)
            // const index = countriesList.findIndex(
            //     (country) => country === countryName
            // )
            // const target = countriesNode[index].parentNode
            // target.style.fill = '#ff7979'
            addWishlistCountry(uid, countryName)
        } else {
            e.currentTarget.setAttribute('data', '0')
            e.currentTarget.style.fill = '#fff'
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

function colorCountry() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            userData
                .doc(`${user.uid}`)
                .get()
                .then(function (doc) {
                    if (doc.exists) {
                        var wishlist = doc.data().wishlist
                        var visited = doc.data().visited
                        countries.style('fill', function (d) {
                            return visited.includes(d.properties.name)
                                ? '#5bd4cf'
                                : wishlist.includes(d.properties.name)
                                ? '#ff7979'
                                : '#566492'
                        })
                    } else {
                        console.log('No such document!')
                    }
                })
                .catch(function (error) {
                    console.log('Error getting document:', error)
                })
        } else {
            return
        }
    })
}
colorCountry()
