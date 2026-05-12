import WarningModal from "@/components/Modals/WarningModal";
import styles from "@/styles/AddTagModal.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import ConfirmModal from "./ConfirmationModal";
import { jwtDecode } from "jwt-decode";

interface AddTagModalProps {
    visible: boolean;
    onClose: () => void;
    onPickLocation: () => void;
    selectedLocation: any;
    onTagAdded?: () => void;
    currentUserLocation: {latitude: number, longitude: number} | null
    onSetLocation: (location: any) => void
    onPreviewLocation: (location: any) => void
}

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

export const TAG_TYPES = [
    'Jalan Rusak',           
    'Kerusakan Fasilitas', 
    'Genangan Air / Banjir', 
    'Hambatan Jalan',        
    'Kecelakaan Lalu Lintas',
    'Penutupan / Proyek Jalan'
];

function AddTagModal({ visible, onClose, onPickLocation, selectedLocation, onTagAdded, currentUserLocation, onSetLocation, onPreviewLocation }: AddTagModalProps) {
    const tokenKey = 'userToken';
   
    const [description, setDescription] = useState("");
    const [tempImages, setTempImages] = useState<any[]>([])
    const [tagType, setTagType] = useState('')
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    //untuk modals
    const [confirmForceCreate, setConfirmForceCreate] = useState(false);
    
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningConfirmText, setWarningConfirmText] = useState("OK");
    const [warningOnConfirm, setWarningOnConfirm] = useState<(() => void) | undefined>(undefined);
    
    function showWarning(title: string, message: string, onConfirmAction?: () => void, confirmText: string = "OK"){
        setWarningTitle(title);
        setWarningMessage(message);
        setWarningConfirmText(confirmText)

        if (onConfirmAction) {
            setWarningOnConfirm(() => () => {
                setWarningVisible(false); 
                onConfirmAction();
            });
        } else {
            setWarningOnConfirm(undefined);
        }
        
        setWarningVisible(true);
    }

    let locationText = "Pilih lokasi dari peta...";
    if (selectedLocation) {
        locationText = selectedLocation.name ? selectedLocation.name : "Lokasi terpilih";
    }
    
    async function pickImage(){
        try{
            if (tempImages.length >= 3) {
                showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
                return;
            }

            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if(!permissionResult.granted){
                showWarning('Izin Diperlukan', 'Izin untuk mengakses galeri media diperlukan untuk mengunggah foto.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                allowsMultipleSelection: true,
                selectionLimit: 3 - tempImages.length,
                quality: 0.8,
            })

            if (!result.canceled) {
                const selectedFiles = result.assets;
                const validImages = selectedFiles.filter(file => {
                    const mimeType = file.mimeType || 'image/jpeg';
                    return mimeType.startsWith('image/');
                });

                if (validImages.length !== selectedFiles.length) {
                    showWarning("File Ditolak", "Beberapa file ditolak karena format tidak didukung.");
                }
                setTempImages([...tempImages, ...validImages]);
            }
        }
        catch(error){
            console.error(error);
            showWarning("Gagal Membuka File", "Terjadi kesalahan saat memproses file. Pastikan Anda hanya memilih file berupa gambar.")
        }
    }

    async function takePhoto(){
        try{
            if (tempImages.length >= 3) {
                showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
                return;
            }
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
            if(!permissionResult.granted){
                showWarning('Izin Diperlukan', 'Izin untuk mengakses galeri media diperlukan untuk mengunggah foto.');
                return;
            }
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.8,
            })
            if(!result.canceled){
                const capturedFile = result.assets[0]
                const mimeType = capturedFile.mimeType || 'image/jpeg';
                if (!mimeType.startsWith('image/')) {
                    showWarning("File Ditolak", "Format file tidak didukung.");
                    return;
                }

                setTempImages([...tempImages, capturedFile]);
            }
        }
        catch(error){
            console.error(error);
            showWarning("Gagal Mengambil Foto", "Terjadi kesalahan saat memproses file. Pastikan Anda hanya memilih file berupa gambar.")
        }
    }

    async function handleUserCurrentLocation(){
        if(!currentUserLocation){
            showWarning("Lokasi Belum Tersedia", "Mohon tunggu sebentar hingga GPS menemukan lokasi Anda, atau pastikan GPS menyala.");
            return;
        }
        setIsLoading(true)
        try{
            const {latitude, longitude} = currentUserLocation
            
            //fetch jalan terdekat dengan OSRM
            const osrmUrl = `https://router.project-osrm.org/nearest/v1/driving/${longitude},${latitude}?number=1`
            const osrmResponse = await fetch(osrmUrl)
            const osrmData = await osrmResponse.json()

            let snappedLat = latitude
            let snappedLon = longitude
            let isSnapped = false

            if(osrmData.code == 'Ok' && osrmData.waypoints && osrmData.waypoints.length > 0){
                snappedLon = osrmData.waypoints[0].location[0]
                snappedLat = osrmData.waypoints[0].location[1]
                isSnapped = true
            }

            //fetch lokasi saat ini dengan nominatim
            const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com';
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`

            let requestHeaders: any = {
                'Accept': 'application/json'
            }

            if (Platform.OS !== 'web') {
                requestHeaders['User-Agent'] = `MyTAppDev/1.0 (${userEmail})`;
            }
            const response = await fetch(apiUrl, {
                headers: requestHeaders
            })
            const jsonResponse = await response.json()
            
            let roadName = "Jalan Tidak Dikenal"
            let roadClass = "Unclassified"

            if(jsonResponse && jsonResponse.address){
                roadName = jsonResponse.address.road || jsonResponse.address.neighbourhood || jsonResponse.address.village || "Jalan Tidak Dikenal";
            }

            const previewData = {
                latitude: snappedLat,
                longitude: snappedLon,
                name: roadName,
                roadClass: roadClass
            };

            if (isSnapped) {
                showWarning(
                    "Lokasi Disesuaikan", 
                    "Lokasi Anda telah digeser secara otomatis ke jalan raya terdekat. Silakan periksa dan konfirmasi di peta.",
                    () => onPreviewLocation && onPreviewLocation(previewData),
                    "Lihat Peta"
                );
            } else {
                let msg = roadName === "Jalan Tidak Dikenal" || !jsonResponse.address?.road
                    ? "Sistem tidak dapat menemukan jalan terdekat. Titik diletakkan persis di posisi GPS Anda."
                    : "Lokasi Anda telah ditemukan.";
                
                showWarning(
                    "Info Lokasi", 
                    `${msg} Silakan konfirmasi di peta.`,
                    () => onPreviewLocation && onPreviewLocation(previewData),
                    "Lihat Peta"
                );
            }
        }
        catch(error){
            console.error(`Geocoding error: ${error}`)
            showWarning("Gagal", "Tidak dapat mengambil nama jalan dari lokasi Anda saat ini.");
        }
        finally{
            setIsLoading(false)
        }
    }

    function handleImage(){
        if (tempImages.length >= 3) {
            showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
            return;
        }
        if (Platform.OS === 'web') {
            //di web hanya berikan pilihan upload, tidak ada buka kamera
            pickImage();
        } else {
            // di mobile, munculkan pilihan upload/kamera
            Alert.alert(
                "Tambah Gambar",
                "Pilih dari mana Anda ingin mengambil gambar",
                [
                    { text: "Buka Kamera", onPress: takePhoto },
                    { text: "Pilih dari Galeri", onPress: pickImage },
                    { text: "Batal", style: "cancel" }
                ]
            );
        }
    }

    function removeImage(indexToRemove: number){
        setTempImages(tempImages.filter((_, index) => index !== indexToRemove))
    }

    async function handlePost(forceCreate=false){
        const token = await getStorageValue(tokenKey)
        if(!token){
            showWarning("Sesi Berakhir", "Sesi Anda tidak valid. Silakan login kembali.");
            return;
        }

        if(!selectedLocation || !tagType || !description.trim()){
            showWarning("Data Tidak Lengkap", "Mohon lengkapi lokasi, tipe tag, dan deskripsi terlebih dahulu.");
            return;
        }

        if (tempImages.length === 0) {
            showWarning("Foto Bukti Diperlukan", "Mohon unggah minimal 1 foto sebagai bukti laporan kondisi jalan.");
            return;
        }
        
        setIsLoading(true)
        try{
            const formData = new FormData();
            formData.append("latitude", selectedLocation.latitude.toString())
            formData.append("longitude", selectedLocation.longitude.toString())
            formData.append("roadClass", selectedLocation.roadClass || 'Unclassified')
            formData.append("issueType", tagType);
            formData.append("description", description)
            formData.append("forceCreate", forceCreate ? "true" : "false")
        
            for(let index = 0; index < tempImages.length; index++){
                const image = tempImages[index];
                
                const mimeType = image.mimeType || 'image/jpeg';
                const fileExtension = mimeType.split('/')[1] || 'jpg';
            
                const fileName = image.fileName || `image_${Date.now()}_${index}.${fileExtension}`;

                if(Platform.OS === 'web'){
                    const imgResponse = await fetch(image.uri);
                    const blob = await imgResponse.blob();
                    formData.append("images", blob, fileName);
                }
                else{
                    formData.append("images", {
                        uri: image.uri,
                        type: mimeType,
                        name: fileName
                    } as any);
                }
            }

            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-roads`;
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            })

            const jsonResponse = await response.json()
            if(jsonResponse.status === 201){
                showWarning("Sukses", "Laporan jalan rusak berhasil dibuat!", () => {
                    setWarningVisible(false);
                    if(onTagAdded){
                        onTagAdded()
                    }
                    resetForm();
                });
            }
            else if(jsonResponse.status === 409){
                setConfirmForceCreate(true)
            }
            else{
                showWarning("Gagal", jsonResponse.message || "Terjadi kesalahan pada server.");
            }
        }
        catch(error){
            console.error("Post Error:", error);
            showWarning("Error Jaringan", "Tidak dapat terhubung ke server. Pastikan internet Anda stabil.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleForceCreate(){
        setConfirmForceCreate(false);
        handlePost(true);
    }

    function resetForm(){
        setDescription('')
        setTagType('')
        setTempImages([])
        setShowDropdown(false)
        onClose()
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
        <View style={styles.overlay}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardContainer}
            >
            <View style={styles.modalContainer}>
                
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={()=>{
                        setDescription('')
                        setTagType('')
                        setTempImages([])
                        onClose()
                    }}>
                    <Ionicons name="close-circle" size={28} color="#333" />
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 15 }}>
                    {tempImages.map((img, index) => (
                        <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                            <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                            <TouchableOpacity 
                                style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 10 }}
                                onPress={() => removeImage(index)}
                            >
                                <Ionicons name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {tempImages.length < 3 && (
                        <TouchableOpacity style={[styles.imagePlaceholder, { width: 80, height: 80, marginTop: 0 }]} onPress={handleImage}>
                            <Ionicons name="camera" size={24} color="#888" />
                            <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Add Picture</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <View style={[styles.labelRow, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={styles.label}>Location</Text>
                    <TouchableOpacity onPress={handleUserCurrentLocation} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#3B82F6" />
                        <Text style={{ fontSize: 12, color: '#3B82F6', marginLeft: 4, fontWeight: 'bold' }}>Gunakan Lokasi Saat Ini</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.inputWrapper} 
                    onPress={onPickLocation}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.textInput, { color: selectedLocation ? "#000" : "#888", marginTop: 12 }]}>
                        {locationText}
                    </Text>
                    <View style={styles.iconButton}>
                        <MaterialCommunityIcons name="map-marker-radius" size={20} color="#333" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.label}>Select tag type</Text>
                <TouchableOpacity 
                    style={styles.dropdownButton} 
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Text style={[styles.dropdownText, { color: tagType ? "#000" : "#888" }]}>
                        {tagType || "Pilih jenis kerusakan..."}
                    </Text>
                    <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#333" />
                </TouchableOpacity>

                {showDropdown && (
                    <View style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginTop: -10, marginBottom: 15, padding: 5 }}>
                        {TAG_TYPES.map((type, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={{ padding: 10, borderBottomWidth: index === TAG_TYPES.length - 1 ? 0 : 1, borderBottomColor: '#E5E7EB' }}
                                onPress={() => {
                                    setTagType(type);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={{ color: '#333' }}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.inputWrapper, styles.textArea]}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholder="Tuliskan detail kerusakan..."
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.submitButton, isLoading && { opacity: 0.7 }]} 
                        onPress={() => handlePost(false)}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Memproses..." : "Post a tag"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ConfirmModal
                    visible={confirmForceCreate}
                    title="Jalan Sudah Dilaporkan"
                    message="Terdapat laporan pada lokasi yang sangat dekat. Apakah Anda yakin ingin memaksakan membuat titik laporan baru?"
                    confirmText="Ya, Paksa Buat Baru"
                    cancelText="Batal"
                    onConfirm={handleForceCreate}
                    onCancel={() => setConfirmForceCreate(false)}
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
            </KeyboardAvoidingView>
        </View>
        </Modal>
    );
}

export default AddTagModal;