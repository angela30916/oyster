const land50 = './db/countries-50m.json'
// const land110 = './db/countries-110m.json'
const width = 975,
    height = 540
const projection = d3
    .geoOrthographic()
    .rotate([240, -15])
    .scale(245)
    .translate([width / 2, height / 2])
const path = d3.geoPath().projection(projection)
const svg = d3.select('svg').attr('viewBox', [0, 0, width, height])
const g = svg.append('g')
g.append('path')
    .attr('fill', '#fff')
    .attr('d', path({ type: 'Sphere' }))
let countries

const country = document.querySelector('.country')
const globe = document.querySelector('.globe')

function render(land) {
    d3.json(land).then((world) => {
        countries = g
            .append('g')
            .attr('fill', '#444')
            .attr('cursor', 'pointer')
            .selectAll('path')
            .data(topojson.feature(world, world.objects.countries).features)
            .join('path')
            .on('click', clicked)
            // .call(() => searchCountry())
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
    })
}

function reset() {
    globe.style.display = 'block'
    country.style.display = 'none'
    countries.transition().style('fill', null)
    svg.transition()
        .duration(500)
        .call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
}

function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d)
    event.stopPropagation()
    countries.transition().style('fill', null)
    d3.select(this).transition().style('fill', '#D1495B')
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
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
        )
    const name = event.currentTarget.textContent
    d3.json('./db/country_code.json').then((results) => {
        const countryCode = flattenObject(results)
        const code = getKeyByValue(countryCode, `${name}`)
        if (code) {
            const resultList = code.split('.')
            getCountryInfo(`${resultList[1]}`, `${resultList[0]}`, name)
        } else {
            console.log('No matching infomation.')
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
    svg.selectAll('path').attr('d', path)
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
    fetch(
        `https://raw.githubusercontent.com/factbook/factbook.json/master/${continent}/${code}.json`
    )
        .then((results) => results.json())
        .then((countryInfo) => {
            globe.style.display = 'none'
            country.style.display = 'block'
            reset()

            let contentList = [
                name,
                countryInfo.Government?.Capital?.name?.text ?? 'null',
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
                ]?.text.split('/')[0] ?? 'null',
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

            function reset() {
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

d3.select('svg')
    .on('click', reset)
    .call(drag)
    .call(zoom)
    .call(() => render(land50))
    .node()

/*
function searchCountry(d) {
    document.querySelector('#submit').addEventListener('click', (event) => {
        event.preventDefault()
        const q = event.currentTarget.previousElementSibling.value
            .toLowerCase()
            .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
        let countries = d3.selectAll('path title')._groups[0]
        let countriesList = Object.keys(countries)
            .map((key) => [countries[key]])
            .map((item) => item[0].textContent)
        let index = countriesList.findIndex((country) => country === q)
        let target = countries[index].parentNode
        ;(d) => {
            const [[x0, y0], [x1, y1]] = path.bounds(d)
            event.stopPropagation()
            countries.transition().style('fill', null)
            d3.select(this).transition().style('fill', '#D1495B')
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
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.pointer(event, svg.node())
                )
            const name = event.currentTarget.textContent
            d3.json('./db/country_code.json').then((results) => {
                const countryCode = flattenObject(results)
                const code = getKeyByValue(countryCode, `${name}`)
                if (code) {
                    const resultList = code.split('.')
                    getCountryInfo(`${resultList[1]}`, `${resultList[0]}`, name)
                } else {
                    console.log('No matching infomation.')
                }
            })
        }
    })
}
*/

const signBtn = document.querySelector('.signIn')
const signBox = document.querySelector('.signInArea')
const signUpBtn = document.querySelector('.signUpBtn')
const signUpArea = document.querySelector('.signUpArea')
const signInBtn = document.querySelector('.signInBtn')

signBtn.addEventListener('click', () => {
    if (
        signBox.style.display === 'none' &&
        signUpArea.style.display === 'none'
    ) {
        signBox.style.display = 'block'
    } else {
        signBox.style.display = 'none'
        signUpArea.style.display = 'none'
    }
})

const eye = document.querySelector('.eye img')
eye.addEventListener('click', () => {
    const x = document.querySelector('.passwordInput')
    if (x.type === 'password') {
        x.type = 'text'
        eye.style.content = 'url(../images/invisible.png)'
    } else {
        x.type = 'password'
        eye.style.content = 'url(../images/visible.png)'
    }
})

signUpBtn.addEventListener('click', () => {
    signBox.style.display = 'none'
    signUpArea.style.display = 'block'
})

signInBtn.addEventListener('click', () => {
    signUpArea.style.display = 'none'
    signBox.style.display = 'block'
})
