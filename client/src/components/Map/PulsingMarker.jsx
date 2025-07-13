import { useEffect, useRef } from 'react'

// Pulsing marker helper
export default function PulsingMarker({ map, position, color, size = 'normal', number, isDestination = false }) {
    const markerRef = useRef(null)

    useEffect(() => {
        if (!map || !position) return

        // Remove previous marker if exists
        if (markerRef.current) {
            markerRef.current.setMap(null)
            markerRef.current = null
        }

        // Determine marker size
        const markerSize = size === 'small' ? 12 : 18

        // Create a custom overlay for pulsing effect
        const markerDiv = document.createElement('div')
        markerDiv.className = 'pulsing-marker'
        markerDiv.style.background = color
        markerDiv.style.border = `2px solid ${color}`
        markerDiv.style.width = `${markerSize}px`
        markerDiv.style.height = `${markerSize}px`
        markerDiv.style.borderRadius = '50%'
        markerDiv.style.boxShadow = `0 0 0 0 ${color}55`
        markerDiv.style.position = 'absolute'
        markerDiv.style.transform = 'translate(-50%, -50%)'
        markerDiv.style.animation = 'pulse 1.5s infinite'
        markerDiv.style.display = 'flex'
        markerDiv.style.alignItems = 'center'
        markerDiv.style.justifyContent = 'center'
        markerDiv.style.fontSize = size === 'small' ? '8px' : '10px'
        markerDiv.style.fontWeight = 'bold'
        markerDiv.style.color = 'white'
        markerDiv.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)'

        // Add number or star
        if (isDestination) {
            markerDiv.textContent = '★'
        } else if (number !== undefined) {
            markerDiv.textContent = number.toString()
        }

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
    }, [map, position, color, size, number, isDestination])

    return null
} 