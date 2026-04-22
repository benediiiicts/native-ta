import { ActivityIndicator, Text, View, Button, Platform, Alert} from "react-native";
import Map from '../components/Map';
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Navbar from '../components/Navbar';
import DetailModal from "../components/Modals/DetailModal";
import AddTagModal from "@/components/Modals/AddTagModal";
import ConfirmModal from "@/components/Modals/ConfirmationModal";
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
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

    const [isLogedIn, setisLogedIn] = useState(false)

    //tags
    const [allTags, setAllTags] = useState<any[]>([])

    //state untuk modal konfirmasi
    const [confirmLocationVisible, setConfirmLocationVisible] = useState(false);
    const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

    //untuk modal warning
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));

    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [DetailModalVisible, setDetailModalVisible] = useState(false)
    const [searchLocation, setSearchLocation] = useState<any>(null)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)

    const [pickedLocation, setPickedLocation] = useState<any>(null)
    const [tempLocation, setTempLocation] = useState<any>(null)

    //untuk tracking lokasi saat ini
    const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(true)

    useEffect(() => {
        const checkLogin = async () => {
            const token = await getStorageValue(tokenKey)
            if(token) {
                setisLogedIn(true)
            }
        }

        checkLogin()
    }, [])

    useEffect(() => {
        loadAllTags()
    }, [])

    useEffect(() => {
        getUserLocation();
    }, []);

    async function getUserLocation(){
        setIsLocating(true)
        try{
            let {status} = await Location.requestForegroundPermissionsAsync()
            if(status !== 'granted'){
                setLocationError('Izin akses lokasi ditolak. Beberapa fitur mungkin tidak berfungsi optimal.');
                showWarning("Izin ditolak", "Aplikasi membutuhkan akses lokasi untuk fitur pelaporan.")
                setIsLocating(false)
                return
            }
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            })

            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            })

            setLocationError(null)
        }
        catch(error){
            console.error(`Gagal mendapatkan lokasi: ${error}`)
            setLocationError('Gagal mendapatkan lokasi GPS Anda.');
        }
        finally{
            setIsLocating(false)
        }
    }

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

    async function loadAllTags(){
        try{
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/fetch-all`
            const response = await fetch(apiUrl)
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setAllTags(jsonResponse.data)
            }
        }
        catch(error){
            console.error(`Gagal memuat data tag: ${error}`)
        }
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

    function handleSelectTag(tag: any){
        setSelectedTagId(tag.id)
        setDetailModalVisible(true)
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
            {currentLocation ? (
                <Map 
                    active={isSelectingLocation} 
                    targetLocation={searchLocation} 
                    onRoadSelect={handlePickLocation}
                    tags={allTags}
                    onTagSelect={handleSelectTag}
                    currentUserLocation={currentLocation} 
                />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={{ marginTop: 10, color: '#6B7280' }}>
                        {locationError ? locationError : "Mencari lokasi Anda..."}
                    </Text>
                </View>
            )}
            <Map 
                active={isSelectingLocation} 
                targetLocation={searchLocation} 
                onRoadSelect={handlePickLocation}
                tags={allTags}
                onTagSelect={handleSelectTag}
                currentUserLocation={currentLocation}
            />
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
                
            </View>
            <AddTagModal
                visible={addModalVisible}
                onClose={() => {
                    setAddModalVisible(false)
                    setPickedLocation(null)
                }}
                onPickLocation={selectLocation}
                selectedLocation={pickedLocation}
                onTagAdded={loadAllTags}
                currentUserLocation={currentLocation}
                onSetLocation={setPickedLocation}
            />
            <DetailModal
                visible={DetailModalVisible}
                onClose={() => {
                    setDetailModalVisible(!DetailModalVisible)
                    setSelectedTagId(null)
                }}
                tagId={selectedTagId}
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