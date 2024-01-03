// MMM-MonModule.js
//const moment = require("moment");

Module.register("MMM-APSC-SOLAR", {
  defaults: {
    apiUrl: "http://192.168.0.28/index.php/meter/old_meter_power_graph",
    updateInterval: 30000, // en millisecondes (60*5 secondes dans cet exemple)
    header: "<i class=\"fa-solid fa-sun\"></i> Production Electrique"
  },
 
  getStyles: function() {
        return ['solar.css']; //, "fontawesome.css"
    },

  start: function () {
    var self = this;
    setInterval(function () {
      self.getData();
    }, this.config.updateInterval);
	
    this.titles = ["<i class=\"fa-solid fa-solar-panel\"></i>", "<i class=\"fa-solid fa-plug\"></i>", "<i class=\"fa-regular fa-clock\"></i>"];
    this.suffixes = ["W", "W", ""];
    this.results = ["Chargement...", "Chargement...", "Chargement..."];
    this.resultsTotal = ["", "", ""];
    this.getData(); // Obtenez les données pour la première fois au démarrage
  },

  getData: function () {
    var self = this;
    // Effectuez une requête AJAX pour obtenir les données depuis l'API REST
    //Log.log("Appel GetData");
    this.sendSocketNotification("MMM-APSC-SOLAR-GET_REST_DATA", this.config.apiUrl);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MMM-APSC-SOLAR-REST_DATA_RESULT") {
      this.processData(payload);
    }
  },

  getHeader: function() {
		return this.config.header;
	},
  getDom: function() {
	var wrapper = document.createElement("div");
	if (this.config.siteUrl === "") {
	    wrapper.innerHTML = "Missing configuration.";
	    return wrapper;
	}
      
        //Display loading while waiting for API response
        if (!this.loaded) {
      	    wrapper.innerHTML = "<i class=\"fa-solid fa-solar-panel\"></i> Loading...";
            return wrapper;
      	}

        var tb = document.createElement("table");

        for (let i = 0; i < this.results.length; i++) {
           let row = document.createElement("tr");
           let titleTr = document.createElement("td");
           let dataTr = document.createElement("td");
	   let dataTotal = document.createElement("td");

           titleTr.innerHTML = this.titles[i];
           dataTr.innerHTML = this.results[i] + " " + this.suffixes[i];
	   dataTotal.innerHTML = (this.resultsTotal[i] != "0" ? this.resultsTotal[i] + " kW" : "");
	if(i==2) dataTr.colSpan = "2";
	   dataTotal.className += " small light normal"
       	   titleTr.className += " small regular bright";
           dataTr.className += " small light normal" + (parseInt(this.results[i])> 2000 ? " power-high" : "");

           row.appendChild(titleTr);
           row.appendChild(dataTr);
	   row.appendChild(dataTotal);
           tb.appendChild(row);
      	}

        wrapper.appendChild(tb);

	let divSituation = document.createElement("div");
	divSituation.className = "conteneur";
	let divPanneau = document.createElement("div");
	divPanneau.innerHTML = "<i class=\"fa-solid fa-solar-panel\"></i>";
	divPanneau.className = "sous-div";
	let divPanneau2Home = document.createElement("div");
	divPanneau2Home.innerHTML = this.results[0] > 0 ? "<i class=\"fa-solid fa-circle-arrow-right fa-beat-fade\" style=\"--fa-beat-fade-opacity: 0.67; --fa-beat-fade-scale: 1.075;\"></i>" : "<i class=\"fa-solid fa-minus\"></i>";
	divPanneau2Home.className = "sous-div " + (this.results[0] > 0 ? "green" : "");
	let divHome = document.createElement("div");
	divHome.className = "sous-div";
	divHome.innerHTML = "<i class=\"fa-solid fa-house\"></i>";
	let divHome2Network = document.createElement("div");
	divHome2Network.className = "sous-div " + (this.results[1] > 0 ? "orange" : "green");
	divHome2Network.innerHTML = this.results[1] > 0 ? "<i class=\"fa-solid fa-circle-arrow-left fa-beat-fade\" style=\"--fa-beat-fade-opacity: 0.67; --fa-beat-fade-scale: 1.075;\"></i>" : "<i class=\"fa-solid fa-circle-arrow-right fa-beat-fade\"></i>";
	let divNetwork = document.createElement("div");
	divNetwork.className = "sous-div";
	divNetwork.innerHTML = "<i class=\"fa-solid fa-bolt\"></i>";

	divSituation.appendChild(divPanneau);
	divSituation.appendChild(divPanneau2Home);
	divSituation.appendChild(divHome);
	divSituation.appendChild(divHome2Network);
	divSituation.appendChild(divNetwork);
	
	//let divSitu = document.createElement("div");
	//divSitu.className = "container";

	//divSitu.appendChild(divSituation);
	//wrapper.appendChild(divSitu);
wrapper.appendChild(divSituation);
        return wrapper;
  },

  processData: function (data) {
    	//console.log("Données récupérées :", data);
 	if (!this.loaded) this.loaded = true;
 	if (data && data.power1 && data.power2) {
    		// Récupérez le dernier élément de "power1" et "power2"
    		const lastPower1 = data.power1[data.power1.length - 1];
    		const lastPower2 = data.power2[data.power2.length - 1];

    		const sumProduction = lastPower1.powerA + lastPower1.powerB + lastPower1.powerC;
    		const sumPowerConsumption = lastPower2.powerA + lastPower2.powerB + lastPower2.powerC;

		var ProdTotal = 0,ConsoTotal = 0;
		for (let pas = 0; pas < data.power1.length; pas++) {
			ProdTotal += (data.power1[pas].powerA + data.power1[pas].powerB + data.power1[pas].powerC) / (60/5);
			ConsoTotal += (data.power2[pas].powerA + data.power2[pas].powerB + data.power2[pas].powerC) / (60/5);
		}

    		const unixTimePower1 = new Date(lastPower1.time).getTime() / 1000;
    		const LastUpdated = moment.unix(unixTimePower1).format("DD MMM YYYY HH:mm");
    		this.results = [sumProduction, sumPowerConsumption, LastUpdated];
		this.resultsTotal = [ Math.round(ProdTotal)/1000 , Math.round(ConsoTotal)/1000 , "0"];
    		//console.log("Data =>", this.results);
    	}
    	else {
    		console.error("Format de données incorrect");
  	}
    this.updateDom();
  },

  // Autres méthodes et hooks peuvent être ajoutés selon les besoins
});

