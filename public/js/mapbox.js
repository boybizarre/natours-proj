/* eslint-disable */
console.log('Hello from the client side!');

// receiving the data from the html dataset
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

// mapbox api
mapboxgl.accessToken =
  'pk.eyJ1IjoiYm95Yml6YXJyZSIsImEiOiJjbG5mMmlxOG0wMzA4MmltYjdoenJ1MjdkIn0.4RAicrif89kZqkX6v-h9cA';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/boybizarre/clnf3aiqi021201qn2wcgblly',
  scrollZoom: false,
  // center: [-118.113491, 34.111745], // starting position [lng, lat]
  // zoom: 9, // starting zoom
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((location) => {
  // create marker
  const element = document.createElement('div');
  element.className = 'marker'; // already created class in css

  // add marker
  new mapboxgl.Marker({
    element,
    anchor: 'bottom',
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  // add popup
  new mapboxgl.Popup({
    offset: 150,
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);

  // extend map bounds to include current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100,
  },
});
