/* exported usersDB, countriesDB, MAP_SCALE_110 */
const firebaseConfig = {
    apiKey: 'AIzaSyB_u7VRtuCAfVSIBhwYcYLJwiZBJpH9-qo',
    authDomain: 'oyster-anping.firebaseapp.com',
    projectId: 'oyster-anping',
    storageBucket: 'oyster-anping.appspot.com',
    messagingSenderId: '473930989738',
    appId: '1:473930989738:web:cd62ac993e7f1b875950d3',
}
firebase.initializeApp(firebaseConfig)
firebase.analytics()

const firebaseDB = firebase.firestore()
const usersDB = firebaseDB.collection('users')
const countriesDB = firebaseDB.collection('countries')

/* const MAP_SCALE_50 = './db/countries-50m.json' */
const MAP_SCALE_110 = './db/countries-110m.json'
const WIDTH = 975
const HEIGHT = 540
const projection = d3
    .geoOrthographic()
    .rotate([240, -15])
    .scale(245)
    .translate([WIDTH / 2, HEIGHT / 2])
const path = d3.geoPath().projection(projection)
const svg = d3.select('svg').attr('viewBox', [-100, 0, WIDTH, HEIGHT])

const svgDefs = svg.append('defs')
const earthGradient = svgDefs
    .append('linearGradient')
    .attr('id', 'earthGradient')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%')
earthGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#fcfdfe')
    .attr('stop-opacity', 1)
earthGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#d6d7d8')
    .attr('stop-opacity', 1)

const g = svg.append('g')
g.append('path')
    .attr('d', path({ type: 'Sphere' }))
    .attr('fill', 'url(#earthGradient)')
    .attr('stroke', '#eee')
    .attr('stroke-width', '0.5')
