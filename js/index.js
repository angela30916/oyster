/* global userData, commentList, details, commentArea, resetCommentArea, infoBtn, commentBtn */
// const land50 = './db/countries-50m.json'
const land110 = './db/countries-110m.json'
const width = 975,
    height = 540
const projection = d3
    .geoOrthographic()
    .rotate([240, -15])
    .scale(245)
    .translate([width / 2, height / 2])
const path = d3.geoPath().projection(projection)
const svg = d3.select('svg').attr('viewBox', [-100, 0, width, height])

/* mainGraient */
const svgDefs = svg.append('defs')
const mainGradient = svgDefs
    .append('linearGradient')
    .attr('id', 'mainGradient')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%')

mainGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#fcfdfe')
    .attr('stop-opacity', 1)

mainGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#d6d7d8')
    .attr('stop-opacity', 1)
/* mainGraient */

const g = svg.append('g')
g.append('path')
    .attr('d', path({ type: 'Sphere' }))
    .attr('fill', 'url(#mainGradient)')
    .attr('stroke', '#eee')
    .attr('stroke-width', '0.5')
let countries

const country = document.querySelector('.country')
const globe = document.querySelector('.globe')

function render(land) {
    d3.json(land).then((world) => {
        countries = g
            .append('g')
            .attr('fill', '#003d5b')
            .attr('stroke', '#eee')
            .attr('stroke-width', '.2')
            .attr('stroke-opacity', '.5')
            .attr('cursor', 'pointer')
            .selectAll('path')
            .data(topojson.feature(world, world.objects.countries).features)
            .join('path')
            .on('click', clicked)
            .attr('d', path)

        countries.append('title').text((d) => d.properties.name)

        g.append('path')
            .attr('fill', 'none')
            .attr(
                'd',
                path(
                    topojson.mesh(
                        world,
                        world.objects.countries,
                        (a, b) => a !== b
                    )
                )
            )
        colorCountry()
    })
}

function reset() {
    globe.style.display = 'block'
    country.style.display = 'none'
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            countries.transition().style('fill', null)
        }
    })

    svg.transition()
        .duration(500)
        .call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2]),
            colorCountry()
        )
}

function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d)
    event.stopPropagation()
    countries.transition().style('fill', null)
    d3.select(this).transition().style('fill', '#edae49')
    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(
                    Math.min(
                        8,
                        0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)
                    )
                )
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
            // d3.pointer(event, svg.node())
        )
    infoBtn.classList.add('active')
    commentBtn.classList.remove('active')
    details.style.display = 'block'
    commentArea.style.display = 'none'
    resetCommentArea()
    const name = event.currentTarget.textContent
    d3.json('./db/country_code.json').then((results) => {
        const countryCode = flattenObject(results)
        const code = getKeyByValue(countryCode, `${name}`)
        if (code) {
            const resultList = code.split('.')
            getCountryInfo(`${resultList[1]}`, `${resultList[0]}`, name)
            let ratings = commentList.filter((l) => name === l.id)[0]
                ? Object.values(commentList.filter((l) => name === l.id)[0])
                : null
            ratings?.pop()
            ratings = ratings ? ratings.map((r) => +r.rating) : null
            showRatings(ratings)
        } else {
            Swal.fire({
                title: 'Sorry, no matching infomation!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
        }
    })
}

function zoomed(event) {
    const { transform } = event
    g.attr('transform', transform)
    g.attr('stroke-width', 1, transform.k)
}

let v0, q0, r0, a0, l
function pointer(event, that) {
    const t = d3.pointers(event, that)

    if (t.length !== l) {
        l = t.length
        if (l > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0])
        dragstarted.apply(that, [event, that])
    }

    // For multitouch, average positions and compute rotation.
    if (l > 1) {
        const x = d3.mean(t, (p) => p[0])
        const y = d3.mean(t, (p) => p[1])
        const a = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0])
        return [x, y, a]
    }

    return t[0]
}

function dragstarted(event) {
    v0 = versor.cartesian(projection.invert(pointer(event, this)))
    q0 = versor((r0 = projection.rotate()))
}

function dragged(event) {
    const p = pointer(event, this)
    const v1 = versor.cartesian(projection.rotate(r0).invert(p))
    const delta = versor.delta(v0, v1)
    let q1 = versor.multiply(q0, delta)

    // For multitouch, compose with a rotation around the axis.
    if (p[2]) {
        const d = (p[2] - a0) / 2
        const s = -Math.sin(d)
        const c = Math.sign(Math.cos(d))
        q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1)
    }

    projection.rotate(versor.rotation(q1))

    // In vicinity of the antipode (unstable) of q0, restart.
    if (delta[0] < 0.7) dragstarted.apply(this, [event, this])
    svg.selectAll('svg>g>g>path').attr('d', path)
}

const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed)
const drag = d3.drag().on('start', dragstarted).on('drag', dragged)

let ids = [
    'name',
    'capital',
    'area',
    'coastline',
    'highest',
    'climate',
    'population',
    'ethnic',
    'language',
    'religion',
    'urban',
    'GDP',
    'unemployment',
    'currency',
    'trade',
    'time',
    'tele',
    'net',
]

function getCountryInfo(code, continent, name) {
    const visitedBtn = document.querySelector('#visited path')
    const wishlistBtn = document.querySelector('#wishlist path')

    const user = firebase.auth().currentUser
    if (user) {
        const uid = user.uid
        userData
            .doc(`${uid}`)
            .get()
            .then((doc) => {
                const visited = doc.data().visited.includes(`${name}`)
                const wishlist = doc.data().wishlist.includes(`${name}`)
                if (visited) {
                    visitedBtn.style.fill = '#00798c'
                    visitedBtn.setAttribute('data', '1')
                } else {
                    visitedBtn.style.fill = '#fff'
                    visitedBtn.setAttribute('data', '0')
                }

                if (wishlist) {
                    wishlistBtn.style.fill = '#ff7979'
                    wishlistBtn.setAttribute('data', '1')
                } else {
                    wishlistBtn.style.fill = '#fff'
                    wishlistBtn.setAttribute('data', '0')
                }
            })
    } else {
        visitedBtn.style.fill = '#fff'
        wishlistBtn.style.fill = '#fff'
    }
    document
        .getElementById('countryImg')
        .setAttribute(
            'src',
            `https://factbook.github.io/images/flags/${code}.png`
        )

    fetch(
        `https://raw.githubusercontent.com/factbook/factbook.json/master/${continent}/${code}.json`
    )
        .then((results) => results.json())
        .then((countryInfo) => {
            globe.style.display = 'none'
            country.style.display = 'block'
            resetID()

            let contentList = [
                name,
                countryInfo.Government?.Capital?.name?.text?.split(
                    '; note'
                )[0] ?? 'null',
                countryInfo.Geography?.Area?.total?.text ?? 'null',
                countryInfo.Geography?.Coastline?.text ?? 'null',
                countryInfo.Geography?.Elevation?.['highest point']?.text ??
                    'null',
                countryInfo.Geography?.Climate?.text ?? 'null',
                countryInfo['People and Society']?.Population?.text ?? 'null',
                countryInfo['People and Society']?.['Ethnic groups']?.text ??
                    'null',
                countryInfo['People and Society']?.Languages?.text ?? 'null',
                countryInfo['People and Society']?.Religions?.text ?? 'null',
                countryInfo['People and Society']?.Urbanization?.[
                    'urban population'
                ]?.text ?? 'null',
                countryInfo?.Economy?.[
                    'GDP (purchasing power parity)'
                ]?.text?.split('/')[0] ?? 'null',
                countryInfo.Economy?.['Unemployment rate']?.text?.split(
                    '/'
                )[0] ?? 'null',
                countryInfo.Economy?.['Exchange rates']?.text?.split(
                    ' per'
                )[0] ?? 'null',
                countryInfo.Economy?.['Current account balance']?.text?.split(
                    ' /'
                )[0] ?? 'null',
                countryInfo.Government?.Capital?.[
                    'time difference'
                ]?.text?.split(' (')[0] ?? 'null',
                countryInfo.Communications?.[
                    'Telecommunication systems'
                ]?.international?.text
                    ?.split(';')[0]
                    .split('- ')[1] ?? 'null',
                countryInfo.Communications?.['Internet country code']?.text ??
                    'null',
            ]

            renderCountryInfo('name', 0)
            renderCountryInfo('capital', 1)
            renderCountryInfo('area', 2)
            renderCountryInfo('coastline', 3)
            renderCountryInfo('highest', 4)
            renderCountryInfo('climate', 5)
            renderCountryInfo('population', 6)
            renderCountryInfo('ethnic', 7)
            renderCountryInfo('language', 8)
            renderCountryInfo('religion', 9)
            renderCountryInfo('urban', 10)
            renderCountryInfo('GDP', 11)
            renderCountryInfo('unemployment', 12)
            renderCountryInfo('currency', 13)
            renderCountryInfo('trade', 14)
            renderCountryInfo('time', 15)
            renderCountryInfo('tele', 16)
            renderCountryInfo('net', 17)

            function renderCountryInfo(id, num) {
                let node = document.getElementById(id)
                if (contentList[num] !== 'null') {
                    node.textContent = contentList[num]
                } else {
                    node.parentNode.style.display = 'none'
                }
            }

            function resetID() {
                ids.forEach((id) => {
                    document.getElementById(id).parentNode.style.display =
                        'block'
                })
            }
        })
}

function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value)
}

const flattenObject = (obj, prefix = '') =>
    Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}.` : ''
        if (
            typeof obj[k] === 'object' &&
            obj[k] !== null &&
            Object.keys(obj[k]).length > 0
        )
            Object.assign(acc, flattenObject(obj[k], pre + k))
        else acc[pre + k] = obj[k]
        return acc
    }, {})

function searchCountry() {
    document.querySelector('.choices').addEventListener('change', (event) => {
        const selectedCountry = event.currentTarget.children[0].textContent
        let countriesNode = d3.selectAll('path title')._groups[0]
        let countriesList = Object.keys(countriesNode)
            .map((key) => [countriesNode[key]])
            .map((item) => item[0].textContent)
        let index = countriesList.findIndex(
            (country) => country === selectedCountry
        )
        if (index < 0) {
            return reset()
        } else {
            let target = countriesNode[index].parentNode
            d3.json(land110).then((world) => {
                let data = topojson.feature(world, world.objects.countries)
                    .features
                let countryData = data.find(
                    (d) => d.properties.name === selectedCountry
                )
                ;(function (d) {
                    const [[x0, y0], [x1, y1]] = path.bounds(d)
                    event.stopPropagation()
                    countries.transition().style('fill', null)
                    d3.select(target).transition().style('fill', '#edae49')
                    svg.transition()
                        .duration(750)
                        .call(
                            zoom.transform,
                            d3.zoomIdentity
                                .translate(width / 2, height / 2)
                                .scale(
                                    Math.min(
                                        8,
                                        0.9 /
                                            Math.max(
                                                (x1 - x0) / width,
                                                (y1 - y0) / height
                                            )
                                    )
                                )
                                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
                            // d3.pointer(event, svg.node())
                        )
                    infoBtn.classList.add('active')
                    commentBtn.classList.remove('active')
                    details.style.display = 'block'
                    commentArea.style.display = 'none'
                    resetCommentArea()
                    d3.json('./db/country_code.json').then((results) => {
                        const countryCode = flattenObject(results)
                        const code = getKeyByValue(
                            countryCode,
                            `${selectedCountry}`
                        )
                        if (code) {
                            const resultList = code.split('.')
                            getCountryInfo(
                                `${resultList[1]}`,
                                `${resultList[0]}`,
                                selectedCountry
                            )
                            let ratings = commentList.filter(
                                (l) => selectedCountry === l.id
                            )[0]
                                ? Object.values(
                                      commentList.filter(
                                          (l) => selectedCountry === l.id
                                      )[0]
                                  )
                                : null
                            ratings?.pop()
                            ratings = ratings
                                ? ratings.map((r) => +r.rating)
                                : null
                            showRatings(ratings)
                        } else {
                            Swal.fire({
                                title: 'Sorry, no matching infomation!',
                                icon: 'error',
                                confirmButtonColor: '#003d5b',
                                confirmButtonText: 'OK',
                            })
                        }
                    })
                })(countryData)
            })
        }
    })
}

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
                                ? '#00798c'
                                : wishlist.includes(d.properties.name)
                                ? '#ff7979'
                                : '#003d5b'
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

function showRatings(ratings) {
    if (ratings) {
        const sum = ratings.reduce((a, b) => a + b, 0)
        const avgStar = Math.round((sum / ratings.length) * 10) / 10
        const starPercentage = `${(avgStar / 5) * 100}%`
        document.querySelector('.stars-inner').style.width = starPercentage
        document.querySelector('#rating-score').textContent = `${avgStar}`
        document.querySelector(
            '.comments-count'
        ).textContent = `(${ratings.length})`
    } else {
        document.querySelector('.stars-inner').style.width = 0
        document.querySelector('#rating-score').textContent = '0'
        document.querySelector('.comments-count').textContent = '(0)'
    }
}

d3.select('svg')
    .on('click', reset)
    .call(drag)
    .call(zoom)
    .call(() => render(land110))
    .call(() => searchCountry())
    .node()

d3.json('./db/country_code.json')
    .then((results) => {
        const countryObj = flattenObject(results)
        return Object.values(countryObj)
    })
    .then((results) => {
        let arr = [{ value: 'Earth', selected: true }]
        results.map((result) => {
            arr.push({ value: `${result}` })
        })
        const element = document.querySelector('.choices')
        new Choices(element, {
            choices: arr,
            placeholder: true,
            searchPlaceholderValue: 'Take me to...',
            itemSelectText: '',
        })
    })
