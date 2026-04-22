import React, { useState, useEffect, use } from 'react';
import { Alert, View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import WarningModal from "@/components/Modals/WarningModal";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import styles from '@/styles/ReportModal.styles';

interface ReportModalProps{
    visible: boolean
    onClose: () => void
    targetType: 'User' | 'TagVersion' | 'Comment' | null
    targetId: number | null
    targetName?: string
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

function ReportModal({visible, onClose, targetType, targetId, targetName}: ReportModalProps){
    const tokenKey = 'userToken';
    
    const [reason, setReason] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [images, setImages] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));

    useEffect(() => {
        if(visible){
            setReason('')
            setDescription('')
            setImages([])
        }
    }, [visible])

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

    function getReasonOptions(){
        switch(targetType){
            case 'User': return ['Spam / Akun Bot', 'Kata-kata Kasar / Pelecehan', 'Identitas Palsu', 'Lainnya']
            case 'TagVersion': return ['Informasi Palsu / Hoax', 'Foto Tidak Pantas', 'Jalan Sudah Diperbaiki (Tidak Valid)', 'Lainnya']
            case 'Comment': return ['Spam / Promosi', 'Komentar Kasar / Ujaran Kebencian', 'Topik Tidak Relevan', 'Lainnya']
            default: return ['Lainnya']
        }
    }
    
    async function pickImage(){
        if (images.length >= 3) {
            showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
            return;
        }

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if(!permissionResult.granted){
            showWarning('Izin Diperlukan', 'Izin untuk mengakses galeri media diperlukan untuk mengunggah foto.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            allowsMultipleSelection: true,
            selectionLimit: 3 - images.length,
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
            setImages([...images, ...validImages]);
        }
    }

    async function takePhoto(){
        if(images.length >= 3){
            showWarning("Batas Maksimal", "Hanya boleh mengunggah maksimal 3 gambar.");
            return;
        }
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
        if(!permissionResult.granted){
            showWarning('Izin Diperlukan', 'Izin untuk mengakses kamera diperlukan.');
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

            setImages([...images, capturedFile]);
        }
    }

    function handleAddImage(){
        if (images.length >= 3) {
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
        setImages(images.filter((_, index) => index !== indexToRemove))
    }

    async function submitReport(){
        if(!reason){
            showWarning("Laporan tidak valid", "Pilih alasan pelaporan terlebih dahulu.")
            return
        }

        setIsSubmitting(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/reports`

            const formData = new FormData()
            formData.append("targetType", targetType!);
            formData.append("targetId", targetId!.toString());
            formData.append("reason", reason);
            formData.append("description", description);

            for(let index = 0; index < images.length; index++){
                const image = images[index];
                
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
                        name: `report_${Date.now()}_${index}.${fileExtension}`,
                        type: mimeType,
                    } as any);
                }
            }
            
            const response = await fetch(apiUrl,{
                method: 'POST',
                headers:{
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const jsonResponse = await response.json()
            if(jsonResponse.status == 201){
                showWarning(
                    "Laporan berhasil dikirim", 
                    "Terima kasih atas kontribusi anda.", 
                    () => onClose() 
                );
            }
            else{
                showWarning("Gagal", jsonResponse.message || "Terjadi kesalahan pada server")
            }
        }
        catch(error){
            console.error(error)
            showWarning("Gagal", "Terjadi kesalahan jaringan")
        }
        finally{
            setIsSubmitting(false)
        }
    }

    function getTitle(){
        if (targetType === 'User') return `Laporkan Pengguna: ${targetName || ''}`;
        if (targetType === 'TagVersion') return 'Laporkan Laporan Jalan Ini';
        return 'Laporkan Komentar';
    }

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{getTitle()}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Pilih Alasan <Text style={{color: 'red'}}>*</Text></Text>
                        <View style={styles.reasonContainer}>
                            {getReasonOptions().map((opt, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={[styles.reasonChip, reason === opt && styles.reasonChipActive]}
                                    onPress={() => setReason(opt)}
                                >
                                    <Text style={[styles.reasonText, reason === opt && styles.reasonTextActive]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Deskripsi Tambahan (Opsional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Jelaskan lebih detail mengenai pelanggaran ini..."
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10}}>
                            <Text style={styles.label}>Bukti Gambar (Opsional)</Text>
                            <Text style={{fontSize: 12, color: '#6B7280'}}>{images.length}/3</Text>
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                            {images.map((img, index) => (
                                <View key={index} style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 3 && (
                                <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                                    <FontAwesome5 name="camera" size={24} color="#9CA3AF" />
                                    <Text style={{color: '#9CA3AF', fontSize: 12, marginTop: 5}}>Tambah</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.submitBtn} onPress={submitReport} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
                            )}
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

                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

export default ReportModal