// Marker popup component for right-click actions
export default function MarkerPopup({ popupInfo, onAddToRoute, onDeleteMarker }) {
    if (!popupInfo) return null

    return (
        <div 
            className="marker-popup"
            style={{
                position: 'fixed',
                left: popupInfo.position.x,
                top: popupInfo.position.y,
                background: 'white',
                border: '2px solid #dc3545',
                borderRadius: '6px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                zIndex: 9999,
                transform: 'translate(-50%, -100%)',
                marginTop: '-10px',
                minWidth: '140px',
                textAlign: 'center'
            }}
        >
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                {popupInfo.type === 'stop' ? 'Route Stop' : 'Clicked Marker'}
            </div>
            {popupInfo.type === 'clicked' ? (
                <button 
                    onClick={() => onAddToRoute(popupInfo.index)}
                    style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        width: '100%',
                        marginBottom: '6px'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#218838'}
                    onMouseOut={(e) => e.target.style.background = '#28a745'}
                >
                    ➕ Add to Route
                </button>
            ) : null}
            <button 
                onClick={() => onDeleteMarker(popupInfo.type, popupInfo.index)}
                style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    width: '100%'
                }}
                onMouseOver={(e) => e.target.style.background = '#c82333'}
                onMouseOut={(e) => e.target.style.background = '#dc3545'}
            >
                🗑️ Delete {popupInfo.type === 'stop' ? 'Stop' : 'Marker'}
            </button>
        </div>
    )
} 