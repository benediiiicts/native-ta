import { Text, View } from "react-native";
import { lazy, Suspense } from "react";

const MapLoader = lazy(() => import('./MapLoader.web'));

function Map({ active }: { active: boolean }){
    return(
        <View style={{ flex: 1 }}>
            <Suspense fallback={<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading Map...</Text></View>}>
                <MapLoader active={active}/>
            </Suspense>
        </View>
    )
}

export default Map;