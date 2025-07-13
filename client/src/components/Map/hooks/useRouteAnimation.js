import { useEffect, useRef } from 'react'
import { computeDistanceMeters } from '../utils/distanceUtils'

export function useRouteAnimation(
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
) {
    const antsAnimationRef = useRef(null)

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

    return { antsAnimationRef }
} 