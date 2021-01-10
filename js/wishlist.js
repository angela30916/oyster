/* global usersDB, countriesGroup, colorCountry, get,  */
const visitedBtn = get('#visited path')
const wishlistBtn = get('#wishlist path')
const exploreBtn = get('#exploreBtn')
const exploreArea = get('.exploreArea')
const exploreSelection = get('.exploreArea select')

function initWishlist() {
    toggleVisited()
    toggleWishlist()
    showExploreArea()
}

function toggleVisited() {
    visitedBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser
        if (user) {
            const uid = user.uid
            const countryName = get('#name').textContent
            if (wishlistBtn.getAttribute('data') === '1') {
                Swal.fire({
                    title: 'You can only choose one!',
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
                return
            } else if (visitedBtn.getAttribute('data') === '0') {
                visitedBtn.setAttribute('data', '1')
                visitedBtn.style.fill = '#00798c'
                addVisitedCountry(uid, countryName)
            } else {
                visitedBtn.setAttribute('data', '0')
                visitedBtn.style.fill = '#fff'
                removeVisitedCountry(uid, countryName)
            }
        } else {
            Swal.fire({
                title: 'Please log in first!',
                confirmButtonColor: '#003d5b',
            })
        }
    })
}

function toggleWishlist() {
    wishlistBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser
        if (user) {
            const uid = user.uid
            const countryName = document.querySelector('#name').textContent
            if (visitedBtn.getAttribute('data') === '1') {
                Swal.fire({
                    title: 'You can only choose one!',
                    icon: 'error',
                    confirmButtonColor: '#003d5b',
                    confirmButtonText: 'OK',
                })
                return
            } else if (wishlistBtn.getAttribute('data') === '0') {
                wishlistBtn.setAttribute('data', '1')
                wishlistBtn.style.fill = '#ff7979'
                addWishlistCountry(uid, countryName)
            } else {
                wishlistBtn.setAttribute('data', '0')
                wishlistBtn.style.fill = '#fff'
                removeWishlistCountry(uid, countryName)
            }
        } else {
            Swal.fire({
                title: 'Please log in first!',
                confirmButtonColor: '#003d5b',
            })
        }
    })
}

function addVisitedCountry(uid, country) {
    usersDB.doc(`${uid}`).update({
        visited: firebase.firestore.FieldValue.arrayUnion(`${country}`),
    })
}

function addWishlistCountry(uid, country) {
    usersDB.doc(`${uid}`).update({
        wishlist: firebase.firestore.FieldValue.arrayUnion(`${country}`),
    })
}

function removeVisitedCountry(uid, country) {
    usersDB.doc(`${uid}`).update({
        visited: firebase.firestore.FieldValue.arrayRemove(`${country}`),
    })
}

function removeWishlistCountry(uid, country) {
    usersDB.doc(`${uid}`).update({
        wishlist: firebase.firestore.FieldValue.arrayRemove(`${country}`),
    })
}

function showExploreArea() {
    exploreBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser
        if (user) {
            if (exploreArea.style.display === 'none') {
                exploreBtn.style.color = '#edae49'
                exploreArea.style.display = 'block'
                getUsersDB(user)
            } else {
                exploreArea.style.display = 'none'
                exploreBtn.style.color = '#fff'
                get('#otherVisited').textContent = "Other's Visited Countries"
                get('#otherWishlist').textContent = "Other's Bucket List"
                colorCountry()
            }
        } else {
            Swal.fire({
                title: 'Please log in first!',
                confirmButtonColor: '#003d5b',
            })
        }
    })
}

function getUsersDB(user) {
    const nameID = new Map()
    const visitedLists = []
    const wishlists = []
    usersDB.get().then((querySnapshot) => {
        const setDataPromises = querySnapshot.docs.map((doc) => {
            nameID.set(doc.id, doc.data().name)
            visitedLists.push(doc.data().visited)
            wishlists.push(doc.data().wishlist)
        })
        Promise.all(setDataPromises).then(() => {
            setSelection(user, nameID, visitedLists, wishlists)
        })
    })
}

function setSelection(user, nameID, visitedLists, wishlists) {
    const optList = []
    nameID.forEach((value, key) => {
        optList.push(
            key === user.uid
                ? `<option value="${value}" selected>${value}(You)</option>`
                : `<option value="${value}">${value}</option>`
        )
    })
    let options = ''
    optList.forEach((opt) => (options += opt))
    exploreSelection.innerHTML = options
    showSelection(visitedLists, wishlists)
}

function showSelection(visitedLists, wishlists) {
    exploreSelection.addEventListener('change', () => {
        const selected = exploreSelection.value
        const selectedIndex = exploreSelection.selectedIndex
        const otherVisited = visitedLists[selectedIndex]
        const otherWishlist = wishlists[selectedIndex]
        get('#otherVisited').textContent = `${selected}'s Visited Countries`
        get('#otherWishlist').textContent = `${selected}'s Bucket List`
        reRenderCountryColor(otherVisited, otherWishlist)
    })
}

function reRenderCountryColor(otherVisited, otherWishlist) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            usersDB
                .doc(`${user.uid}`)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const wishlist = doc.data().wishlist
                        const visited = doc.data().visited
                        countriesGroup.style('fill', (d) => {
                            return visited.includes(d.properties.name)
                                ? '#00798c'
                                : wishlist.includes(d.properties.name)
                                ? '#ff7979'
                                : otherVisited.includes(d.properties.name)
                                ? '#d1d1d1'
                                : otherWishlist.includes(d.properties.name)
                                ? '#f2cc8f'
                                : '#003d5b'
                        })
                    }
                })
        }
    })
}

window.addEventListener('DOMContentLoaded', initWishlist)
