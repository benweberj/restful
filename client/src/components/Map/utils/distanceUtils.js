// Distance calculation utilities
export function computeDistanceMeters(a, b) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = a.lat * Math.PI / 180
    const φ2 = b.lat * Math.PI / 180
    const Δφ = (b.lat - a.lat) * Math.PI / 180
    const Δλ = (b.lng - a.lng) * Math.PI / 180

    const x = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

    return R * y
}

export function calculateDistance(point1, point2) {
    return computeDistanceMeters(point1, point2)
} 