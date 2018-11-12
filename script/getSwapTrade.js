const axios = require('axios');
var request = require('request');

// axios.get('localhost:8000/api/trades?fromDate=1539277200&toDate=1542041999')
//   .then(function (response) {
//     // handle success
//     console.log(response);

//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });

  request('http://localhost:8000/api/trades?fromDate=1539277200&toDate=1542041999', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });

