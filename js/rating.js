/* global db */
const countryData = db.collection('countries')
const commentBtn = document.querySelector('#commentBtn')
const details = document.querySelector('.details')
const commentArea = document.querySelector('#commentArea')
const submitBtn = document.querySelector('.submit-comment button')
const commentInput = document.querySelector('#commentSend')
const inputArea = document.querySelector('.input')
let commentList = []

commentBtn.addEventListener('click', () => {
    if (details.style.display !== 'none') {
        details.style.display = 'none'
        commentArea.style.display = 'block'
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
    updateComment()
    commentList = commentList.filter(
        (l) => document.querySelector('#name').textContent === l.id
    )
    console.log(commentList)
})

submitBtn.addEventListener('click', () => {
    const user = firebase.auth().currentUser
    const userId = user.uid
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
                    [userId]: {
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

function updateComment() {
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
    })
}
