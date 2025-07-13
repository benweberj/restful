import { useEffect, useRef, useState } from 'react'
import { streetLabelStyles, areaLabelStyles, placeLabelStyles } from './utils/mapStyles'
import { useMapInitialization } from './hooks/useMapInitialization'
import { useRouteOptimization } from './hooks/useRouteOptimization'
import { useMarkerManagement } from './hooks/useMarkerManagement'
import { useRouteAnimation } from './hooks/useRouteAnimation'
import PulsingMarker from './PulsingMarker'
import FloatingMenu from './FloatingMenu'
import MarkerPopup from './MarkerPopup'

export default function Map() {
    const mapRef = useRef(null)
    const [map, setMap] = useState(null)
    const [mapType, setMapType] = useState('roadmap')
    const [manualMapType, setManualMapType] = useState('roadmap')

    const [toggles, setToggles] = useState({
        showTraffic: false,
        showPlaces: false,
        showStreets: false,
        showAreas: false
    })
    const [userLocation, setUserLocation] = useState(null)
    const [stops, setStops] = useState([])
    const [clickedMarkers, setClickedMarkers] = useState([])
    const [directionsRenderer, setDirectionsRenderer] = useState(null)
    const [routeInfo, setRouteInfo] = useState(null)
    const [roundTrip, setRoundTrip] = useState(false)
    const [routeLegs, setRouteLegs] = useState(null)
    const [animatedPolyline, setAnimatedPolyline] = useState(null)
    const [currentZoom, setCurrentZoom] = useState(13)
    const [popupInfo, setPopupInfo] = useState(null)
    
    // Use refs to access current state in event listeners
    const stopsRef = useRef(stops)
    const clickedMarkersRef = useRef(clickedMarkers)
    
    // Update refs when state changes
    useEffect(() => {
        stopsRef.current = stops
    }, [stops])
    
    useEffect(() => {
        clickedMarkersRef.current = clickedMarkers
    }, [clickedMarkers])

    // Initialize map
    useMapInitialization(
        mapRef,
        map,
        setMap,
        mapType,
        toggles,
        setClickedMarkers,
        setPopupInfo,
        stopsRef,
        clickedMarkersRef
    )

    // Update mapType and styles when toggles change
    useEffect(() => {
        if (!map) return
        map.setMapTypeId(mapType)
        map.setOptions({
            styles: [
                ...(toggles.showStreets ? [] : streetLabelStyles),
                ...(toggles.showAreas ? [] : areaLabelStyles),
                ...(toggles.showPlaces ? [] : placeLabelStyles)
            ]
        })
    }, [map, toggles, mapType])

    // Traffic Layer
    useEffect(() => {
        if (!map) return
        let trafficLayer = null
        if (toggles.showTraffic) {
            trafficLayer = new window.google.maps.TrafficLayer()
            trafficLayer.setMap(map)
        }
        return () => {
            if (trafficLayer) trafficLayer.setMap(null)
        }
    }, [map, toggles.showTraffic])

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            pos => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                if (map) {
                    map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                }
            },
            () => {},
            { enableHighAccuracy: true }
        )
    }, [map])

    // Add stop to the list
    const handleAddStop = ({ lat, lng, name }) => {
        setStops(prev => [...prev, { lat, lng, name }])
        if (map) {
            map.panTo({ lat, lng })
        }
    }

    // Listen for zoom changes to update dot size
    useEffect(() => {
        if (!map) return
        const zoomListener = map.addListener('zoom_changed', () => {
            setCurrentZoom(map.getZoom())
        })
        setCurrentZoom(map.getZoom())
        return () => {
            window.google.maps.event.removeListener(zoomListener)
        }
    }, [map])

    // Use custom hooks
    const { optimizeRoute } = useRouteOptimization(stops, setStops, userLocation, roundTrip)
    
    const { handleDeleteMarker, handleAddToRoute } = useMarkerManagement(
        stops,
        setStops,
        clickedMarkers,
        setClickedMarkers,
        popupInfo,
        setPopupInfo,
        userLocation,
        roundTrip,
        map
    )

    const { antsAnimationRef } = useRouteAnimation(
        map,
        userLocation,
        stops,
        roundTrip,
        directionsRenderer,
        setDirectionsRenderer,
        routeInfo,
        setRouteInfo,
        routeLegs,
        setRouteLegs,
        animatedPolyline,
        setAnimatedPolyline,
        currentZoom
    )

    // Map container style
    const mapContainerStyle = {
        width: '100%',
        height: '100vh',
        position: 'relative'
    }

    return (
        <div style={mapContainerStyle}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            <FloatingMenu
                toggles={toggles}
                setToggles={setToggles}
                mapType={mapType}
                setMapType={setMapType}
                manualMapType={manualMapType}
                setManualMapType={setManualMapType}
                map={map}
                onAddStop={handleAddStop}
                stops={stops}
                onStopsChange={setStops}
                onOptimizeRoute={optimizeRoute}
                routeLegs={routeLegs}
                roundTrip={roundTrip}
                setRoundTrip={setRoundTrip}
                userLocation={userLocation}
                routeInfo={routeInfo}
            />
            {/* User location marker */}
            {userLocation && map && (
                <PulsingMarker map={map} position={userLocation} color="#1abc9c" />
            )}
            {/* Stop markers */}
            {stops.map((stop, index) => (
                <PulsingMarker
                    key={`${stop.lat}-${stop.lng}-${index}`}
                    map={map}
                    position={stop}
                    color="#2980ff"
                    number={index + 1}
                    isDestination={index === stops.length - 1}
                />
            ))}
            {/* Clicked markers */}
            {clickedMarkers.map((marker, index) => (
                <PulsingMarker
                    key={index}
                    map={map}
                    position={marker}
                    color="#2980ff"
                    size="small"
                />
            ))}
            {/* Popup for marker actions */}
            <MarkerPopup 
                popupInfo={popupInfo}
                onAddToRoute={handleAddToRoute}
                onDeleteMarker={handleDeleteMarker}
            />
        </div>
    )
} 