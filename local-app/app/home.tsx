import { View } from "react-native";
import { Button } from "react-native";
import Map from '../components/Map';
import { useState } from "react";

function Home() {
    let [tagMode, setTagMode] = useState(false)

    return (
        <View style={{ flex: 1 }}>
            <Map active={tagMode}/>
            <Button title="Press me" onPress={() => setTagMode(!tagMode)} />
        </View>
    );
}


export default Home;