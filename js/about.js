const galleryPhotos = [
    {
        id: 0,
        name: 'swamp milkweed',
        src: '../img/images/milkweed.png',
        desc: "Swamp milkweed (<i>Asclepias incarnata</i>)"
    },
    {
        id: 1,
        name: 'common milkweed',
        src: '../img/images/common-milkweed.png',
        desc: "Common milkweed (<i>Asclepias syriaca</i>)"
    },
    {
        id: 2,
        name: 'butterfly milkweed',
        src: '../img/images/butterfly-milkweed.png',
        desc: "Butterfly milkweed (<i>Asclepias tuberosa</i>)"
    },
    {
        id: 3,
        name: 'prairie milkweed',
        src: '../img/images/prairie-milkweed.png',
        desc: "Prairie milkweed (<i>Asclepias sullivantii</i>)"
    },
    {
        id: 4,
        name: 'showy milkweed',
        src: '../img/images/showy-milkweed.png',
        desc: "Showy milkweed (<i>Asclepias speciosa</i>)"
    }
]

document.addEventListener('DOMContentLoaded', function() {
    const imgDesc = document.querySelector('.gallery-desc');
    const imgElement = document.querySelector('.gallery-img');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    let number = 0;

    function renderGallery(idx) {
        imgElement.src = galleryPhotos[idx].src;
        imgDesc.innerHTML = galleryPhotos[idx].desc;
        if (number >= galleryPhotos.length) {
            number = 0;
        }
    }

    let galleryInterval = setInterval(() => {
        number++;
        if (number >= galleryPhotos.length) {
            number = 0;
        }
        renderGallery(number);
    }, 7000);

    function updateGallery(step) {
        clearInterval(galleryInterval);
        number += step;
        if (number < 0) {
            number = galleryPhotos.length - 1;
        } else if (number >= galleryPhotos.length) {
            number = 0;
        }
        renderGallery(number);
        galleryInterval = setInterval(() => {
            number++;
            if (number >= galleryPhotos.length) {
                number = 0;
            }
            renderGallery(number);
        }, 7000);
    }

    prev.addEventListener('click', () => updateGallery(-1));
    next.addEventListener('click', () => updateGallery(1));
    renderGallery(number);
});