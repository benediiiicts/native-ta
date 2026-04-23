import React, {useState, useEffect, use} from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import WarningModal from "@/components/Modals/WarningModal";
import * as SecureStore from 'expo-secure-store';
import styles from '@/styles/ReportModal.styles'; 

interface TagManageModalProps{
    visible: boolean
    onClose: () => void
    tagId: number | null
    versionId: number | null
    initialData:{
        isVerified: boolean
        roadIsActive: boolean
        versionIsActive: boolean
    } | null
    onActionSuccess: () => void
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

function TagManageModal({visible, onClose, tagId, versionId, initialData, onActionSuccess}: TagManageModalProps){
    const tokenKey = 'userToken'
    
    const [isVerified, setIsVerified] = useState(false)
    const [visibility, setVisibility] = useState<'active' | 'hide_version' | 'hide_road'>('active')
    const [adminNotes, setAdminNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [warning, setWarning] = useState({ visible: false, title: '', message: '' });

    useEffect(()=>{
        if(visible && initialData){
            setIsVerified(initialData.isVerified)
            if(!initialData.roadIsActive) setVisibility('hide_road')
            else if(!initialData.versionIsActive) setVisibility('hide_version')
            else setVisibility('active')
            setAdminNotes('')
        }
    }, [visible, initialData])

    async function handleAdminAction(){
        setIsSubmitting(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/tags/manage`

            const response = await fetch(apiUrl,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body:JSON.stringify({
                    tagId,
                    versionId,
                    isVerified,
                    visibility,
                    adminNotes
                })
            })

            const jsonResponse = await response.json()
            if(jsonResponse.status == 200 || jsonResponse.status == 201){
                setWarning({ 
                    visible: true, 
                    title: "Sukses", 
                    message: "Perubahan moderasi berhasil disimpan." 
                });
            }
        }
        catch(error: any){
            console.error(error)
            setWarning({ visible: true, title: "Gagal", message: error.message || "Terjadi kesalahan jaringan." });
        }
        finally{
            setIsSubmitting(false)
        }
    }

    return(
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios'? "padding" : "height"}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Moderasi Tag Admin</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>
                            Status Vverifikasi
                        </Text>
                        <View style={styles.reasonContainer}>
                            <TouchableOpacity
                                style={[styles.reasonChip, isVerified && { backgroundColor: '#3B82F6' }]}
                                onPress={()=>setIsVerified(!isVerified)}
                            >
                                <Ionicons name={isVerified ? "shield-checkmark" : "shield-outline"} size={18} color={isVerified ? "white" : "#4B5563"} />
                                <Text
                                    style={[styles.reasonText, isVerified && { color: 'white' }]}
                                >
                                    {isVerified? "Terverifikasi Admin": "Belum terverifikasi"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { marginTop: 20 }]}>Visibilitas (Soft Delete)</Text>
                        <View style={styles.reasonContainer}>
                            {[
                                { id: 'active', label: 'Aktif (Tampil)', icon: 'eye' },
                                { id: 'hide_version', label: 'Sembunyikan Versi Ini', icon: 'eye-off' },
                                { id: 'hide_road', label: 'Sembunyikan Seluruh Jalan', icon: 'trash' },
                            ].map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.reasonChip, visibility === opt.id && { backgroundColor: '#EF4444' }]}
                                    onPress={()=> setVisibility(opt.id as any)}
                                >
                                    <Text style={[styles.reasonText, visibility === opt.id && { color: 'white' }]}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { marginTop: 20 }]}>Catatan Admin (Internal)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Alasan moderasi..."
                            multiline
                            value={adminNotes}
                            onChangeText={setAdminNotes}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#8B5CF6' }]}
                            onPress={handleAdminAction}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Simpan Moderasi</Text>}
                        </TouchableOpacity>
                    </View>

                    <WarningModal
                        visible={warning.visible}
                        title={warning.title}
                        message={warning.message}
                        confirmText="OK"
                        onConfirm={() => {
                            setWarning({ ...warning, visible: false });
                            if (warning.title === "Sukses") {
                                onActionSuccess();
                                onClose();
                            }
                        }}
                        onCancel={() => setWarning({ ...warning, visible: false })}
                    />
                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}

export default TagManageModal