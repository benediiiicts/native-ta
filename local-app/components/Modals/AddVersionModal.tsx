import styles from "@/styles/AddTagModal.styles";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import WarningModal from "@/components/Modals/WarningModal";

interface AddVersionModalProps {
    visible: boolean;
    onClose: () => void;
    tagRoadId: number;
    onVersionAdded?: () => void;
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

export const TAG_STATUSES = [
    'Menunggu Tindakan',    
    'Dalam Penanganan',     
    'Sudah Diperbaiki',     
    'Kedaluwarsa / Tidak Valid'
];

function AddVersionModal({ visible, onClose, tagRoadId, onVersionAdded }: AddVersionModalProps) {
    const tokenKey = 'userToken';
   
    const [description, setDescription] = useState("");
    const [tempImages, setTempImages] = useState<any[]>([])
    const [status, setStatus] = useState('') 
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            const selectedFile = result.assets[0];
            const mimeType = selectedFile.mimeType || 'image/jpeg';

            if (!mimeType.startsWith('image/')) {
                showWarning("File Ditolak", "Format file tidak didukung. Mohon hanya unggah file gambar.");
                return;
            }

            if(tempImages.length >= 3){
                showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
                return;
            }
            setTempImages([...tempImages, selectedFile]);
        }
    }

    function removeImage(indexToRemove: number){
        setTempImages(tempImages.filter((_, index) => index !== indexToRemove))
    }

    async function handlePost(){
        const token = await getStorageValue(tokenKey)
        if(!token){
            showWarning("Sesi Berakhir", "Sesi Anda tidak valid. Silakan login kembali.");
            return;
        }

        if(!status || !description.trim()){
            showWarning("Data Tidak Lengkap", "Mohon lengkapi status dan deskripsi terlebih dahulu.");
            return;
        }

        if (tempImages.length === 0) {
            showWarning("Foto Bukti Diperlukan", "Mohon unggah minimal 1 foto sebagai bukti laporan kondisi jalan.");
            return;
        }
        
        setIsLoading(true)
        try{
            const formData = new FormData();
            
            formData.append("tagRoadId", tagRoadId.toString());
            formData.append("status", status);
            formData.append("description", description);
        
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

            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-version`;
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
                showWarning(
                    "Pembaruan Diterima", 
                    "Versi pembaruan jalan Anda telah berhasil disimpan. Informasi ini akan ditampilkan sebagai status utama setelah diverifikasi dan mendapatkan cukup persetujuan (Approve) dari pengguna lain.", 
                    () => {
                        setWarningVisible(false);
                        if(onVersionAdded){
                            onVersionAdded() 
                        }
                        resetForm();
                    }
                );
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

    function resetForm(){
        setDescription('')
        setStatus('')
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
                    onPress={resetForm}
                >
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

                <Text style={styles.label}>Pilih Status Terbaru</Text>
                <TouchableOpacity 
                    style={styles.dropdownButton} 
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Text style={[styles.dropdownText, { color: status ? "#000" : "#888" }]}>
                        {status || "Pilih status..."}
                    </Text>
                    <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#333" />
                </TouchableOpacity>

                {showDropdown && (
                    <View style={{ backgroundColor: '#F3F4F6', borderRadius: 8, marginTop: -10, marginBottom: 15, padding: 5 }}>
                        {TAG_STATUSES.map((type, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={{ padding: 10, borderBottomWidth: index === TAG_STATUSES.length - 1 ? 0 : 1, borderBottomColor: '#E5E7EB' }}
                                onPress={() => {
                                    setStatus(type);
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
                    placeholder="Tuliskan pembaruan kondisi jalan saat ini..."
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.submitButton, isLoading && { opacity: 0.7 }]} 
                        onPress={handlePost}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Memproses..." : "Update Versi"}
                        </Text>
                    </TouchableOpacity>
                </View>

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

export default AddVersionModal;