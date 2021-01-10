/* global usersDB, countriesDB */
/* exported countriesGroup, comments, commentBtn, infoBtn, commentArea, infoArea, earthInfoArea, countryInfoArea,get, colorCountry, showRatings, resetCommentArea */
const commentBtn = get('#commentBtn')
const infoBtn = get('#infoBtn')
const commentArea = get('#commentArea')
const infoArea = get('#infoArea')
const earthInfoArea = get('#earthInfoArea')
const countryInfoArea = get('#countryInfoArea')
let comments = [countriesDB.get().then((querySnapshot) => querySnapshot)]
let countriesGroup

function get(selector) {
    return document.querySelector(selector)
}

function getAll(selector) {
    return document.querySelectorAll(selector)
}

function colorCountry() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            usersDB
                .doc(`${user.uid}`)
                .get()
                .then(function (doc) {
                    if (doc.exists) {
                        const wishlist = doc.data().wishlist
                        const visited = doc.data().visited
                        countriesGroup.style('fill', function (d) {
                            return visited.includes(d.properties.name)
                                ? '#00798c'
                                : wishlist.includes(d.properties.name)
                                ? '#ff7979'
                                : '#003d5b'
                        })
                    }
                })
        }
    })
}

function showRatings(country) {
    let ratings = comments.filter((comment) => country === comment.id)[0]
        ? Object.values(comments.filter((comment) => country === comment.id)[0])
        : null
    ratings?.pop()
    ratings = ratings ? ratings.map((r) => +r.rating) : null

    if (ratings) {
        const sum = ratings.reduce((a, b) => a + b, 0)
        const avgStar = Math.round((sum / ratings.length) * 10) / 10
        const starPercentage = `${(avgStar / 5) * 100}%`
        get('.stars-inner').style.width = starPercentage
        get('#rating-score').textContent = `${avgStar}`
        get('.count').textContent = `(${ratings.length})`
    } else {
        get('.stars-inner').style.width = 0
        get('#rating-score').textContent = '0'
        get('.count').textContent = '(0)'
    }
}

function resetCommentArea() {
    getAll('.comment')?.forEach((e) => e.remove())
    get('#noComment')?.remove()
}
