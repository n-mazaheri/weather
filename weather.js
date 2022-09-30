const axios = require('axios').default;
const prompt = require('prompt-sync')();

const UNITS = 'metric';
const EXCLUDE = 'hourly,minutely';
const NOW = Math.round(Date.now() / 1000);
const DAY = 25 * 60 * 60;
const YESTERDAY = NOW - DAY;

const withQueryParameters = (url, params) => {
  url.searchParams.set('appId', params?.key);
  url.searchParams.set('lat', params?.lat);
  url.searchParams.set('lon', params?.lng);
  url.searchParams.set('units', UNITS);
  url.searchParams.set('exclude', EXCLUDE);
  url.searchParams.set('dt', YESTERDAY);
  return url;
};

async function calcualteResources(lat, lng, key) {
  const historicalApi = new URL('https://api.openweathermap.org/data/2.5/onecall/timemachine');
  const values = { lat, lng, key };
  const { data: pastWeather } = await axios.get(`${withQueryParameters(historicalApi, values)}`);

  let totalReward = calculateReward(pastWeather);
  console.log(totalReward);
}

function calculateReward(pastWeather) {
  const totalReward = { sun: 0, rain: 0, wind: 0, snow: 0 };
  for (let index = 0; index < pastWeather.hourly.length; index++) {
    let sun = calculateSun(pastWeather.hourly[index]);
    let snow = calculateSnow(pastWeather.hourly[index]);
    let wind = calculateWind(pastWeather.hourly[index]);
    let rain = calculateRain(pastWeather.hourly[index]);
    console.log(sun, snow, wind, rain);
    totalReward.sun += sun;
    totalReward.snow += snow;
    totalReward.wind += wind;
    totalReward.rain += rain;
  }
  return totalReward;
}

function calculateSun(oneHourData) {
  let cloud = oneHourData?.clouds ? oneHourData?.clouds / 100 : 0;
  let sun = 1 - cloud;
  let uvi = oneHourData?.uvi ? oneHourData?.uvi / 16 : 0;
  return sun * uvi;
}
function calculateSnow(oneHourData) {
  return oneHourData?.snow && oneHourData?.snow['1h'] ? oneHourData?.snow['1h'] / 3048 : 0;
}
function calculateWind(oneHourData) {
  return oneHourData?.wind_speed ? oneHourData?.wind_speed / 103 : 0;
}
function calculateRain(oneHourData) {
  return oneHourData?.rain && oneHourData?.rain['1h'] ? oneHourData?.rain['1h'] / 305 : 0;
}

const lat = prompt('latitude? ');
const long = prompt('longitude? ');
const appId = prompt('open weather api key? ');
calcualteResources(lat, long, appId);
