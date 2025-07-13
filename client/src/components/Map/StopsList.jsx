import { useState } from 'react'
import StopItem from './StopItem'

export default function StopsList({ stops, onStopsChange, onOptimizeRoute, routeLegs, map, roundTrip, setRoundTrip, userLocation, routeInfo }) {
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