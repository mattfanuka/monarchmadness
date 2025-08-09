import { blackIcon, redIcon, orangeIcon, goldIcon, yellowIcon, greenIcon, blueIcon, violetIcon } from './leaflet-color-markers.js';

//Loading map and tile layer with Leaflet.js API
const map = L.map('map').setView([39.5, -98.35], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Address search API
const search = document.getElementById('search');
const address = document.getElementById('address');

//Global variables
let lat;
let lon;
let oldMarker;
let sightingArray = [];
let placeName;
const CACHE_DURATION = 1000 * 30 //30 seconds

//Address search functionality
search.addEventListener('click', searchAddress);

address.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchAddress();
    }
})

async function searchAddress() {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${address.value}&format=jsonv2&limit=1`);
    const data = await response.json();
    if (!data.length > 0) {
        alert('No place found - try again');
        return;
    }
    removeTestMarker();
    lat = data[0].lat;
    lon = data[0].lon;
    getPlaceName();
    const addy = data[0].display_name;
    renderDataEntry(addy);
    submitSighting();
    addTestMarker(lat, lon);
}

async function getPlaceName() {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error (`HTTP error:${response.status}`);
        const name = await response.json();
        //City name validation
        let city = name.address.city;
        if (city === undefined) {
            city = name.name;
        };
        //State or country name validation
        let state = name.address.state;
        if (state === undefined) {
            state = name.address.country;
        };

        placeName = `${city}, ${state}`;
    } catch(err) {
        console.error(`Error code 1: Failed to fetch place name`, (err));
        return null;
    };
}

//Render data entry
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
const day = String(today.getDate()).padStart(2, '0');

function renderDataEntry(addy) {
    const dataField = document.querySelector('.data-field');
    dataField.innerHTML = `
            <h3 class="address-checker">${addy}</h3>
            <p id='lat-lon'><i>${lat}, ${lon}</i></p><br>
            <div class="monarch-options">
                <div class="option-label">
                    <label for="date">When did the sighting occur?</label>
                    <input type="date" id="date" name="date" value=${year}-${month}-${day} required>
                </div>
                <div class="option-label">
                    <label for="environment">Where did you see the Monarch?</label>
                    <input name="environment" id="environment" type="text" placeholder="ex. on milkweed, midair" maxlength="40">
                </div>

                <div class="option-label">
                    <label for="life-stage">Stage of life? </label> 
                    <select id="life-stage" name="life-stage" required>
                        <option value="" disabled selected>Select one</option>
                        <option value="egg">Egg</option>
                        <option value="larva">Larva</option>
                        <option value="pupa">Pupa</option>
                        <option value="adult">Adult</option>
                    </select>
                </div>
                <button class="sighting-submit" type="submit">Submit</button>
            </div>
    `
}

//Submight Sighting API request
function submitSighting() {
    const button = document.querySelector('.sighting-submit');
    button.addEventListener('click', async function (e) {
        e.preventDefault();

        const date = document.querySelector('#date').value;
        const environment = document.querySelector('#environment').value;
        const lifeStage = document.querySelector('#life-stage').value;

        if (lifeStage === '') {
            alert("Please enter a stage of life.");
            return;
        }

        const sightingPayload = {
            latitude: lat,
            longitude: lon,
            date: date,
            environment: environment,
            lifeStage: lifeStage,
            place: placeName,
        }

        try {
            const response = await fetch('https://monarchbackend.onrender.com/api/sightings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sightingPayload)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Sighting submitted successfully!');
                console.log('Saved:', result);
                location.reload(true);
            } else {
                alert('Failed to submit', result.error);
            }
        }
        catch (err) {
            console.error('Network error:', err);
            alert('Network error. Please try again later');
        }
    });
}

async function onLoad() {
    await grabAllSightings();
    renderSightings(sightingArray);
}

//Map Marker Functions
async function grabAllSightings() {
    try {
        const response = await fetch ('https://monarchbackend.onrender.com/api/sightings');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const allSightings = await response.json();
        sightingArray = allSightings;
    }
    catch(err) {
        console.error('Error fetching sightings:', err);
    }
}

function renderSightings(arr) {
    let selectedYearSightings = [];
    for (let j = 0; j < arr.length; j++) {
        const sighting = arr[j];
        const date = new Date(sighting.date);
        const year = date.getUTCFullYear();

        if (year === Number(document.getElementById('year').value)) {
            selectedYearSightings.push(arr[j]);
        }
    }
    
    for (let i = 0; i < selectedYearSightings.length; i++) {
        const sighting = selectedYearSightings[i];
        const date = new Date(sighting.date);
        const month = date.getUTCMonth();
        let icon;

        switch (Math.floor(month/2)) {
            case 0: icon = redIcon; break;
            case 1: icon = orangeIcon; break;
            case 2: icon = yellowIcon; break;
            case 3: icon = greenIcon; break;
            case 4: icon = blueIcon; break;
            case 5: icon = violetIcon; break;
            default: icon = blackIcon;
        }

        let environment;
        sighting.environment === '' ? environment = 'N/A' : environment = sighting.environment;
       
        let marker = new L.marker([sighting.latitude, sighting.longitude], { icon }).addTo(map);
        
        marker.bindPopup(`
            <b>Location</b>: ${sighting.place} 
            <br>
            <b>Environment</b>: ${environment[0].toUpperCase()}${environment.slice(1)}
            <br>
            <b>Lifestage</b>: ${sighting.lifeStage[0].toUpperCase()}${sighting.lifeStage.slice(1)}
            <br>
            <b>Date</b>: ${date.toDateString()}
            `)
    }
}

document.querySelector('#filter').addEventListener('click', sortData);

//This is not the most efficient way to do this but I DONT CARE BECAUSE I WROTE IT MYSELF WITHOUT AI
//Uses a couple arrays to pass a filtered array (that i didnt use filter for for some reason) to the render function
//You need two month eval variables because you're working with half the inputs, so multiply each month option by 2 and add one to represent all 12 months numerically
function sortData() {
    let checkedBoxes = [];
    let selectedMonths = [];
    const boxes = document.querySelectorAll('.checkbox');
    boxes.forEach(function(box) {
        if(box.checked) {
            checkedBoxes.push(Number(box.id));
        }
    });

    for (let i = 0; i < checkedBoxes.length; i++) {
        for (let j = 0; j < sightingArray.length; j++) {
            const evalMonth = checkedBoxes[i] * 2;
            const eval2 = evalMonth + 1;
            const sighting = sightingArray[j];
            const month = new Date(sighting.date).getUTCMonth();

            if (month === evalMonth || month === eval2) {
                selectedMonths.push(sighting);
            }
        }
    }

    //remove all markers
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    renderSightings(selectedMonths);
}


//Adding/removing markers for when entering location
function addTestMarker(lat, lon) {
    const marker = new L.marker([lat, lon], {icon: goldIcon}).addTo(map);
    oldMarker = marker;
    map.flyTo([lat, lon], 8);
    marker.bindPopup("Is this the correct location?").openPopup();
}

function removeTestMarker() {
    if (oldMarker) {
        map.removeLayer(oldMarker);
    }
}


//Month selection toggle
document.querySelector('#all-checks').addEventListener('click', toggleBoxes);

function toggleBoxes() {
    const boxes = document.querySelectorAll('.checkbox');
    let counter = 0;

    for(let i = 0; i < boxes.length; i++) {
        if (!boxes[i].checked) {
            boxes[i].checked = true;
        }
        else {
            counter++;
        }
        
    };

    if (counter !== 6) {
        return;
    }

    boxes.forEach(box => box.checked = false)
}

onLoad();