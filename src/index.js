import axios from 'axios';
const accountSid = "TWILIO_ACCOUNT_SID";
const authToken = "TWILIO_AUTH_TOKEN";
const client = require('twilio')(accountSid, authToken);

axios.get('http://localhost:3000/students')
.then(function (response){
    console.log(response);
});

window.showText = function() {
    var text = document.getElementById("name-confirm");
    var given_id = document.getElementById("ID").value;
    axios.get(`http://localhost:3000/students/${given_id}`, function(data) {
        debugger;
        document.getElementById("name-confirm").innerHTML = "Your name is" + data.name;
    });
    if (text.style.visibility === "hidden") {
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
    }
}
function showManualLocation() {
    var manualLocation = document.getElementById("hidden-location");
    if(manualLocation.style.display === "none"){
        manualLocation.style.display = "flex";
    }else{
        manualLocation.style.display = "none";
    }
}
function submitForm() {
    var given_id = document.getElementById("ID").value;
    var location_on = document.getElementById("location").checked;
    var student_location;
    if(location_on){
        student_location = updateLocation()
    }else{
        student_location = document.getElementById("location_input")
    }
}
function sendEmail() { 
    Email.send({ 
      Host: "smtp.gmail.com", 
      Username: "breecobb715@gmail.com", 
      Password: "Enter your password", 
      To: 'breecobb715@gmail.com', 
      From: "breecobb715@gmail.com", 
      Subject: "Salvus Student Status Update",
      Body: "Your child JOHN DOE has updated their status to STATUS at LOCATION. Please take necessary actions to secure your student's safety, and remind them to update their status to \"At Home\"",
    }) 
      .then(function (message) { 
        alert("mail sent successfully") 
      }); 
}
client.messages
    .create({
        body: "Your child JOHN DOE has updated their status to STATUS at LOCATION. Please take necessary actions to secure your student's safety, and remind them to update their status to \"At Home\"",
        from: '+13252080653',
        to: '+17203629336'
    })
    .then(message => console.log(message.sid));

function updateLocation(){
    const successfulLookup = (position) => {
        const {latitude, longitude} = position.coords;
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=794de57bd17a4799b9a28383449eba2a`)
        .then(response => response.json().then(data => console.log(data.results[0].formatted)));
    }

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(successfulLookup, console.log, {maximumAge:10000, timeout: 5000, enableHighAccuracy: true});
    }else{
        alert("Geolocation API is not supported in your browser")
    }
}