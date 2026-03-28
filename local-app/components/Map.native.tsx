import { View, StyleSheet } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

let API_KEY = "apENJ0nZLlOgrNouOtre";
let map_path = `https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.png?key=${API_KEY}`;

function Map(){
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Map;