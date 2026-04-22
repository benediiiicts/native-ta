import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import styles from '@/styles/UserProfileModal.styles';

interface UserProfileModalProps{
    visible: boolean
    onClose: () => void
    userId: number | null
    onReportPress: (userId: number, username: string) => void;
}

function UserProfileModal({ visible, onClose, userId, onReportPress }: UserProfileModalProps){
    const [profileData, setProfileData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

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
            }
        }
        catch(error){
            console.error(`Gagal memuat profile user: ${error}`)
        }
        finally{
            setIsLoading(false)
        }
    }

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            
                            {/* Tombol Close */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="#4B5563" />
                            </TouchableOpacity>

                            {isLoading || !profileData ? (
                                <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 40 }} />
                            ) : (
                                <>
                                    {/* Header Profil */}
                                    <View style={styles.header}>
                                        <View style={styles.avatarPlaceholder}>
                                            <FontAwesome5 name="user-alt" size={40} color="#9CA3AF" />
                                        </View>
                                        <Text style={styles.username}>{profileData.username}</Text>
                                        <Text style={styles.memberSince}>
                                            Bergabung sejak {new Date(profileData.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                        </Text>
                                    </View>

                                    {/* Statistik */}
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statNumber}>{profileData.stats.totalLaporan}</Text>
                                            <Text style={styles.statLabel}>Laporan Dibuat</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statBox}>
                                            <Text style={styles.statNumber}>{profileData.stats.totalKomentar}</Text>
                                            <Text style={styles.statLabel}>Komentar</Text>
                                        </View>
                                    </View>

                                    {/* Tombol Report */}
                                    <TouchableOpacity 
                                        style={styles.reportButton}
                                        onPress={() => {
                                            onClose(); // Tutup profil
                                            onReportPress(profileData.id, profileData.username); // Buka form report
                                        }}
                                    >
                                        <MaterialIcons name="report-problem" size={20} color="#EF4444" />
                                        <Text style={styles.reportButtonText}>Laporkan Pengguna Ini</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default UserProfileModal