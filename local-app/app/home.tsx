import AddTagModal from "@/components/Modals/AddTagModal";
import ConfirmModal from "@/components/Modals/ConfirmationModal";
import NotificationModal from "@/components/Modals/NotificationModal";
import UserProfileModal from "@/components/Modals/UserProfileModal";
import WarningModal from "@/components/Modals/WarningModal";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Map from '../components/Map';
import DetailModal from "../components/Modals/DetailModal";
import Navbar from '../components/Navbar';

async function getStorageValue(key: string){
    let token = null
    if (Platform.OS === 'web') {
        try {
            token = localStorage.getItem(key);
        } catch (error) {
            console.error(`Local storage is unavailable: ${error}`);
            return null;
        }
    } else {
        token = await SecureStore.getItemAsync(key);
    }

    //cek jika token expire
    if(token){
        try{
            const decoded = jwtDecode(token)
            const currentTime = Date.now() / 1000

            if(decoded.exp && decoded.exp < currentTime){
                if(Platform.OS === 'web') localStorage.removeItem(key)
                else await SecureStore.deleteItemAsync(key)

                return null
            }
        }
        catch(error){
            console.error(`Gagal encoding token: ${error}`)
            return null
        }
    }

    return token
}

interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    role: string;
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

    const [isLogedIn, setIsLogedIn] = useState(false)
    const [myId, setMyId] = useState<number | null>(null);
    const [myRole, setMyRole] = useState<string | null>(null)

    //tags
    const [allTags, setAllTags] = useState<any[]>([])
    const [showHiddenTags, setShowHiddenTags] = useState(false);

    //fetch time untuk notifikasi
    const [lastFetchTime, setLastFetchTime] = useState<string>(() => new Date().toISOString());
    const [hasNewUpdates, setHasNewUpdates] = useState(false);

    //state untuk modal konfirmasi
    const [confirmLocationVisible, setConfirmLocationVisible] = useState(false);
    const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

    //untuk modal warning
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningConfirmText, setWarningConfirmText] = useState("")
    const [warningOnConfirm, setWarningOnConfirm] = useState<(() => void) | undefined>(undefined);

    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [DetailModalVisible, setDetailModalVisible] = useState(false)
    const [searchLocation, setSearchLocation] = useState<any>(null)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)

    const [pickedLocation, setPickedLocation] = useState<any>(null)
    const [tempLocation, setTempLocation] = useState<any>(null)

    //untuk profile
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(false);

    //report
    const [reportVisible, setReportVisible] = useState(false);
    const [reportTargetType, setReportTargetType] = useState<'User' | 'TagVersion' | 'Comment' | null>(null);
    const [reportTargetId, setReportTargetId] = useState<number | null>(null);
    const [reportTargetName, setReportTargetName] = useState<string>('')

    //notification
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);

    //state untuk filter tag
    const [activeFilter, setActiveFilter] = useState<string>('Semua')

    //untuk tracking lokasi saat ini
    const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isLocating, setIsLocating] = useState(true)

    useEffect(() => {
        async function checkLogin() {
            const token = await getStorageValue(tokenKey)
            if(token){
                const decoded: DecodedToken = jwtDecode(token)
                setIsLogedIn(true)
                setMyId(decoded.id)
                setMyRole(decoded.role)
            }
        }
        checkLogin()
    }, [])

    useEffect(() => {
        loadAllTags()
    }, [])

    useEffect(() => {
        getUserLocation();
    }, [])

    useEffect(()=>{
        loadAllTags()
    }, [showHiddenTags])

    useEffect(() => {
        if(!currentLocation || isSelectingLocation) return
        const checkUpdates = setInterval(async () => {
            try{
                const {latitude, longitude} = currentLocation
                const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/check-updates?lat=${latitude}&lon=${longitude}&lastFetch=${encodeURIComponent(lastFetchTime)}`;
                const response = await fetch(apiUrl)
                const jsonResponse = await response.json()
                if(jsonResponse.status == 200 && jsonResponse.data.hasUpdates){
                    setHasNewUpdates(true)
                }
            }
            catch(error){
                console.error(`Polling error: ${error}`)
            }
        }, 3*60*1000)

        return () => clearInterval(checkUpdates)

    }, [currentLocation, lastFetchTime, isSelectingLocation])

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
        setIsLogedIn(false)
        setConfirmLogoutVisible(false)
    }

    function handleOpenMyProfile(){
        setSelectedUserId(myId);
        setIsViewingOwnProfile(true);
        setProfileModalVisible(true);
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
            setWarningOnConfirm(undefined)
        }
        
        setWarningVisible(true)
    }

    async function loadAllTags(){
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/fetch-all?includeHidden=${showHiddenTags}`;
            const response = await fetch(apiUrl,{
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setAllTags(jsonResponse.data)
                setLastFetchTime(new Date().toISOString())
                setHasNewUpdates(false)
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
            <Navbar 
                login={isLogedIn} 
                onLogout={() => setConfirmLogoutVisible(true)} 
                onSearchResults={handleLocationSearch}
                onPickLocationMode={isSelectingLocation? true : false}
                currentUserLocation={currentLocation}
                onProfilePress={handleOpenMyProfile}
                userRole={myRole}
                onNotificationPress={() => setNotificationModalVisible(true)}
            />
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
            {hasNewUpdates && !isSelectingLocation && (
                <View style={{ position: 'absolute', top: 130, alignSelf: 'center', zIndex: 15 }}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: '#10B981',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 30,
                            flexDirection: 'row',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            elevation: 6
                        }}
                        onPress={() => loadAllTags()}
                    >
                        <Ionicons name="refresh-circle" size={24} color="white" style={{ marginRight: 6 }} />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                            Terdapat pembaruan laporan di sekitar anda. Refresh untuk melihat informasi terkini.
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 }}>
                {isSelectingLocation ? (
                    <>
                        <TouchableOpacity 
                            style={{ marginHorizontal: 5, borderRadius: 20, backgroundColor: "#EF4444", padding: 10, alignItems: 'center'}}
                            onPress={()=>{
                                setIsSelectingLocation(false)
                                setAddModalVisible(false)
                                setTempLocation(null)
                                setSearchLocation(null)
                            }}>
                                <Text style={{ color: 'white', marginLeft: 8, marginRight: 8, fontWeight: 'bold', fontSize: 14 }}>
                                    Batal
                                </Text>
                        </TouchableOpacity>

                        {tempLocation && (
                            <TouchableOpacity 
                                style={{ marginHorizontal: 5, borderRadius: 20, backgroundColor: '#10B981', padding: 10 }}
                                onPress={() => setConfirmLocationVisible(true)}>
                                <Text style={{ color: 'white', marginLeft: 8, marginRight: 8, fontWeight: 'bold', fontSize: 14 }}>
                                    Konfirmasi Lokasi
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ):(
                    <TouchableOpacity
                        style={{borderRadius: 20, backgroundColor: "#3c82e4", padding: 10}}
                        onPress={()=>{
                            (isLogedIn ? setAddModalVisible(true) : handleNotLoggedIn())
                        }}
                    >
                        <Text style={{ color: 'white', marginLeft: 8, marginRight: 8, fontWeight: 'bold', fontSize: 14 }}>
                            Buat Laporan Baru
                        </Text>
                    </TouchableOpacity>
                )}
                {!isSelectingLocation && (
                    <TouchableOpacity
                        style={{
                            borderRadius: 20, 
                            backgroundColor: "#3c82e4", 
                            padding: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 10
                        }}
                        onPress={()=>{
                            setSearchLocation({
                                ...currentLocation,
                                _timestamp: new Date().getTime()
                            })
                        }}
                    >
                        <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#ffffff" />
                        <Text style={{ color: 'white', marginLeft: 4, marginRight: 8, fontWeight: 'bold', fontSize: 14 }}>
                            Lokasi saya
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Jika admin, tunjukkan tombol show hidden tags */}
            {myRole === 'admin' && isLogedIn && !isSelectingLocation && (
                <TouchableOpacity 
                    onPress={() => setShowHiddenTags(!showHiddenTags)}
                    style={{
                        position: 'absolute', bottom: 100, right: 20, 
                        backgroundColor: showHiddenTags ? '#EF4444' : '#4B5563',
                        padding: 10, borderRadius: 30, elevation: 5, flexDirection: 'row', alignItems: 'center'
                    }}
                >
                    <Ionicons name={showHiddenTags ? "eye" : "eye-off"} size={20} color="white" />
                    <Text style={{ color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 12 }}>
                        {showHiddenTags ? "Mode Admin: Tampilkan Semua Tag" : "Mode Admin: Sembunyikan Hidden Tag"}
                    </Text>
                </TouchableOpacity>
            )}
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
                currentUserId={myId}
                userRole={myRole}
                onTagUpdated={loadAllTags}
            />
            <UserProfileModal
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                userId={selectedUserId}
                isAdmin={myRole === 'admin'}
                isOwnProfile={isViewingOwnProfile}
                onProfileUpdated={loadAllTags}
                onReportPress={(id, name) => {
                    setReportTargetType('User');
                    setReportTargetId(id);
                    setReportTargetName(name);
                    setReportVisible(true);
                }}
            />
            <NotificationModal 
                visible={notificationModalVisible} 
                onClose={() => setNotificationModalVisible(false)} 
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