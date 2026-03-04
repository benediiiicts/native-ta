import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

let API_KEY = "apENJ0nZLlOgrNouOtre";
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function MapLoader(){
    let [region, setRegion] = useState(null);

    return (
        <MapContainer
            //sementara menggunakan lokasi statik bandung
            //kedepannya akan ambil lokasi pengguna
            center={[-6.9175, 107.6191]}
            zoom={14}        
            style={{ height: '100%', width: '100%' }} 
        >
            <TileLayer
                url={map_path}
                maxZoom={19}
            />
            <RegionTracker onRegionChange={setRegion}/>
        </MapContainer>
    )
}

function fetchOverpass(){
    
}

//track region saat ini
function RegionTracker({ onRegionChange }: { onRegionChange: any }){
    useMapEvents({
        moveend: (event) => {
            let map = event.target;
            let bound = map.getBounds();
            
            let regionBound = {
                south: bound.getSouth(),
                west: bound.getWest(),
                north: bound.getNorth(),
                east: bound.getEast(),
            }

            onRegionChange(regionBound)
        }
    })
    
    return null;
}

export default MapLoader;