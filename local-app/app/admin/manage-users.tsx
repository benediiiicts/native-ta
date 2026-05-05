import UserManageModal from "@/components/Modals/UserManageModal";
import UserProfileModal from '@/components/Modals/UserProfileModal';
import NotFoundPage from '@/components/NotFoundPage';
import styles from "@/styles/manage-users.styles";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import React, { useEffect, useState } from "react";
import { FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    role: string;
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
function ManageUsers(){
    const router = useRouter()
    const tokenKey = 'userToken'

    const [isLogedIn, setIsLogedIn] = useState(false)
    const [myRole, setMyRole] = useState<string | null>(null)

    const [users, setUsers] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [profileModalVisible, setProfileModalVisible] = useState(false)
    const [manageModalVisible, setManageModalVisible] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

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

    useEffect(()=>{
        const delayedSeacrh = setTimeout(()=>{
            setCurrentPage(1)
            fetchUsers()
        }, 500)

        return ()=>clearTimeout(delayedSeacrh)
    }, [searchQuery])

    async function fetchUsers(){
        setIsLoading(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/users?search=${searchQuery}`
            const response = await fetch(apiUrl, {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setUsers(jsonResponse.data)
            }
        }
        catch(error){
            console.error(`Gagal memuat daftar user: ${error}`)
        }
        finally{
            setIsLoading(false)
        }
    }

    return(
        <>
            {isLogedIn && myRole === 'admin' ? renderManageUsers() : <NotFoundPage/>}
        </>
    )

    function renderItem({ item }: { item: any }) {
        return (
            <View style={styles.userCard}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, item.role === 'admin' && { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name={item.role === 'admin' ? "shield-checkmark" : "person"} size={24} color={item.role === 'admin' ? "#3B82F6" : "#6B7280"} />
                    </View>
                    <View>
                        <Text style={styles.usernameText}>
                            {item.username} {item.role === 'admin' && <Text style={styles.adminBadge}>(Admin)</Text>}
                        </Text>
                        {item.banType && (
                            <Text style={styles.bannedText}>Status: {item.banType}</Text>
                        )}
                    </View>
                </View>
                
                <View style={styles.actionGroup}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => {
                            setSelectedUser(item);
                            setProfileModalVisible(true);
                        }}
                    >
                        <MaterialCommunityIcons name="card-account-details-outline" size={26} color="#4B5563" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => {
                            setSelectedUser(item);
                            setManageModalVisible(true);
                        }}
                    >
                        <Ionicons name="build" size={26} color={item.banType ? "#EF4444" : "#4B5563"} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    function renderManageUsers(){
        const indexOfLastItem = currentPage * itemsPerPage
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        const currentItems = users.slice(indexOfFirstItem, indexOfLastItem)

        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={28} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="search user"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
                
                <FlatList
                    data={currentItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{isLoading ? "Mencari..." : "User tidak ditemukan"}</Text>
                    }
                />

                {users.length > itemsPerPage && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                            onPress={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#D1D5DB" : "#374151"} />
                        </TouchableOpacity>

                        <Text style={styles.pageInfo}>
                            {currentPage} / {Math.ceil(users.length / itemsPerPage)}
                        </Text>

                        <TouchableOpacity
                            style={[styles.pageBtn, currentPage === Math.ceil(users.length / itemsPerPage) && styles.pageBtnDisabled]}
                            onPress={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
                        >
                            <Ionicons name="chevron-forward" size={20} color={currentPage === Math.ceil(users.length / itemsPerPage) ? "#D1D5DB" : "#374151"} />
                        </TouchableOpacity>
                    </View>
                )}

                {selectedUser && (
                    <UserManageModal
                        visible={manageModalVisible}
                        onClose={() => setManageModalVisible(false)}
                        userId={selectedUser.id}
                        username={selectedUser.username}
                        currentBanType={selectedUser.banType}
                        onActionSuccess={() => fetchUsers()}
                    />
                )}

                {selectedUser && (
                    <UserProfileModal
                        visible={profileModalVisible}
                        onClose={() => setProfileModalVisible(false)}
                        userId={selectedUser.id}
                        isOwnProfile={false}
                        isAdmin={true}
                        onReportPress={(userId, username) => {}}
                        onProfileUpdated={() => fetchUsers()}
                    />
                )}
            </View>
        )
    }
}

export default ManageUsers