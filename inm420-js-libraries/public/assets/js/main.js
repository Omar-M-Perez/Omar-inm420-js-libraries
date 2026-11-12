// info for each destination, the map and the chart both get their data from here
// coords are [latitude, longitude] and temps are the average highs in °C for dec, jan, feb, mar
const destinations = {
    tulum: {
        name: "Tulum",
        country: "Mexico",
        coords: [20.2114, -87.4654],
        flight: "~4h direct",
        temps: [28, 27, 28, 29]
    },
    cartagena: {
        name: "Cartagena",
        country: "Colombia",
        coords: [10.391, -75.4794],
        flight: "~5h flight",
        temps: [31, 31, 31, 31]
    },
    lisbon: {
        name: "Lisbon",
        country: "Portugal",
        coords: [38.7223, -9.1393],
        flight: "~7h direct",
        temps: [15, 15, 16, 19]
    },
    bali: {
        name: "Bali",
        country: "Indonesia",
        coords: [-8.4095, 115.1889],
        flight: "~24h, 1+ stops",
        temps: [31, 30, 30, 31]
    },
    marrakech: {
        name: "Marrakech",
        country: "Morocco",
        coords: [31.6295, -7.9811],
        flight: "~10h, 1 stop",
        temps: [19, 18, 20, 23]
    }
};

// toronto is home, everything gets compared to it
const toronto = {
    name: "Toronto",
    coords: [43.6532, -79.3832],
    temps: [2, -1, 0, 5]
};

// colours from my stylesheet so the map and chart match the page
const hibiscus = "#b5304a";
const coldBlue = "#9bb1c8";

// get references to the elements we will use
const slider = document.querySelector(".glide");
const chips = document.querySelector(".chips");
const chipButtons = document.querySelectorAll(".chip");
const exploreSection = document.getElementById("explore");
const tempDiff = document.getElementById("temp-diff");
const chartCanvas = document.getElementById("temp-chart");


// ---------- typed.js ----------

// types out each destination name in the hero, deletes it, then types the next one
new Typed("#typed-destination", {
    strings: ["Tulum.", "Cartagena.", "Lisbon.", "Bali.", "Marrakech."],
    // how fast it types and deletes (milliseconds per letter)
    typeSpeed: 70,
    backSpeed: 40,
    // how long it waits before deleting the word
    backDelay: 1600,
    // keeps going forever
    loop: true,
    // the cursor css is in my stylesheet so the library doesn't need to add its own
    autoInsertCss: false
});


// ---------- glide.js ----------

// carousel for the destination cards
const glide = new Glide(".glide", {
    // carousel means it loops back to the start at the end
    type: "carousel",
    // how many cards you can see at once on desktop
    perView: 3,
    gap: 24,
    // show less cards on smaller screens (glide's breakpoints mean "this width and smaller")
    breakpoints: {
        1024: {
            perView: 2
        },
        640: {
            perView: 1,
            // shows a bit of the next card so people know they can swipe
            peek: { before: 0, after: 48 }
        }
    }
});

// mount starts the carousel
glide.mount();


// ---------- leaflet ----------

// make the map inside the div with the id trip-map
// scroll zoom is off so the page doesn't get stuck on the map when you scroll
// dragging is off on phones so your finger can still scroll the page
const map = L.map("trip-map", {
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile
});

// map tiles from openstreetmap (free, no api key needed)
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
    maxZoom: 19
}).addTo(map);

// my own diamond pins instead of the default blue ones, the css for them is in the stylesheet
const pinIcon = L.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [18, 18] });
const homeIcon = L.divIcon({ className: "map-pin map-pin-home", html: "<span></span>", iconSize: [18, 18] });

// toronto pin
L.marker(toronto.coords, { icon: homeIcon }).addTo(map).bindPopup("<strong>Toronto</strong><br>Home (YYZ)");

// save the pins and lines so i can change them later when someone picks a destination
const markers = {};
const lines = {};

// all the coords so the map can zoom out to fit them
const allCoords = [toronto.coords];

// loop through every destination and add a pin and a dashed flight line from toronto
for (const id in destinations) {
    const place = destinations[id];

    // the pin with a popup that shows the name, country and flight time
    markers[id] = L.marker(place.coords, { icon: pinIcon }).addTo(map);
    markers[id].bindPopup(`<strong>${place.name}</strong><br>${place.country} &middot; ${place.flight} from YYZ`);

    // the flight line goes from toronto to the destination
    lines[id] = L.polyline([toronto.coords, place.coords], {
        color: hibiscus,
        weight: 2,
        opacity: 0.8,
        dashArray: "6 8"
    }).addTo(map);

    // clicking a pin does the same thing as clicking a button
    markers[id].on("click", function () {
        selectDestination(id);
    });

    allCoords.push(place.coords);
}

// zoom the map out so every pin fits
map.fitBounds(allCoords, { padding: [30, 30] });


// ---------- chart.js ----------

// same font as the page
Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
Chart.defaults.color = "#2a1e1b";

// bar chart with two sets of bars, the picked destination and toronto
const chart = new Chart(chartCanvas, {
    type: "bar",
    data: {
        labels: ["Dec", "Jan", "Feb", "Mar"],
        datasets: [
            {
                // this first one changes when you pick a destination (tulum is first)
                label: destinations.tulum.name,
                data: destinations.tulum.temps,
                backgroundColor: hibiscus
            },
            {
                // toronto never changes
                label: toronto.name,
                data: toronto.temps,
                backgroundColor: coldBlue
            }
        ]
    },
    options: {
        responsive: true,
        // lets the chart fill the .chart-box height from the css
        maintainAspectRatio: false,
        scales: {
            y: {
                suggestedMin: -5,
                suggestedMax: 35,
                title: {
                    display: true,
                    text: "Avg. high (°C)"
                }
            }
        },
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});


// ---------- fslightbox + aos ----------

// fslightbox doesn't need any code here, it finds the links with data-fslightbox in the html by itself

// aos animates anything with a data-aos attribute when you scroll to it
AOS.init({
    // how long the animation takes
    duration: 800,
    // only animate the first time, not every time you scroll past
    once: true,
    // starts the animation a bit before the element is on the screen
    offset: 80
});


// ---------- my functions ----------

// update the chart and the sentence above it
function updateChart(id) {
    const place = destinations[id];

    // swap in the new destination's name and temps, then redraw the chart
    chart.data.datasets[0].label = place.name;
    chart.data.datasets[0].data = place.temps;
    chart.update();

    // january is spot 1 in the temps array (arrays start at 0)
    const difference = place.temps[1] - toronto.temps[1];
    tempDiff.innerHTML = `In January, ${place.name} is about <strong>${difference}&deg;C warmer</strong> than Toronto.`;

    // highlight the button that was picked and take the highlight off the rest
    chipButtons.forEach((button) => {
        if (button.dataset.destination === id) {
            button.classList.add("is-active");
        } else {
            button.classList.remove("is-active");
        }
    });
}

// fly the map over to the destination and highlight its flight line
function updateMap(id) {
    map.flyTo(destinations[id].coords, 5, { duration: 1.5 });
    markers[id].openPopup();

    // make the picked line darker and fade out the others
    for (const key in lines) {
        if (key === id) {
            lines[key].setStyle({ opacity: 1, weight: 3 });
        } else {
            lines[key].setStyle({ opacity: 0.3, weight: 2 });
        }
    }
}

// picking a destination updates both the chart and the map
function selectDestination(id) {
    updateChart(id);
    updateMap(id);
}

// "show on map" buttons in the carousel
// the listener is on the whole slider because glide makes copies of the cards when it loops
slider.addEventListener("click", (e) => {
    if (e.target.classList.contains("card-btn")) {
        selectDestination(e.target.dataset.destination);
        // scroll down to the map so you can see it move
        exploreSection.scrollIntoView({ behavior: "smooth" });
    }
});

// destination buttons above the map
chips.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
        selectDestination(e.target.dataset.destination);
    }
});

// show tulum in the chart when the page opens
updateChart("tulum");
