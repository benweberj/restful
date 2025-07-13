import { useCallback } from 'react'
import { calculateDistance } from '../utils/distanceUtils'

export function useRouteOptimization(stops, setStops, userLocation, roundTrip) {
    const optimizeRoute = useCallback(async () => {
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
    }, [stops, setStops, userLocation, roundTrip])

    return { optimizeRoute }
} 