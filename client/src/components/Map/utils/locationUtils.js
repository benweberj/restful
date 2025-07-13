// Location utilities for smart naming and geocoding
export function findClosestMarker(clickPosition, markers, threshold = 0.01) {
    let closestMarker = null
    let minDistance = Infinity

    markers.forEach((marker, index) => {
        const distance = Math.sqrt(
            Math.pow(clickPosition.lat - marker.lat, 2) +
            Math.pow(clickPosition.lng - marker.lng, 2)
        )
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance
            closestMarker = { marker, index }
        }
    })

    return closestMarker
}

export async function getSmartLocationName(lat, lng, map) {
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