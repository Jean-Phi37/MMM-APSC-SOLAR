/* Magic Mirror
 * Module: MMM-APSC-SOLAR
 *
 * By Jean-Philippe Baud
 * MIT Licensed.
 */
const NodeHelper = require("node_helper");

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

  getRestData: async function (url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`MMM-APSC-SOLAR: HTTP ${response.status} for ${url}`);
        return;
      }

      const data = await response.json();
      this.sendSocketNotification("MMM-APSC-SOLAR-REST_DATA_RESULT", data);
    } catch (error) {
      console.error(`MMM-APSC-SOLAR: Failed to fetch data from ${url}`, error);
    }
  },
});

