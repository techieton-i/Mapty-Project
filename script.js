'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;


class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getposition();
        form.addEventListener('submit', this._newWorkout.bind(this));

        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getposition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('could not get your position');
            });
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log(latitude, longitude);
        console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 13);


        console.log(this);


        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // map events
        this.#map.on('click', this._showForm.bind(this));

    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    };

    _newWorkout(e) {

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        e.preventDefault();
        //Get data from form 
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;


        //if workout running, create running object
        if (type === 'running') {

            const cadence = +inputCadence.value;
            //check if data is valid
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert('Inputs have to be positive');

            workout = new Running([lat, lng], distance, duration, cadence);

        }
        // if workout cycling create cycling object
        if (type === 'cycling') {

            const elevation = +inputElevation.value;

            //check if data is valid

            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Inputs have to be positive');

            workout = new Cycling([lat, lng], distance, duration, elevation);


        }

        //add new object to workout array
        this.#workouts.push(workout);

        //render workout on map as marker

        //render workout on list

        //hide form

        //clear input fields






        // clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';


        // display marker
        console.log(lat);
        this._renderWorkoutMarker(workout);

    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 50,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`
                })
            ).setPopupContent(`${workout.type}`)
            .openPopup();

    }

}

const app = new App();

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);


    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;  //in km
        this.duration = duration; //in min
    }
}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration,);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration,);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / this.duration;
        return this.speed;
    }
}




// const run1 = new Running([30, 15], 5.2, 24, 128);
// const cycle1 = new Cycling([30, 15], 25, 95, 528);
// console.log(run1, cycle1);




