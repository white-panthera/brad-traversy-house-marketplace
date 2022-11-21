// Leaflet
import L from "leaflet";

// Marker
import pinkMarkerIcon from "../assets/pink-marker.png";
import blueMarkerIcon from "../assets/blue-marker.png";

export const pinkMarker =  L.icon({
    iconUrl: pinkMarkerIcon,
    iconSize:     [46, 46], // size of the icon
    iconAnchor:   [23, 23], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -23] // point from which the popup should open relative to the iconAnchor
});

export const blueMarker =  L.icon({
    iconUrl: blueMarkerIcon,
    iconSize:     [46, 46], // size of the icon
    iconAnchor:   [23, 23], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -23] // point from which the popup should open relative to the iconAnchor
});