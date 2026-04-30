import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import styles from '@/styles/NotificationModal.styles';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
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

function NotificationModal({visible, onClose}: NotificationModalProps){
    const tokenKey = 'userToken'

    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    async function fetchNotifications(){
        setIsLoading(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiurl = `${process.env.EXPO_PUBLIC_API_URL}/api/notifications`
            const response = await fetch(apiurl, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setNotifications(jsonResponse.data.notifications)
            }
        }
        catch(error){
            console.error("Gagal memuat notifikasi:", error);
        }
        finally{
            setIsLoading(false)
        }
    }

    async function markAllAsRead(){
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/read-all`
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const updated = notifications.map(n => ({...n, isRead: true})) 
            setNotifications(updated)
        }
        catch(error){
            console.error(error)
        }
    }

    async function handleReadItem(id: number){
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${id}/read`
            const response = await fetch(apiUrl,{
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setNotifications(prev => prev.map(n => n.id == id? {...n, isRead: true}: n))
        }
        catch(error){
            console.error(error)
        }
    }

    const getIconColor = (type: string) => {
        switch(type) {
            case 'warning': return '#F59E0B' // Orange
            case 'danger': return '#EF4444' // Red
            case 'success': return '#10B981' // Green
            default: return '#3B82F6' // Blue
        }
    }

    const getIconName = (type: string) => {
        switch(type) {
            case 'warning': return 'warning'
            case 'danger': return 'alert-circle'
            case 'success': return 'checkmark-circle'
            default: return 'information-circle'
        }
    }

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Notifikasi</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={markAllAsRead}>
                            <Text style={styles.markReadText}>Tandai Semua Dibaca</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ padding: 15 }}
                            ListEmptyComponent={<Text style={styles.emptyText}>Belum ada notifikasi.</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                                    onPress={() => !item.isRead && handleReadItem(item.id)}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name={getIconName(item.type)} size={32} color={getIconColor(item.type)} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.title, !item.isRead && styles.boldText]}>{item.title}</Text>
                                        <Text style={styles.message}>{item.message}</Text>
                                        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('id-ID')}</Text>
                                    </View>
                                    {!item.isRead && <View style={styles.unreadDot} />}
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    )
}

export default NotificationModal