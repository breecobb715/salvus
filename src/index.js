import axios from 'axios';

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
axios.get('http://localhost:3000/students')
.then(function (response){
    console.log(response);
});
window.showText = async function() {
    var text = document.getElementById("name-confirm");
    var given_id = document.getElementById("ID").value;
    let result;
    await axios.get(`http://localhost:3000/students/${given_id}`).then(function(response) {
        result = response.data[0].first_name + " " + response.data[0].last_name;
    });
    document.getElementById("name-confirm").innerHTML = "Your name is " + result
    if (text.style.visibility === "hidden") {
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
    }
}
window.showManualLocation = function() {
    var manualLocation = document.getElementById("hidden-location");
    if(manualLocation.style.display === "none"){
        manualLocation.style.display = "flex";
    }else{
        manualLocation.style.display = "none";
    }
}
window.submitForm = async function() {
    var given_id = document.getElementById("ID").value;
    var location_on = document.getElementById("location").checked;
    var student_location;
    if(location_on){
        student_location = updateLocation()
    }else{
        student_location = document.getElementById("location_input").value;
    }
    let contact_method, contact_info
    await axios.get(`http://localhost:3000/students/${given_id}`).then(function(response) {
        contact_method = response.data[0].parent_contact_method;
        contact_info = response.data[0].parent_contact_info;
    });
    if(contact_method == "email"){
        sendEmail();
    }else if(contact_method == "text"){
        sendText();
    }else{
        console.log("No contact method found!");
    }
}
async function sendEmail() { 
    let name, status, location
    await axios.get(`http://localhost:3000/students/${given_id}`).then(function(response) {
        name = response.data[0].first_name + " " + response.data[0].last_name;
        status = response.data[0].status;
        location = response.data[0].location;
    });
    Email.send({ 
      Host: "smtp.gmail.com", 
      Username: "breecobb715@gmail.com", 
      Password: process.env.EMAIL_PASS, 
      To: 'breecobb715@gmail.com', 
      From: "breecobb715@gmail.com", 
      Subject: "Salvus Student Status Update",
      Body: `Your child ${result} has updated their status to ${status} at ${location}. Please take necessary actions to secure your student's safety, and remind them to update their status to \"At Home\"`,
    }) 
      .then(function (message) { 
        console.log("Email sent")
      }); 
}
async function sendText(){
    let name, status, location
    await axios.get(`http://localhost:3000/students/${given_id}`).then(function(response) {
        name = response.data[0].first_name + " " + response.data[0].last_name;
        status = response.data[0].status;
        location = response.data[0].location;
    });
    client.messages
        .create({
            body: `Your child ${name} has updated their status to ${status} at ${location}. Please take necessary actions to secure your student's safety, and remind them to update their status to \"At Home\"`,
            from: '+13252080653',
            to: '+17203629336'
        })
        .then(message => console.log(message.sid));
}

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
window.updateComplete = async function() {
    let name, parent, status, location;
    await axios.get(`http://localhost:3000/students/${given_id}`).then(function(response) {
        name = response.data[0].first_name.toUpperCase() + " " + response.data[0].last_name.toUpperCase()
        parent = response.data[0].parent_first_name.toUpperCase() + " " + response.data[0].last_name.toUpperCase()
        status = response.data[0].status.toUpperCase()
        location = response.data[0].location.toUpperCase()
    });
    document.getElementById("base-info").innerHTML = `${name}, your guardian ${parent} has been notified that you are ${status} at ${location}.`
    document.getElementById("unsubmit-info").innerHTML = `If you are not ${name}, please press "Unsubmit Form" to undo your changes.`
    if (text.style.visibility === "hidden") {
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
    }
}