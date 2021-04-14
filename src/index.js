import axios from 'axios';

axios.get('http://localhost:3000/students')
.then(function (response){
    console.log(response);
});