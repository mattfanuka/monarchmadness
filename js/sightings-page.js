let sightingArray = [];

async function grabAllSightings() {
    try {
        const response = await fetch ('https://monarchbackend.onrender.com/api/sightings');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const allSightings = await response.json();
        sightingArray = allSightings
    }
    catch(err) {
        console.error('Error fetching sightings:', err);
    }
}

function renderList(arr) {
    const entryContainer = document.querySelector('.entry-container');
    const totalSightings = document.querySelector('.total-sightings');

    totalSightings.innerHTML += `${arr.length})`;

    for (let i = 0; i < arr.length; i++) {
        const sighting = arr[i];
        const date = new Date(sighting.date);

        let environment;
        sighting.environment === '' ? environment = 'N/A' : environment = sighting.environment;
        
        entryContainer.innerHTML += `
        <div class="entry">
            <span class="location"><h3>${sighting.place}</h3></span>
            <span class="env"><h3>${environment[0].toUpperCase()}${environment.slice(1)}</h3></span>
            <span class="life-stage"><h3>${sighting.lifeStage[0].toUpperCase()}${sighting.lifeStage.slice(1)}</h3></span>
            <span class="date"><h3>${date.toDateString()}</h3></span>
        </div>
        `
    }
    console.log('done')
    console.log(entryContainer)
}

function sortData(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[arr.length - 1];
    const pivotDate = new Date (pivot.date)
    const left = [];
    const right = [];

    for (let i = 0; i < arr.length - 1; i++) {
        const date = new Date(arr[i].date)

        if (date.getTime() > pivotDate.getTime()) {
            left.push(arr[i]);
        }
        else if (date.getTime() <= pivotDate.getTime()) {
            right.push(arr[i]);
        }
    }

    return [...sortData(left), pivot, ...sortData(right)];
}

async function onload() {
    await grabAllSightings();
    const data = sortData(sightingArray);
    renderList(data);
}


