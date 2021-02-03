# [Oyster!](https://oyster-anping.web.app/)
> The world is your *Oyster!*

An interactive world map SPA mainly using `D3.js`, allowing users to explore the information and comments of each country by clicking, zooming and dragging.
* Implemented with `d3-geo` API to build a spherical shape map.
* Rendered country shapes and borders by `TopoJSON`.
* Combined `d3.drag` and `d3.zoom` to allow dragging within the zoomable earth SVG.
* Initiated search functionality by `Chioces.js`.
* Collected auto-update country data from [The World Factbook](https://www.cia.gov/the-world-factbook/) produced by CIA.
* Applied rating system and wishlist functionality by `Cloud Firestore` to get realtime updates.

<img src="https://user-images.githubusercontent.com/67624604/104166930-828a4900-5436-11eb-8f24-6d11a360a461.png" width="600px" alt="Main Page" title="Main Page">

## Demo Link
https://oyster-anping.web.app/
#### Test Account
* Email: test@test.test
* Password: testtest
## Technologies
### Front-End
* HTML
* CSS
* JavaScript(ES6)
### JavaScript Library
* D3.js
### Database
* Cloud Firestore
* Firebase Authentication
### Packages
* TopoJSON
* Versor
* Choices.js
* SweetAlert2
### Tools
* Version Control: Git, GitHub
* Agile Planning Development: Trello (Scrum)
* Lint Tools: ESLint, Prettier
## Website Structure
![Structure](https://user-images.githubusercontent.com/67624604/104220748-e9315600-547a-11eb-8532-0318693178f8.png "Website Structure")
## Features
##### Drag the globe at will.
![feature1](https://user-images.githubusercontent.com/67624604/104190921-bfb30300-5457-11eb-97a8-102b311f19f4.gif)
##### Click any countries you like.
![feature2](https://user-images.githubusercontent.com/67624604/104191178-220c0380-5458-11eb-8d23-0ab77880455c.gif)
##### Search countries by entering the name.
![feature3](https://user-images.githubusercontent.com/67624604/104191844-005f4c00-5459-11eb-853e-b367fcafa15f.gif)
##### Login to create your own map.
![feature4](https://user-images.githubusercontent.com/67624604/104193405-08b88680-545b-11eb-9f7a-280b0c206979.gif)
##### Explore other's map.
![feature5](https://user-images.githubusercontent.com/67624604/104194106-db200d00-545b-11eb-9094-20f03edf2303.gif)
#### Leave your comments!
![feature6](https://user-images.githubusercontent.com/67624604/104216999-c486af80-5475-11eb-9e59-119391590f8b.gif)
## Future Features
* Visualize conutry information with D3.
* Refactor website with Svelte.js
