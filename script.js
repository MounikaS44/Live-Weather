
const apiid = '556de8ae52e74c3b46dde500a22cfd24' // 🔑 Replace with your OpenWeatherMap key


// DOM References

const cityInput        = document.querySelector('#cityInput')
const searchBtn        = document.querySelector('#searchBtn')
const errMsg           = document.querySelector('#err')
const loaderWrap       = document.querySelector('#loader')
const mainOverlay      = document.querySelector('#mainOverlay')
const weatherIcon      = document.querySelector('#weatherIcon')
const bgOverlay        = document.querySelector('#bgOverlay')
const sunGlow          = document.querySelector('#sunGlow')
const rainCanvas       = document.querySelector('#rainCanvas')
const snowCanvas       = document.querySelector('#snowCanvas')
const lightningOverlay = document.querySelector('#lightningOverlay')
const starsEl          = document.querySelector('#stars')
const clouds           = document.querySelectorAll('.cloud')  // kept but unused
const bgVideoA         = document.querySelector('#bgVideoA')
const bgVideoB         = document.querySelector('#bgVideoB')
const forecastDiv      = document.querySelector('#forecast')


// 🎥 VIDEO BACKGROUND

const videoMap = {
    Clear:        'Images/clear.mp4',
    Clouds:       'Images/clouds.mp4',
    Rain:         'Images/rain.mp4',
    Drizzle:      'Images/drizzle.mp4',
    Thunderstorm: 'Images/thunderstorm.mp4',
    Snow:         'Images/snow.mp4',
    Mist:         'Images/mist.mp4',
    Fog:          'Images/mist.mp4',
    Haze:         'Images/mist.mp4',
    Smoke:        'Images/mist.mp4',
    Default:      'Images/default.mp4'
}

// Track which video slot is currently active (visible)
let activeVideo = 'A'

// Crossfade to a new video — swaps A↔B with smooth opacity transition
function switchBackgroundVideo(condition) {
    const src = videoMap[condition] || videoMap.Default

    if (activeVideo === 'A') {
        bgVideoB.src = src
        bgVideoB.load()
        bgVideoB.play().catch(() => {})
        bgVideoB.style.opacity = '1'
        bgVideoA.style.opacity = '0'
        activeVideo = 'B'
    } else {
        bgVideoA.src = src
        bgVideoA.load()
        bgVideoA.play().catch(() => {})
        bgVideoA.style.opacity = '1'
        bgVideoB.style.opacity = '0'
        activeVideo = 'A'
    }
}


// 🌈 Weather Emoji Map (for forecast cards)

// const weatherEmoji = {
//     Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
//     Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️',
//     Fog: '🌫️', Haze: '🌫️', Smoke: '🌫️', Dust: '💨',
//     Sand: '💨', Ash: '🌋', Squall: '💨', Tornado: '🌪️'
// }

const iconMap = {
    Clear:       'Images/clear-.png',
    Clouds:      'Images/clouds-.png',
    Rain:        'Images/rain-.png',
    Drizzle:     'Images/drizzle-.png',
    Mist:        'Images/mist-.png',
    Fog:         'Images/mist-.png',
    Haze:        'Images/mist-.png',
    Snow:        'Images/snow-.png',
    Thunderstorm:'Images/thunder-.png',
    Default:     'Images/Weather_Icon-.png'
}


// 💬 WEATHER CONDITION QUOTES

const weatherQuotes = {
    Clear:        { icon: '☀️', text: 'Every sunny day is the sky\'s way of smiling back at you.' },
    Sunny:        { icon: '☀️', text: 'Every sunny day is the sky\'s way of smiling back at you.' },
    Clouds:       { icon: '⛅', text: 'Even clouds have silver linings — you just have to look up.' },
    Rain:         { icon: '🌧️', text: 'The rain whispers secrets only the sky knows.' },
    Drizzle:      { icon: '🌦️', text: 'A little drizzle never stopped the sky from telling its story.' },
    Thunderstorm: { icon: '⛈️', text: 'After every storm, the sky remembers how to be beautiful again.' },
    Snow:         { icon: '❄️', text: 'The sky tucks the world in with snowflakes when it\'s time to rest.' },
    Mist:         { icon: '🌫️', text: 'When the world turns misty, the sky is just keeping its mysteries close.' },
    Fog:          { icon: '🌫️', text: 'When the world turns foggy, the sky is just keeping its mysteries close.' },
    Haze:         { icon: '🌫️', text: 'Through the haze, the sky still has a story waiting to unfold.' },
    Smoke:        { icon: '🌫️', text: 'Even through the smoke, the sky holds on to its quiet beauty.' },
    Default:      { icon: '🌤️', text: 'Look up. The sky always has something to say.' }
}

function showQuote(condition) {
    const quoteBlock = document.querySelector('#quoteBlock')
    const quoteText  = document.querySelector('#quoteText')
    const quoteIcon  = document.querySelector('#quoteIcon')
    const q = weatherQuotes[condition] || weatherQuotes.Default
    quoteIcon.textContent = q.icon
    quoteText.textContent = q.text
    quoteBlock.classList.remove('visible')
    // Trigger reflow then fade in
    setTimeout(() => quoteBlock.classList.add('visible'), 50)
}
function updateDateTime() {
    const now = new Date()
    const opts = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    document.querySelector('#dateTime').textContent = now.toLocaleString('en-US', opts)
}
updateDateTime()
setInterval(updateDateTime, 60000)


// 🌦️ UPDATE MAIN UI

function updateUI(data) {
    document.querySelector('#country').textContent   = `${data.name}, ${data.sys.country}`
    document.querySelector('#temp').textContent      = Math.round(data.main.temp) + '°C'
    document.querySelector('#des').textContent       = data.weather[0].description
    document.querySelector('#humidity').textContent  = data.main.humidity + '%'
    document.querySelector('#wind').textContent      = data.wind.speed + ' km/h'
    document.querySelector('#feelsLike').textContent = Math.round(data.main.feels_like) + '°C'
    document.querySelector('#visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km'

    const cond = data.weather[0].main
    weatherIcon.src = iconMap[cond] || iconMap.Default

    setWeatherEffects(cond)
    updateDateTime()
}


// ⛅ WEATHER EFFECTS CONTROLLER

function setWeatherEffects(condition) {
    // 🎥 Switch background video
    switchBackgroundVideo(condition)

    // 💬 Show matching quote
    showQuote(condition)

    // Reset all effects
    stopRain(); stopSnow(); stopLightning()
    sunGlow.style.opacity = '0'
    bgOverlay.className = 'bg-overlay-global'

    const cond = condition.toLowerCase()

    if (cond.includes('clear') || cond.includes('sunny')) {
        bgOverlay.classList.add('weather-clear')
        showSunGlow()
        showStars()

    } else if (cond.includes('cloud')) {
        bgOverlay.classList.add('weather-clouds')
        hideStars()

    } else if (cond.includes('rain') && !cond.includes('thunder')) {
        bgOverlay.classList.add('weather-rain')
        startRain(200)
        hideStars()

    } else if (cond.includes('drizzle')) {
        bgOverlay.classList.add('weather-drizzle')
        startRain(80)
        hideStars()

    } else if (cond.includes('thunder') || cond.includes('storm')) {
        bgOverlay.classList.add('weather-thunder')
        startRain(350)
        startLightning()
        hideStars()

    } else if (cond.includes('snow')) {
        bgOverlay.classList.add('weather-snow')
        startSnow()
        hideStars()

    } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke')) {
        // Video handles the background — no extra overlay or animation needed
        hideStars()
    }
}


// ☀️ SUN GLOW

function showSunGlow() {
    sunGlow.style.opacity = '1'
}


// ⭐ STARS

function showStars() {
    starsEl.innerHTML = ''
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        const size = Math.random() * 2.5 + 0.5
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            top: ${Math.random() * 60}%;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 3 + 2}s;
            animation-delay: ${Math.random() * 4}s;
        `
        starsEl.appendChild(star)
    }
    starsEl.style.opacity = '1'
}
function hideStars() {
    starsEl.style.opacity = '0'
    setTimeout(() => { starsEl.innerHTML = '' }, 1500)
}

// 🌧️ RAIN ANIMATION

let rainAnimId = null
let rainCtx = null

function startRain(dropCount = 200) {
    rainCanvas.width  = window.innerWidth
    rainCanvas.height = window.innerHeight
    rainCtx = rainCanvas.getContext('2d')
    rainCanvas.style.opacity = '1'

    const drops = Array.from({ length: dropCount }, () => ({
        x: Math.random() * rainCanvas.width,
        y: Math.random() * rainCanvas.height,
        length: Math.random() * 18 + 8,
        speed: Math.random() * 8 + 8,
        opacity: Math.random() * 0.5 + 0.2,
        width: Math.random() * 1.2 + 0.4
    }))

    function drawRain() {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
        drops.forEach(d => {
            rainCtx.beginPath()
            rainCtx.strokeStyle = `rgba(174,214,241,${d.opacity})`
            rainCtx.lineWidth = d.width
            rainCtx.moveTo(d.x, d.y)
            rainCtx.lineTo(d.x - 1, d.y + d.length)
            rainCtx.stroke()
            d.y += d.speed
            if (d.y > rainCanvas.height) {
                d.y = -d.length
                d.x = Math.random() * rainCanvas.width
            }
        })
        rainAnimId = requestAnimationFrame(drawRain)
    }
    drawRain()
}

function stopRain() {
    if (rainAnimId) { cancelAnimationFrame(rainAnimId); rainAnimId = null }
    if (rainCtx) rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height)
    rainCanvas.style.opacity = '0'
}


// ❄️ SNOW ANIMATION

let snowAnimId = null
let snowCtx = null

function startSnow() {
    snowCanvas.width  = window.innerWidth
    snowCanvas.height = window.innerHeight
    snowCtx = snowCanvas.getContext('2d')
    snowCanvas.style.opacity = '1'

    const flakes = Array.from({ length: 120 }, () => ({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        radius: Math.random() * 3.5 + 1,
        speed: Math.random() * 1.5 + 0.5,
        drift: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.6 + 0.3
    }))

    function drawSnow() {
        snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)
        flakes.forEach(f => {
            snowCtx.beginPath()
            snowCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
            snowCtx.fillStyle = `rgba(255,255,255,${f.opacity})`
            snowCtx.fill()
            f.y += f.speed
            f.x += f.drift
            if (f.y > snowCanvas.height) { f.y = -f.radius; f.x = Math.random() * snowCanvas.width }
        })
        snowAnimId = requestAnimationFrame(drawSnow)
    }
    drawSnow()
}

function stopSnow() {
    if (snowAnimId) { cancelAnimationFrame(snowAnimId); snowAnimId = null }
    if (snowCtx) snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)
    snowCanvas.style.opacity = '0'
}


// ⚡ LIGHTNING

let lightningInterval = null

function startLightning() {
    lightningInterval = setInterval(() => {
        if (Math.random() > 0.55) {
            lightningOverlay.classList.add('flash')
            setTimeout(() => lightningOverlay.classList.remove('flash'), 200)
        }
    }, 2500)
}
function stopLightning() {
    if (lightningInterval) { clearInterval(lightningInterval); lightningInterval = null }
    lightningOverlay.classList.remove('flash')
}


// 🌐 WEATHER API

async function checkweather(name) {
    if (!name.trim()) {
        showError("Please enter a city name ⚠️"); return
    }
    showLoader()
    try {
        const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&appid=${apiid}&units=metric`)
        const data = await res.json()
        hideLoader()
        if (res.ok) {
            hideError()
            updateUI(data)
            getForecast(data.coord.lat, data.coord.lon)
        } else {
            showError("Invalid city name ❌")
            resetDisplay()
        }
    } catch (e) {
        hideLoader()
        showError("Network error. Check connection 🌐")
    }
}

// 📍 Geolocation
async function getUserLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
        showLoader()
        try {
            const { latitude: lat, longitude: lon } = pos.coords
            const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiid}&units=metric`)
            const data = await res.json()
            hideLoader()
            if (res.ok) { updateUI(data); getForecast(lat, lon) }
        } catch (e) { hideLoader() }
    }, () => hideLoader())
}

// 📅 5-Day Forecast — uses lat/lon to avoid city name encoding issues
async function getForecast(lat, lon) {
    try {
        const res  = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiid}&units=metric`)
        const data = await res.json()
        if (!res.ok) return

        forecastDiv.innerHTML = ''

        // Pick the first entry per unique date
        const days = []
        const seen = new Set()
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0]
            if (!seen.has(date)) { seen.add(date); days.push(item) }
        })

        days.slice(0, 5).forEach(day => {
            const d     = new Date(day.dt_txt)
            const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            const cond  = day.weather[0].main
            const imgSrc = iconMap[cond] || iconMap.Default
            forecastDiv.innerHTML += `
                <div class="forecast-card">
                    <div class="fc-day">${label}</div>
                    <img class="fc-img" src="${imgSrc}" alt="${cond}">
                    <div class="fc-temp">${Math.round(day.main.temp)}°C</div>
                    <div class="fc-desc">${day.weather[0].description}</div>
                </div>
            `
        })
    } catch (e) {
        console.warn('Forecast error:', e)
    }
}



function showLoader() {
    loaderWrap.classList.add('active')
    if (mainOverlay) mainOverlay.style.opacity = '0'
}
function hideLoader() {
    loaderWrap.classList.remove('active')
    if (mainOverlay) { mainOverlay.style.opacity = '1'; mainOverlay.style.transition = 'opacity 0.5s' }
}
function showError(msg) { errMsg.style.display = 'block'; errMsg.textContent = msg }
function hideError()    { errMsg.style.display = 'none' }
function resetDisplay() {
    ['#country','#temp','#des','#humidity','#wind','#feelsLike','#visibility'].forEach(id => {
        document.querySelector(id).textContent = '--'
    })
}


searchBtn.addEventListener('click', () => checkweather(cityInput.value))
cityInput.addEventListener('keypress', e => { if (e.key === 'Enter') checkweather(cityInput.value) })

// Resize canvases
window.addEventListener('resize', () => {
    if (rainAnimId)  { rainCanvas.width  = window.innerWidth; rainCanvas.height  = window.innerHeight }
    if (snowAnimId)  { snowCanvas.width  = window.innerWidth; snowCanvas.height  = window.innerHeight }
})


// 🚀 INIT

getUserLocation()
