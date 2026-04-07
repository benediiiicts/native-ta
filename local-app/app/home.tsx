import { View, Button, Platform, Alert} from "react-native";
import Map from '../components/Map';
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Navbar from '../components/Navbar';
import DetailModal from "../components/Modals/DetailModal";
import AddTagModal from "@/components/Modals/AddTagModal";
import ConfirmModal from "@/components/Modals/ConfirmationModal";
import * as SecureStore from 'expo-secure-store';
import WarningModal from "@/components/Modals/WarningModal";

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
    const router = useRouter()
    const tokenKey = 'userToken';

    let [isLogedIn, setisLogedIn] = useState(false)

    //state untuk modal konfirmasi
    let [confirmLocationVisible, setConfirmLocationVisible] = useState(false);
    let [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

    //untuk modal warning
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));

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

    function showWarning(title: string, message: string, onConfirmAction?: () => void){
        setWarningTitle(title);
        setWarningMessage(message);

        if (onConfirmAction) {
            setWarningOnConfirm(() => () => {
                setWarningVisible(false)
                onConfirmAction() 
            });
        } else {
            setWarningOnConfirm(() => () => setWarningVisible(false))
        }
        
        setWarningVisible(true)
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
        console.log('Masuk function handlePickLocation')
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

    function handleNotLoggedIn(){
        showWarning(
            'Anda belum login', 
            'Login/ register untuk melakukan aksi', 
            () => router.push('/login')
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Map active={isSelectingLocation} targetLocation={searchLocation} onRoadSelect={handlePickLocation}/>
            {isSelectingLocation? (
                <Navbar 
                    login={isLogedIn} 
                    onLogout={() => setConfirmLogoutVisible(true)} 
                    onSearchResults={handleLocationSearch}
                    onPickLocationMode={true}
                />
            ):(
                <Navbar 
                    login={isLogedIn} 
                    onLogout={() => setConfirmLogoutVisible(true)} 
                    onSearchResults={handleLocationSearch}
                    onPickLocationMode={false}
                />
            )}
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                {isSelectingLocation? (
                    <Button
                        title="Cancel"
                        onPress={()=>{
                            setIsSelectingLocation(false)
                            setAddModalVisible(false)
                        }}
                    />
                ):(
                    <Button
                        title="Add Tag"
                        onPress={()=>{
                            (isLogedIn? setAddModalVisible(true): handleNotLoggedIn())
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
            <WarningModal
                visible={warningVisible}
                title={warningTitle}
                message={warningMessage}
                confirmText="Login"
                onConfirm={warningOnConfirm}
                onCancel={() => setWarningVisible(false)}
            />
        </View>
    );
}


export default Home;