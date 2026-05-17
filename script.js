/* =========================
GLOBAL VARIABLES
========================= */

let currentLat = null;
let currentLon = null;

let surveyPoints = [];

let map;
let polygon;
let markers = [];

let drawMode = false;

let streetLayer;
let satelliteLayer;

/* =========================
MAP INIT
========================= */

map = L.map('map').setView([28.1099,30.7503],8);

/* STREET */

streetLayer = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'© OpenStreetMap'
}
);

/* SATELLITE */

satelliteLayer = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
{
attribution:'© Esri'
}
);

streetLayer.addTo(map);

/* =========================
MAP CLICK DRAW
========================= */

map.on('click',function(e){

if(!drawMode) return;

const lat = e.latlng.lat;
const lon = e.latlng.lng;

surveyPoints.push({

lat,
lon,

displayText:`

Lat:
${lat.toFixed(8)}

<br>

Lon:
${lon.toFixed(8)}

`

});

updateSurvey();

});

/* =========================
THEME
========================= */

function toggleTheme(){

document.body.classList.toggle('light');

}

/* =========================
MAP TYPES
========================= */

function setStreetMap(){

map.removeLayer(satelliteLayer);

streetLayer.addTo(map);

}

function setSatelliteMap(){

map.removeLayer(streetLayer);

satelliteLayer.addTo(map);

}

/* =========================
DRAW MODE
========================= */

function toggleDrawMode(){

drawMode = !drawMode;

if(drawMode){

alert('Draw Mode Enabled');

}else{

alert('Draw Mode Disabled');

}

}

/* =========================
ELEMENTS
========================= */

const conversionType =
document.getElementById('conversionType');

const decimalSection =
document.getElementById('decimalSection');

const dmsSection =
document.getElementById('dmsSection');

const utmSection =
document.getElementById('utmSection');

const pointInputType =
document.getElementById('pointInputType');

const pointDecimalSection =
document.getElementById('pointDecimalSection');

const pointDMSSection =
document.getElementById('pointDMSSection');

const pointUTMSection =
document.getElementById('pointUTMSection');

/* =========================
SWITCH CONVERTER
========================= */

conversionType.addEventListener(
'change',
switchConverter
);

function switchConverter(){

decimalSection.style.display='none';
dmsSection.style.display='none';
utmSection.style.display='none';

if(
conversionType.value ===
'decimalToDMS'
||
conversionType.value ===
'decimalToUTM'
){

decimalSection.style.display='block';

}

if(
conversionType.value ===
'dmsToDecimal'
){

dmsSection.style.display='block';

}

if(
conversionType.value ===
'utmToDecimal'
){

utmSection.style.display='block';

}

}

/* =========================
POINT INPUT SWITCH
========================= */

pointInputType.addEventListener(
'change',
switchPointInput
);

function switchPointInput(){

pointDecimalSection.style.display='none';

pointDMSSection.style.display='none';

pointUTMSection.style.display='none';

if(
pointInputType.value ===
'decimal'
){

pointDecimalSection.style.display='block';

}

if(
pointInputType.value ===
'dms'
){

pointDMSSection.style.display='block';

}

if(
pointInputType.value ===
'utm'
){

pointUTMSection.style.display='block';

}

}

/* =========================
DECIMAL → DMS
========================= */

function decimalToDMS(decimal){

const absolute =
Math.abs(decimal);

const degrees =
Math.floor(absolute);

const minutesNotTruncated =
(absolute - degrees) * 60;

const minutes =
Math.floor(minutesNotTruncated);

const seconds =
(
(minutesNotTruncated - minutes) * 60
).toFixed(4);

return{

degrees,
minutes,
seconds

};

}

/* =========================
DMS → DECIMAL
========================= */

function dmsToDecimal(
deg,
min,
sec,
dir
){

let decimal =

parseFloat(deg || 0)

+

parseFloat(min || 0) / 60

+

parseFloat(sec || 0) / 3600;

if(
dir === 'S'
||
dir === 'W'
){

decimal *= -1;

}

return decimal;

}

/* =========================
UTM
========================= */

function getUTMZone(longitude){

return Math.floor((longitude + 180) / 6) + 1;

}

function getUTMProjection(zone){

return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;

}

function latLonToUTM(lat, lon){

const zone =
getUTMZone(lon);

const utmProjection =
getUTMProjection(zone);

const result =
proj4(
'WGS84',
utmProjection,
[lon, lat]
);

return{

zone,
easting: result[0],
northing: result[1]

};

}

function utmToLatLon(
easting,
northing
){

const zone =
parseInt(
document.getElementById('utmZone').value
);

const utmProjection =
getUTMProjection(zone);

const result =
proj4(
utmProjection,
'WGS84',
[
parseFloat(easting),
parseFloat(northing)
]
);

return{

lat: result[1],
lon: result[0]

};

}

/* =========================
LIVE CONVERT
========================= */

document
.querySelectorAll('input')
.forEach(input=>{

input.addEventListener(
'input',
convertCoordinates
);

});

/* =========================
MAIN CONVERT
========================= */

function convertCoordinates(){

/* DECIMAL */

if(
conversionType.value ===
'decimalToDMS'
||
conversionType.value ===
'decimalToUTM'
){

const lat =
parseFloat(
document.getElementById('decimalLat').value
);

const lon =
parseFloat(
document.getElementById('decimalLon').value
);

if(
isNaN(lat)
||
isNaN(lon)
){

return;

}

currentLat = lat;
currentLon = lon;

document.getElementById('resultLat')
.innerText =
lat.toFixed(8);

document.getElementById('resultLon')
.innerText =
lon.toFixed(8);

const utm =
latLonToUTM(lat,lon);

document.getElementById('resultEasting')
.innerText =
utm.easting.toFixed(3);

document.getElementById('resultNorthing')
.innerText =
utm.northing.toFixed(3);

}

/* DMS */

if(
conversionType.value ===
'dmsToDecimal'
){

const lat =
dmsToDecimal(

document.getElementById('inputLatDeg').value,

document.getElementById('inputLatMin').value,

document.getElementById('inputLatSec').value,

document.getElementById('inputLatDir').value

);

const lon =
dmsToDecimal(

document.getElementById('inputLonDeg').value,

document.getElementById('inputLonMin').value,

document.getElementById('inputLonSec').value,

document.getElementById('inputLonDir').value

);

document.getElementById('resultLat')
.innerText =
lat.toFixed(8);

document.getElementById('resultLon')
.innerText =
lon.toFixed(8);

const utm =
latLonToUTM(lat,lon);

document.getElementById('resultEasting')
.innerText =
utm.easting.toFixed(3);

document.getElementById('resultNorthing')
.innerText =
utm.northing.toFixed(3);

}

/* UTM */

if(
conversionType.value ===
'utmToDecimal'
){

const easting =
parseFloat(
document.getElementById('utmEasting').value
);

const northing =
parseFloat(
document.getElementById('utmNorthing').value
);

if(
isNaN(easting)
||
isNaN(northing)
){

return;

}

const result =
utmToLatLon(
easting,
northing
);

document.getElementById('resultLat')
.innerText =
result.lat.toFixed(8);

document.getElementById('resultLon')
.innerText =
result.lon.toFixed(8);

}

}

/* =========================
COPY
========================= */

function copyResults(){

const text = `

Latitude:
${document.getElementById('resultLat').innerText}

Longitude:
${document.getElementById('resultLon').innerText}

Easting:
${document.getElementById('resultEasting').innerText}

Northing:
${document.getElementById('resultNorthing').innerText}

`;

navigator.clipboard.writeText(text);

alert('Copied');

}

/* =========================
CLEAR
========================= */

function clearAllFields(){

document
.querySelectorAll('input')
.forEach(input=>{

input.value='';

});

document.getElementById('resultLat')
.innerText='---';

document.getElementById('resultLon')
.innerText='---';

document.getElementById('resultEasting')
.innerText='---';

document.getElementById('resultNorthing')
.innerText='---';

}

/* =========================
ADD POINT
========================= */

function addPoint(){

let lat;
let lon;

let displayText='';

/* DECIMAL */

if(
pointInputType.value ===
'decimal'
){

lat =
parseFloat(
document.getElementById('pointLat').value
);

lon =
parseFloat(
document.getElementById('pointLon').value
);

displayText = `

Lat:
${lat}

<br>

Lon:
${lon}

`;

}

/* DMS */

if(
pointInputType.value ===
'dms'
){

const latDeg =
document.getElementById('pointLatDeg').value;

const latMin =
document.getElementById('pointLatMin').value;

const latSec =
document.getElementById('pointLatSec').value;

const latDir =
document.getElementById('pointLatDir').value;

const lonDeg =
document.getElementById('pointLonDeg').value;

const lonMin =
document.getElementById('pointLonMin').value;

const lonSec =
document.getElementById('pointLonSec').value;

const lonDir =
document.getElementById('pointLonDir').value;

lat =
dmsToDecimal(
latDeg,
latMin,
latSec,
latDir
);

lon =
dmsToDecimal(
lonDeg,
lonMin,
lonSec,
lonDir
);

displayText = `

${latDeg}°
${latMin}'
${latSec}"
${latDir}

<br>

${lonDeg}°
${lonMin}'
${lonSec}"
${lonDir}

`;

}

/* UTM */

if(
pointInputType.value ===
'utm'
){

const easting =
parseFloat(
document.getElementById('pointEasting').value
);

const northing =
parseFloat(
document.getElementById('pointNorthing').value
);

const result =
utmToLatLon(
easting,
northing
);

lat = result.lat;
lon = result.lon;

displayText = `

Easting:
${easting}

<br>

Northing:
${northing}

`;

}

if(
isNaN(lat)
||
isNaN(lon)
){

alert('Invalid Point');

return;

}

surveyPoints.push({

lat,
lon,
displayText

});

updateSurvey();

}

/* =========================
DELETE POINT
========================= */

function deletePoint(index){

surveyPoints.splice(index,1);

updateSurvey();

}

/* =========================
CLEAR SURVEY
========================= */

function clearSurvey(){

surveyPoints=[];

updateSurvey();

}

/* =========================
UPDATE SURVEY
========================= */

function updateSurvey(){

const pointsList =
document.getElementById('pointsList');

pointsList.innerHTML='';

markers.forEach(marker=>{

map.removeLayer(marker);

});

markers=[];

if(polygon){

map.removeLayer(polygon);

}

surveyPoints.forEach((point,index)=>{

const marker =
L.marker([point.lat,point.lon])

.addTo(map)

.bindPopup(
`Point ${index+1}`
);

markers.push(marker);

pointsList.innerHTML += `

<div class="point-card">

<b>
Point ${index+1}
</b>

<br><br>

${point.displayText}

<button
class="delete-btn"
onclick="deletePoint(${index})">

Delete Point

</button>

</div>

`;

});

if(
surveyPoints.length >=3
){

polygon =
L.polygon(

surveyPoints.map(p=>[
p.lat,
p.lon
]),

{
color:'#38bdf8',
fillColor:'#38bdf8',
fillOpacity:0.25
}

).addTo(map);

map.fitBounds(
polygon.getBounds()
);

}

document.getElementById('areaMeters')
.innerText =
calculateArea().toFixed(2);

document.getElementById('perimeterMeters')
.innerText =
calculatePerimeter().toFixed(2);

}

/* =========================
AREA
========================= */

function calculateArea(){

if(
surveyPoints.length <3
){

return 0;

}

let utmPoints=[];

surveyPoints.forEach(point=>{

const utm =
latLonToUTM(
point.lat,
point.lon
);

utmPoints.push({

x:utm.easting,
y:utm.northing

});

});

let area=0;

for(
let i=0;
i<utmPoints.length;
i++
){

const j =
(i+1)%utmPoints.length;

area +=
utmPoints[i].x *
utmPoints[j].y;

area -=
utmPoints[j].x *
utmPoints[i].y;

}

return Math.abs(area/2);

}

/* =========================
PERIMETER
========================= */

function calculatePerimeter(){

if(
surveyPoints.length <2
){

return 0;

}

let total = 0;

for(
let i=0;
i<surveyPoints.length;
i++
){

const j =
(i+1)%surveyPoints.length;

const p1 =
latLonToUTM(
surveyPoints[i].lat,
surveyPoints[i].lon
);

const p2 =
latLonToUTM(
surveyPoints[j].lat,
surveyPoints[j].lon
);

const dx =
p2.easting - p1.easting;

const dy =
p2.northing - p1.northing;

total +=
Math.sqrt(
dx*dx + dy*dy
);

}

return total;

}

/* =========================
GPS
========================= */

function useCurrentGPS(){

navigator.geolocation
.getCurrentPosition(

(position)=>{

const lat =
position.coords.latitude;

const lon =
position.coords.longitude;

document.getElementById('pointLat')
.value =
lat.toFixed(8);

document.getElementById('pointLon')
.value =
lon.toFixed(8);

map.setView(
[lat,lon],
16
);

},

()=>{

alert('GPS Permission Denied');

}

);

}

/* =========================
EXPORT CSV
========================= */

function exportCSV(){

if(
surveyPoints.length===0
){

alert('No Points');

return;

}

let csv =
'Point,Latitude,Longitude\n';

surveyPoints.forEach((p,i)=>{

csv +=
`${i+1},${p.lat},${p.lon}\n`;

});

const blob =
new Blob([csv],{
type:'text/csv'
});

const link =
document.createElement('a');

link.href =
URL.createObjectURL(blob);

link.download =
'GeoPrecision_Points.csv';

link.click();

}

/* =========================
SAVE PROJECT
========================= */

function saveProject(){

localStorage.setItem(

'geoPrecisionPoints',

JSON.stringify(surveyPoints)

);

alert('Project Saved');

}

/* =========================
LOAD PROJECT
========================= */

window.onload = function(){

const saved =
localStorage.getItem(
'geoPrecisionPoints'
);

if(saved){

surveyPoints =
JSON.parse(saved);

updateSurvey();

}

};

/* =========================
START
========================= */

switchConverter();

switchPointInput();

/* =========================
PWA
========================= */

if(
'serviceWorker'
in navigator
){

navigator.serviceWorker
.register('service-worker.js');

}