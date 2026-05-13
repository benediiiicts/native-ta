import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Modal, FlatList, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, UrlTile, type Region } from "react-native-maps";
import styles from "@/styles/Map.native.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

let API_KEY = process.env.EXPO_PUBLIC_API_KEY;
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

async function fetchOverpass(s: number, w: number, n: number, e: number) {
    console.log(s, w, n, e)
    // let query = `
    //     [out:json][timeout:30];
    //     way["highway"](${s}, ${w}, ${n}, ${e});
    //     out geom;z
    // `;
    // let url_overpass = `https://overpass.private.coffee/api/interpreter?data=${encodeURIComponent(query)}`;

    // try {
    //     let response = await fetch(url_overpass);
    //     if (!response.ok) return []; 
    //     let data = await response.json();
    //     return data.elements || [];
    // } catch (error) {
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

function Map({ active, targetLocation=false, onRoadSelect, tags = [], onTagSelect, currentUserLocation }: {active: boolean; targetLocation?: any; onRoadSelect: any; tags?: any[]; onTagSelect: any; currentUserLocation: {latitude: number, longitude: number}}) {
    let [road, setRoad] = useState<any[]>([]);
    let [currentZoom, setCurrentZoom] = useState<number>(14);
    let timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    //untuk grouping tag
    const [stackedTagsModal, setStackedTagsModal] = useState<{visible: boolean, tags: any[]}>({visible: false, tags: []});
    let mapRef = useRef<MapView>(null)
    let currentRegionRef = useRef<Region | null>(null)

    useEffect(()=>{
        if(!active){
            setRoad([])
            if(timeoutRef.current){
                clearTimeout(timeoutRef.current)
            }
        }
    }, [active])

    function handleRegionChange(region: Region) {
        //untuk track zoom saat ini
        currentRegionRef.current = region
        const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
        setCurrentZoom(zoom);
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

    function checkRadius(lat1: number, lon1: number, lat2: number, lon2: number){
        const earthRadius = 6371000
        const p1 = lat1 * Math.PI / 180
        const p2 = lat2 * Math.PI / 180
        const dp = (lat2 - lat1) * Math.PI / 180
        const dl = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
                Math.cos(p1) * Math.cos(p2) *
                Math.sin(dl / 2) * Math.sin(dl / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return earthRadius * c
    }
    
    useEffect(()=>{
        if(active && mapRef.current){
            const targetLat = currentRegionRef.current ? currentRegionRef.current.latitude : currentUserLocation.latitude;
            const targetLon = currentRegionRef.current ? currentRegionRef.current.longitude : currentUserLocation.longitude;

            mapRef.current.animateToRegion({
                    latitude: targetLat,
                    longitude: targetLon,
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
    
    const visibleTags = tags.filter((tag)=>{
        const rc = tag.roadClass?.toLowerCase() || 'unclassified';
        if (currentZoom < 12) {
            return false
        }
        else if (currentZoom < 14) {
            return ['motorway', 'trunk', 'primary'].includes(rc)
        } else if (currentZoom < 16) {
            return ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(rc)
        }
        return true
    })

    const maxDistance = 10 //meter
    const groupedTags: any[][] = []

    visibleTags.forEach((tag) => {
        let addedToGroup = false
        for(let i = 0; i < groupedTags.length; i++){
            const group = groupedTags[i]
            const centerTag = group[0]

            const distance = checkRadius(
                parseFloat(tag.latitude),
                parseFloat(tag.longitude),
                parseFloat(centerTag.latitude),
                parseFloat(centerTag.longitude)
            )

            if(distance <= maxDistance){
                group.push(tag)
                addedToGroup = true
                break;
            }
        }
        if(!addedToGroup){
            groupedTags.push([tag])
        }
    })

    return (
        <View style={styles.wrapper}>
            <MapView 
                style={styles.map}
                onRegionChangeComplete={handleRegionChange}
                initialRegion={{
                    latitude: currentUserLocation.latitude,
                    longitude: currentUserLocation.longitude,
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

                    let roadName = 'Unknown';
                    let roadClass = 'Unclassified'
                    if(way.tags){
                        if(way.tags.name){
                            roadName = way.tags.name   
                        }
                        if(way.tags.highway){
                            roadClass = way.tags.highway;
                        }
                    }

                    return (
                        <Polyline
                            key={way.id}
                            coordinates={coordinates}
                            strokeColor="rgba(0, 100, 255, 0.6)"
                            strokeWidth={5}
                            zIndex={2}
                            tappable={true} 
                            onPress={(e) => {
                                if (active && onRoadSelect) {
                                    onRoadSelect({
                                        id: way.id,
                                        name: roadName,
                                        roadClass: roadClass,
                                        latitude: e.nativeEvent.coordinate?.latitude,
                                        longitude: e.nativeEvent.coordinate?.longitude
                                    })
                                }
                            }}
                        />
                    );
                })}

                {groupedTags.map((group: any[], index)=>{
                    const isStacked = group.length > 1
                    const firstTag = group[0]

                    return(
                        <Marker
                            style={{zIndex: 2}}
                            key={`group_${index}`}
                            coordinate={{
                                latitude: parseFloat(firstTag.latitude),
                                longitude: parseFloat(firstTag.longitude),
                            }}
                            pinColor={isStacked? "yellow" : "red"}
                            title={isStacked ? `${group.length} Laporan` : (firstTag.issueType || firstTag.issue_type)}
                            description={isStacked ? "Tekan untuk melihat daftar" : "Klik untuk melihat detail"}
                            onPress={()=>{
                                if(isStacked){
                                    setStackedTagsModal({ visible: true, tags: group })
                                }
                                else{
                                    onTagSelect(firstTag)
                                }
                            }}
                        />
                    )
                })}
                
                {targetLocation && targetLocation.latitude && targetLocation.longitude && (
                    <Marker
                        style={{zIndex: 1}}
                        coordinate={{
                            latitude: parseFloat(targetLocation.latitude),
                            longitude: parseFloat(targetLocation.longitude),
                        }}
                        pinColor="blue"
                        title="Titik Pilihan"
                        description={targetLocation.name || ''}
                    />
                )}
                
                {/* {visibleTags.map((tag)=>{
                    return (
                        <Marker
                            key={tag.id}
                            coordinate={{
                                latitude: parseFloat(tag.latitude),
                                longitude: parseFloat(tag.longitude),
                            }}
                            title={tag.issueType || tag.issue_type}
                            description="Klik untuk melihat detail"
                            onPress={() => onTagSelect(tag)}
                        />
                    );
                })} */}
            </MapView>

            <Modal
                visible={stackedTagsModal.visible}
                transparent={true}
                animationType="slide"
                onRequestClose={()=>{
                    setStackedTagsModal({visible: false, tags: []})
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {stackedTagsModal.tags.length} Laporan di Titik Ini
                            </Text>
                            <TouchableOpacity onPress={() => setStackedTagsModal({visible: false, tags: []})}>
                                <Ionicons name="close-circle" size={28} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={stackedTagsModal.tags}
                            keyExtractor={(item, idx) => `${item.id}_${idx}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.clusterItem}
                                    onPress={() => {
                                        setStackedTagsModal({visible: false, tags: []}); 
                                        onTagSelect(item);
                                    }}
                                >
                                    <View style={styles.itemIcon}>
                                        <Ionicons name="warning" size={24} color="#EF4444" />
                                    </View>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemTitle}>{item.issueType || item.issue_type}</Text>
                                        <Text style={styles.itemSubtitle}>Ketuk untuk melihat detail</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default Map;