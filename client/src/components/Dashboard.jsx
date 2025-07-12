import styled from 'styled-components'
import Map from './Map'

const DashboardContainer = styled.div`
    height: 100%;
    border: 2px solid red;
`

export default function Dashboard() {
    return (
        <DashboardContainer>
            <Map />
        </DashboardContainer>
    )
}