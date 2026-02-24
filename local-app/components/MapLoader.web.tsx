import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet';

let API_KEY = "apENJ0nZLlOgrNouOtre";
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function MapLoader(){
    return (
        <MapContainer
            center={[0, 0]}
            zoom={2}        
            style={{ height: '100%', width: '100%' }} 
        >
            <TileLayer
                url={map_path}
                maxZoom={19}
            />
        </MapContainer>
    )
}

export default MapLoader;