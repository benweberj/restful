import { useCallback } from 'react'
import { getSmartLocationName } from '../utils/locationUtils'
import { calculateDistance } from '../utils/distanceUtils'

export function useMarkerManagement(
    stops, 
    setStops, 
    clickedMarkers, 
    setClickedMarkers, 
    popupInfo, 
    setPopupInfo, 
    userLocation, 
    roundTrip,
    map
) {
    const handleDeleteMarker = useCallback((type, index) => {
        if (type === 'clicked') {
            setClickedMarkers(prev => prev.filter((_, i) => i !== index))
        } else if (type === 'stop') {
            setStops(prev => prev.filter((_, i) => i !== index))
        }
        setPopupInfo(null)
    }, [setClickedMarkers, setStops, setPopupInfo])

    const handleAddToRoute = useCallback(async (clickedMarkerIndex) => {
        const clickedMarker = clickedMarkers[clickedMarkerIndex]
        if (!clickedMarker || !userLocation) return

        // Get a smart name for the marker
        const smartName = await getSmartLocationName(clickedMarker.lat, clickedMarker.lng, map)
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
    }, [clickedMarkers, userLocation, map, stops, setStops, roundTrip, setClickedMarkers, setPopupInfo])

    return {
        handleDeleteMarker,
        handleAddToRoute
    }
} 