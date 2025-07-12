import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

// Map style constants
const streetLabelStyles = [
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] }
]
const areaLabelStyles = [
    { featureType: 'administrative', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.province', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'off' }] }
]
const placeLabelStyles = [
    { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] }
]

// Pulsing marker helper
function PulsingMarker({ map, position, color, size = 'normal', number, isDestination = false }) {
    const markerRef = useRef(null)

    useEffect(() => {
        if (!map || !position) return

        // Remove previous marker if exists
        if (markerRef.current) {
            markerRef.current.setMap(null)
            markerRef.current = null
        }

        // Determine marker size
        const markerSize = size === 'small' ? 12 : 18

        // Create a custom overlay for pulsing effect
        const markerDiv = document.createElement('div')
        markerDiv.className = 'pulsing-marker'
        markerDiv.style.background = color
        markerDiv.style.border = `2px solid ${color}`
        markerDiv.style.width = `${markerSize}px`
        markerDiv.style.height = `${markerSize}px`
        markerDiv.style.borderRadius = '50%'
        markerDiv.style.boxShadow = `0 0 0 0 ${color}55`
        markerDiv.style.position = 'absolute'
        markerDiv.style.transform = 'translate(-50%, -50%)'
        markerDiv.style.animation = 'pulse 1.5s infinite'
        markerDiv.style.display = 'flex'
        markerDiv.style.alignItems = 'center'
        markerDiv.style.justifyContent = 'center'
        markerDiv.style.fontSize = size === 'small' ? '8px' : '10px'
        markerDiv.style.fontWeight = 'bold'
        markerDiv.style.color = 'white'
        markerDiv.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)'

        // Add number or star
        if (isDestination) {
            markerDiv.textContent = '★'
        } else if (number !== undefined) {
            markerDiv.textContent = number.toString()
        }

        // Custom OverlayView
        class CustomMarker extends window.google.maps.OverlayView {
            constructor(position) {
                super()
                this.position = position
            }
            onAdd() {
                this.getPanes().overlayMouseTarget.appendChild(markerDiv)
            }
            draw() {
                const point = this.getProjection().fromLatLngToDivPixel(this.position)
                if (point) {
                    markerDiv.style.left = point.x + 'px'
                    markerDiv.style.top = point.y + 'px'
                }
            }
            onRemove() {
                if (markerDiv.parentNode) {
                    markerDiv.parentNode.removeChild(markerDiv)
                }
            }
        }
        markerRef.current = new CustomMarker(new window.google.maps.LatLng(position.lat, position.lng))
        markerRef.current.setMap(map)

        return () => {
            if (markerRef.current) markerRef.current.setMap(null)
        }
    }, [map, position, color, size, number, isDestination])

    return null
}

// Search bar component for adding stops
function SearchBar({ map, onAddStop }) {
    const inputRef = useRef(null)
    const autocompleteRef = useRef(null)

    useEffect(() => {
        if (!map || !window.google || !inputRef.current) return

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current)
        autocompleteRef.current.setFields(['geometry', 'name'])
        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace()
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                onAddStop({ lat, lng, name: place.name })
                inputRef.current.value = '' // Clear input after adding
            }
        })
    }, [map, onAddStop])

    return (
        <div className="search-container">
            <input
                ref={inputRef}
                type="text"
                placeholder="Search for a place to add as stop..."
                className="search-input"
            />
        </div>
    )
}

// Stop item component with drag and drop and enhanced editing
function StopItem({
    stop,
    index,
    onDelete,
    onEdit,
    onDragStart,
    onDragOver,
    onDrop,
    isDragging,
    travelInfo,
    map
}) {
    const [isEditing, setIsEditing] = useState(false)
    const inputRef = useRef(null)
    const autocompleteRef = useRef(null)
    const [editValue, setEditValue] = useState(stop.name)

    useEffect(() => {
        if (!isEditing || !map || !inputRef.current) return
        
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current)
        autocompleteRef.current.setFields(['geometry', 'name'])
        
        const handlePlaceChanged = () => {
            const place = autocompleteRef.current.getPlace()
            console.log('Place selected:', place)
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                console.log('Updating stop with new location:', { lat, lng, name: place.name })
                onEdit(index, { lat, lng, name: place.name })
                setIsEditing(false)
            }
        }
        
        autocompleteRef.current.addListener('place_changed', handlePlaceChanged)
        
        // Clean up
        return () => {
            if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
            }
        }
    }, [isEditing, map, index, onEdit])

    const handleEditClick = () => {
        setIsEditing(true)
        setEditValue(stop.name)
    }

    const handleInputBlur = () => {
        setIsEditing(false)
    }

    return (
        <div
            className={`stop-item ${isDragging ? 'dragging' : ''}`}
            draggable
            onDragStart={e => onDragStart(e, index)}
            onDragOver={e => onDragOver(e)}
            onDrop={e => onDrop(e, index)}
        >
            <div className="stop-handle">⋮⋮</div>
            <div className="stop-content">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={handleInputBlur}
                        autoFocus
                        className="stop-edit-input"
                        placeholder="Search for a place..."
                    />
                ) : (
                    <div className="stop-name">{stop.name}</div>
                )}
                {travelInfo && (
                    <div className="stop-travel-info">{travelInfo}</div>
                )}
            </div>
            <div className="stop-actions">
                <button
                    className="stop-edit-btn"
                    onClick={handleEditClick}
                    title="Edit stop location"
                >
                    ✏️
                </button>
                <button
                    className="stop-delete-btn"
                    onClick={() => onDelete(index)}
                    title="Delete stop"
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

// Stops list component with optimize button and round trip toggle
function StopsList({ stops, onStopsChange, onOptimizeRoute, routeLegs, map, roundTrip, setRoundTrip, userLocation, routeInfo }) {
    const [draggedIndex, setDraggedIndex] = useState(null)

    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }
    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }
    const handleDrop = (e, dropIndex) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === dropIndex) return
        const newStops = [...stops]
        const [draggedStop] = newStops.splice(draggedIndex, 1)
        newStops.splice(dropIndex, 0, draggedStop)
        onStopsChange(newStops)
        setDraggedIndex(null)
    }
    const handleDelete = (index) => {
        const newStops = stops.filter((_, i) => i !== index)
        onStopsChange(newStops)
    }
    const handleEdit = (index, updatedStop) => {
        const newStops = [...stops]
        newStops[index] = updatedStop
        onStopsChange(newStops)
    }
    // Compose travel info for each stop
    const getTravelInfo = (i) => {
        if (!routeLegs || !userLocation) return null
        if (i === 0) {
            // First stop: from user
            const fromYou = routeLegs[0]
            return fromYou ? `${fromYou.time} from you (${fromYou.distance})` : null
        } else {
            // From user and from previous stop
            const fromYou = routeLegs[i] ? `${routeLegs[i].time} from you (${routeLegs[i].distance})` : null
            const fromPrev = routeLegs[i] ? `${routeLegs[i].timeFromPrev} from previous stop (${routeLegs[i].distanceFromPrev})` : null
            return [fromYou, fromPrev].filter(Boolean).join(', ')
        }
    }
    return (
        <div className="stops-list">
            <div className="stops-header">
                <h3>Route Stops</h3>
                {stops.length > 1 && (
                    <button
                        className="optimize-btn"
                        onClick={onOptimizeRoute}
                        title="Optimize route order for shortest time"
                    >
                        🚀 Optimize
                    </button>
                )}
            </div>
            {stops.length === 0 ? (
                <div className="no-stops">No stops added yet. Search for places to add stops.</div>
            ) : (
                <div className="stops-container">
                    {stops.map((stop, index) => (
                        <StopItem
                            key={`${stop.lat}-${stop.lng}-${index}`}
                            stop={stop}
                            index={index}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragging={draggedIndex === index}
                            travelInfo={getTravelInfo(index)}
                            map={map}
                        />
                    ))}
                </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="checkbox"
                    id="round-trip-toggle"
                    checked={roundTrip}
                    onChange={e => setRoundTrip(e.target.checked)}
                />
                <label htmlFor="round-trip-toggle" style={{ fontSize: 13 }}>
                    Round Trip (return to start)
                </label>
            </div>
            {routeInfo && (
                <div className="route-summary" style={{ marginTop: 12, padding: 8, background: '#e3f2fd', borderRadius: 6, fontSize: 13 }}>
                    <strong>Total Distance:</strong> {routeInfo.totalDistance}<br />
                    <strong>Total Time:</strong> {routeInfo.totalTime}
                </div>
            )}
        </div>
    )
}

// Floating menu component
function FloatingMenu({ toggles, setToggles, mapType, setMapType, manualMapType, setManualMapType, map, onAddStop, stops, onStopsChange, onOptimizeRoute, routeLegs, roundTrip, setRoundTrip, userLocation, routeInfo }) {
    return (
        <div className="floating-menu">
            <div className="floating-menu-title">Map Options</div>
            <SearchBar
                map={map}
                onAddStop={onAddStop}
            />
            <StopsList
                stops={stops}
                onStopsChange={onStopsChange}
                onOptimizeRoute={onOptimizeRoute}
                routeLegs={routeLegs}
                map={map}
                roundTrip={roundTrip}
                setRoundTrip={setRoundTrip}
                userLocation={userLocation}
                routeInfo={routeInfo}
            />
            <div className="toggle-group">
                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="traffic-toggle"
                        checked={toggles.showTraffic}
                        onChange={e => setToggles(t => ({ ...t, showTraffic: e.target.checked }))}
                    />
                    <label htmlFor="traffic-toggle">Traffic</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="streets-toggle"
                        checked={toggles.showStreets}
                        onChange={e => setToggles(t => ({ ...t, showStreets: e.target.checked }))}
                    />
                    <label htmlFor="streets-toggle">Road/Street Names</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="places-toggle"
                        checked={toggles.showPlaces}
                        onChange={e => setToggles(t => ({ ...t, showPlaces: e.target.checked }))}
                    />
                    <label htmlFor="places-toggle">Places</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="areas-toggle"
                        checked={toggles.showAreas}
                        onChange={e => setToggles(t => ({ ...t, showAreas: e.target.checked }))}
                    />
                    <label htmlFor="areas-toggle">Areas (Towns/Provinces)</label>
                </div>

                <div className="toggle-divider"></div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="satellite-toggle"
                        checked={mapType === 'hybrid'}
                        onChange={e => {
                            const newMapType = e.target.checked ? 'hybrid' : 'roadmap'
                            setMapType(newMapType)
                            setManualMapType(newMapType)
                        }}
                    />
                    <label htmlFor="satellite-toggle">Satellite</label>
                </div>
            </div>
        </div>
    )
}

// Helper to compute distance between two LatLng points in meters
function computeDistanceMeters(a, b) {
    const R = 6371000 // Earth radius in meters
    const toRad = x => x * Math.PI / 180
    const dLat = toRad(b.lat() - a.lat())
    const dLng = toRad(b.lng() - a.lng())
    const lat1 = toRad(a.lat())
    const lat2 = toRad(b.lat())
    const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal))
    return R * c
}

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
    const antsAnimationRef = useRef(null)
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

    // Main map logic
    useEffect(() => {
        let loader = new Loader({
            apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['visualization', 'places']
        })

        let mapInstance = null
        let trafficLayer = null

        loader.load().then(() => {
            if (!mapRef.current) return
            mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 37.7749, lng: -122.4194 },
                zoom: 13,
                mapTypeId: mapType,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: false,
                tilt: 0,
                styles: [
                    ...(toggles.showStreets ? [] : streetLabelStyles),
                    ...(toggles.showAreas ? [] : areaLabelStyles),
                    ...(toggles.showPlaces ? [] : placeLabelStyles)
                ]
            })

            // Add click event listener
            mapInstance.addListener('click', async (event) => {
                const clickedPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }
                
                // Get a smart name for the clicked position
                const smartName = await getSmartLocationName(clickedPosition.lat, clickedPosition.lng)
                const markerWithName = { ...clickedPosition, name: smartName }
                
                setClickedMarkers(prev => [...prev, markerWithName])
                // Close popup when clicking on map
                setPopupInfo(null)
            })

            // Add zoom change listener for automatic hybrid view and tilt
            mapInstance.addListener('zoom_changed', () => {
                const currentZoom = mapInstance.getZoom()
                if (currentZoom >= 18) {
                    mapInstance.setMapTypeId('hybrid')
                    mapInstance.setTilt(45)
                    setMapType('hybrid')
                } else if (currentZoom < 16) {
                    mapInstance.setMapTypeId(manualMapType)
                    mapInstance.setTilt(0)
                    setMapType(manualMapType)
                }
            })

            // Right click to show popup for markers
            mapInstance.addListener('rightclick', (event) => {
                // Prevent default Google Maps context menu
                event.stop()
                
                const clickPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }

                const zoom = mapInstance.getZoom()
                const threshold = Math.pow(2, 15 - zoom) * 0.001

                console.log('Right click detected at:', clickPosition)
                console.log('Threshold:', threshold)
                console.log('Current stops (from ref):', stopsRef.current)
                console.log('Current clicked markers (from ref):', clickedMarkersRef.current)

                // Check if right-click is near any clicked markers
                const closestClickedMarker = findClosestMarker(clickPosition, clickedMarkersRef.current, threshold)
                if (closestClickedMarker) {
                    console.log('Found clicked marker:', closestClickedMarker)
                    // Get screen coordinates from the event
                    const screenX = event.domEvent.clientX
                    const screenY = event.domEvent.clientY
                    
                    setPopupInfo({
                        type: 'clicked',
                        position: { x: screenX, y: screenY },
                        index: closestClickedMarker.index,
                        marker: closestClickedMarker.marker
                    })
                    return
                }

                // Check if right-click is near any stops
                const closestStop = findClosestMarker(clickPosition, stopsRef.current, threshold)
                if (closestStop) {
                    console.log('Found stop:', closestStop)
                    // Get screen coordinates from the event
                    const screenX = event.domEvent.clientX
                    const screenY = event.domEvent.clientY
                    
                    setPopupInfo({
                        type: 'stop',
                        position: { x: screenX, y: screenY },
                        index: closestStop.index,
                        marker: closestStop.marker
                    })
                    return
                }

                console.log('No markers found near click')
                // If not near any markers, close popup
                setPopupInfo(null)
            })

            setMap(mapInstance)
        })

        return () => {
            if (trafficLayer) trafficLayer.setMap(null)
            if (mapInstance) mapInstance = null
        }
        // eslint-disable-next-line
    }, [])

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

    // Update route when stops or roundTrip changes
    useEffect(() => {
        if (!map || !userLocation || stops.length === 0) {
            if (directionsRenderer) {
                directionsRenderer.setDirections({ routes: [] })
                setRouteInfo(null)
                setRouteLegs(null)
            }
            if (animatedPolyline) {
                animatedPolyline.setMap(null)
                setAnimatedPolyline(null)
            }
            if (antsAnimationRef.current) {
                clearInterval(antsAnimationRef.current)
                antsAnimationRef.current = null
            }
            return
        }
        if (directionsRenderer) {
            directionsRenderer.setDirections({ routes: [] })
        }
        const directionsService = new window.google.maps.DirectionsService()
        const renderer = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 4,
                strokeOpacity: 0.7
            }
        })
        renderer.setMap(map)
        setDirectionsRenderer(renderer)
        // Prepare waypoints (all stops except the last one)
        let waypoints = stops.slice(0, -1).map(stop => ({
            location: new window.google.maps.LatLng(stop.lat, stop.lng),
            stopover: true
        }))
        // Last stop is the destination
        let destination = stops[stops.length - 1]
        // If round trip, destination is userLocation
        if (roundTrip) {
            waypoints = stops.map(stop => ({
                location: new window.google.maps.LatLng(stop.lat, stop.lng),
                stopover: true
            }))
            destination = userLocation
        }
        directionsService.route(
            {
                origin: userLocation,
                destination: destination,
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                optimizeWaypoints: false
            },
            (result, status) => {
                if (status === 'OK') {
                    renderer.setDirections(result)
                    const route = result.routes[0]
                    const legs = route.legs
                    // Marching ants: moving dots with constant speed
                    if (animatedPolyline) {
                        animatedPolyline.setMap(null)
                    }
                    if (antsAnimationRef.current) {
                        clearInterval(antsAnimationRef.current)
                        antsAnimationRef.current = null
                    }
                    const path = route.overview_path
                    // Compute total length in meters
                    let totalLength = 0
                    for (let i = 1; i < path.length; i++) {
                        totalLength += computeDistanceMeters(path[i-1], path[i])
                    }
                    // Dot symbol: half transparent black, scale by zoom
                    const getDotScale = (zoom) => {
                        if (zoom >= 18) return 5
                        if (zoom >= 15) return 4
                        if (zoom >= 12) return 3
                        if (zoom >= 10) return 2
                        return 1.5
                    }
                    const dotSymbol = {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: '#000',
                        fillOpacity: 0.5,
                        scale: getDotScale(map.getZoom()),
                        strokeColor: '#000',
                        strokeWeight: 1,
                        strokeOpacity: 0.5
                    }
                    // Fewer dots: increase repeatMeters
                    const repeatMeters = 100
                    const repeatPercent = (repeatMeters / totalLength) * 100
                    let offsetPercent = 0
                    const animatedLine = new window.google.maps.Polyline({
                        path: path,
                        strokeColor: '#000',
                        strokeWeight: 0,
                        strokeOpacity: 0,
                        icons: [{
                            icon: dotSymbol,
                            offset: '0%',
                            repeat: `${repeatPercent}%`
                        }]
                    })
                    animatedLine.setMap(map)
                    setAnimatedPolyline(animatedLine)
                    // Animate the offset at a constant speed (e.g., 60 meters/sec)
                    const speedMetersPerSec = 60
                    const intervalMs = 40
                    const stepPercent = (speedMetersPerSec * (intervalMs/1000) / totalLength) * 100
                    antsAnimationRef.current = setInterval(() => {
                        offsetPercent = (offsetPercent + stepPercent) % 100
                        // Update scale if zoom changed (handled in separate effect now)
                        animatedLine.set('icons', [{
                            icon: dotSymbol,
                            offset: `${offsetPercent}%`,
                            repeat: `${repeatPercent}%`
                        }])
                    }, intervalMs)
                    // ... per-stop info and routeInfo ...
                    const newRouteLegs = stops.map((stop, i) => {
                        let time = '', distance = '', timeFromPrev = '', distanceFromPrev = ''
                        if (i < legs.length) {
                            time = legs[i].duration.text
                            distance = legs[i].distance.text
                        }
                        if (i > 0 && i < legs.length) {
                            timeFromPrev = legs[i].duration.text
                            distanceFromPrev = legs[i].distance.text
                        }
                        return { time, distance, timeFromPrev, distanceFromPrev }
                    })
                    setRouteLegs(newRouteLegs)
                    const totalDistanceKm = route.legs.reduce((total, leg) => total + leg.distance.value, 0) / 1000
                    const totalTimeMinutes = route.legs.reduce((total, leg) => total + leg.duration.value, 0) / 60
                    
                    // Convert to miles and format time
                    const totalDistanceMiles = (totalDistanceKm * 0.621371).toFixed(1)
                    const hours = Math.floor(totalTimeMinutes / 60)
                    const minutes = Math.round(totalTimeMinutes % 60)
                    const timeString = hours > 0 ? `${hours}hr ${minutes}m` : `${minutes}m`
                    
                    setRouteInfo({
                        totalDistance: `${totalDistanceMiles} mi`,
                        totalTime: timeString
                    })
                } else {
                    setRouteLegs(null)
                    setRouteInfo(null)
                    if (animatedPolyline) {
                        animatedPolyline.setMap(null)
                        setAnimatedPolyline(null)
                    }
                    if (antsAnimationRef.current) {
                        clearInterval(antsAnimationRef.current)
                        antsAnimationRef.current = null
                    }
                }
            }
        )
        // Cleanup on unmount
        return () => {
            if (animatedPolyline) {
                animatedPolyline.setMap(null)
                setAnimatedPolyline(null)
            }
            if (antsAnimationRef.current) {
                clearInterval(antsAnimationRef.current)
                antsAnimationRef.current = null
            }
        }
    }, [map, userLocation, stops, roundTrip])

    // Update dot scale on zoom without resetting route
    useEffect(() => {
        if (!animatedPolyline || !map) return
        const getDotScale = (zoom) => {
            if (zoom >= 18) return 5
            if (zoom >= 15) return 4
            if (zoom >= 12) return 3
            if (zoom >= 10) return 2
            return 1.5
        }
        const icons = animatedPolyline.get('icons')
        if (icons && icons[0]) {
            icons[0].icon.scale = getDotScale(map.getZoom())
            animatedPolyline.set('icons', icons)
        }
    }, [animatedPolyline, map, currentZoom])

    // Route optimization using Traveling Salesman Problem approximation
    const optimizeRoute = async () => {
        if (stops.length <= 2) return

        // Create distance matrix between all points (including user location)
        const allPoints = [userLocation, ...stops]
        const distanceMatrix = []

        for (let i = 0; i < allPoints.length; i++) {
            distanceMatrix[i] = []
            for (let j = 0; j < allPoints.length; j++) {
                if (i === j) {
                    distanceMatrix[i][j] = 0
                } else {
                    distanceMatrix[i][j] = calculateDistance(allPoints[i], allPoints[j])
                }
            }
        }

        let optimizedOrder
        if (roundTrip) {
            // For round trips: optimize total distance including return to start
            // Use nearest neighbor but consider the return journey
            optimizedOrder = [0] // Start with user location
            const unvisited = Array.from({ length: allPoints.length - 1 }, (_, i) => i + 1)

            while (unvisited.length > 0) {
                const current = optimizedOrder[optimizedOrder.length - 1]
                let bestNext = unvisited[0]
                let bestTotalCost = Infinity

                // For each unvisited stop, calculate total cost including return to start
                for (let i = 0; i < unvisited.length; i++) {
                    const candidate = unvisited[i]
                    const costToCandidate = distanceMatrix[current][candidate]
                    
                    // Calculate cost of remaining stops + return to start
                    let remainingCost = 0
                    const remainingStops = unvisited.filter((_, index) => index !== i)
                    
                    if (remainingStops.length > 0) {
                        // Estimate remaining cost using nearest neighbor for remaining stops
                        let tempCurrent = candidate
                        const tempRemaining = [...remainingStops]
                        
                        while (tempRemaining.length > 0) {
                            let nearest = tempRemaining[0]
                            let minDist = distanceMatrix[tempCurrent][nearest]
                            
                            for (let j = 1; j < tempRemaining.length; j++) {
                                const dist = distanceMatrix[tempCurrent][tempRemaining[j]]
                                if (dist < minDist) {
                                    minDist = dist
                                    nearest = tempRemaining[j]
                                }
                            }
                            remainingCost += minDist
                            tempCurrent = nearest
                            tempRemaining.splice(tempRemaining.indexOf(nearest), 1)
                        }
                        
                        // Add cost to return to start
                        remainingCost += distanceMatrix[tempCurrent][0]
                    } else {
                        // This is the last stop, just add return cost
                        remainingCost = distanceMatrix[candidate][0]
                    }
                    
                    const totalCost = costToCandidate + remainingCost
                    if (totalCost < bestTotalCost) {
                        bestTotalCost = totalCost
                        bestNext = candidate
                    }
                }

                optimizedOrder.push(bestNext)
                unvisited.splice(unvisited.indexOf(bestNext), 1)
            }
        } else {
            // For one-way trips: simple nearest neighbor (current logic)
            optimizedOrder = [0] // Start with user location
            const unvisited = Array.from({ length: allPoints.length - 1 }, (_, i) => i + 1)

            while (unvisited.length > 0) {
                const current = optimizedOrder[optimizedOrder.length - 1]
                let nearest = unvisited[0]
                let minDistance = distanceMatrix[current][nearest]

                for (let i = 1; i < unvisited.length; i++) {
                    const candidate = unvisited[i]
                    const distance = distanceMatrix[current][candidate]
                    if (distance < minDistance) {
                        minDistance = distance
                        nearest = candidate
                    }
                }

                optimizedOrder.push(nearest)
                unvisited.splice(unvisited.indexOf(nearest), 1)
            }
        }

        // Reorder stops based on optimization (skip user location)
        const optimizedStops = optimizedOrder.slice(1).map(index => stops[index - 1])
        setStops(optimizedStops)
    }

    // Helper function to calculate distance between two points
    const calculateDistance = (point1, point2) => {
        const latDiff = point1.lat - point2.lat
        const lngDiff = point1.lng - point2.lng
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
    }

    // Helper function to find closest marker within threshold
    const findClosestMarker = (clickPosition, markers, threshold = 0.01) => {
        let closestMarker = null
        let minDistance = Infinity

        markers.forEach((marker, index) => {
            const distance = calculateDistance(clickPosition, marker)
            if (distance < minDistance && distance <= threshold) {
                minDistance = distance
                closestMarker = { marker, index }
            }
        })

        return closestMarker
    }

    // Get smart location name using reverse geocoding
    const getSmartLocationName = async (lat, lng) => {
        if (!map || !window.google) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`

        try {
            // Use reverse geocoding to get location information
            const geocoder = new window.google.maps.Geocoder()
            const geocodeResult = await geocoder.geocode({ location: { lat, lng } })

            if (geocodeResult.results && geocodeResult.results.length > 0) {
                const result = geocodeResult.results[0]
                const addressComponents = result.address_components

                // Try to get street address first
                const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))
                const route = addressComponents.find(comp => comp.types.includes('route'))
                
                if (streetNumber && route) {
                    return `${streetNumber.long_name} ${route.long_name}`
                }

                // Try to get neighborhood
                const neighborhood = addressComponents.find(comp => comp.types.includes('sublocality'))
                if (neighborhood) {
                    return neighborhood.long_name
                }

                // Try to get city
                const city = addressComponents.find(comp => comp.types.includes('locality'))
                if (city) {
                    return city.long_name
                }

                // Fallback to formatted address
                return result.formatted_address
            }

            // Final fallback to coordinates
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        } catch (error) {
            console.error('Error getting location name:', error)
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
    }

    // Handle popup actions
    const handleDeleteMarker = (type, index) => {
        if (type === 'clicked') {
            setClickedMarkers(prev => prev.filter((_, i) => i !== index))
        } else if (type === 'stop') {
            setStops(prev => prev.filter((_, i) => i !== index))
        }
        setPopupInfo(null)
    }

    // Handle adding clicked marker to route optimally
    const handleAddToRoute = async (clickedMarkerIndex) => {
        const clickedMarker = clickedMarkers[clickedMarkerIndex]
        if (!clickedMarker || !userLocation) return

        // Get a smart name for the marker
        const smartName = await getSmartLocationName(clickedMarker.lat, clickedMarker.lng)
        const markerWithName = { ...clickedMarker, name: smartName }

        // Find the optimal position to insert this marker
        let bestPosition = 0
        let bestTotalDistance = Infinity

        // Try inserting at each position in the current route
        for (let i = 0; i <= stops.length; i++) {
            const testStops = [...stops]
            testStops.splice(i, 0, markerWithName)
            
            // Calculate total distance for this insertion
            let totalDistance = 0
            let currentPoint = userLocation
            
            for (let j = 0; j < testStops.length; j++) {
                const nextPoint = testStops[j]
                totalDistance += calculateDistance(currentPoint, nextPoint)
                currentPoint = nextPoint
            }
            
            // If round trip, add return distance
            if (roundTrip) {
                totalDistance += calculateDistance(currentPoint, userLocation)
            }
            
            if (totalDistance < bestTotalDistance) {
                bestTotalDistance = totalDistance
                bestPosition = i
            }
        }

        // Insert the marker at the optimal position
        const newStops = [...stops]
        newStops.splice(bestPosition, 0, markerWithName)
        setStops(newStops)
        
        // Remove the clicked marker
        setClickedMarkers(prev => prev.filter((_, i) => i !== clickedMarkerIndex))
        setPopupInfo(null)
    }

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
            {popupInfo && (
                <div 
                    className="marker-popup"
                    style={{
                        position: 'fixed',
                        left: popupInfo.position.x,
                        top: popupInfo.position.y,
                        background: 'white',
                        border: '2px solid #dc3545',
                        borderRadius: '6px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        zIndex: 9999,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-10px',
                        minWidth: '140px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                        {popupInfo.type === 'stop' ? 'Route Stop' : 'Clicked Marker'}
                    </div>
                    {popupInfo.type === 'clicked' ? (
                        <button 
                            onClick={() => handleAddToRoute(popupInfo.index)}
                            style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                width: '100%',
                                marginBottom: '6px'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#218838'}
                            onMouseOut={(e) => e.target.style.background = '#28a745'}
                        >
                            ➕ Add to Route
                        </button>
                    ) : null}
                    <button 
                        onClick={() => handleDeleteMarker(popupInfo.type, popupInfo.index)}
                        style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#c82333'}
                        onMouseOut={(e) => e.target.style.background = '#dc3545'}
                    >
                        🗑️ Delete {popupInfo.type === 'stop' ? 'Stop' : 'Marker'}
                    </button>
                </div>
            )}
        </div>
    )
}
