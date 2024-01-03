/* Magic Mirror
 * Module: MMM-APSC-SOLAR
 *
 * By Jean-Philippe Baud
 * MIT Licensed.
 */
const NodeHelper = require("node_helper");
const request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log("Node helper started for MMM-APSC-SOLAR");
  },

  socketNotificationReceived: function (notification, payload) {
    //console.log("Notification: " + notification + " Payload: " + payload);
    if (notification === "MMM-APSC-SOLAR-GET_REST_DATA") {
      this.getRestData(payload);
    }
  },

  getRestData: function (url) {
    var self = this;
    // Effectuez une requête HTTP pour obtenir les données depuis l'API REST
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Envoyez les données à MMM-MonModule.js
        self.sendSocketNotification("MMM-APSC-SOLAR-REST_DATA_RESULT", JSON.parse(body));
      }
    });
  },
});

