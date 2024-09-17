const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone'); // Import moment-timezone

const app = express();
const API_KEY = '0dbe2db8f6dc8e19693fb9e4f75ec33e'; 

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.render('index', { weather: null, error: null, bgClass: '', iconUrl: '', city: '' });
});

app.get('/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.render('index', { weather: null, error: 'Please enter a city!', bgClass: '', iconUrl: '', city: '' });
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    
    try {
        const response = await axios.get(url);
        const weatherData = response.data;

        const temperature = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        const windSpeed = weatherData.wind.speed;
        const timezone = weatherData.timezone; // Timezone offset in seconds
        const iconCode = weatherData.weather[0].icon;

        // Map weather descriptions to icons
        let iconUrl;
        if (weatherDescription.includes('clear')) {
            iconUrl = 'images/sun.png';
        } else if (weatherDescription.includes('storm')) {
            iconUrl = 'images/storm.png';
        } else if (weatherDescription.includes('shower')) {
            iconUrl = 'images/rainy-day.png';
        } else if (weatherDescription.includes('snow')) {
            iconUrl = 'images/snow.png';
        } else if (weatherDescription.includes('rain')) {
            iconUrl = 'images/raining.png';
        } else if (weatherDescription.includes('cloud')) {
            iconUrl = 'images/clouds.png';
        } else {
            iconUrl = 'images/cloud.png'; // Fallback icon
        }

        // Convert the time to the city's local time
        const localTime = moment().utcOffset(timezone / 60).format('HH:mm'); // Convert to local time

        const hours = moment().utcOffset(timezone / 60).hour();
        let bgClass = '';

        if (hours >= 6 && hours < 12) {
            bgClass = 'morning';
        } else if (hours >= 12 && hours < 18) {
            bgClass = 'afternoon';
        } else if (hours >= 18 && hours < 21) {
            bgClass = 'evening';
        } else {
            bgClass = 'night';
        }

        const weatherMessage = {
            city: city,
            time: localTime,
            temperature: temperature,
            description: weatherDescription,
            windSpeed: windSpeed,
            iconUrl: iconUrl
        };

        res.render('index', { weather: weatherMessage, error: null, bgClass });
    } catch (error) {
        if (error.response && error.response.data.message === 'city not found') {
            res.render('index', { weather: null, error: 'City not found! Please check the spelling.', bgClass: '', iconUrl: '', city: '' });
        } else {
            res.render('index', { weather: null, error: 'An error occurred. Please try again later.', bgClass: '', iconUrl: '', city: '' });
        }
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

