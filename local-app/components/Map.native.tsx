import { View, StyleSheet } from "react-native";
import MapView, { UrlTile, type Region } from "react-native-maps";
import React from "react";

let API_KEY = "apENJ0nZLlOgrNouOtre";
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function Map(){
  let onRegionChange;

  return(
      <View style={styles.wrapper}>
          <MapView style={styles.map}>
              <UrlTile
                urlTemplate={map_path}
                zIndex={1}
              />
          </MapView>
      </View>
  )
}

async function fetchOverpass(s: number, w: number, n: number, e: number){
  let query = `
    [out:json][timeout:25];
    way["highway"](${s}, ${w}, ${n}, ${e});
    out geom;
  `;
  let url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
}

//untuk fetch koordinat (S, W, E, N)
async function RegionTrack(region: { latitude: number; latitudeDelta: number; longitude: number; longitudeDelta: number}){
  let north = region.latitude + (region.latitudeDelta / 2);
  let south = region.latitude - (region.latitudeDelta / 2);
  let west = region.longitude + (region.longitudeDelta / 2);
  let east = region.longitude - (region.longitudeDelta / 2);

}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Map;