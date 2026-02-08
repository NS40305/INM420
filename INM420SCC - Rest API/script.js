/* ================================================
   Configuration
   ================================================ */
const API_KEY = '03e0b0d75bfe4fe9af905119260802';
const BASE_URL = 'http://api.weatherapi.com/v1/current.json';
const TIME_API_URL = 'https://worldtimeapi.org/api/timezone';

const CITY_TIMEZONE_MAP = {
    'Toronto': 'America/Toronto',
    'Vancouver': 'America/Vancouver',
    'New York': 'America/New_York',
    'London': 'Europe/London',
    'Tokyo': 'Asia/Tokyo',
    'Sydney': 'Australia/Sydney'
};

/* ================================================
   DOM Elements
   ================================================ */
const locationSelect = document.getElementById('location-select');
const cityNameEl = document.getElementById('city-name');
const localTimeEl = document.getElementById('local-time');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind');
const weatherAnimationEl = document.getElementById('weather-animation');

/* ================================================
   API Functions
   ================================================ */
async function fetchWeather(city) {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        alert('Please set your API Key in script.js!');
        console.error('[API] Error: API Key not configured');
        return;
    }

    const requestUrl = `${BASE_URL}?key=${API_KEY}&q=${city}&aqi=no`;
    const startTime = performance.now();

    console.log('[API] ====================================');
    console.log(`[API] Request: Fetching weather for "${city}"`);
    console.log(`[API] URL: ${requestUrl}`);

    try {
        const response = await fetch(requestUrl);
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);

        console.log(`[API] Status: ${response.status} ${response.statusText}`);
        console.log(`[API] Response Time: ${responseTime}ms`);

        if (!response.ok) {
            console.error(`[API] Error: HTTP ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('[API] Success: Data received');
        console.log('[API] Location:', data.location.name, data.location.country);
        console.log('[API] Weather:', data.current.condition.text, `${data.current.temp_c}°C`);
        console.log('[API] ====================================');

        const worldTime = await fetchWorldTime(city);
        updateUI(data, worldTime);
    } catch (error) {
        console.error('[API] Error:', error.message);
        console.log('[API] ====================================');
        cityNameEl.textContent = 'Error loading data';
        conditionEl.textContent = 'Please check your API key or connection.';
    }
}

async function fetchWorldTime(city) {
    const timezone = CITY_TIMEZONE_MAP[city];

    if (!timezone) {
        console.warn(`[Time API] No timezone mapping for city: ${city}`);
        return null;
    }

    const timeUrl = `${TIME_API_URL}/${timezone}`;

    console.log('[Time API] ====================================');
    console.log(`[Time API] Request: Fetching time for "${city}"`);
    console.log(`[Time API] Timezone: ${timezone}`);

    try {
        const response = await fetch(timeUrl);

        if (!response.ok) {
            console.error(`[Time API] Error: HTTP ${response.status}`);
            return null;
        }

        const data = await response.json();

        console.log(`[Time API] Status: ${response.status} OK`);
        console.log(`[Time API] DateTime: ${data.datetime}`);
        console.log('[Time API] ====================================');

        return data;
    } catch (error) {
        console.error('[Time API] Error:', error.message);
        console.log('[Time API] ====================================');
        return null;
    }
}

/* ================================================
   UI Update Functions
   ================================================ */
function updateUI(data, worldTime) {
    const { location, current } = data;

    cityNameEl.textContent = `${location.name}, ${location.country}`;

    let displayTime;
    let timeForTheme;

    if (worldTime && worldTime.datetime) {
        const dateObj = new Date(worldTime.datetime);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        displayTime = `${year}-${month}-${day} ${hours}:${minutes}`;
        timeForTheme = displayTime;
        console.log('[UI] Using WorldTimeAPI time:', displayTime);
    } else {
        displayTime = location.localtime;
        timeForTheme = location.localtime;
        console.log('[UI] Fallback to WeatherAPI time:', displayTime);
    }

    localTimeEl.textContent = displayTime;
    temperatureEl.textContent = `${current.temp_c}°C`;
    conditionEl.textContent = current.condition.text;
    humidityEl.textContent = `${current.humidity}%`;
    windSpeedEl.textContent = `${current.wind_kph} km/h`;

    const iconUrl = current.condition.icon.startsWith('//')
        ? `https:${current.condition.icon}`
        : current.condition.icon;

    weatherIconEl.src = iconUrl;
    weatherIconEl.alt = current.condition.text;
    weatherIconEl.classList.remove('hidden');

    applyWeatherTheme(current.condition.text, current.is_day, timeForTheme);
}

/* ================================================
   Theme Functions
   ================================================ */
function applyWeatherTheme(conditionText, isDay, localtime) {
    const condition = conditionText.toLowerCase();

    document.body.className = '';
    clearWeatherAnimations();

    if (localtime) {
        applyTimeBrightness(localtime);
    }

    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
        document.body.classList.add('theme-rainy');
        createRainAnimation();
    } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('blizzard')) {
        document.body.classList.add('theme-snowy');
        createSnowAnimation();
    } else if (condition.includes('thunder') || condition.includes('storm')) {
        document.body.classList.add('theme-stormy');
        createRainAnimation();
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        document.body.classList.add('theme-cloudy');
        createCloudAnimation();
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
        document.body.classList.add('theme-foggy');
    } else if (condition.includes('sunny') || condition.includes('clear')) {
        if (isDay === 1) {
            document.body.classList.add('theme-sunny');
            createSunAnimation();
        } else {
            document.body.classList.add('theme-night');
        }
    } else {
        if (isDay === 0) {
            document.body.classList.add('theme-night');
        }
    }
}

function applyTimeBrightness(localtime) {
    const timePart = localtime.split(' ')[1];
    const hour = parseInt(timePart.split(':')[0], 10);

    console.log(`[Time] Local hour: ${hour}`);

    if (hour >= 5 && hour < 7) {
        document.body.classList.add('time-dawn');
        console.log('[Time] Period: Dawn');
    } else if (hour >= 7 && hour < 12) {
        document.body.classList.add('time-morning');
        console.log('[Time] Period: Morning');
    } else if (hour >= 12 && hour < 17) {
        document.body.classList.add('time-afternoon');
        console.log('[Time] Period: Afternoon');
    } else if (hour >= 17 && hour < 20) {
        document.body.classList.add('time-dusk');
        console.log('[Time] Period: Dusk');
    } else {
        document.body.classList.add('time-night');
        console.log('[Time] Period: Night');
    }
}

/* ================================================
   Animation Functions
   ================================================ */
   
// Clear - Remove all animation elements
function clearWeatherAnimations() {
    if (weatherAnimationEl) {
        weatherAnimationEl.innerHTML = '';
    }
}

// Rain / Drizzle / Shower / Storm - Falling rain drops
function createRainAnimation() {
    const numberOfDrops = 50;

    for (let i = 0; i < numberOfDrops; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        const duration = 0.5 + Math.random() * 0.5;
        drop.style.animationDuration = `${duration}s`;
        drop.style.animationDelay = `-${Math.random() * duration}s`;
        drop.style.opacity = `${0.3 + Math.random() * 0.7}`;
        weatherAnimationEl.appendChild(drop);
    }
}

// Snow / Sleet / Blizzard - Falling snowflakes
function createSnowAnimation() {
    const numberOfFlakes = 30;

    for (let i = 0; i < numberOfFlakes; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.width = `${5 + Math.random() * 10}px`;
        flake.style.height = flake.style.width;
        const duration = 3 + Math.random() * 5;
        flake.style.animationDuration = `${duration}s`;
        flake.style.animationDelay = `-${Math.random() * duration}s`;
        flake.style.opacity = `${0.5 + Math.random() * 0.5}`;
        weatherAnimationEl.appendChild(flake);
    }
}

// Cloudy / Overcast - Drifting clouds
function createCloudAnimation() {
    const numberOfClouds = 5;

    for (let i = 0; i < numberOfClouds; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${10 + Math.random() * 30}%`;
        cloud.style.width = `${100 + Math.random() * 150}px`;
        cloud.style.height = `${50 + Math.random() * 50}px`;
        cloud.style.animationDuration = `${20 + Math.random() * 20}s`;
        cloud.style.animationDelay = `${-Math.random() * 20}s`;
        weatherAnimationEl.appendChild(cloud);
    }
}

// Sunny / Clear - Radiating sun rays
function createSunAnimation() {
    const numberOfRays = 12;

    for (let i = 0; i < numberOfRays; i++) {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        ray.style.transform = `rotate(${i * (360 / numberOfRays)}deg)`;
        ray.style.animationDelay = `${i * 0.2}s`;
        weatherAnimationEl.appendChild(ray);
    }
}

/* ================================================
   Test Animation Functions
   ================================================ */
function applyTestAnimation(type) {
    cityNameEl.textContent = `Test Mode: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    localTimeEl.textContent = 'Animation Preview';
    temperatureEl.textContent = '--°C';
    conditionEl.textContent = `Testing ${type} animation`;
    humidityEl.textContent = '--%';
    windSpeedEl.textContent = '-- km/h';
    weatherIconEl.classList.add('hidden');

    document.body.className = '';
    clearWeatherAnimations();

    switch (type) {
        case 'sunny':
            document.body.classList.add('theme-sunny');
            createSunAnimation();
            break;
        case 'cloudy':
            document.body.classList.add('theme-cloudy');
            createCloudAnimation();
            break;
        case 'rainy':
            document.body.classList.add('theme-rainy');
            createRainAnimation();
            break;
        case 'snowy':
            document.body.classList.add('theme-snowy');
            createSnowAnimation();
            break;
        case 'stormy':
            document.body.classList.add('theme-stormy');
            createRainAnimation();
            break;
        case 'night':
            document.body.classList.add('theme-night');
            break;
        case 'foggy':
            document.body.classList.add('theme-foggy');
            break;
    }
}

/* ================================================
   Event Listeners
   ================================================ */
locationSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;

    if (selectedValue.startsWith('TEST:')) {
        const testType = selectedValue.replace('TEST:', '');
        applyTestAnimation(testType);
    } else {
        fetchWeather(selectedValue);
    }
});

/* ================================================
   Initialization
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (locationSelect.options.length > 0) {
        fetchWeather(locationSelect.options[0].value);
    }
});
