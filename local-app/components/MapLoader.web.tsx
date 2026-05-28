// import localOverpassData from '@/assets/bandung_raya.json';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

let DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let API_KEY = process.env.EXPO_PUBLIC_API_KEY;
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function MapLoader({ active, targetLocation=false, onRoadSelect, tags=[], onTagSelect, currentUserLocation}: { active: boolean; targetLocation?: any; onRoadSelect: any; tags?: any[]; onTagSelect: any; currentUserLocation: {latitude: number, longitude: number}}){
    let [road, setRoad] = useState<any[]>([])
    let [currentZoom, setCurrentZoom] = useState<number>(14);

    useEffect(()=>{
        if(!active){
            setRoad([])
        }
    }, [active])

    const visibleTags = tags.filter((tag)=>{
        const rc = tag.roadClass?.toLowerCase() || 'unclassified';
        
        if (currentZoom < 12) {
            return false;
        }
        else if (currentZoom < 14) {
            return ['motorway', 'trunk', 'primary'].includes(rc);
        } else if (currentZoom < 16) {
            return ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(rc);
        }
        return true;
    })

    return (
        <MapContainer
            //ambil lokasi pengguna
            center={[currentUserLocation?.latitude, currentUserLocation?.longitude]}
            zoom={14}        
            style={{ height: '100%', width: '100%' }} 
        >
            <TileLayer
                url={map_path}
                maxZoom={19}
            />
            <SearchRegionTrack targetLocation={targetLocation}/>
            <RegionTrack active={active} onRegionChange={setRoad} onZoomChange={setCurrentZoom}/>
            {road.map((way)=>{

                if(!way.geometry) return null

                let coordinates = way.geometry.map((pos: any) => [pos.lat, pos.lon]);

                let roadName = 'Unknown'
                let roadClass = 'Unclassified'
                if(way.tags){
                    if(way.tags.highway){
                        roadClass = way.tags.highway
                    }
                }
                // console.log(coordinates)

                return (
                    <Polyline 
                        key={way.id}
                        positions={coordinates}
                        pathOptions={{ 
                            color: 'rgba(0, 100, 255, 0.6)', 
                            weight: 10,
                            interactive: true 
                        }}
                        eventHandlers={{
                            click: async (e) => {
                                const lat = e.latlng.lat
                                const lon = e.latlng.lng
                                let fetchedRoadName = 'Unknown'

                                try{
                                    const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com'
                                    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&email=${userEmail}`
                        
                                    let requestHeaders: any = {
                                        'Accept': 'application/json'
                                    }
                                    
                                    const response = await fetch(apiUrl, {
                                        headers: requestHeaders
                                    })
                                    const jsonResponse = await response.json()
                                    
                                    if(jsonResponse && jsonResponse.address){
                                        fetchedRoadName = jsonResponse.address.road || jsonResponse.address.neighbourhood || jsonResponse.address.village || jsonResponse.address.town || "Unknown";
                                    }
                                }
                                catch(error){
                                    console.error(`Error while fetching road name: ${error}`)
                                }
                                
                                console.log("Garis jalan ditekan!", fetchedRoadName);
                                if(onRoadSelect){
                                    onRoadSelect({
                                        id: way.id,
                                        name: fetchedRoadName,
                                        roadClass: roadClass,
                                        latitude: lat,
                                        longitude: lon
                                    })
                                }
                            }
                        }}
                    />
                )
            })}
            {targetLocation && targetLocation.latitude && targetLocation.longitude && (
                <Marker
                    position={[parseFloat(targetLocation.latitude), parseFloat(targetLocation.longitude)]}
                >
                    <Popup>
                        <b>Titik Pilihan</b> <br/>
                        {targetLocation.name || ""}
                    </Popup>
                </Marker>
            )}
            
            <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
            >
                {visibleTags.map((tag)=>{
                    return(
                        <Marker
                            key={tag.id}
                            position={[parseFloat(tag.latitude), parseFloat(tag.longitude)]}
                            icon={redIcon}
                        >
                            <Popup>
                                <div 
                                    onClick={() => onTagSelect(tag)} 
                                    style={{ cursor: 'pointer' }}
                                >
                                    <b>{tag.issueType || tag.issue_type}</b> <br />
                                    Klik untuk melihat detail.
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MarkerClusterGroup>
        </MapContainer>
    )
}

async function fetchOverpass(s: number, w: number, n: number, e: number){
    console.log(s, w, n, e)
    // let query = `
    // [out:json][timeout:30];
    // way["highway"](${s}, ${w}, ${n}, ${e});
    // out geom;
    // `;
    // let url_overpass = `https://overpass.private.coffee/api/interpreter?data=${encodeURIComponent(query)}`;

    // try {
    //     let response = await fetch(url_overpass);
    //     if (!response.ok) return []; 
    //     let data = await response.json();
    //     return data.elements || []; 
    // }
    // catch(error) {
    //     console.error("Failed to fetch from Overpass:", error);
    //     return [];
    // }
    const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/roads?s=${s}&w=${w}&n=${n}&e=${e}`
    try{
        const response = await fetch(apiUrl)
        if(!response.ok) return []
        const jsonResponse = await response.json()
        return jsonResponse
    }
    catch(error){
        console.error(`Gagal mengambil data jalan: ${error}`)
        return []
    }
}

function SearchRegionTrack({targetLocation}: {targetLocation: any}){
    let map = useMap()
    useEffect(() => {
        if(targetLocation && targetLocation.latitude && targetLocation.longitude){
            map.setView([targetLocation.latitude, targetLocation.longitude], 18, {animate: true})
        }
    }, [targetLocation, map])
    return null
}

//track region saat ini
function RegionTrack({ onRegionChange, active, onZoomChange }: { onRegionChange: any; active: boolean; onZoomChange: (z: number) => void }){
    let timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    let map = useMap()

    useEffect(()=>{
        if(active){
            map.setZoom(19, {animate: true})
        }
    }, [active, map])

    useMapEvents({
        moveend: (event) => {
            onZoomChange(map.getZoom());
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

                    let roadData = await fetchOverpass(regionBound.south, regionBound.west, regionBound.north, regionBound.east)
                    onRegionChange(roadData)
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