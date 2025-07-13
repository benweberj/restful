import { useState } from 'react'
import styled from 'styled-components'

import SearchBar from './SearchBar'
import StopsList from './StopsList'

const CloseButton = styled.button`
    top: 10px;
    left: 110%;
    float: right;
`

// Floating menu component
export default function FloatingMenu({ toggles, setToggles, mapType, setMapType, manualMapType, setManualMapType, map, onAddStop, stops, onStopsChange, onOptimizeRoute, routeLegs, roundTrip, setRoundTrip, userLocation, routeInfo }) {
    const [open, setOpen] = useState(true)
    
    return (<>
        <div className={`floating-menu ${!open && 'closed'}`}>
            <button style={{ float: 'right' }} onClick={() => setOpen(false)}>Close</button>
            <div className="floating-menu-title">Map Options</div>
            <SearchBar
                map={map}
                onAddStop={onAddStop}
            />
            <StopsList
                stops={stops}
                onStopsChange={onStopsChange}
                onOptimizeRoute={onOptimizeRoute}
                routeLegs={routeLegs}
                map={map}
                roundTrip={roundTrip}
                setRoundTrip={setRoundTrip}
                userLocation={userLocation}
                routeInfo={routeInfo}
            />
            <div className="toggle-group">
                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="traffic-toggle"
                        checked={toggles.showTraffic}
                        onChange={e => setToggles(t => ({ ...t, showTraffic: e.target.checked }))}
                    />
                    <label htmlFor="traffic-toggle">Traffic</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="streets-toggle"
                        checked={toggles.showStreets}
                        onChange={e => setToggles(t => ({ ...t, showStreets: e.target.checked }))}
                    />
                    <label htmlFor="streets-toggle">Road/Street Names</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="places-toggle"
                        checked={toggles.showPlaces}
                        onChange={e => setToggles(t => ({ ...t, showPlaces: e.target.checked }))}
                    />
                    <label htmlFor="places-toggle">Places</label>
                </div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="areas-toggle"
                        checked={toggles.showAreas}
                        onChange={e => setToggles(t => ({ ...t, showAreas: e.target.checked }))}
                    />
                    <label htmlFor="areas-toggle">Areas (Towns/Provinces)</label>
                </div>

                <div className="toggle-divider"></div>

                <div className="toggle-item">
                    <input
                        type="checkbox"
                        id="satellite-toggle"
                        checked={mapType === 'hybrid'}
                        onChange={e => {
                            const newMapType = e.target.checked ? 'hybrid' : 'roadmap'
                            setMapType(newMapType)
                            setManualMapType(newMapType)
                        }}
                    />
                    <label htmlFor="satellite-toggle">Satellite</label>
                </div>
            </div>
        </div>

        <button onClick={() => setOpen(true)} style={{ position: 'absolute', top: 20, left: 20  }}>Open</button>
        </>
    )
} 