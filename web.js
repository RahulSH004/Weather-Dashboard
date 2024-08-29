
const container = document.getElementById('container');
const searchInput = document.getElementById('search-input');
const videoContainer = document.getElementById('video-container');

function getTimeOfDay(cityLocalTime) {
    const now = new Date();
    const hours = now.getHours();

    // Check if the current time is between 8 PM and 4 AM
    if (hours >= 20 || hours < 4) {
        return 'night';
    }
    return '';
}
function resetTransition() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.classList.remove('visible');
    // Force a reflow to restart the transition
    void videoContainer.offsetWidth; // Trigger reflow
    videoContainer.classList.add('visible');
}

// Call this function before fetching a new video




async function fetchWeatherVideo(weatherCondition) {
    const timeOfDay = getTimeOfDay();
    
    console.log(timeOfDay, weatherCondition)
    const pexelsUrl = `https://api.pexels.com/videos/search?query=${weatherCondition} ${timeOfDay}&per_page=1`;
    try {
        const response = await fetch(pexelsUrl, {
            headers: {
                Authorization: 'z3De8uuzS1ofQ4z2eDrV2px9iMgbf3lrf2zHcpa11ka4kKudrrlhbrFR'
            }
        });
        const data = await response.json();

        if (response.ok && data.videos.length > 0) {
            const videoUrl = data.videos[0].video_files[0].link;
            console.log('Video URL:', videoUrl);
            // Display the video on your webpage
            videoContainer.innerHTML = `
                <video autoplay loop muted style="width: 100%; height: 100%; object-fit: cover;">
                    <source src="${videoUrl}" type="video/mp4">
                </video>`;
                videoContainer.classList.add('visible');
                resetTransition();
        } else {
            console.log('No videos found for the current weather condition');
            // Display a fallback message or content
            document.getElementById('video-container').innerHTML = '<h1>No Videos Found</h1>';
            videoContainer.classList.add('visible');
        }
    } catch (error) {
        console.error('Error fetching video:', error);
        document.getElementById('video-container').classList.remove('visible');
    }
}
function updateBackgroundVideo() {
    // Get the current weather condition from your existing weather element
    const weatherConditionElement = document.getElementById('current-weather-condition');
    if (weatherConditionElement) {
        const weatherCondition = weatherConditionElement.textContent.trim().toLowerCase();
        fetchWeatherVideo(weatherCondition); // Call the function with the current weather condition
    } else {
        console.log('Weather condition element not found.');
    }
}



//--weather--//

const WEATHER_API_KEY = 'bff8cf254ed842809ad75541242108';
const locationElement = document.getElementById('location-name');
const dateElement = document.getElementById('location-date');
const timeElement = document.getElementById('location-time');
const tempElement = document.getElementById('current-temperature');
const weatherElement = document.getElementById('current-weather-condition');
const weatherIconElement = document.getElementById('weather-icon-image');
const timezone = document.getElementById('location-time-zone');

async function fetchWeather(cityName) {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${cityName}&aqi=yes`);
        const astroresponse = await fetch(`http://api.weatherapi.com/v1/astronomy.json?key=${WEATHER_API_KEY}&q=${cityName}&dt=${currentDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${ response.status }`);
        }
        if (!astroresponse) {
            throw new Error(`HTTP error! status: ${ astroresponse.status }`);
        }
        const data = await response.json();
        const astroData = await astroresponse.json();
        console.log(data, astroData);  // Make sure this is being logged

        let localtime = data.location.localtime.split(' ')[1]; // Get the time part
        let [hours, minutes] = localtime.split(':'); // Split hours and minutes
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        // Populate your elements with data (example)
        locationElement.textContent = `${ data.location.name }, ${ data.location.country }`;
        dateElement.textContent = new Date(data.location.localtime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        timeElement.textContent = data.location.localtime.split(' ')[1];
        timezone.textContent = `${ hours }:${ minutes } ${ ampm }`;
        tempElement.textContent = `${ data.current.temp_c } °C`;
        weatherElement.textContent = data.current.condition.text;
        timeElement.innerHTML = `<span class="sunrise-image"><img src="weather_icons/sunrise.png" alt="sunrise"></span> ${ astroData.astronomy.astro.sunrise } |
            <span class="sunset-image"><img src="weather_icons/sunset.png" alt="sunset"></span> ${ astroData.astronomy.astro.sunset }`;
            const iconurl = `https://${data.current.condition.icon}`;
            weatherIconElement.src = iconurl;
        weatherIconElement.alt = data.current.condition.text;

        updateBackgroundVideo(data.location.localtime);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Example call to fetchWeather

// forecast 

async function forecast(cityName) {
    try {
        const forecastresponse = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${cityName}&days=6&aqi=no&alerts=no`);
        
        if (!forecastresponse.ok) {
            throw new Error(`HTTP error! status: ${ forecastresponse.status }`);
        }

        const forecastdata = await forecastresponse.json();
        const weeklyForecastContainer = document.querySelector('.weekly-forecast');

        // Clear any existing forecast content
        weeklyForecastContainer.innerHTML = '';

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split(' ')[0];

        // Iterate over forecast days and skip today's forecast
        forecastdata.forecast.forecastday.forEach(day => {
            // Skip today's date
            if (day.date === today) return;

            // Create a container for each forecast day
            const forecastDayElement = document.createElement('div');
            forecastDayElement.classList.add('forecast-day');

            // Get the weekday name and short date
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            const shortDate = new Date(day.date).toLocaleDateString('en-US', { day: '2-digit' });

            // Populate the forecast day's HTML content
            forecastDayElement.innerHTML = 
                `<p class="day">${shortDate} ${dayName}</p>
                <div class="icon"><img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}"></div>
                <p class="temp">${day.day.maxtemp_c}°<span class="min-temp">${day.day.mintemp_c}°</span></p>`;

            // Append the forecast day to the weekly forecast container
            weeklyForecastContainer.appendChild(forecastDayElement);
        });
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}


//details 

const humdityvalue = document.getElementById('humidity-value');
const windvalue = document.getElementById('wind-value');
const precipitation = document.getElementById('precipitation-value');
const aqivalue = document.getElementById('Aqi-value');
const uvvalue = document.getElementById('UV-card-value')

const humidityDesc = document.getElementById('humidity-description');
const windDesc = document.getElementById('wind-description');
const precipitationDesc = document.getElementById('precipitation-description');
const uvDesc = document.getElementById('UV-card-description');
const aqiDesc = document.getElementById('Aqi-description');

async function fetchDetails(cityName) {
    try {
        const detailsresponse = await fetch(`https://api.tomorrow.io/v4/weather/realtime?location=${cityName}&apikey=3bkGtuZ9tW5t85c4pF83NDwRMLoCJHBb`);
        const detail = await fetch(`http://api.weatherapi.com/v1/current.json?key=bff8cf254ed842809ad75541242108&q=${cityName}&aqi=yes`);

            console.log('Details response status:', detailsresponse.status);
            console.log('Detail response status:', detail.status);

        if(!detailsresponse){
            throw new Error(`HTTP error! status: ${ detailsresponse.status }`);
        }
        if (!detail.ok) {
            throw new Error(`HTTP error! status: ${ detail.status }`);
        }
        const ddata = await detail.json();
        const detailsdata = await detailsresponse.json();

        // Use the console log
        console.log(detailsdata,ddata);

        const humidity = ddata.current.humidity;
        const windSpeed = ddata.current.wind_kph;
        const precipitationProbability = detailsdata.data.values.precipitationProbability;
        const uvIndex = ddata.current.uv;
        const aqiValue = ddata.current.air_quality['us-epa-index'];

        humdityvalue.textContent = `${ humidity }%`;
        windvalue.textContent = `${ windSpeed } km / h`;
        precipitation.textContent = `${precipitationProbability}%`;
        uvvalue.textContent = `${ uvIndex }`;
        aqivalue.textContent = `${ aqiValue }`;

        // description
        // Description logic for humidity
        humidityDesc.textContent = humidity < 30 ? 'Low humidity' : humidity < 60 ? 'Moderate humidity' : 'High humidity';

        // Description logic for wind speed
        windDesc.textContent = windSpeed < 5 ? 'Calm wind' : windSpeed < 20 ? 'Light breeze' : windSpeed < 40 ? 'Moderate wind' : 'Strong wind';

        // Description logic for precipitation probability
        precipitationDesc.textContent = precipitationProbability < 20 ? 'Low chance of rain' : precipitationProbability < 50 ? 'Possible rain' : precipitationProbability < 80 ? 'Likely rain' : 'Very likely rain';

        // Description logic for UV index
        uvDesc.textContent = uvIndex <= 2 ? 'Low UV risk' : uvIndex <= 5 ? 'Moderate UV risk' : uvIndex <= 7 ? 'High UV risk' : uvIndex <= 10 ? 'Very high UV risk' : 'Extreme UV risk';

        // Description logic for AQI (Air Quality Index)
        aqiDesc.textContent = aqiValue === 1 ? 'Good' : aqiValue === 2 ? 'Moderate' : aqiValue === 3 ? 'Unhealthy for sensitive groups' : aqiValue === 4 ? 'Unhealthy' : aqiValue === 5 ? 'Very Unhealthy' : 'Hazardous';

    } catch (error) {
        console.error('Error fetching weather details:', error);
    }
}


// today forecast
async function fetchTodayForecast(cityName) {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=bff8cf254ed842809ad75541242108&q=${cityName}&days=1&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const hourlyForecast = data.forecast.forecastday[0].hour;
        const cityLocalTime = new Date(data.location.localtime); // City's local time

        // Get current city local hour
        const currentHourInCity = cityLocalTime.getHours();

        // Determine the next 3-hour intervals in city's local time
        const nextIntervals = [currentHourInCity + 3, currentHourInCity + 6, currentHourInCity + 9].map(hour => hour % 24);

        const todayForecastContainer = document.querySelector('.today-forecast');
        todayForecastContainer.innerHTML = '';

        nextIntervals.forEach(hour => {
            // Find the forecast data for the specific hour
            const hourData = hourlyForecast.find(data => new Date(data.time).getHours() === hour);

            if (hourData) {
                // Convert time to 12-hour format based on city's local time
                const time = new Date(hourData.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const temp = hourData.temp_c.toFixed(1); // Temperature in Celsius

                // Add the forecast information to the container
                todayForecastContainer.innerHTML += `
                    <div class="forecast-time">
                        <p class="time">${time}</p>
                        <div class="icon">
                            <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}">
                            <span class="description">${hourData.condition.text}</span>
                        </div>
                        <p class="temp">${temp}°C</p>
                    </div>
                    ${hour !== nextIntervals[nextIntervals.length - 1] ? '<hr>' : ''}`
                ;
            }
        });

    } catch (error) {
        console.error('Error fetching today forecast:', error);
    }
}



searchInput.addEventListener('change', (event) => {
    const cityName = event.target.value.trim();
    fetchWeather(cityName);
    fetchDetails(cityName);
    forecast(cityName);
    fetchTodayForecast(cityName);
});

fetchWeather('New York');
forecast('New york');
fetchDetails('New york');
fetchTodayForecast('New york');
