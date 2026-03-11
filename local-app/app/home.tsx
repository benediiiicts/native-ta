import { View, Button} from "react-native";
import Map from '../components/Map';
import { useState } from "react";
import Navbar from '../components/Navbar';

function Home() {
    let [tagMode, setTagMode] = useState(false)

    return (
        <View style={{ flex: 1 }}>
            <Map active={tagMode}/>
            <Navbar />
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                <Button 
                    title={tagMode ? "Cancel" : "Add tag"} 
                    onPress={() => setTagMode(!tagMode)} 
                />
            </View>
        </View>
    );
}


export default Home;