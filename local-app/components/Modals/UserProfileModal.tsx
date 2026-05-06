import React, { useEffect, useState } from 'react';
import { TextInput, Platform, View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import WarningModal from './WarningModal';
import styles from '@/styles/UserProfileModal.styles';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface UserProfileModalProps{
    visible: boolean
    onClose: () => void
    userId: number | null
    isOwnProfile: boolean
    isAdmin: boolean
    onReportPress: (userId: number, username: string) => void
    onProfileUpdated?: () => void
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

function UserProfileModal({ visible, onClose, userId, isOwnProfile, isAdmin, onReportPress, onProfileUpdated }: UserProfileModalProps){
    const tokenKey = 'userToken'

    const [profileData, setProfileData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");

        //untuk modal warning
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningConfirmText, setWarningConfirmText] = useState("")
    const [warningOnConfirm, setWarningOnConfirm] = useState<(() => void) | undefined>(undefined);
    
    useEffect(()=>{
        if(visible && userId){
            fetchProfile()
        } else{
            setProfileData(null)
        }
    }, [visible, userId])

    async function fetchProfile(){
        setIsLoading(true)
        try{
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}/profile`
            const response = await fetch(apiUrl)
            const jsonResponse = await response.json()
            if (jsonResponse.data) {
                setProfileData(jsonResponse.data);
                setNewUsername(jsonResponse.data.username);
            }
        }
        catch(error){
            console.error(`Gagal memuat profile user: ${error}`)
        }
        finally{
            setIsLoading(false)
        }
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

    async function handleUpdateUsername(){
        if(!newUsername.trim()) return
        const token = await getStorageValue(tokenKey)

        try{
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/update-username`
            const response = await fetch(apiUrl,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername })
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setIsEditing(false)
                fetchProfile();
                if (onProfileUpdated) onProfileUpdated();
            }
            else{
                showWarning("Gagal", jsonResponse.message, "OK")
            }
        }
        catch(error){
            showWarning("Gagal", "Gagal menghubungi server", "OK")
        }
    }

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => { setIsEditing(false); onClose(); }}>
                        <Ionicons name="close" size={24} color="#4B5563" />
                    </TouchableOpacity>

                    {isLoading || !profileData ? <ActivityIndicator size="large" color="#3B82F6" /> : (
                        <>
                            <View style={styles.header}>
                                <View style={styles.avatarPlaceholder}><FontAwesome5 name="user-alt" size={40} color="#9CA3AF" /></View>
                                
                                {isEditing ? (
                                    <TextInput 
                                        style={styles.input} 
                                        value={newUsername} 
                                        onChangeText={setNewUsername}
                                        autoFocus
                                    />
                                ) : (
                                    <Text style={styles.username}>{profileData.username}</Text>
                                )}

                                {isOwnProfile && <Text style={styles.email}>{profileData.email}</Text>}
                                <Text style={styles.memberSince}>Member since {new Date(profileData.createdAt).getFullYear()}</Text>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statBox}><Text style={styles.statNumber}>{profileData.stats.tagCount}</Text><Text style={styles.statLabel}>Laporan</Text></View>
                                <View style={styles.statBox}><Text style={styles.statNumber}>{profileData.stats.commentCount}</Text><Text style={styles.statLabel}>Komentar</Text></View>
                            </View>

                            {isOwnProfile ? (
                                <TouchableOpacity 
                                    style={[styles.actionButton, { backgroundColor: isEditing ? '#10B981' : '#3B82F6' }]} 
                                    onPress={isEditing ? handleUpdateUsername : () => setIsEditing(true)}
                                >
                                    <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={20} color="white" />
                                    <Text style={styles.actionButtonText}>{isEditing ? "Simpan Perubahan" : "Edit Username"}</Text>
                                </TouchableOpacity>
                            ) : !isAdmin ? (
                                <TouchableOpacity style={styles.reportButton} onPress={() => onReportPress?.(profileData.id, profileData.username)}>
                                    <MaterialIcons name="report-problem" size={20} color="#EF4444" />
                                    <Text style={styles.reportButtonText}>Laporkan Pengguna</Text>
                                </TouchableOpacity>
                            ) : null}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

export default UserProfileModal