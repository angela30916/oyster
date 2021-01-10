/* global comments, commentBtn, infoBtn, commentArea, infoArea, get, getAll, showRatings, resetCommentArea, countriesDB */
const submitBtn = get('.submit button')
const commentInput = get('#comment')
const inputArea = get('.commentInput')
let starsToSend = 0

function initRating() {
    showComments()
    showInfoArea()
    submitComment()
    updateCommentList()
}

function showComments() {
    commentBtn.addEventListener('click', () => {
        showInputArea()
        if (infoArea.style.display !== 'none') {
            infoBtn.classList.toggle('active')
            commentBtn.classList.toggle('active')
            infoArea.style.display = 'none'
            commentArea.style.display = 'block'
            resetCommentArea()
            clearCommentStar()
            getCountryComments()
        }
    })
}

function clearCommentStar() {
    starsToSend = 0
    const css = document.querySelector('#css4star')
    const style = css.sheet
    const length = style.rules.length
    if (length !== 0) {
        for (let i = 0; i < length; i++) {
            style.deleteRule(0)
        }
    }
}

function getCountryComments() {
    const countryComments = comments.filter(
        (l) => get('#name').textContent === l.id
    )[0]
        ? Object.values(
              comments.filter((l) => get('#name').textContent === l.id)[0]
          )
        : null
    countryComments?.pop()
    renderCountryComments(countryComments)
}

function renderCountryComments(countryComments) {
    const commentLength = countryComments?.length
    if (commentLength > 0) {
        for (let i = 0; i < commentLength; i++) {
            d3.select('#commentArea').append('div').attr('class', 'comment')
        }
        countryComments.forEach((comment, i) => {
            const fullStar = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ffc108"
                    d="M21.82,10.74,16.7,14.45l2,6a1,1,0,0,1-.37,1.12,1,1,0,0,1-1.17,0L12,17.87,6.88,21.59a1,1,0,0,1-1.17,0,1,1,0,0,1-.37-1.12l2-6L2.18,10.74a1,1,0,0,1,.59-1.81H9.09l2-6a1,1,0,0,1,1.9,0l2,6h6.32a1,1,0,0,1,.59,1.81Z" />
            </svg>`.repeat(comment.rating)
            const emptyStar = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#dadce0"
                    d="M21.82,10.74,16.7,14.45l2,6a1,1,0,0,1-.37,1.12,1,1,0,0,1-1.17,0L12,17.87,6.88,21.59a1,1,0,0,1-1.17,0,1,1,0,0,1-.37-1.12l2-6L2.18,10.74a1,1,0,0,1,.59-1.81H9.09l2-6a1,1,0,0,1,1.9,0l2,6h6.32a1,1,0,0,1,.59,1.81Z" />
            </svg>`.repeat(5 - comment.rating)
            const commentTemplate = `
                <div class="commenter"><b>${comment.name}</b></div>
                <div class="commentStar">
                    ${fullStar}${emptyStar}
                </div>
                <div><span>${comment.comment}</span></div>
            `
            getAll('.comment')[i].innerHTML = commentTemplate
        })
    } else {
        commentArea.insertAdjacentHTML(
            'afterend',
            '<center id="noComment"><b>Be the first to comment!</b></center>'
        )
    }
}

function showInputArea() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            inputArea.style.display = 'block'
            calculateCommentStar()
        } else {
            inputArea.style.display = 'none'
        }
    })
}

function calculateCommentStar() {
    const stars = getAll('.stars span')
    const css = get('#css4star')
    const style = css.sheet
    stars.forEach((star) => {
        star.addEventListener('click', () => {
            starsToSend = +star.getAttribute('value')
            const length = style.rules.length
            if (length !== 0) {
                for (let i = 0; i < length; i++) {
                    style.deleteRule(0)
                }
            }
            for (let i = 0; i < starsToSend; i++) {
                style.insertRule(
                    `#star${i + 1}::before{color: #ffc108 !important;}`
                )
            }
        })
    })
}

function showInfoArea() {
    infoBtn.addEventListener('click', () => {
        if (commentArea.style.display !== 'none') {
            resetCommentArea()
            infoBtn.classList.toggle('active')
            commentBtn.classList.toggle('active')
            infoArea.style.display = 'block'
            commentArea.style.display = 'none'
        }
    })
}

function submitComment() {
    submitBtn.addEventListener('click', () => {
        const user = firebase.auth().currentUser
        const userName = user.displayName
        const countryName = get('#name').textContent
        const star = starsToSend
        if (!commentInput.value) {
            Swal.fire({
                title: 'Please leave your comments!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
        } else if (star === 0) {
            Swal.fire({
                title: 'Please leave your ratings!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
        } else {
            Swal.fire({
                title: 'Is it correct?',
                text: `${'⭐'.repeat(star)} ${commentInput.value}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#003d5b',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, submit!',
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Submitted!',
                        icon: 'success',
                        confirmButtonColor: '#003d5b',
                        confirmButtonText: 'OK',
                    })
                    countriesDB
                        .doc(`${countryName}`)
                        .set(
                            {
                                [setUUID()]: {
                                    name: `${userName}`,
                                    comment: `${commentInput.value}`,
                                    rating: star,
                                },
                            },
                            { merge: true }
                        )
                        .then(() => {
                            commentInput.value = ''
                            clearCommentStar()
                        })
                }
            })
        }
    })
}

function setUUID() {
    let d = Date.now()
    if (
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
    ) {
        d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }
    )
}

function updateCommentList() {
    countriesDB.onSnapshot((res) => {
        res.docChanges().forEach((change) => {
            const doc = { ...change.doc.data(), id: change.doc.id }
            switch (change.type) {
                case 'added':
                    comments.push(doc)
                    break
                case 'modified':
                    {
                        const index = comments.findIndex(
                            (item) => item.id === doc.id
                        )
                        comments[index] = doc
                    }
                    break
                case 'removed':
                    comments = comments.filter((item) => item.id !== doc.id)
                    break
                default:
                    break
            }
        })
        resetCommentArea()
        getCountryComments()
        showRatings(get('#name').textContent)
    })
}

window.addEventListener('DOMContentLoaded', initRating)
