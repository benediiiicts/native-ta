import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import styles from '@/styles/dashboard.styles';
import NotFoundPage from '@/components/NotFoundPage';

interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    role: string;
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

function AdminDashboard(){
    const router = useRouter()
    const tokenKey = 'userToken'

    const [myRole, setMyRole] = useState<string | null>(null)
    const [isLogedIn, setIsLogedIn] = useState(false)

    useEffect(()=>{
        async function checkLogin(){
            const token = await getStorageValue(tokenKey)
            if(token){
                const decoded: DecodedToken = jwtDecode(token)
                setIsLogedIn(true)
                setMyRole(decoded.role)
            }
        }
        checkLogin()
    }, [])

    return(
        <>
            {isLogedIn && myRole === 'admin' ? renderDashboard() : <NotFoundPage/>}   
        </>
    )

    function renderDashboard(){
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push('/home')} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Administrator Dashboard</Text>
                </View>

                <View style={styles.menuContainer}>
                    
                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/admin/manage-users')}>
                        <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                            <Ionicons name="people" size={32} color="#3B82F6" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Manage User</Text>
                            <Text style={styles.menuDesc}>Suspend, blokir, atau ubah role pengguna</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => {/* router.push('/admin/manage-reports') */}}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="flag-triangle" size={32} color="#EF4444" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Manage Report</Text>
                            <Text style={styles.menuDesc}>Tinjau laporan dari pengguna</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuCard} onPress={() => {/* router.push('/admin/statistics') */}}>
                        <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="stats-chart" size={32} color="#10B981" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuTitle}>Statistik Daerah</Text>
                            <Text style={styles.menuDesc}>Lihat analitik laporan per wilayah</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }
}

export default AdminDashboard