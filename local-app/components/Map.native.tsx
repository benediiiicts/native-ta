import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Polyline, UrlTile, type Region } from "react-native-maps";

let API_KEY = process.env.EXPO_PUBLIC_API_KEY;
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

async function fetchOverpass(s: number, w: number, n: number, e: number) {
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
    } catch (error) {
        console.error("Failed to fetch from Overpass:", error);
        return [];
    }
}

function Map({ active, targetLocation=false, onRoadSelect }: {active: boolean; targetLocation?: any; onRoadSelect: any}) {
    let [road, setRoad] = useState<any[]>([]);
    let timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    let mapRef = useRef<MapView>(null)

    useEffect(()=>{
        if(!active){
            setRoad([])
            if(timeoutRef.current){
                clearTimeout(timeoutRef.current)
            }
        }
    }, [active])

    function handleRegionChange(region: Region) {
        if(active){
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(async () => {
                if (region.longitudeDelta > 0.03) {
                    setRoad([]);
                    return;
                }

                let north = region.latitude + (region.latitudeDelta / 2);
                let south = region.latitude - (region.latitudeDelta / 2);
                let west = region.longitude - (region.longitudeDelta / 2);
                let east = region.longitude + (region.longitudeDelta / 2);

                let roadData = await fetchOverpass(south, west, north, east);
                
                setRoad(roadData);
            }, 1000);
        }
        else{
            setRoad([])
        }
    };
    
    useEffect(()=>{
        if(active && mapRef.current){
            mapRef.current.animateToRegion({
                    latitude: -6.9175,
                    longitude: 107.6191,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
            }, 1000)
        }
    }, [active])

    useEffect(() => {
        if(targetLocation && targetLocation.latitude && targetLocation.longitude){
            mapRef.current?.animateToRegion({
                latitude: targetLocation.latitude,
                longitude: targetLocation.longitude,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            })
        }
    }, [targetLocation, mapRef])

    return (
        <View style={styles.wrapper}>
            <MapView 
                style={styles.map}
                onRegionChangeComplete={handleRegionChange}
                region={{
                    latitude: -6.9175,
                    longitude: 107.6191,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                ref={mapRef}
                >
                <UrlTile
                    urlTemplate={map_path}
                    zIndex={1}
                />
                
                {road.map((way) => {
                    if (!way.geometry) return null;

                    let coordinates = way.geometry.map((pos: any) => ({
                        latitude: pos.lat,
                        longitude: pos.lon
                    }));

                    return (
                        <Polyline
                            key={way.id}
                            coordinates={coordinates}
                            strokeColor="rgba(0, 100, 255, 0.6)"
                            strokeWidth={5}
                            zIndex={2}
                            tappable={true} 
                            onPress={(e) => {
                                if (e.nativeEvent.coordinate) {
                                    const clickedLat = e.nativeEvent.coordinate.latitude;
                                    const clickedLng = e.nativeEvent.coordinate.longitude;
                                    Alert.alert(`ID: ${way.id}\nKoordinat:\nLat:${clickedLat.toFixed(5)}\nLong:${clickedLng.toFixed(5)}`)
                                }
                            }}
                        />
                    );
                })}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
});

export default Map;