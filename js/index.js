d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
    (world) => {
        const width = 975,
            height = 540

        const svg = d3
            .select('svg')
            .attr('viewBox', [0, 0, width, height])
            .on('click', reset)

        const projection = d3
            .geoOrthographic()
            .rotate([240, -15])
            .scale(245)
            .translate([width / 2, height / 2])

        const path = d3.geoPath().projection(projection)

        const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed)

        const drag = d3.drag().on('start', dragstarted).on('drag', dragged)

        const g = svg.append('g')

        g.append('path')
            .attr('fill', '#fff')
            .attr('d', path({ type: 'Sphere' }))

        const countries = g
            .append('g')
            .attr('fill', '#444')
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

        svg.call(drag)

        svg.call(zoom)

        function reset() {
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
            // const name = event.currentTarget.textContent
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

        return svg.node()
    }
)

const areaBtn = document.querySelector('.areaBtn')

areaBtn.addEventListener('click', () => {
    let hidden = document.querySelector('.hidden')
    if (hidden.style.display === 'none') {
        hidden.style.display = 'block'
    } else {
        hidden.style.display = 'none'
    }
})

// function getCountryInfo(code, continent) {
//     fetch(
//         `https://raw.githubusercontent.com/factbook/factbook.json/master/${continent}/${code}.json`
//     )
//         .then((results) => results.json())
//         .then((myJson) => console.log(myJson))
// }
