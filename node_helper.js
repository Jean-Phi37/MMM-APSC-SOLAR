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
    this.inFlightRequests = new Set();
  },

  socketNotificationReceived: function (notification, payload) {
    //console.log("Notification: " + notification + " Payload: " + payload);
    if (notification === "MMM-APSC-SOLAR-GET_REST_DATA") {
      this.getRestData(payload);
    }
  },

  getRestData: async function (url) {
    if (this.inFlightRequests.has(url)) {
      return;
    }

    this.inFlightRequests.add(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        console.error(`MMM-APSC-SOLAR: HTTP ${response.status} for ${url}`);
        return;
      }

      const data = await response.json();
      this.sendSocketNotification("MMM-APSC-SOLAR-REST_DATA_RESULT", data);
    } catch (error) {
      if (error.name === "AbortError") {
        console.error(`MMM-APSC-SOLAR: Request timeout for ${url}`);
      } else {
        console.error(`MMM-APSC-SOLAR: Failed to fetch data from ${url}`, error);
      }
    } finally {
      clearTimeout(timeout);
      this.inFlightRequests.delete(url);
    }
  },
});

