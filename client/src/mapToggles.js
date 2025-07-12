const mapToggles = [
    {
      id: "labels",
      label: "All Labels",
      style: [{ featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "road_labels",
      label: "Road Labels",
      style: [{ featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "place_labels",
      label: "Place Labels",
      style: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "city_labels",
      label: "City Labels",
      style: [{ featureType: "administrative.locality", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "street_names",
      label: "Street Names",
      style: [{ featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "highways",
      label: "Highways",
      style: [{ featureType: "road.highway", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "local_roads",
      label: "Local Roads",
      style: [{ featureType: "road.local", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "parks",
      label: "Parks",
      style: [{ featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "water",
      label: "Water",
      style: [{ featureType: "water", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "water_labels",
      label: "Water Labels",
      style: [{ featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "transit",
      label: "Transit",
      style: [{ featureType: "transit", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "bus_stations",
      label: "Bus Stations",
      style: [{ featureType: "transit.station.bus", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "rail_stations",
      label: "Rail Stations",
      style: [{ featureType: "transit.station.rail", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "airports",
      label: "Airports",
      style: [{ featureType: "transit.station.airport", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "medical",
      label: "Medical POIs",
      style: [{ featureType: "poi.medical", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    },
    {
      id: "schools",
      label: "Schools",
      style: [{ featureType: "poi.school", elementType: "geometry", stylers: [{ visibility: "off" }] }]
    }
  ]
  
  export default mapToggles
  