import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';

let API_KEY = process.env.EXPO_PUBLIC_API_KEY;
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function MapLoader({ active }: { active: boolean }){
    let [road, setRoad] = useState<any[]>([])

    useEffect(()=>{
        if(!active){
            setRoad([])
        }
    }, [active])

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
            <RegionTrack active={active} onRegionChange={setRoad}/>
            {road.map((way)=>{

                if(!way.geometry) return null

                let coordinates = way.geometry.map((pos: any) => [pos.lat, pos.lon]);

                console.log(coordinates)

                return (
                    <Polyline 
                        key={way.id}
                        positions={coordinates}
                        pathOptions={{ 
                            color: 'rgba(0, 100, 255, 0.6)', 
                            weight: 5 
                        }}
                        eventHandlers={{
                            click: (e) => {
                                let clickedLat = e.latlng.lat;
                                let clickedLng = e.latlng.lng;
                                alert(`ID: ${way.id}\nKoordinat:\nLat:${clickedLat.toFixed(5)}\nLong:${clickedLng.toFixed(5)}`);
                            }
                        }}
                    />
                )
            })}
        </MapContainer>
    )
}

async function fetchOverpass(s: number, w: number, n: number, e: number){
    console.log(s, w, n, e)
    let query = `
    [out:json][timeout:30];
    way["highway"](${s}, ${w}, ${n}, ${e});
    out geom;
    `;
    let url_overpass = `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        let response = await fetch(url_overpass);
        if (!response.ok) return []; 
        let data = await response.json();
        return data.elements || []; 
    }
    catch(error) {
        console.error("Failed to fetch from Overpass:", error);
        return [];
    }
}

//track region saat ini
function RegionTrack({ onRegionChange, active }: { onRegionChange: any; active: boolean }){
    let timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    let map = useMap()

    useEffect(()=>{
        if(active){
            map.setZoom(18, {animate: true})
        }
    }, [active, map])

    useMapEvents({
        moveend: (event) => {
            if(active){
                let map = event.target;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(async () => {
                    let bound = map.getBounds();
                    if (map.getZoom() < 16) {
                        console.log(map.getZoom())
                        onRegionChange([]);
                        return;
                    }

                    let regionBound = {
                        south: bound.getSouth(),
                        west: bound.getWest(),
                        north: bound.getNorth(),
                        east: bound.getEast(),
                    }

                    let roadsData = await fetchOverpass(regionBound.south, regionBound.west, regionBound.north, regionBound.east)
                    onRegionChange(roadsData)
                }, 1000)
            }
            else{
                onRegionChange([])
                if(timeoutRef.current){
                    clearTimeout(timeoutRef.current)
                }
                return
            }
        }
    })
    
    return null;
}

export default MapLoader;