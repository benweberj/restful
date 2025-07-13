import { useEffect, useRef, useState } from 'react'

// Stop item component with drag and drop and enhanced editing
export default function StopItem({
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
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleInputBlur}
                        className="stop-edit-input"
                        autoFocus
                    />
                ) : (
                    <div className="stop-name" onClick={handleEditClick}>
                        {stop.name}
                    </div>
                )}
                {travelInfo && (
                    <div className="travel-info">
                        <span className="distance">{travelInfo.distance}</span>
                        <span className="duration">{travelInfo.duration}</span>
                    </div>
                )}
            </div>
            <button className="delete-btn" onClick={() => onDelete(index)}>
                ×
            </button>
        </div>
    )
} 