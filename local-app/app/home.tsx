import { View, Button, Platform, Alert} from "react-native";
import Map from '../components/Map';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import DetailModal from "../components/Modals/DetailModal";
import LogoutModal from "@/components/Modals/LogoutModal";
import AddTagModal from "@/components/Modals/AddTagModal";
import ConfirmModal from "@/components/Modals/ConfirmationModal";
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

    let [isLogedIn, setisLogedIn] = useState(false)

    //state untuk modal konfirmasi
    let [confirmLocationVisible, setConfirmLocationVisible] = useState(false);
    let [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

    let [DetailModalMode, setDetailModalMode] = useState(false)
    let [searchLocation, setSearchLocation] = useState<any>(null)
    let [isSelectingLocation, setIsSelectingLocation] = useState(false)
    let [addModalVisible, setAddModalVisible] = useState(false)

    let [pickedLocation, setPickedLocation] = useState<any>(null)
    let [tempLocation, setTempLocation] = useState<any>(null)

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
        setConfirmLogoutVisible(false)
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
        setTempLocation(roadData)
        setConfirmLocationVisible(true)
    }

    function handleConfirmLocation(){
        setPickedLocation(tempLocation)
        setConfirmLocationVisible(false)
        setAddModalVisible(true)
        setIsSelectingLocation(false)
    }

    function handleCancelLocation(){
        setTempLocation(null)
        setConfirmLocationVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <Map active={isSelectingLocation} targetLocation={searchLocation} onRoadSelect={handlePickLocation}/>
            {isSelectingLocation && (
                <Navbar login={isLogedIn} onLogout={() => setConfirmLocationVisible(true)} onSearchResults={handleLocationSearch}/>
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
                visible={addModalVisible}
                onClose={() => {setAddModalVisible(false)}}
                onPickLocation={selectLocation}
                selectedLocation={pickedLocation}
            />
            <DetailModal
                visible={DetailModalMode}
                onClose={() => setDetailModalMode(!DetailModalMode)}
            />
            <ConfirmModal
                visible={confirmLocationVisible}
                title="Gunakan lokasi ini?"
                message={`Lokasi: ${tempLocation?.name} dipilih.\nGunakan lokasi ini?`}
                confirmText="Ya, gunakan"
                isDestructive={true}
                onConfirm={handleConfirmLocation}
                onCancel={handleCancelLocation}
            />
            <ConfirmModal
                visible={confirmLogoutVisible}
                title="Konfirmasi Keluar"
                message="Apakah Anda yakin ingin keluar dari akun ini?"
                confirmText="Keluar"
                isDestructive={true}
                onConfirm={handleLogout}
                onCancel={()=>setConfirmLogoutVisible(false)}
            />
        </View>
    );
}


export default Home;