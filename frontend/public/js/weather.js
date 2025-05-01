const API_KEY = '794efe392152c49c188a920c09dd9e24'; // Replace with your API key
const body = document.getElementById('app-body');
const weatherSection = document.getElementById('weather-section');
const weatherIcon = document.getElementById('weather-icon');
const alertSection = document.getElementById('alert-section');
const rainContainer = document.querySelector('.rain');
const snowContainer = document.querySelector('.snow');
const alertModal = document.getElementById('alert-modal');


function fetchWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('location').innerText = data.name;
            document.getElementById('temperature').innerText = `${data.main.temp} °C`;
            document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
            let windSpeedKnots = (data.wind.speed * 1.94384).toFixed(2);
            document.getElementById('wind-speed').innerText = `Wind Speed: ${windSpeedKnots} knots`;

            // Update Weather Icon
            updateWeatherIcon(data.weather[0].id);

            // Check for High Wind Alert
            if (windSpeedKnots > 20) {
                showAlert("⚠️ High Wind Alert! Stay Safe.", "high-wind");
            } else {
                clearAlert();
            }

            // Change background based on weather condition
            let weatherCondition = data.weather[0].main.toLowerCase();
            updateBackground(weatherCondition);
        })
        .catch(error => console.error('Error fetching weather data:', error));

    // Fetch Hourly Forecast
    fetchHourlyForecast(lat, lon);

    // Fetch 7-Day Forecast
    fetchWeeklyForecast(lat, lon);

    // Fetch UV Index and Air Quality Data
    fetchUVIndex(lat, lon);
    fetchAirQuality(lat, lon);
}


function updateWeatherIcon(conditionId) {
    let iconClass = 'wi wi-day-sunny'; // Default icon

    if (conditionId >= 200 && conditionId < 300) {
        iconClass = 'wi wi-thunderstorm';
    } else if (conditionId >= 300 && conditionId < 400) {
        iconClass = 'wi wi-sprinkle';
    } else if (conditionId >= 500 && conditionId < 600) {
        iconClass = 'wi wi-rain';
    } else if (conditionId >= 600 && conditionId < 700) {
        iconClass = 'wi wi-snow';
    } else if (conditionId >= 700 && conditionId < 800) {
        iconClass = 'wi wi-fog';
    } else if (conditionId === 800) {
        iconClass = isDaytime() ? 'wi wi-day-sunny' : 'wi wi-night-clear';
    } else if (conditionId > 800 && conditionId < 900) {
        iconClass = isDaytime() ? 'wi wi-day-cloudy' : 'wi wi-night-cloudy';
    }

    weatherIcon.className = 'wi ' + iconClass + ' text-6xl mt-2';
}
function updateBackground(condition) {
    const backgrounds = {
        clear: "url('/img/clear.jpeg')",
        clouds: "url('/img/cloud.jpeg')",
        rain: "url('/img/rain.jpg')",
        thunderstorm: "url('/img/thunder.jpeg')",
        snow: "url('/img/snow.jpeg')",
        mist: "url('/img/mist.jpeg')"
    };
    weatherSection.style.backgroundImage = backgrounds[condition] || "url('/img/normal1.jpeg')" ;
    weatherSection.style.backgroundSize = "cover    ";
    weatherSection.style.backgroundPosition = "center";
    weatherSection.style.backgroundRepeat = "no-repeat";

    // Trigger Rain Animation
    if (condition === 'rain' || condition === 'drizzle') {
        startRainAnimation();
    } else {
        stopRainAnimation();
    }

    // Trigger Snow Animation
    if (condition === 'snow') {
        startSnowAnimation();
    } else {
        stopSnowAnimation();
    }
}

function startRainAnimation() {
    rainContainer.innerHTML = ''; // Clear existing drops
    rainContainer.style.display = 'block';
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random()}s`;
        rainContainer.appendChild(drop);
    }
}

function stopRainAnimation() {
    rainContainer.style.display = 'none';
}

function startSnowAnimation() {
    snowContainer.innerHTML = ''; // Clear existing snowflakes
    snowContainer.style.display = 'block';
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDelay = `${Math.random() * 3}s`;
        snowflake.style.setProperty('--snow-offset', `${Math.random() * 200 - 100}px`);
        snowContainer.appendChild(snowflake);
    }
}

function stopSnowAnimation() {
    snowContainer.style.display = 'none';
}

function showAlert(message, type) {
    document.getElementById('alert-message').innerText = message;
    document.getElementById('modal-alert-message').innerText = message;
    alertSection.classList.add('blinking');

    // Change alert background based on alert type
    if (type === "high-wind") {
        alertSection.classList.remove('bg-red-100', 'bg-yellow-100');
        alertSection.classList.add('bg-orange-200');
    } else if (type === "severe") {
        alertSection.classList.remove('bg-red-100', 'bg-orange-200');
        alertSection.classList.add('bg-yellow-100');
        // Show modal for severe alerts
        alertModal.style.display = "block";
    } else {
        alertSection.classList.remove('bg-orange-200', 'bg-yellow-100');
        alertSection.classList.add('bg-red-100');
    }
}

function clearAlert() {
    document.getElementById('alert-message').innerText = "No alerts.";
    alertSection.classList.remove('blinking', 'bg-orange-200', 'bg-yellow-100');
    alertSection.classList.add('bg-red-100');
}

function closeModal() {
    alertModal.style.display = "none";
    clearAlert();
}

function isDaytime() {
    const now = new Date();
    const hour = now.getHours();
    return hour > 6 && hour < 18; // Consider 6 AM to 6 PM as daytime
}

function fetchHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const hourlyContainer = document.getElementById('hourly-container');
            hourlyContainer.innerHTML = ''; // Clear existing forecasts

            // Display the next 12 hours
            for (let i = 0; i < 4; i++) {
                const forecast = data.list[i];
                const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const temperature = forecast.main.temp.toFixed(1);
                const iconCode = forecast.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                const hourlyItem = document.createElement('div');
                hourlyItem.classList.add('hourly-item', 'p-4', 'text-center');
                hourlyItem.innerHTML = `
                    <p>${time}</p>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>${temperature}°C</p>
                `;
                hourlyContainer.appendChild(hourlyItem);
            }
        })
        .catch(error => console.error('Error fetching hourly forecast:', error));
}

function fetchWeeklyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const weeklyContainer = document.getElementById('weekly-container');
            weeklyContainer.innerHTML = ''; // Clear existing forecasts

            // Filter forecasts to get one forecast per day
            const dailyForecasts = [];
            for (let i = 0; i < data.list.length; i += 8) { // Assuming 3-hour intervals, so 8 intervals per day
                dailyForecasts.push(data.list[i]);
            }

            // Display the next 7 days
            for (let i = 0; i < 7 && i < dailyForecasts.length; i++) {
                const forecast = dailyForecasts[i];
                const day = new Date(forecast.dt * 1000).toLocaleDateString([], { weekday: 'short' });
                const temperature = forecast.main.temp.toFixed(1);
                const iconCode = forecast.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                const weeklyItem = document.createElement('div');
                weeklyItem.classList.add('weekly-item', 'p-4', 'text-center');
                weeklyItem.innerHTML = `
                    <p>${day}</p>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>${temperature}°C</p>
                `;
                weeklyContainer.appendChild(weeklyItem);
            }
        })
        .catch(error => console.error('Error fetching weekly forecast:', error));
}

function fetchUVIndex(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('uv-index').innerText = `UV Index: ${data.value}`;
        })
        .catch(error => console.error('Error fetching UV Index:', error));
}

function fetchAirQuality(lat, lon) {
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const airQualityIndex = data.list[0].main.aqi; // 1-5, where 1 is Good, 5 is Very Poor
            let airQualityText = "Moderate";
            switch (airQualityIndex) {
                case 1: airQualityText = "Good"; break;
                case 2: airQualityText = "Fair"; break;
                case 3: airQualityText = "Moderate"; break;
                case 4: airQualityText = "Poor"; break;
                case 5: airQualityText = "Very Poor"; break;
            }
            document.getElementById('air-quality').innerText = `Air Quality: ${airQualityText}`;
        })
        .catch(error => console.error('Error fetching Air Quality:', error));
}

function searchCity() {
    const city = document.getElementById('city-search').value;
    if (city) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    fetchWeather(lat, lon);
                } else {
                    alert('City not found.');
                }
            })
            .catch(error => console.error('Error fetching city coordinates:', error));
    }
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => fetchWeather(position.coords.latitude, position.coords.longitude),
        error => console.error('Error getting location:', error)
    );
}


async function subscribeToAlerts() {
    const city = document.getElementById('city-search').value.trim();
    if (!city) {
      alert('Please enter a city to subscribe.');
      return;
    }
  
    try {
      const response = await fetch('/subscribeWindAlerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city })
      });
  
      const result = await response.json();
      if (result.success) {
        alert('Subscribed successfully to weather alerts for ' + city);
      } else {
        alert('Subscription failed: ' + result.message);
      }
    } catch (err) {
      console.error('Error subscribing to alerts:', err);
      alert('Something went wrong.');
    }
  }
  