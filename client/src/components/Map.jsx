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
function PulsingMarker({ map, position, color }) {
    const markerRef = useRef(null)

    useEffect(() => {
        if (!map || !position) return

        // Remove previous marker if exists
        if (markerRef.current) {
            markerRef.current.setMap(null)
            markerRef.current = null
        }

        // Create a custom overlay for pulsing effect
        const markerDiv = document.createElement('div')
        markerDiv.className = 'pulsing-marker'
        markerDiv.style.background = color
        markerDiv.style.border = `2px solid ${color}`
        markerDiv.style.width = '18px'
        markerDiv.style.height = '18px'
        markerDiv.style.borderRadius = '50%'
        markerDiv.style.boxShadow = `0 0 0 0 ${color}55`
        markerDiv.style.position = 'absolute'
        markerDiv.style.transform = 'translate(-50%, -50%)'
        markerDiv.style.animation = 'pulse 1.5s infinite'

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
    }, [map, position, color])

    return null
}

// Search bar component
function SearchBar({ map, onPlaceSelected }) {
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
                onPlaceSelected({ lat, lng, name: place.name })
            }
        })
    }, [map, onPlaceSelected])

    return (
        <div className="search-container">
            <input
                ref={inputRef}
                type="text"
                placeholder="Search for a place..."
                className="search-input"
            />
        </div>
    )
}

// Floating menu component
function FloatingMenu({ toggles, setToggles, mapType, setMapType, map, onPlaceSelected }) {
    return (
        <div className="floating-menu">
            <div className="floating-menu-title">Map Options</div>

            <SearchBar map={map} onPlaceSelected={onPlaceSelected} />

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
                        onChange={e => setMapType(e.target.checked ? 'hybrid' : 'roadmap')}
                    />
                    <label htmlFor="satellite-toggle">Satellite</label>
                </div>
            </div>
        </div>
    )
}

export default function Map() {
    const mapRef = useRef(null)
    const [map, setMap] = useState(null)
    const [mapType, setMapType] = useState('roadmap')

    const [toggles, setToggles] = useState({
        showTraffic: false,
        showPlaces: false,
        showStreets: false,
        showAreas: false
    })
    const [userLocation, setUserLocation] = useState(null)
    const [targetMarker, setTargetMarker] = useState(null)
    const [clickedMarkers, setClickedMarkers] = useState([])
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
                styles: [
                    ...(toggles.showStreets ? [] : streetLabelStyles),
                    ...(toggles.showAreas ? [] : areaLabelStyles),
                    ...(toggles.showPlaces ? [] : placeLabelStyles)
                ]
            })

            // Add click event listener
            mapInstance.addListener('click', (event) => {
                const clickedPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }
                setClickedMarkers(prev => [...prev, clickedPosition])
            })

            // Add right-click event listener for deleting markers
            mapInstance.addListener('rightclick', (event) => {
                const clickPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }

                // Calculate threshold based on zoom level
                const zoom = mapInstance.getZoom()
                const threshold = Math.pow(2, 15 - zoom) * 0.001 // Scales with zoom

                // Get current state values for comparison
                setClickedMarkers(prevClickedMarkers => {
                    // Check if right-click is near any clicked markers
                    const closestClickedMarker = findClosestMarker(clickPosition, prevClickedMarkers, threshold)
                    if (closestClickedMarker) {
                        return prevClickedMarkers.filter((_, index) => index !== closestClickedMarker.index)
                    }
                    return prevClickedMarkers
                })

                // Check if right-click is near target marker
                setTargetMarker(prevTargetMarker => {
                    if (prevTargetMarker) {
                        const distanceToTarget = calculateDistance(clickPosition, prevTargetMarker)
                        if (distanceToTarget <= threshold) {
                            return null
                        }
                    }
                    return prevTargetMarker
                })
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

    // Add marker for searched place
    const handlePlaceSelected = ({ lat, lng, name }) => {
        setTargetMarker({ lat, lng, name })
        if (map) {
            map.panTo({ lat, lng })
        }
    }

    // Helper function to calculate distance between two points (simple approximation)
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
                map={map}
                onPlaceSelected={handlePlaceSelected}
            />
            {/* User location marker */}
            {userLocation && map && (
                <PulsingMarker map={map} position={userLocation} color="#1abc9c" />
            )}
            {/* Target marker */}
            {targetMarker && map && (
                <PulsingMarker map={map} position={targetMarker} color="#2980ff" />
            )}
            {/* Clicked markers */}
            {clickedMarkers.map((marker, index) => (
                <PulsingMarker
                    key={index}
                    map={map}
                    position={marker}
                    color="#e74c3c"
                />
            ))}
        </div>
    )
}
