import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { streetLabelStyles, areaLabelStyles, placeLabelStyles } from '../utils/mapStyles'
import { getSmartLocationName } from '../utils/locationUtils'
import { findClosestMarker } from '../utils/locationUtils'

export function useMapInitialization(
    mapRef,
    map,
    setMap,
    mapType,
    toggles,
    setClickedMarkers,
    setPopupInfo,
    stopsRef,
    clickedMarkersRef
) {
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
                const smartName = await getSmartLocationName(clickedPosition.lat, clickedPosition.lng, mapInstance)
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
                } else if (currentZoom < 16) {
                    mapInstance.setMapTypeId('roadmap')
                    mapInstance.setTilt(0)
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

    return { map }
} 