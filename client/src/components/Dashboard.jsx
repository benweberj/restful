import styled from 'styled-components'
import Map from './Map/Map'

const DashboardContainer = styled.div`
    height: 100%;
`

export default function Dashboard() {
    return (
        <DashboardContainer>
            <Map />
        </DashboardContainer>
    )
}