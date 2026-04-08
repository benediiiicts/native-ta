import styles from "@/styles/AddTagModal.styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import ConfirmModal from "./ConfirmationModal"; 
import WarningModal from "@/components/Modals/WarningModal";

interface AddTagModalProps {
    visible: boolean;
    onClose: () => void;
    onPickLocation: () => void;
    selectedLocation: any;
}

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

const TAG_TYPES = ['Jalan berlubang', 'Fasilitas rusak']

function AddTagModal({ visible, onClose, onPickLocation, selectedLocation }: AddTagModalProps) {
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
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));
    
    function showWarning(title: string, message: string, onConfirmAction?: () => void){
        setWarningTitle(title);
        setWarningMessage(message);

        if (onConfirmAction) {
            setWarningOnConfirm(() => onConfirmAction);
        } else {
            setWarningOnConfirm(() => () => setWarningVisible(false));
        }
        
        setWarningVisible(true);
    }

    let locationText = "Pilih lokasi dari peta...";
    if (selectedLocation) {
        locationText = selectedLocation.name ? selectedLocation.name : "Lokasi terpilih";
    }
    
    async function pickImage(){
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!permissionResult.granted){
            showWarning('Izin Diperlukan', 'Izin untuk mengakses galeri media diperlukan untuk mengunggah foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            if(tempImages.length >= 3){
                showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
                return;
            }
            setTempImages([...tempImages, result.assets[0]])
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

        if(!selectedLocation || !tagType || !description){
            showWarning("Data Tidak Lengkap", "Mohon lengkapi lokasi, tipe tag, dan deskripsi terlebih dahulu.");
            return;
        }
        
        setIsLoading(true)
        try{
            const formData = new FormData();
            formData.append("latitude", selectedLocation.latitude.toString())
            formData.append("longitude", selectedLocation.longitude.toString())
            formData.append("roadClass", selectedLocation.roadClass || 'Unclassified')
            formData.append("status", tagType)
            formData.append("description", description)
            formData.append("forceCreate", forceCreate ? "true" : "false")
        
            tempImages.forEach((image, index) => {
                formData.append("images", {
                    uri: image.uri,
                    name: `image_${Date.now()}_${index}.jpg`,
                    type: "image/jpeg",
                } as any);
            });

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
                
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
                        <TouchableOpacity style={[styles.imagePlaceholder, { width: 80, height: 80, marginTop: 0 }]} onPress={pickImage}>
                            <Ionicons name="camera" size={24} color="#888" />
                            <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>Add Picture</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Location</Text>
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
                    confirmText="OK"
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