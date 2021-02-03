/* global MAP_SCALE_110, g, path, countriesGroup, earthInfoArea, countryInfoArea, svg, WIDTH, HEIGHT, infoBtn, commentBtn, infoArea, commentArea, usersDB, visitedBtn, wishlistBtn, get, projection, colorCountry, resetCommentArea, showRatings */
const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed)
const drag = d3.drag().on('start', dragstart).on('drag', dragged)
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

function initApp() {
    d3.select('svg')
        .on('click', resetMap)
        .call(drag)
        .call(zoom)
        .call(() => renderMap(MAP_SCALE_110))
        .call(searchCountry)
        .node()
    initChoices()
}

function renderMap(scale) {
    d3.json(scale).then((world) => {
        countriesGroup = g
            .append('g')
            .attr('fill', '#003d5b')
            .attr('stroke', '#eee')
            .attr('stroke-width', '.2')
            .attr('stroke-opacity', '.5')
            .attr('cursor', 'pointer')
            .selectAll('path')
            .data(topojson.feature(world, world.objects.countries).features)
            .join('path')
            .on('click', clickCountry)
            .attr('d', path)
        countriesGroup.append('title').text((d) => d.properties.name)
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

function resetMap() {
    earthInfoArea.style.display = 'block'
    countryInfoArea.style.display = 'none'
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            countriesGroup.transition().style('fill', null)
        }
    })
    svg.transition()
        .duration(500)
        .call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([WIDTH / 2, HEIGHT / 2]),
            colorCountry()
        )
}

function clickCountry(event, d, country = this, countryName) {
    const [[x0, y0], [x1, y1]] = path.bounds(d)
    event.stopPropagation()
    countriesGroup.transition().style('fill', null)
    d3.select(country).transition().style('fill', '#edae49')
    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(WIDTH / 2, HEIGHT / 2)
                .scale(
                    Math.min(
                        8,
                        0.9 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT)
                    )
                )
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
        )
    infoBtn.classList.add('active')
    commentBtn.classList.remove('active')
    infoArea.style.display = 'block'
    commentArea.style.display = 'none'
    resetCommentArea()
    showCountryInfo(event?.currentTarget?.textContent ?? countryName)
    showVisitedAndWishlist(event?.currentTarget?.textContent ?? countryName)
}

function showCountryInfo(country) {
    d3.json('./db/country_code.json').then((results) => {
        const countryCode = getKeyByValue(flattenObject(results), `${country}`)
        if (countryCode) {
            const continentANDCode = countryCode.split('.')
            renderCountryInfo(
                `${continentANDCode[1]}`,
                `${continentANDCode[0]}`,
                country
            )
            showRatings(country)
        } else {
            Swal.fire({
                title: 'Sorry, no matching information!',
                icon: 'error',
                confirmButtonColor: '#003d5b',
                confirmButtonText: 'OK',
            })
        }
    })
}

function showVisitedAndWishlist(country) {
    const user = firebase.auth().currentUser
    if (user) {
        usersDB
            .doc(`${user.uid}`)
            .get()
            .then((doc) => {
                const isVisited = doc.data().visited.includes(`${country}`)
                const isWishlist = doc.data().wishlist.includes(`${country}`)
                if (isVisited) {
                    visitedBtn.style.fill = '#00798c'
                    visitedBtn.setAttribute('data', '1')
                } else {
                    visitedBtn.style.fill = '#fff'
                    visitedBtn.setAttribute('data', '0')
                }
                if (isWishlist) {
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
}

function renderCountryInfo(code, continent, name) {
    getCountryImg(code)
    getCountryInfo(code, continent, name)
}

function getCountryImg(code) {
    get('#countryImg').setAttribute(
        'src',
        `https://factbook.github.io/media/flags/${code}.png`
    )
}

function getCountryInfo(code, continent, name) {
    const idList = [
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

    fetch(
        `https://raw.githubusercontent.com/factbook/factbook.json/master/${continent}/${code}.json`
    )
        .then((results) => results.json())
        .then((countryInfo) => {
            earthInfoArea.style.display = 'none'
            countryInfoArea.style.display = 'block'
            resetInfoArea()

            const contentList = [
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

            idList.forEach((id, i) => renderEachInfo(id, i))

            function renderEachInfo(id, num) {
                const node = get(`#${id}`)
                if (contentList[num] !== 'null') {
                    node.textContent = contentList[num]
                } else {
                    node.parentNode.style.display = 'none'
                }
            }

            function resetInfoArea() {
                idList.forEach((id) => {
                    get(`#${id}`).parentNode.style.display = 'block'
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
        dragstart.apply(that, [event, that])
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

function dragstart(event) {
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
    if (delta[0] < 0.7) dragstart.apply(this, [event, this])
    svg.selectAll('svg>g>g>path').attr('d', path)
}

function searchCountry() {
    get('.choices').addEventListener('change', (event) => {
        const selectedCountry = event.currentTarget.children[0].textContent
        const countriesNode = d3.selectAll('path title')._groups[0]
        const countriesList = Object.keys(countriesNode)
            .map((key) => [countriesNode[key]])
            .map((item) => item[0].textContent)
        const index = countriesList.findIndex(
            (country) => country === selectedCountry
        )
        if (index < 0) {
            return resetMap()
        } else {
            const target = countriesNode[index].parentNode
            d3.json(MAP_SCALE_110).then((world) => {
                const data = topojson.feature(world, world.objects.countries)
                    .features
                const countryData = data.find(
                    (d) => d.properties.name === selectedCountry
                )
                clickCountry(event, countryData, target, selectedCountry)
            })
        }
    })
}

function initChoices() {
    d3.json('./db/country_code.json')
        .then((results) => {
            const countryObj = flattenObject(results)
            return Object.values(countryObj)
        })
        .then((countryNames) => {
            const choicesList = [{ value: 'Earth', selected: true }]
            countryNames.map((name) => {
                choicesList.push({ value: `${name}` })
            })
            const choices = get('.choices')
            new Choices(choices, {
                choices: choicesList,
                placeholder: true,
                searchPlaceholderValue: 'Take me to...',
                itemSelectText: '',
            })
        })
}

function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value)
}

window.addEventListener('DOMContentLoaded', initApp)
