import { View, Button, Platform, Alert} from "react-native";
import Map from '../components/Map';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import DetailModal from "../components/Modals/DetailModal";
import LogoutModal from "@/components/Modals/LogoutModal";
import AddTagModal from "@/components/Modals/AddTagModal";
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
    let [DetailModalMode, setDetailModalMode] = useState(false)
    let [isLogedIn, setisLogedIn] = useState(false)
    let [searchLocation, setSearchLocation] = useState<any>(null)
    let [logoutModalVisible, setLogoutModalVisible] = useState(false)
    let [isSelectingLocation, setIsSelectingLocation] = useState(false)
    let [addModalVisible, setAddModalVisible] = useState(false)
    let [pickedLocation, setPickedLocation] = useState<any>(null)

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
        setLogoutModalVisible(false)
    }

    function handleLocationSearch(data: any[]){
        if(data && data.length > 0){
            const location = data[0]
            setSearchLocation({
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                name: location.display_name
            })
            console.log("Lokasi Ditemukan:", location.display_name);
        }
        else{
            console.log("Street not found")
        }
    }

    function selectLocation(){
        setAddModalVisible(false)
        setIsSelectingLocation(true)
    }

    function handlePickLocation(roadData: any){
        if(!isSelectingLocation) return
        if(Platform.OS === 'web'){
            alert(
                
            )
        }
        else{
            Alert.alert(
                "Location confirmation",
                "Use this location?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Continue",
                        onPress: () => {
                            setPickedLocation(roadData)
                            setIsSelectingLocation(false)
                            setAddModalVisible(true)
                        }
                    }
                ]
            )
        }
        //pop up untuk konfirmasi lokasi yang dipilih 
    }

    return (
        <View style={{ flex: 1 }}>
            <Map active={isSelectingLocation} targetLocation={searchLocation} onRoadSelect={handlePickLocation}/>
            {isSelectingLocation && (
                <Navbar login={isLogedIn} onLogout={() => setLogoutModalVisible(true)} onSearchResults={handleLocationSearch}/>
            )}
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                {isSelectingLocation? (
                    <Button
                        title="Cancel"
                        onPress={()=>{
                            setIsSelectingLocation(false)
                            setAddModalVisible(true)
                        }}
                    />
                ):(
                    <Button
                        title="Add Tag"
                        onPress={()=>{
                            setAddModalVisible(false)
                        }}
                    />
                )}
                {!isSelectingLocation && (
                    <Button
                        title={DetailModalMode? "Close": "Tag details"}
                        onPress={() => setDetailModalMode(!DetailModalMode)}
                    />
                )}
            </View>
            <AddTagModal
                visible={tagMode}
                onClose={() => {setTagMode(!tagMode); return {}}}
                onPickLocation={selectLocation}
                selectedLocation={pickedLocation}
            />
            <DetailModal
                visible={DetailModalMode}
                onClose={() => setDetailModalMode(!DetailModalMode)}
            />
            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={handleLogout}
            />
        </View>
    );
}


export default Home;