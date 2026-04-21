// MMM-MonModule.js

Module.register("MMM-APSC-SOLAR", {
  defaults: {
    apiUrl: "http://192.168.0.28/index.php/meter/old_meter_power_graph",
    updateInterval: 30000, // en millisecondes (60*5 secondes dans cet exemple)
    header: '<i class="fa-solid fa-sun"></i> Production Electrique',
    showPhaseDetails: true,
  },

  getStyles: function () {
    return ["solar.css"]; //, "fontawesome.css"
  },

  start: function () {
    var self = this;
    setInterval(function () {
      self.getData();
    }, this.config.updateInterval);

    this.rows = [
      {
        title: '<i class="fa-solid fa-solar-panel"></i>',
        value: "Chargement...",
        suffix: "W",
        total: "",
      },
      {
        title: '<i class="fa-solid fa-plug"></i>',
        value: "Chargement...",
        suffix: "W",
        total: "",
      },
      {
        title: '<i class="fa-regular fa-clock"></i>',
        value: "Chargement...",
        suffix: "",
        total: "",
        spanTwoColumns: true,
      },
    ];

    this.energyFlow = {
      production: 0,
      consumption: 0,
    };

    this.getData(); // Obtenez les données pour la première fois au démarrage
  },

  getData: function () {
    this.sendSocketNotification("MMM-APSC-SOLAR-GET_REST_DATA", this.config.apiUrl);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MMM-APSC-SOLAR-REST_DATA_RESULT") {
      this.processData(payload);
    }
  },

  getHeader: function () {
    return this.config.header;
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    if (this.config.siteUrl === "") {
      wrapper.innerHTML = "Missing configuration.";
      return wrapper;
    }

    //Display loading while waiting for API response
    if (!this.loaded) {
      wrapper.innerHTML = '<i class="fa-solid fa-solar-panel"></i> Loading...';
      return wrapper;
    }

    var tb = document.createElement("table");

    for (let i = 0; i < this.rows.length; i++) {
      const metric = this.rows[i];
      let row = document.createElement("tr");
      let titleTr = document.createElement("td");
      let dataTr = document.createElement("td");
      let dataTotal = document.createElement("td");

      titleTr.innerHTML = metric.title;
      dataTr.innerHTML = metric.value + (metric.suffix ? " " + metric.suffix : "");
      dataTotal.innerHTML = metric.total ? metric.total : "";

      if (metric.spanTwoColumns) {
        dataTr.colSpan = "2";
      }

      dataTotal.className += " small light normal";
      titleTr.className += " small regular bright";
      dataTr.className += " small light normal" + ((metric.highlight && parseInt(metric.value, 10) > 2000) ? " power-high" : "");

      row.appendChild(titleTr);
      row.appendChild(dataTr);
      if (!metric.spanTwoColumns) {
        row.appendChild(dataTotal);
      }

      tb.appendChild(row);
    }

    wrapper.appendChild(tb);

    let divSituation = document.createElement("div");
    divSituation.className = "conteneur";
    let divPanneau = document.createElement("div");
    divPanneau.innerHTML = '<i class="fa-solid fa-solar-panel"></i>';
    divPanneau.className = "sous-div";
    let divPanneau2Home = document.createElement("div");
    divPanneau2Home.innerHTML = this.energyFlow.production > 0 ? '<i class="fa-solid fa-circle-arrow-right fa-beat-fade" style="--fa-beat-fade-opacity: 0.67; --fa-beat-fade-scale: 1.075;"></i>' : '<i class="fa-solid fa-minus"></i>';
    divPanneau2Home.className = "sous-div " + (this.energyFlow.production > 0 ? "green" : "");
    let divHome = document.createElement("div");
    divHome.className = "sous-div";
    divHome.innerHTML = '<i class="fa-solid fa-house"></i>';
    let divHome2Network = document.createElement("div");
    divHome2Network.className = "sous-div " + (this.energyFlow.consumption > 0 ? "orange" : "green");
    divHome2Network.innerHTML = this.energyFlow.consumption > 0 ? '<i class="fa-solid fa-circle-arrow-left fa-beat-fade" style="--fa-beat-fade-opacity: 0.67; --fa-beat-fade-scale: 1.075;"></i>' : '<i class="fa-solid fa-circle-arrow-right fa-beat-fade"></i>';
    let divNetwork = document.createElement("div");
    divNetwork.className = "sous-div";
    divNetwork.innerHTML = '<i class="fa-solid fa-bolt"></i>';

    divSituation.appendChild(divPanneau);
    divSituation.appendChild(divPanneau2Home);
    divSituation.appendChild(divHome);
    divSituation.appendChild(divHome2Network);
    divSituation.appendChild(divNetwork);

    wrapper.appendChild(divSituation);
    return wrapper;
  },

  processData: function (data) {
    if (!this.loaded) this.loaded = true;

    if (data && data.power1 && data.power2 && data.power1.length && data.power2.length) {
      // Récupérez le dernier élément de "power1" et "power2"
      const lastPower1 = data.power1[data.power1.length - 1];
      const lastPower2 = data.power2[data.power2.length - 1];

      const phaseProduction = {
        A: Number(lastPower1.powerA) || 0,
        B: Number(lastPower1.powerB) || 0,
        C: Number(lastPower1.powerC) || 0,
      };

      const phaseConsumption = {
        A: Number(lastPower2.powerA) || 0,
        B: Number(lastPower2.powerB) || 0,
        C: Number(lastPower2.powerC) || 0,
      };

      const sumProduction = phaseProduction.A + phaseProduction.B + phaseProduction.C;
      const sumPowerConsumption = phaseConsumption.A + phaseConsumption.B + phaseConsumption.C;

      var ProdTotal = 0,
        ConsoTotal = 0;
      for (let pas = 0; pas < data.power1.length; pas++) {
        ProdTotal += (Number(data.power1[pas].powerA) + Number(data.power1[pas].powerB) + Number(data.power1[pas].powerC)) / (60 / 5);
        ConsoTotal += (Number(data.power2[pas].powerA) + Number(data.power2[pas].powerB) + Number(data.power2[pas].powerC)) / (60 / 5);
      }

      const lastUpdateDate = new Date(lastPower1.time);
      const LastUpdated = Number.isNaN(lastUpdateDate.getTime())
        ? "Date invalide"
        : lastUpdateDate.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

      const rows = [
        {
          title: '<i class="fa-solid fa-solar-panel"></i>',
          value: Math.round(sumProduction),
          suffix: "W",
          total: Math.round(ProdTotal) / 1000 + " kW",
          highlight: true,
        },
        {
          title: '<i class="fa-solid fa-plug"></i>',
          value: Math.round(sumPowerConsumption),
          suffix: "W",
          total: Math.round(ConsoTotal) / 1000 + " kW",
          highlight: true,
        },
      ];

      if (this.config.showPhaseDetails) {
        rows.push(
          {
            title: "↳ Prod L1/L2/L3",
            value: `${Math.round(phaseProduction.A)} / ${Math.round(phaseProduction.B)} / ${Math.round(phaseProduction.C)}`,
            suffix: "W",
            total: "",
          },
          {
            title: "↳ Conso L1/L2/L3",
            value: `${Math.round(phaseConsumption.A)} / ${Math.round(phaseConsumption.B)} / ${Math.round(phaseConsumption.C)}`,
            suffix: "W",
            total: "",
          }
        );
      }

      rows.push({
        title: '<i class="fa-regular fa-clock"></i>',
        value: LastUpdated,
        suffix: "",
        total: "",
        spanTwoColumns: true,
      });

      this.rows = rows;
      this.energyFlow = {
        production: sumProduction,
        consumption: sumPowerConsumption,
      };
    } else {
      console.error("Format de données incorrect");
    }

    this.updateDom();
  },

  // Autres méthodes et hooks peuvent être ajoutés selon les besoins
});
