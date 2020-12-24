/* global db */
const countryData = db.collection('countries')
const commentBtn = document.querySelector('#commentBtn')
const details = document.querySelector('.details')
const commentArea = document.querySelector('#commentArea')
const submitBtn = document.querySelector('.submit-comment button')
const commentInput = document.querySelector('#commentSend')
const inputArea = document.querySelector('.input')
let commentList = [countryData.get().then((querySnapshot) => querySnapshot)]

commentBtn.addEventListener('click', () => {
    resetCommentArea()
    if (details.style.display !== 'none') {
        details.style.display = 'none'
        commentArea.style.display = 'block'
        const countryComments = commentList.filter(
            (l) => document.querySelector('#name').textContent === l.id
        )[0]
            ? Object.values(
                  commentList.filter(
                      (l) =>
                          document.querySelector('#name').textContent === l.id
                  )[0]
              )
            : null
        countryComments?.pop()

        const length = countryComments?.length
        if (length > 0) {
            for (let i = 0; i < length; i++) {
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
                document.querySelectorAll('.comment')[
                    i
                ].innerHTML = commentTemplate
            })
        } else {
            commentArea.insertAdjacentHTML(
                'afterend',
                '<center id="noComment"><b>Be the first to comment!</b></center>'
            )
        }
    } else {
        details.style.display = 'block'
        commentArea.style.display = 'none'
    }
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            inputArea.style.display = 'block'
        } else {
            inputArea.style.display = 'none'
        }
    })
})

submitBtn.addEventListener('click', () => {
    const user = firebase.auth().currentUser
    const userName = user.displayName
    const countryName = document.querySelector('#name').textContent
    if (!commentInput.value) {
        Swal.fire({
            title: 'Please leave your comments!',
            icon: 'error',
            confirmButtonColor: '#566492',
            confirmButtonText: 'OK',
        })
    } else {
        countryData
            .doc(`${countryName}`)
            .set(
                {
                    [setUUID()]: {
                        name: `${userName}`,
                        comment: `${commentInput.value}`,
                        rating: Math.floor(Math.random() * 5) + 1,
                    },
                },
                { merge: true }
            )
            .then(
                Swal.fire({
                    title: 'Submitted!',
                    text: `${commentInput.value}`,
                    icon: 'success',
                    confirmButtonColor: '#566492',
                    confirmButtonText: 'OK',
                }),
                (commentInput.value = '')
            )
    }
})

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
            let r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }
    )
}

function resetCommentArea() {
    document.querySelectorAll('.comment')?.forEach((e) => e.remove())
    document.querySelector('#noComment')?.remove()
}

(function updateCommentList() {
    countryData.onSnapshot((res) => {
        res.docChanges().forEach((change) => {
            const doc = { ...change.doc.data(), id: change.doc.id }

            switch (change.type) {
                case 'added':
                    commentList.push(doc)
                    break
                case 'modified':
                    {
                        const index = commentList.findIndex(
                            (item) => item.id === doc.id
                        )
                        commentList[index] = doc
                    }
                    break
                case 'removed':
                    commentList = commentList.filter(
                        (item) => item.id !== doc.id
                    )
                    break
                default:
                    break
            }
        })
        resetCommentArea()
        const countryComments = commentList.filter(
            (l) => document.querySelector('#name').textContent === l.id
        )[0]
            ? Object.values(
                  commentList.filter(
                      (l) =>
                          document.querySelector('#name').textContent === l.id
                  )[0]
              )
            : null
        countryComments?.pop()
        const length = countryComments?.length
        if (length > 0) {
            for (let i = 0; i < length; i++) {
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
                document.querySelectorAll('.comment')[
                    i
                ].innerHTML = commentTemplate
            })
        } else {
            commentArea.insertAdjacentHTML(
                'afterend',
                '<center id="noComment"><b>Be the first to comment!</b></center>'
            )
        }
    })
})()
