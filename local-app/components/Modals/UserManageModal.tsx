import React, {useState, useEffect} from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WarningModal from "@/components/Modals/WarningModal";
import * as SecureStore from 'expo-secure-store';
import styles from '@/styles/ReportModal.styles';
import { jwtDecode } from "jwt-decode";

interface UserManageModalProps{
    visible: boolean
    onClose: () => void
    userId: number | null
    username: string
    currentBanType: string | null
    onActionSuccess: () => void
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

function UserManageModal({visible, onClose, userId, username, currentBanType, onActionSuccess}: UserManageModalProps){
    const tokenKey = 'userToken'
    
    const [action, setAction] = useState<'suspend' | 'permanent_ban' | 'revoke' | 'set_admin' | null>(null)
    const [durationDays, setDurationDays] = useState('3')//default 3 hari
    const [adminNotes, setAdminNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [warning, setWarning] = useState({visible: false, title: '', message: ''})

    useEffect(()=>{
        if(visible){
            setAction(currentBanType? 'revoke' : 'suspend')
            setDurationDays('3')
            setAdminNotes('')
        }
    }, [visible, currentBanType])
    
    async function handleSubmit(){
        if(!action){
            setWarning({ visible: true, title: "Pilih Aksi", message: "Silakan pilih tindakan moderasi terlebih dahulu." });
            return;
        }

        setIsSubmitting(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/users/${userId}/manage`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action,
                    durationDays: parseInt(durationDays),
                    adminNotes
                })
            })

            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setWarning({ visible: true, title: "Sukses", message: "Tindakan moderasi user berhasil disimpan." });
            }
            else{
                throw new Error(jsonResponse.message);
            }
        }
        catch(error: any){
            setWarning({ visible: true, title: "Gagal", message: error.message || "Terjadi kesalahan jaringan." });
        }
        finally{
            setIsSubmitting(false)
        }
    }

    function handleTextChange(text: string){
        const numericValue = text.replace(/[^0-9]/g, '');
        setDurationDays(numericValue)
    }

    return(
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Moderasi User: {username}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Pilih Tindakan Moderasi</Text>
                        <View style={styles.reasonContainer}>
                            {[
                                { id: 'suspend', label: 'Suspend Sementara', color: '#F59E0B' },
                                { id: 'permanent_ban', label: 'Banned Permanen', color: '#EF4444' },
                                { id: 'revoke', label: 'Cabut Sanksi (Bebaskan)', color: '#10B981' },
                                { id: 'set_admin', label: 'Jadikan Admin', color: '#3B82F6' }
                            ].map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.reasonChip, action === opt.id && { backgroundColor: opt.color }]}
                                    onPress={() => setAction(opt.id as any)}
                                >
                                    <Text style={[styles.reasonText, action === opt.id && { color: 'white' }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {action === 'suspend' && (
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.label}>Durasi Suspend (Hari)</Text>
                                <TextInput
                                    style={[styles.textInput, { height: 50 }]}
                                    keyboardType="numeric"
                                    value={durationDays}
                                    onChangeText={handleTextChange}
                                />
                            </View>
                        )}

                        <Text style={[styles.label, { marginTop: 20 }]}>Pesan Peringatan untuk User</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Deskripsi..."
                            multiline
                            value={adminNotes}
                            onChangeText={setAdminNotes}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#0066ff' }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Terapkan Sanksi</Text>}
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

export default UserManageModal