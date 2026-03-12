import { View, Button} from "react-native";
import Map from '../components/Map';
import { useState } from "react";
import Navbar from '../components/Navbar';
import DetailModal from "../components/DetailModal";

function Home() {
    let [tagMode, setTagMode] = useState(false)
    let [modalMode, setModalMode] = useState(false)

    return (
        <View style={{ flex: 1 }}>
            <Map active={tagMode}/>
            <Navbar />
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                <Button 
                    title={tagMode ? "Cancel" : "Add tag"} 
                    onPress={() => setTagMode(!tagMode)} 
                />
                <Button
                    title={modalMode? "Close": "Tag details"}
                    onPress={() => setModalMode(!modalMode)}
                />
            </View>
            <DetailModal
                visible={modalMode}
                onClose={() => setModalMode(!modalMode)}
            />
        </View>
    );
}


export default Home;