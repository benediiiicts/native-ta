import { Text, View } from "react-native";
import { lazy, Suspense } from "react";

const MapLoader = lazy(() => import('./MapLoader.web'));

function Map({ active, targetLocation, onRoadSelect, tags=[] }: { active: boolean; targetLocation: any; onRoadSelect: any; tags?: any[] }){

    return(
        <View style={{ flex: 1 }}>
            <Suspense fallback={<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading Map...</Text></View>}>
                <MapLoader 
                    active={active} 
                    targetLocation={targetLocation} 
                    onRoadSelect={onRoadSelect}
                    tags={tags}
                />
            </Suspense>
        </View>
    )
}

export default Map;