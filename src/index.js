import axios from 'axios';

axios.get('http://localhost:3000/students')
.then(function (response){
    console.log(response);
});

window.showText = function() {
    var text = document.getElementById("name-confirm");
    var given_id = document.getElementById("ID");
    axios.get(`/students/${given_id}`, function(data) {
        debugger;
        document.getElementById("name-confirm").innerHTML = "Your name is" + data.name;
    });
    if (text.style.visibility === "hidden") {
        text.style.visibility = "visible";
    } else {
        text.style.visibility = "hidden";
    }
}

module.exports = {
    showText: showText,
};