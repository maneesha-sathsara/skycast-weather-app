const cityInput = document.getElementById("cityInput");
const searchButton = document.querySelector(".search-row button");

const statusMsg = document.getElementById("statusMsg");

const currentCard = document.getElementById("currentCard");
const cityNameElement = document.getElementById("cityName");
const temperatureElement = document.getElementById("temp");
const windElement = document.getElementById("wind");
const conditionElement = document.getElementById("condition");

const forecastBody = document.getElementById("forecastBody");


searchButton.addEventListener("click", searchWeather);


async function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        statusMsg.textContent = "Please enter a city name.";
        currentCard.classList.add("hidden");
        forecastBody.innerHTML = "";
        return;
    }

    statusMsg.textContent = "Loading...";


    try {

        // TASK 2 - GEOCODING

        const geocodingURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

        const geocodingResponse = await fetch(geocodingURL);

        if (!geocodingResponse.ok) {
            throw new Error("Geocoding request failed");
        }

        const geocodingData = await geocodingResponse.json();


        if (!geocodingData.results || geocodingData.results.length === 0) {

            statusMsg.textContent =
                "City not found. Please try another city.";

            currentCard.classList.add("hidden");
            forecastBody.innerHTML = "";

            return;
        }


        const location = geocodingData.results[0];

        const cityName = location.name;
        const latitude = location.latitude;
        const longitude = location.longitude;


        console.log("City:", cityName);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);


        // TASK 3 - CURRENT WEATHER

        const forecastURL =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current_weather=true` +
            `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
            `&timezone=auto`;


        const forecastResponse = await fetch(forecastURL);

        if (!forecastResponse.ok) {
            throw new Error("Weather request failed");
        }

        const forecastData = await forecastResponse.json();

        const currentWeather = forecastData.current_weather;


        cityNameElement.textContent = cityName;

        temperatureElement.textContent =
            `${currentWeather.temperature} °C`;

        windElement.textContent =
            `${currentWeather.windspeed} km/h`;

        conditionElement.textContent =
            getWeatherDescription(currentWeather.weathercode);


        currentCard.classList.remove("hidden");


        // TASK 4 - FORECAST TABLE

        const daily = forecastData.daily;

        const dates = daily.time;
        const weatherCodes = daily.weathercode;
        const maxTemperatures = daily.temperature_2m_max;
        const minTemperatures = daily.temperature_2m_min;
        const precipitation = daily.precipitation_sum;


        forecastBody.innerHTML = "";


        for (let i = 0; i < dates.length; i++) {

            const row = document.createElement("tr");


            if (precipitation[i] > 0) {
                row.classList.add("rainy-day");
            }


            const dateCell = document.createElement("td");
            const conditionCell = document.createElement("td");
            const maxTempCell = document.createElement("td");
            const minTempCell = document.createElement("td");
            const precipitationCell = document.createElement("td");


            dateCell.textContent = dates[i];

            conditionCell.textContent =
                getWeatherDescription(weatherCodes[i]);

            maxTempCell.textContent =
                `${maxTemperatures[i]} °C`;

            minTempCell.textContent =
                `${minTemperatures[i]} °C`;

            precipitationCell.textContent =
                `${precipitation[i]} mm`;


            row.appendChild(dateCell);
            row.appendChild(conditionCell);
            row.appendChild(maxTempCell);
            row.appendChild(minTempCell);
            row.appendChild(precipitationCell);


            forecastBody.appendChild(row);
        }


        statusMsg.textContent = "";


    } catch (error) {

        console.error("Error:", error);

        statusMsg.textContent =
            "Unable to load weather data. Please try again.";

        currentCard.classList.add("hidden");
    }
}


function getWeatherDescription(code) {

    if (code === 0) {
        return "Clear sky";

    } else if (code >= 1 && code <= 3) {
        return "Mainly clear / partly cloudy";

    } else if (code === 45 || code === 48) {
        return "Fog";

    } else if (code >= 51 && code <= 57) {
        return "Drizzle";

    } else if (code >= 61 && code <= 67) {
        return "Rain";

    } else if (code >= 71 && code <= 77) {
        return "Snow";

    } else if (code >= 80 && code <= 82) {
        return "Rain showers";

    } else if (code >= 95 && code <= 99) {
        return "Thunderstorm";

    } else {
        return "Unknown weather";
    }
}