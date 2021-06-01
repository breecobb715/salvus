import axios from 'axios';
import{ init } from 'emailjs-com';
init(process.env.EMAIL_USER_ID);
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
axios.get('http://localhost:3000/students')
.then(function (response){
    console.log(response);
});
const url = "http://localhost:3000/"
window.showText = async function() {
    var text = document.getElementById("name-confirm");
    var given_id = document.getElementById("ID").value;
    let result;
    await axios.get(`${url}students/${given_id}`).then(function(response) {
        result = response.data[0].first_name + " " + response.data[0].last_name;
    });
    document.getElementById("name-confirm").innerHTML = "Your name is " + result
    if (text.style.visibility === "hidden") {
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
    }
}
window.swapPage = function(){
    var form = document.getElementById("form")
    var complete = document.getElementById("complete")
    if(form.style.display === "none"){
        complete.style.display = "none"
        form.style.display = "flex"
    }else{
        form.style.display = "none"
        complete.style.display = "flex"
    }
}
window.clearForm = function(){
    document.getElementById("ID").value = ""
    document.getElementById("safe").checked = false
    document.getElementById("in-peril").checked = false
    document.getElementById("home").checked = false
    swapPage()
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
    await axios.post(`${url}updatestudent/${given_id}`, {
        status: document.querySelector('input[name="status"]:checked').value,
        location: student_location
    });
    let contact_method, contact_info
    await axios.get(`${url}students/${given_id}`).then(function(response) {
        contact_method = response.data[0].parent_contact_method;
        contact_info = response.data[0].parent_contact_info;
    });
    console.log("Got console info")
    if(contact_method == "EMAIL"){
        sendEmail(given_id, contact_info);
    }else if(contact_method == "TEXT"){
        console.log("Contact method found")
        sendText(given_id, contact_info);
    }else{
        console.log("No contact method found!");
    }
    updateComplete(given_id);
    swapPage();
}
async function sendEmail(given_id, contactEmail) { 
    let name, status, location
    await axios.get(`${url}students/${given_id}`).then(function(response) {
        name = response.data[0].first_name + " " + response.data[0].last_name;
        status = response.data[0].status;
        location = response.data[0].location;
    });
    console.log("Email sent?")
    emailjs.send(process.env.EMAIL_SERVICE_ID, process.env.EMAIL_TEMPLATE_ID, {name, status, location}, process.env.EMAIL_USER_ID);
    console.log("Email sent!")
}
async function sendText(given_id, contactText){
    console.log("Given ID is " + given_id + " contact number is " + contactText);
    let name, status, location;
    await axios.get(`${url}students/${given_id}`).then(function(response) {
        name = response.data[0].first_name + " " + response.data[0].last_name;
        status = response.data[0].status;
        location = response.data[0].location;
    });
    console.log("Name is " + name + " status is " + status + " location is " + location);
    client.messages
        .create({
            body: `Your child ${name} has updated their status to ${status} at ${location}. Please take necessary actions to secure your student's safety, and remind them to update their status to \"At Home\"`,
            from: '+13252080653',
            to: contactText
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
window.updateComplete = async function(given_id) {
    let name, parent, status, location;
    await axios.get(`${url}students/${given_id}`).then(function(response) {
        name = response.data[0].first_name.toUpperCase() + " " + response.data[0].last_name.toUpperCase()
        parent = response.data[0].parent_first_name.toUpperCase() + " " + response.data[0].last_name.toUpperCase()
        status = response.data[0].status.toUpperCase()
        location = response.data[0].location.toUpperCase()
    });
    document.getElementById("base-info").innerHTML = `<p>${name}, your guardian ${parent} has been notified that you are ${status} at ${location}.</p>`;
    document.getElementById("unsubmit-info").innerHTML = `<p>If you are not ${name}, please press "Unsubmit Form" to undo your changes.</p>`;
}
window.makeStudent = function(){
    axios.post(`${url}newstudent`, {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        student_id: document.getElementById("student_id").value,
        parent_first_name: document.getElementById("par_first_name").value,
        parent_last_name: document.getElementById("par_last_name").value,
        parent_contact_method: document.getElementById("contact_method").value,
        parent_contact_info: document.getElementById("contact").value
    });
    document.getElementById("first_name").value = "";
    document.getElementById("last_name").value = "";
    document.getElementById("student_id").value = "";
    document.getElementById("par_first_name").value = "";
    document.getElementById("par_last_name").value = "";
    document.getElementById("contact_method").value = "";
    document.getElementById("contact").value = "";
}

if(document.getElementById("admin-view")){
    console.log("Admin View Only")
    axios.get(`${url}students`)
        .then(function (response){
        for (var i = 0; i < response.data.length; i++) {
            var first_name = response.data[i].first_name;
            let wellSection = document.createElement("div");
            wellSection.className = "well";
            wellSection.setAttribute("id", `student-well-${i}`);
            var wellParent = document.getElementById("well-section");
            wellParent.appendChild(wellSection);
            wellSection.innerHTML = `
                <h2>${response.data[i].first_name} ${response.data[i].last_name}</h2>
                <h4>Student ID: ${response.data[i].student_id}</h4>
                <h4>Parent Name: ${response.data[i].parent_first_name} ${response.data[i].parent_last_name}</h4>
                <h4>Parent Contact Information: ${response.data[i].parent_contact_method} ${response.data[i].parent_contact_info}</h4>
                <hr>
            `;
        }
    });
}