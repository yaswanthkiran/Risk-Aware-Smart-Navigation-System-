
const API_KEY = "G8svEcpAniaUYHUDeqiDUINXHOv0I9pf";
const WEATHER_API_KEY = "4755d8a121d58b361f6a66b0425dad93";
const DEFAULT_CENTER = [83.2550, 17.7400];

let map;
let cachedAccidents = [];
let currentWeather = "Clear";
let currentTraffic = "Moderate";
let markers = [];
let trafficMarkers = [];
let emergencyMarkers = [];
let currentWeatherCoords = [17.7400, 83.2550];

let voiceEnabled = true;

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    document.getElementById("voiceBtn").innerText = voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off";
    if (!voiceEnabled) window.speechSynthesis.cancel();
}

function speak(text) {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

const LOCATIONS = [
    "Gajuwaka", "Anakapalle", "Pendurthi", "Madhurawada", "Rushikonda",
    "Bheemunipatnam", "NAD Junction", "Duvvada", "Paravada", "Simhachalam",
    "Akkayyapalem", "MVP Colony", "Arilova", "Yendada", "Lawsons Bay",
    "RK Beach", "Jagadamba", "Scindia", "Yarada", "Chinna Waltair",
    "Seethammadhara", "Siripuram", "Steel Plant", "Gopalapatnam", "Peda Waltair",
    "Daba Gardens", "Old Gajuwaka", "Gopalapatnam Junction", "Kothavalasa",
    "Bheemunipatnam Beach", "Rushikonda Beach", "NAD X Roads",
    "Daba Gardens Junction", "Seethammadhara X Roads", "Scindia Junction",
    "Yendada Junction", "Pendurthi X Roads", "Paravada X Roads",
    "Duvvada X Roads", "Rushikonda X Roads", "Madhurawada X Roads",
    "Arilova X Roads", "Akkayyapalem Junction", "Jagadamba X Roads"
];

const coordinates = {
    "Gajuwaka": [83.2167, 17.7000],
    "Anakapalle": [83.0030, 17.6913],
    "Pendurthi": [83.2000, 17.8333],
    "Madhurawada": [83.3522, 17.8243],
    "Rushikonda": [83.3680, 17.7882],
    "Bheemunipatnam": [83.4520, 17.8900],
    "NAD Junction": [83.2550, 17.7400],
    "Duvvada": [83.1800, 17.6800],
    "Paravada": [83.1450, 17.6260],
    "Simhachalam": [83.2500, 17.7660],
    "Akkayyapalem": [83.3090, 17.7280],
    "MVP Colony": [83.3390, 17.7420],
    "Arilova": [83.3320, 17.7520],
    "Yendada": [83.3620, 17.7600],
    "Lawsons Bay": [83.3430, 17.7285],
    "RK Beach": [83.3300, 17.7200],
    "Jagadamba": [83.3000, 17.7100],
    "Scindia": [83.2600, 17.6900],
    "Yarada": [83.2800, 17.6580],
    "Chinna Waltair": [83.3305, 17.7130],
    "Seethammadhara": [83.3210, 17.7300],
    "Siripuram": [83.3065, 17.7135],
    "Steel Plant": [83.2060, 17.7060],
    "Gopalapatnam": [83.1960, 17.7040],
    "Peda Waltair": [83.3350, 17.7180],
    "Daba Gardens": [83.3080, 17.7110],
    "Old Gajuwaka": [83.2120, 17.6940],
    "Gopalapatnam Junction": [83.2010, 17.7000],
    "Kothavalasa": [83.3750, 17.8120],
    "Bheemunipatnam Beach": [83.4550, 17.9000],
    "Rushikonda Beach": [83.3685, 17.7890],
    "NAD X Roads": [83.2580, 17.7380],
    "Daba Gardens Junction": [83.3100, 17.7100],
    "Seethammadhara X Roads": [83.3240, 17.7330],
    "Scindia Junction": [83.2620, 17.6920],
    "Yendada Junction": [83.3640, 17.7620],
    "Pendurthi X Roads": [83.3085, 17.7880],
    "Paravada X Roads": [83.1480, 17.6300],
    "Duvvada X Roads": [83.1820, 17.6820],
    "Rushikonda X Roads": [83.3700, 17.7900],
    "Madhurawada X Roads": [83.3550, 17.8260],
    "Arilova X Roads": [83.3340, 17.7540],
    "Akkayyapalem Junction": [83.3110, 17.7300],
    "Jagadamba X Roads": [83.3020, 17.7120]
};


const graph = {
    "Gajuwaka": [{ node: "Pendurthi", cost: 7 }, { node: "Duvvada", cost: 6 }, { node: "NAD Junction", cost: 9 }],
    "Anakapalle": [{ node: "Paravada", cost: 10 }, { node: "Duvvada", cost: 15 }],
    "Pendurthi": [{ node: "Gajuwaka", cost: 7 }, { node: "Madhurawada", cost: 12 }, { node: "NAD Junction", cost: 6 }, { node: "Pendurthi X Roads", cost: 2 }],
    "Madhurawada": [{ node: "Pendurthi", cost: 12 }, { node: "NAD Junction", cost: 15 }],
    "Rushikonda": [{ node: "Madhurawada", cost: 5 }, { node: "Rushikonda Beach", cost: 2 }, { node: "Rushikonda X Roads", cost: 1 }],
    "Bheemunipatnam": [{ node: "Bheemunipatnam Beach", cost: 3 }, { node: "NAD Junction", cost: 8 }],
    "NAD Junction": [{ node: "Gajuwaka", cost: 9 }, { node: "Pendurthi", cost: 6 }, { node: "Madhurawada", cost: 15 }],
    "Duvvada": [{ node: "Gajuwaka", cost: 6 }, { node: "Paravada", cost: 8 }, { node: "Duvvada X Roads", cost: 1 }],
    "Paravada": [{ node: "Anakapalle", cost: 10 }, { node: "Duvvada", cost: 8 }, { node: "NAD Junction", cost: 14 }, { node: "Paravada X Roads", cost: 1 }],
    "Simhachalam": [{ node: "Akkayyapalem", cost: 5 }, { node: "NAD Junction", cost: 5 }],
    "Akkayyapalem": [{ node: "NAD Junction", cost: 4 }, { node: "Simhachalam", cost: 5 }, { node: "Arilova", cost: 3 }, { node: "Akkayyapalem Junction", cost: 1 }],
    "MVP Colony": [{ node: "Arilova", cost: 3 }, { node: "Yendada", cost: 4 }],
    "Arilova": [{ node: "Akkayyapalem", cost: 3 }, { node: "MVP Colony", cost: 3 }, { node: "Arilova X Roads", cost: 1 }],
    "Yendada": [{ node: "MVP Colony", cost: 4 }, { node: "Yendada Junction", cost: 1 }],
    "Lawsons Bay": [{ node: "RK Beach", cost: 1 }],
    "RK Beach": [{ node: "Jagadamba", cost: 2 }, { node: "Lawsons Bay", cost: 1 }],
    "Jagadamba": [{ node: "Scindia", cost: 3 }, { node: "Daba Gardens", cost: 1 }, { node: "Siripuram", cost: 2 }, { node: "RK Beach", cost: 2 }, { node: "NAD Junction", cost: 7 }, { node: "Jagadamba X Roads", cost: 1 }],
    "Scindia": [{ node: "Jagadamba", cost: 3 }, { node: "NAD Junction", cost: 6 }, { node: "Scindia Junction", cost: 1 }],
    "Yarada": [{ node: "Scindia", cost: 6 }],
    "Chinna Waltair": [{ node: "RK Beach", cost: 2 }, { node: "Siripuram", cost: 2 }],
    "Seethammadhara": [{ node: "Siripuram", cost: 2 }, { node: "Daba Gardens", cost: 3 }, { node: "Seethammadhara X Roads", cost: 1 }],
    "Siripuram": [{ node: "Seethammadhara", cost: 2 }, { node: "Jagadamba", cost: 2 }],
    "Steel Plant": [{ node: "Gajuwaka", cost: 4 }, { node: "Duvvada", cost: 5 }],
    "Peda Waltair": [{ node: "RK Beach", cost: 2 }, { node: "Siripuram", cost: 2 }],
    "Daba Gardens": [{ node: "Seethammadhara", cost: 3 }, { node: "Siripuram", cost: 3 }, { node: "Daba Gardens Junction", cost: 1 }],
    "Old Gajuwaka": [{ node: "Gajuwaka", cost: 3 }],
    "Gopalapatnam": [{ node: "Steel Plant", cost: 3 }, { node: "NAD Junction", cost: 4 }, { node: "Gopalapatnam Junction", cost: 1 }],
    "Kothavalasa": [{ node: "Anakapalle", cost: 15 }],
    "Bheemunipatnam Beach": [{ node: "Bheemunipatnam", cost: 3 }],
    "Rushikonda Beach": [{ node: "Rushikonda", cost: 2 }],
    "NAD X Roads": [{ node: "NAD Junction", cost: 2 }],
    "Daba Gardens Junction": [{ node: "Daba Gardens", cost: 1 }],
    "Seethammadhara X Roads": [{ node: "Seethammadhara", cost: 1 }],
    "Scindia Junction": [{ node: "Scindia", cost: 1 }],
    "Yendada Junction": [{ node: "Yendada", cost: 1 }],
    "Pendurthi X Roads": [{ node: "Pendurthi", cost: 2 }],
    "Paravada X Roads": [{ node: "Paravada", cost: 1 }],
    "Duvvada X Roads": [{ node: "Duvvada", cost: 1 }],
    "Rushikonda X Roads": [{ node: "Rushikonda", cost: 1 }],
    "Madhurawada X Roads": [{ node: "Madhurawada", cost: 2 }],
    "Arilova X Roads": [{ node: "Arilova", cost: 1 }],
    "Akkayyapalem Junction": [{ node: "Akkayyapalem", cost: 1 }],
    "Jagadamba X Roads": [{ node: "Jagadamba", cost: 1 }]
};


for (const node in graph) {
    graph[node].forEach(neighbor => {
        if (!graph[neighbor.node]) graph[neighbor.node] = [];
        if (!graph[neighbor.node].some(n => n.node === node)) {
            graph[neighbor.node].push({ node, cost: neighbor.cost });
        }
    });
}


function populateSelects() {
    const optionsHTML = LOCATIONS.map(
        loc => `<option value="${loc}">${loc}</option>`
    ).join("");
    document.getElementById("start").innerHTML += optionsHTML;
    document.getElementById("end").innerHTML += optionsHTML;
}


function calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const lat1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function heuristic(a, b) {
    return calculateDistance(coordinates[a], coordinates[b]);
}

function getWeatherPenalty() {
    return { Rain: 15, Drizzle: 10, Mist: 12, Clouds: 5 }[currentWeather] ?? 0;
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve([pos.coords.longitude, pos.coords.latitude]),
            err => reject(err)
        );
    });
}

function updateDateTime() {
    const now = new Date();
    document.getElementById("currentDate").innerText = now.toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    document.getElementById("currentTime").innerText = now.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
}

function clearTrafficMarkers() {
    trafficMarkers.forEach(m => m.remove());
    trafficMarkers = [];
}

function clearMarkers() {
    markers.forEach(m => m.remove());
    markers = [];
    clearTrafficMarkers();
}

function clearEmergencyMarkers() {
    emergencyMarkers.forEach(m => m.remove());
    emergencyMarkers = [];
}

function clearRoutes() {
    ["shortestRoute", "safeRoute"].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
        const key = id + "Label";
        if (window[key]) { window[key].remove(); window[key] = null; }
    });

    if (window.shortLabel) { window.shortLabel.remove(); window.shortLabel = null; }
}


window.updateRiskLevel = function () {
    const riskTextEl = document.getElementById("riskText");
    const riskBarEl = document.getElementById("riskBar");
    if (!riskTextEl || !riskBarEl) return;

    let score = 0;
    const accidentReported = document.getElementById("accident")?.innerText !== "No accident reported";
    const traffic = document.getElementById("traffic")?.innerText || "";
    const condition = (document.getElementById("condition")?.innerText || "").toLowerCase();

    if (accidentReported) score += 50;
    if (traffic === "Heavy") score += 40;
    else if (traffic === "Moderate") score += 20;
    if (condition.includes("rain") || condition.includes("storm")) score += 40;
    else if (condition.includes("cloud")) score += 15;

    const level = score >= 70 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
    const color = score >= 70 ? "red" : score >= 30 ? "orange" : "green";

    riskTextEl.innerText = `${level} (${score}%)`;
    riskBarEl.style.width = score + "%";
    riskBarEl.style.backgroundColor = color;
};


async function checkWeather(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`);
        const data = await res.json();

        currentWeather = data.weather[0].main;
        const main = data.weather[0].main.toLowerCase();

        document.getElementById("condition").innerText = data.weather[0].main;
        document.getElementById("temp").innerText = Math.round(data.main.temp) + "°C";
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("wind").innerText = Math.round(data.wind.speed * 3.6) + " km/h";
        document.getElementById("pressure").innerText = data.main.pressure;

        const iconMap = { cloud: "clouds", clear: "clear", rain: "rain", drizzle: "drizzle", mist: "mist", haze: "mist", thunder: "rain" };
        const iconKey = Object.keys(iconMap).find(k => main.includes(k)) || "clear";
        document.getElementById("weatherIcon").src = `images/${iconMap[iconKey]}.png`;

        updateRiskLevel();
    } catch (err) {
        console.error("Weather fetch failed:", err);
    }
}

function toggleWeather() {
    const box = document.getElementById("weatherContent");
    box.style.display = box.style.display === "block" ? "none" : "block";
}


async function getTrafficData(lat, lon) {
    try {
        const res = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${API_KEY}&point=${lat},${lon}`);
        const data = await res.json();
        const ratio = data.flowSegmentData.currentSpeed / data.flowSegmentData.freeFlowSpeed;
        if (ratio < 0.4) return "Heavy";
        if (ratio < 0.7) return "Moderate";
        return "Low";
    } catch {
        return "Moderate";
    }
}

async function updateTraffic() {
    const place = document.getElementById("start").value || "NAD Junction";
    if (!coordinates[place]) return;
    const [lon, lat] = coordinates[place];
    currentTraffic = await getTrafficData(lat, lon);
    document.getElementById("traffic").innerText = currentTraffic;
    updateRiskLevel();
}

async function showTrafficOnRoute(routeCoords) {
    clearTrafficMarkers();
    for (let i = 0; i < routeCoords.length; i += 5) {
        const [lon, lat] = routeCoords[i];
        const traffic = await getTrafficData(lat, lon);
        if (traffic !== "Moderate" && traffic !== "Heavy") continue;

        const el = document.createElement("div");
        el.style.cssText = "width:20px;height:20px;border-radius:50%;border:2px solid white;";
        el.style.background = traffic === "Heavy" ? "red" : "orange";
        el.style.boxShadow = `0 0 12px ${traffic === "Heavy" ? "red" : "orange"}`;

        const marker = new tt.Marker({ element: el })
            .setLngLat([lon, lat])
            .setPopup(new tt.Popup().setHTML(`<b>${traffic} Traffic</b>`))
            .addTo(map);
        trafficMarkers.push(marker);
    }
}


async function loadAccidents() {
    try {
        const res = await fetch("andhra_accidents.json");
        const data = await res.json();
        const nodes = [];
        data.forEach(acc => {
            for (const node in coordinates) {
                const [nLon, nLat] = coordinates[node];
                if (calculateDistance([acc.lng, acc.lat], [nLon, nLat]) < 0.5) {
                    nodes.push(node);
                }
            }
        });
        return [...new Set(nodes)];
    } catch (err) {
        console.error("Failed to load accidents:", err);
        return [];
    }
}

async function initAccidents() {
    try {
        cachedAccidents = await loadAccidents();
    } catch {
        cachedAccidents = [];
    }
}


async function aStarSafe(start, goal) {
    const accidentNodes = [...cachedAccidents];
    const weatherPenalty = getWeatherPenalty();
    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    for (const node in graph) { gScore[node] = fScore[node] = Infinity; }
    gScore[start] = 0;
    fScore[start] = heuristic(start, goal);

    while (openSet.size > 0) {
        const current = [...openSet].reduce((a, b) => fScore[a] < fScore[b] ? a : b);
        if (current === goal) {
            const path = [];
            let cur = current;
            while (cur) { path.unshift(cur); cur = cameFrom[cur]; }
            return path;
        }
        openSet.delete(current);
        for (const neighbor of (graph[current] || [])) {
            let cost = neighbor.cost + weatherPenalty;
            if (accidentNodes.includes(neighbor.node)) cost += 100;
            const tempG = gScore[current] + cost;
            if (tempG < gScore[neighbor.node]) {
                cameFrom[neighbor.node] = current;
                gScore[neighbor.node] = tempG;
                fScore[neighbor.node] = tempG + heuristic(neighbor.node, goal);
                openSet.add(neighbor.node);
            }
        }
    }
    return [];
}


function addRouteLabel(layerId, color, timeDisplay, coord) {
    const key = layerId + "Label";
    if (window[key]) window[key].remove();
    window[key] = new tt.Popup({ closeButton: false, closeOnClick: false, anchor: "bottom" })
        .setLngLat(coord)
        .setHTML(`<div style="background:${color};color:white;padding:4px 10px;border-radius:12px;font-weight:bold;border:2px solid white;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,.3)">⏱️ ${timeDisplay}</div>`)
        .addTo(map);
}

function drawRouteLayer(layerId, routeCoords, color) {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(layerId)) map.removeSource(layerId);
    map.addSource(layerId, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: routeCoords } }
    });
    map.addLayer({ id: layerId, type: "line", source: layerId, paint: { "line-color": color, "line-width": 6 } });
}

function fitAndAddMarkers(routeCoords) {
    const bounds = new tt.LngLatBounds();
    routeCoords.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: 50 });

    clearMarkers();
    markers.push(
        new tt.Marker({ color: "green" }).setLngLat(routeCoords[0]).addTo(map),
        new tt.Marker({ color: "red" }).setLngLat(routeCoords[routeCoords.length - 1]).addTo(map)
    );
}


async function drawRouteWithTime(path, color, layerId) {
    if (!path || path.length < 2) return;
    const locations = path.map(n => { const [lon, lat] = coordinates[n]; return `${lat},${lon}`; }).join(":");
    try {
        const res = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${API_KEY}`);
        const data = await res.json();
        if (!data.routes?.length) return;

        const route = data.routes[0];
        const routeCoords = route.legs.flatMap(leg => leg.points.map(p => [p.longitude, p.latitude]));
        const timeDisplay = Math.round(route.summary.travelTimeInSeconds / 60) + " mins";

        addRouteLabel(layerId, color, timeDisplay, routeCoords[Math.floor(routeCoords.length / 2)]);
        document.getElementById("time").innerText = timeDisplay;
        document.getElementById("distance").innerText = (route.summary.lengthInMeters / 1000).toFixed(2) + " km";
        document.getElementById("path").innerText = path.join(" → ");
        speak(`Safest route found. Travel via ${path.join(', ')}. Distance is ${(route.summary.lengthInMeters / 1000).toFixed(2)} kilometres. Estimated time is ${timeDisplay}.`);
        drawRouteLayer(layerId, routeCoords, color);
        fitAndAddMarkers(routeCoords);
        showTrafficOnRoute(routeCoords);
    } catch (err) {
        console.error("Routing failed:", err);
    }
}

async function shortestPath() {
    const startPlace = document.getElementById("start").value;
    const endPlace = document.getElementById("end").value;
    if (!startPlace || !endPlace) { alert("Please select start and destination"); return; }

    clearRoutes();
    const [sLon, sLat] = coordinates[startPlace];
    const [eLon, eLat] = coordinates[endPlace];

    try {
        const res = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${sLat},${sLon}:${eLat},${eLon}/json?key=${API_KEY}`);
        const data = await res.json();
        if (!data.routes?.length) { alert("No route found"); return; }

        const route = data.routes[0];
        const routeCoords = route.legs[0].points.map(p => [p.longitude, p.latitude]);
        const timeMin = Math.round(route.summary.travelTimeInSeconds / 60);


        addRouteLabel("short", "#0078ff", timeMin + " mins", routeCoords[Math.floor(routeCoords.length / 2)]);

        document.getElementById("time").innerText = timeMin + " mins";
        document.getElementById("distance").innerText = (route.summary.lengthInMeters / 1000).toFixed(2) + " km";
        document.getElementById("path").innerText = `${startPlace} → ${endPlace}`;
        speak(`Shortest route found. Start from ${startPlace}, destination ${endPlace}. Distance is ${(route.summary.lengthInMeters / 1000).toFixed(2)} kilometres. Estimated time is ${timeMin} minutes.`);
        drawRouteLayer("shortestRoute", routeCoords, "#0078ff");
        fitAndAddMarkers(routeCoords);
        showTrafficOnRoute(routeCoords);
    } catch (err) {
        console.error(err);
        alert("Routing failed");
    }
}

async function safestPath() {
    const startPlace = document.getElementById("start").value;
    const endPlace = document.getElementById("end").value;
    if (!startPlace || !endPlace) { alert("Please select start and destination"); return; }

    clearRoutes();
    if (cachedAccidents.length === 0) await initAccidents();

    const path = await aStarSafe(startPlace, endPlace);
    if (!path.length) { alert("No safe path found"); return; }

    await drawRouteWithTime(path, "#ff0000", "safeRoute");
    document.getElementById("accident").innerText = "Accident-aware route selected";
    updateRiskLevel();
}


function resetFields() {
    clearMarkers();
    clearTrafficMarkers();
    clearEmergencyMarkers();
    clearRoutes();

    if (map.getLayer("emergencyRoute")) map.removeLayer("emergencyRoute");
    if (map.getSource("emergencyRoute")) map.removeSource("emergencyRoute");

    ["start", "end"].forEach(id => document.getElementById(id).value = "");
    ["path", "distance", "time"].forEach(id => document.getElementById(id).innerText = "--");

    document.getElementById("accident").innerText = "No accident reported";
    document.getElementById("traffic").innerText = "Moderate";
    document.getElementById("condition").innerText = "--";
    document.getElementById("temp").innerText = "--";
    document.getElementById("humidity").innerText = "--";
    document.getElementById("wind").innerText = "--";
    document.getElementById("pressure").innerText = "--";

    document.getElementById("riskText").innerText = "LOW (0%)";
    document.getElementById("riskBar").style.width = "0%";
    document.getElementById("riskBar").style.backgroundColor = "green";

    currentTraffic = "Moderate";
    currentWeather = "Clear";
    cachedAccidents = [];

    map.setCenter(DEFAULT_CENTER);
    map.setZoom(12);
}


function activateEmergencyMode() {
    clearEmergencyMarkers();
    speak("Emergency mode activated. Finding nearby hospitals and police stations.");

    navigator.geolocation.getCurrentPosition(
        pos => {
            map.setCenter([pos.coords.longitude, pos.coords.latitude]);
            map.setZoom(14);
            fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude, "hospital");
            fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude, "police station");
            speak("Locating nearest hospitals and police stations around you. Click Go Now on any marker to get directions.");
        },
        () => {
            alert("Location access needed for Emergency Mode");
            speak("Location access is required to activate emergency mode. Please allow location access.");
        }
    );
}

function fetchNearbyPlaces(lat, lon, keyword) {
    fetch(`https://api.tomtom.com/search/2/search/${keyword}.json?key=${API_KEY}&limit=20&radius=10000&position=${lat},${lon}`)
        .then(res => res.json())
        .then(data => {
            if (!data.results?.length) return;
            data.results.forEach(place => { if (place.position) addEmergencyMarker(place, keyword); });
        })
        .catch(err => console.error("Places API error:", err));
}

function addEmergencyMarker(place, type) {
    const { lon, lat } = place.position;
    const name = place.poi?.name || "Emergency Service";
    const isHospital = type.includes("hospital");

    const localImg = isHospital ? "images/hospital_default.jpg" : "images/police_default.jpg";
    const backupImg = isHospital
        ? "https://cdn-icons-png.flaticon.com/512/3306/3306560.png"
        : "https://cdn-icons-png.flaticon.com/512/1022/1022313.png";

    const marker = new tt.Marker({ color: isHospital ? "red" : "blue" })
        .setLngLat([lon, lat])
        .addTo(map);
    emergencyMarkers.push(marker);

    marker.setPopup(new tt.Popup({ offset: 30 }).setHTML(`
        <div style="text-align:center;width:180px;font-family:Arial">
            <img src="${localImg}" onerror="this.onerror=null;this.src='${backupImg}'"
                 style="width:100%;height:100px;object-fit:cover;border-radius:5px;margin-bottom:5px;border:1px solid #ccc">
            <strong style="display:block;margin-bottom:5px;font-size:14px">${name}</strong>
            <button onclick="triggerEmergencyRoute(${lat},${lon})"
                    style="background:#28a745;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:bold;width:100%">
                Go Now
            </button>
        </div>
    `));
}

window.triggerEmergencyRoute = async function (destLat, destLon) {
    speak("Getting emergency route. Please stay calm, route is being calculated.");
    try {
        const [lon, lat] = await getCurrentLocation();
        drawEmergencyRoute(lat, lon, destLat, destLon);
    } catch {
        alert("Please enable location access to find the route.");
        speak("Unable to get your location. Please enable location access.");
    }
};
async function drawEmergencyRoute(startLat, startLon, endLat, endLon) {
    try {
        const res = await fetch(`https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json?key=${API_KEY}`);
        const data = await res.json();

        if (!data.routes?.length) {
            alert("No route found");
            speak("No emergency route found. Please call 108 for ambulance or 100 for police.");
            return;
        }

        const coords = data.routes[0].legs[0].points.map(p => [p.longitude, p.latitude]);
        const timeMin = Math.round(data.routes[0].summary.travelTimeInSeconds / 60);
        const distKm = (data.routes[0].summary.lengthInMeters / 1000).toFixed(2);

        drawRouteLayer("emergencyRoute", coords, "#00ff00");

        const bounds = new tt.LngLatBounds();
        coords.forEach(c => bounds.extend(c));
        map.fitBounds(bounds, { padding: 50 });

        speak(`Emergency route found. Distance is ${distKm} kilometres. Estimated time is ${timeMin} minutes. Drive carefully and follow the green route on screen.`);

    } catch (err) {
        console.error("Emergency routing error:", err);
        speak("Emergency routing failed. Please call 108 for ambulance or 100 for police immediately.");
    }
}


function openGoogleMaps() {
    const startPlace = document.getElementById("start").value;
    const endPlace = document.getElementById("end").value;
    if (!startPlace || !endPlace) { alert("Please select start and destination"); return; }

    const [sLon, sLat] = coordinates[startPlace];
    const [eLon, eLat] = coordinates[endPlace];
    window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${sLat},${sLon}&destination=${eLat},${eLon}&travelmode=driving`,
        "_blank"
    );
}

function goToWeather() {
    window.location.href = "weather.html";
}


window.onload = function () {
    populateSelects();

    map = tt.map({
        key: API_KEY,
        container: "map",
        center: DEFAULT_CENTER,
        zoom: 15,
        pitch: 60,
        bearing: -20,
        antialias: true
    });

    map.on("load", () => {
        map.setFog({
            color: "rgb(186,210,235)",
            "high-color": "rgb(36,92,223)",
            "horizon-blend": 0.2,
            "space-color": "rgb(11,11,25)",
            "star-intensity": 0.6
        });


        const labelLayerId = map.getStyle().layers.find(
            l => l.type === "symbol" && l.layout["text-field"]
        )?.id;

        map.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 18, ["get", "height"]],
                "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 18, ["get", "min_height"]],
                "fill-extrusion-opacity": 0.6
            }
        }, labelLayerId);
    });

    map.addControl(new tt.NavigationControl(), "bottom-right");
    map.addControl(new tt.FullscreenControl(), "bottom-right");
    map.addControl(new tt.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    }), "bottom-right");


    loadAccidents().then(nodes => {
        nodes.forEach(node => {
            const el = document.createElement("div");
            el.className = "glow-marker";
            new tt.Marker({ element: el })
                .setLngLat(coordinates[node])
                .setPopup(new tt.Popup().setText("Accident Zone: " + node))
                .addTo(map);
        });
    });


    updateDateTime();
    setInterval(updateDateTime, 1000);


    updateRiskLevel();
    setInterval(updateRiskLevel, 5000);


    updateTraffic();
    setInterval(updateTraffic, 30000);


    getCurrentLocation()
        .then(([lon, lat]) => {
            currentWeatherCoords = [lat, lon];
            checkWeather(lat, lon);
        })
        .catch(() => checkWeather(DEFAULT_CENTER[1], DEFAULT_CENTER[0]));


    setInterval(() => checkWeather(currentWeatherCoords[0], currentWeatherCoords[1]), 300000);


    document.getElementById("start").addEventListener("change", function () {
        if (!this.value || !coordinates[this.value]) return;
        const [lon, lat] = coordinates[this.value];
        currentWeatherCoords = [lat, lon];
        checkWeather(lat, lon);
        map.flyTo({ center: [lon, lat], zoom: 18, pitch: 70, bearing: 60, speed: 0.8, curve: 1.8, easing: t => t * (2 - t) });
    });


    document.getElementById("end").addEventListener("change", function () {
        if (!this.value || !coordinates[this.value]) return;
        const [lon, lat] = coordinates[this.value];
        currentWeatherCoords = [lat, lon];
        checkWeather(lat, lon);
    });


    setInterval(async () => {
        const start = document.getElementById("start").value;
        const end = document.getElementById("end").value;
        if (!start || !end) return;
        const path = await aStarSafe(start, end);
        if (path.length) drawRouteWithTime(path, "#ff0000", "safeRoute");
    }, 60000);


    initAccidents();
};

let isMapDark = false;

function toggleMapDarkMode() {
    isMapDark = !isMapDark;

    const sw = document.getElementById("ios-switch");
    const icon = document.getElementById("mode-icon");
    const label = document.getElementById("toggle-label");


    sw.classList.toggle("on", isMapDark);


    icon.className = isMapDark ? "ti ti-sun active" : "ti ti-moon";
    label.textContent = isMapDark ? "Light mode" : "Dark mode";

    if (isMapDark) {

        document.getElementById("map").style.filter =
            "invert(1) hue-rotate(180deg) brightness(0.85) saturate(1.2)";
    } else {

        document.getElementById("map").style.filter = "none";
    }
}