const apiid = 'your_api_key_here'

// // 🌙 Theme toggle
// const toggle = document.querySelector('#themeToggle')
// toggle.addEventListener('click', () => {
//     document.body.classList.toggle('dark')
// })

// 📦 Common UI updater (IMPORTANT)
function updateUI(data) {
    document.querySelector('#country').innerHTML = data.name
    document.querySelector('#temp').innerHTML = Math.round(data.main.temp) + '°C'
    document.querySelector('#des').innerHTML = data.weather[0].description
    document.querySelector('#humidity').innerHTML = data.main.humidity + '%'
    document.querySelector('#wind').innerHTML = data.wind.speed + ' km/h'

    setWeatherImage(data.weather[0].main)
}

// 🌦️ Weather API
const checkweather = async (name) => {
    const loader = document.querySelector('#loader')

    if (!name) {
        document.querySelector('#err').style.display = 'block'
        document.querySelector('#err').innerText = "Please enter a city name ⚠️"
        return
    }

    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apiid}&units=metric`

    loader.style.display = 'block'

    const res = await fetch(apiurl)
    const data = await res.json()

    loader.style.display = 'none'

    if (res.ok) {
        document.querySelector('#err').style.display = 'none'
        updateUI(data)
        getForecast(data.name)

    } else {
        document.querySelector('#err').style.display = 'block'
        document.querySelector('#err').innerText = "Invalid city name ❌"

        document.querySelector('#country').innerHTML = "--"
        document.querySelector('#temp').innerHTML = "--"
        document.querySelector('#des').innerHTML = "--"
        document.querySelector('#humidity').innerHTML = "--"
        document.querySelector('#wind').innerHTML = "--"
    }
}

// 🔍 Button click
document.querySelector('.inp button').addEventListener('click', () => {
    const location = document.querySelector('.inp input').value
    checkweather(location)
})

// ⌨️ Enter key
document.querySelector('.inp input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkweather(e.target.value)
    }
})

// 📍 Geolocation
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude

            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiid}&units=metric`

            const res = await fetch(url)
            const data = await res.json()

            if (res.ok) {
                updateUI(data)
                getForecast(data.name)
            }
        })
    }
}

getUserLocation()

// 🌦️ Weather image
function setWeatherImage(condition) {
    const img = document.querySelector('.three img')

    if (condition === "Clouds") {
        img.src = "Images/cloud-.png"
    } else if (condition === "Clear") {
        img.src = "Images/clear-.png"
    } else if (condition === "Rain") {
        img.src = "Images/rain-.png"
    } else if (condition === "Drizzle") {
        img.src = "Images/drizzle-.png"
    } else if (condition === "Mist") {
        img.src = "Images/mist-.png"
    } else {
        img.src = "Images/Weather_Icon-.png"
    }
}

// 📅 5-day forecast
async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiid}&units=metric`

    const res = await fetch(url)
    const data = await res.json()

    console.log(data) 

    const forecastDiv = document.querySelector('#forecast')
    if (!forecastDiv) return

    forecastDiv.innerHTML = ""

    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i]

        forecastDiv.innerHTML += `
    <div class="forecast-card">
        <p>${new Date(day.dt_txt).toDateString()}</p>
        <p>${Math.round(day.main.temp)}°C</p>
        <p>${day.weather[0].main}</p>
    </div>
`


        
    }
}