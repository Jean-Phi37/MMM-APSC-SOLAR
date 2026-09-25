# MMM-APSC-SOLAR

Module pour récupérer les données de l'APSystems ECU-C local dans MagicMirror.

Le module calcule les puissances globales (production/consommation) et peut désormais afficher en plus les 3 phases en parallèle (L1/L2/L3) sur la dernière mesure reçue.

## Configuration

```js
{
  module: "MMM-APSC-SOLAR",
  position: "top_right",
  config: {
    apiUrl: "http://192.168.0.28/index.php/meter/old_meter_power_graph",
    updateInterval: 30000,
    showPhaseDetails: true,
    subscriptionMaxPower: 9000
  }
}
```

### Options

- `apiUrl`: URL de l'API REST ECU-C.
- `updateInterval`: fréquence de rafraîchissement en millisecondes.
- `showPhaseDetails`: affiche le détail `Prod L1/L2/L3` et `Conso L1/L2/L3` quand `true`.
- `subscriptionMaxPower`: puissance max de l'abonnement (en W). Le module calcule le seuil par phase (`/3`) et colore la ligne `Conso L1/L2/L3`.
- `warningThreshold`: seuil orange (par défaut `0.75`, soit 75% de la limite de phase).
- `dangerThreshold`: seuil rouge (par défaut `0.95`, soit 95% de la limite de phase).
