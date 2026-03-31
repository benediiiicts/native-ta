import { View, Button, Platform} from "react-native";
import Map from '../components/Map';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import DetailModal from "../components/DetailModal";
import * as SecureStore from 'expo-secure-store';

async function getStorageValue(key: string){
    if (Platform.OS === 'web') {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Local storage is unavailable: ${error}`);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
}

function Home() {
    const tokenKey = 'userToken';

    let [tagMode, setTagMode] = useState(false)
    let [modalMode, setModalMode] = useState(false)
    let [isLogedIn, setisLogedIn] = useState(false)

    useEffect(() => {
        const checkLogin = async () => {
            const token = await getStorageValue(tokenKey)
            if(token) {
                setisLogedIn(true)
            }
        }

        checkLogin()
    }, [])

    async function handleLogout(){
        if(Platform.OS == 'web'){
            try{
                localStorage.removeItem(tokenKey)
            }
            catch(error){
                console.error(`Local storage error ${error}`)
                return null
            }
        }
        else{
            await SecureStore.deleteItemAsync(tokenKey)
        }
        setisLogedIn(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <Map active={tagMode}/>
            <Navbar login={isLogedIn} onLogout={handleLogout}/>
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