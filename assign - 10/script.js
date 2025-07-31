const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherData = document.getElementById('weather-data');
const weatherIcon = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('weather-condition');
const cityCountryEl = document.getElementById('city-country');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

const weatherBody = document.getElementById('weather-body');

// Create autocomplete dropdown
const autocompleteDropdown = document.createElement('ul');
autocompleteDropdown.id = 'autocomplete-dropdown';
autocompleteDropdown.className = 'absolute z-10 w-full bg-white text-gray-800 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto hidden';
cityInput.parentNode.appendChild(autocompleteDropdown);

const apiKey = 'db7d9c6793cb03aebd655494c7dd3de1';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=';

async function getWeather(city) {
    loadingIndicator.classList.remove('hidden');
    weatherData.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        const response = await fetch(apiUrl + encodeURIComponent(city) + `&appid=${apiKey}`);
        const data = await response.json();
        if (!response.ok) {
            // Show API error message if available
            throw new Error(data.message ? data.message : 'City not found.');
        }
        updateWeatherUI(data);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function updateWeatherUI(data) {
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    conditionEl.textContent = data.weather[0].main;
    cityCountryEl.textContent = `${data.name}, ${data.sys.country}`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    updateBackground(data.weather[0].main.toLowerCase());
    weatherData.classList.remove('hidden');
}

function updateBackground(condition) {
    weatherBody.className = '';
    weatherBody.classList.add('transition-all', 'duration-500');

    if (condition.includes('clear')) {
        weatherBody.classList.add('bg-gradient-sunny');
    } else if (condition.includes('cloud')) {
        weatherBody.classList.add('bg-gradient-cloudy');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        weatherBody.classList.add('bg-gradient-rainy');
    } else if (condition.includes('mist') || condition.includes('haze') || condition.includes('fog')) {
        weatherBody.classList.add('bg-gradient-mist');
    } else {
        weatherBody.classList.add('bg-gradient-main');
    }
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherData.classList.add('hidden');
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});


// Autocomplete logic using GeoDB Cities API
let autocompleteTimeout;
cityInput.addEventListener('input', (e) => {
    const query = cityInput.value.trim();
    clearTimeout(autocompleteTimeout);
    if (query.length < 2) {
        autocompleteDropdown.classList.add('hidden');
        autocompleteDropdown.innerHTML = '';
        return;
    }
    autocompleteTimeout = setTimeout(() => fetchCitySuggestions(query), 300);
});

async function fetchCitySuggestions(query) {
    // GeoDB Cities API (no API key needed for basic usage)
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&namePrefix=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': 'demo', // Use 'demo' for limited free usage
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        });
        const data = await response.json();
        showAutocompleteSuggestions(data.data || []);
    } catch (err) {
        autocompleteDropdown.classList.add('hidden');
    }
}

function showAutocompleteSuggestions(cities) {
    autocompleteDropdown.innerHTML = '';
    if (!cities.length) {
        autocompleteDropdown.classList.add('hidden');
        return;
    }
    cities.forEach(city => {
        const li = document.createElement('li');
        li.className = 'px-4 py-2 cursor-pointer hover:bg-gray-200';
        li.textContent = `${city.city}, ${city.countryCode}`;
        li.addEventListener('mousedown', () => {
            cityInput.value = city.city;
            autocompleteDropdown.classList.add('hidden');
            getWeather(city.city);
        });
        autocompleteDropdown.appendChild(li);
    });
    autocompleteDropdown.classList.remove('hidden');
}

// Hide dropdown on blur
cityInput.addEventListener('blur', () => {
    setTimeout(() => autocompleteDropdown.classList.add('hidden'), 150);
});

// Enter key triggers search
cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            autocompleteDropdown.classList.add('hidden');
            getWeather(city);
        }
    }
});

window.addEventListener('load', () => getWeather('Delhi'));
