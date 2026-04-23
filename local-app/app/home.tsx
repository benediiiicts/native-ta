import { TouchableOpacity, ScrollView, ActivityIndicator, Text, View, Button, Platform, Alert} from "react-native";
import Map from '../components/Map';
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Navbar from '../components/Navbar';
import DetailModal from "../components/Modals/DetailModal";
import AddTagModal from "@/components/Modals/AddTagModal";
import ConfirmModal from "@/components/Modals/ConfirmationModal";
import UserProfileModal from "@/components/Modals/UserProfileModal";
import WarningModal from "@/components/Modals/WarningModal";
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

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

const TAG_CATEGORIES = [
        'Semua', 
        'Jalan Rusak', 
        'Fasilitas Jalan Rusak', 
        'Genangan Air / Banjir', 
        'Hambatan Jalan', 
        'Kecelakaan Lalu Lintas',
        'Penutupan / Proyek Jalan'
    ];

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
    const [warningConfirmText, setWarningConfirmText] = useState("")
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));

    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [DetailModalVisible, setDetailModalVisible] = useState(false)
    const [searchLocation, setSearchLocation] = useState<any>(null)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)

    const [pickedLocation, setPickedLocation] = useState<any>(null)
    const [tempLocation, setTempLocation] = useState<any>(null)

    //state untuk filter tag
    const [activeFilter, setActiveFilter] = useState<string>('Semua')

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
                showWarning("Izin ditolak", "Aplikasi membutuhkan akses lokasi untuk fitur pelaporan.", "OK")
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

    function showWarning(title: string, message: string, confirmText: string, onConfirmAction?: () => void){
        setWarningTitle(title);
        setWarningMessage(message);
        setWarningConfirmText(confirmText)

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
        setSearchLocation(roadData)
    }

    function handleConfirmLocation(){
        setPickedLocation(tempLocation)
        setConfirmLocationVisible(false)
        setAddModalVisible(true)
        setIsSelectingLocation(false)
        setSearchLocation(null)
    }

    function handleCancelLocation(){
        setTempLocation(null)
        setConfirmLocationVisible(false)
        setIsSelectingLocation(true)
        setSearchLocation(null)
    }

    function handleNotLoggedIn(){
        showWarning(
            'Anda belum login', 
            'Login/ register untuk melakukan aksi', 
            'Login',
            () => router.push('/login')
        )
    }

    const displayedTags = allTags.filter((tag)=>{
        if(activeFilter == 'Semua') return true
        return tag.issueType === activeFilter || tag.issue_type === activeFilter;
    })

    return (
        <View style={{ flex: 1 }}>
            {currentLocation ? (
                <Map 
                    active={isSelectingLocation} 
                    targetLocation={searchLocation} 
                    onRoadSelect={handlePickLocation}
                    tags={displayedTags}
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
            {isSelectingLocation? (
                <Navbar 
                    login={isLogedIn} 
                    onLogout={() => setConfirmLogoutVisible(true)} 
                    onSearchResults={handleLocationSearch}
                    onPickLocationMode={true}
                    currentUserLocation={currentLocation}
                />
            ):(
                <Navbar 
                    login={isLogedIn} 
                    onLogout={() => setConfirmLogoutVisible(true)} 
                    onSearchResults={handleLocationSearch}
                    onPickLocationMode={false}
                    currentUserLocation={currentLocation}
                />
            )}
            {!isSelectingLocation && (
                <View style={{ position: 'absolute', top: 70, left: 0, right: 0, zIndex: 10 }}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
                    >
                        {TAG_CATEGORIES.map((category, index)=>{
                            const isActive = activeFilter === category
                            return(
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        backgroundColor: isActive ? '#3B82F6' : '#FFFFFF',
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        marginRight: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 3.84,
                                        elevation: 5, 
                                        borderWidth: isActive ? 0 : 1,
                                        borderColor: '#E5E7EB'
                                    }}
                                    onPress={() => setActiveFilter(category)}
                                >
                                    <Text style={{ 
                                        color: isActive ? '#FFFFFF' : '#4B5563', 
                                        fontWeight: '600', 
                                        fontSize: 13 
                                    }}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            )}
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                {isSelectingLocation ? (
                    <>
                        <View style={{ marginHorizontal: 5 }}>
                            <Button
                                title="Batal"
                                color="#EF4444"
                                onPress={()=>{
                                    setIsSelectingLocation(false)
                                    setAddModalVisible(false)
                                    setTempLocation(null)
                                    setSearchLocation(null)
                                }}
                            />
                        </View>

                        {tempLocation && (
                            <View style={{ marginHorizontal: 5 }}>
                                <Button
                                    title="Konfirmasi Lokasi"
                                    color="#10B981"
                                    onPress={() => setConfirmLocationVisible(true)}
                                />
                            </View>
                        )}
                    </>
                ):(
                    <Button
                        title="Buat Laporan Baru"
                        onPress={()=>{
                            (isLogedIn ? setAddModalVisible(true) : handleNotLoggedIn())
                        }}
                    />
                )}
                
            </View>
            <AddTagModal
                visible={addModalVisible}
                onClose={() => {
                    setAddModalVisible(false)
                    setPickedLocation(null)
                    setSearchLocation(null)
                }}
                onPickLocation={selectLocation}
                selectedLocation={pickedLocation}
                onTagAdded={loadAllTags}
                currentUserLocation={currentLocation}
                onSetLocation={setPickedLocation}
                onPreviewLocation={(locData: any)=>{
                    setAddModalVisible(false)
                    setSearchLocation(locData)
                    setTempLocation(locData)
                    setIsSelectingLocation(true)
                }}
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
                confirmText={warningConfirmText}
                onConfirm={warningOnConfirm}
                onCancel={() => setWarningVisible(false)}
            />
        </View>
    );
}


export default Home;