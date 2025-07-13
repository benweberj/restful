import { useEffect, useRef } from 'react'

// Search bar component for adding stops
export default function SearchBar({ map, onAddStop }) {
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