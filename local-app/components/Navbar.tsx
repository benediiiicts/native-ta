import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Alert, FlatList, Keyboard, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { styles } from '../styles/Navbar.styles'; 

interface NavbarProps {
    login: boolean;
    onLogout: () => void;
    onSearchResults: (data: any[]) => void;
    onPickLocationMode: boolean;
    currentUserLocation?: {latitude: number, longitude: number} | null;
    onProfilePress: () => void
    userRole: string | null
    onNotificationPress: () => void
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


function Navbar({ login, onLogout, onSearchResults, onPickLocationMode, currentUserLocation, onProfilePress, userRole, onNotificationPress }: NavbarProps) {
    let router = useRouter();
    const tokenKey = 'userToken'

    const [searchLocation, setSearchLocation] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [noResultsFound, setNoResultsFound] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(()=>{
        let interval: any
        if(login){
            fetchUnreadCount()
            interval = setInterval(fetchUnreadCount, 3 * 60 * 1000)
        }
        return () => clearInterval(interval)
    }, [])

    async function fetchUnreadCount(){
        try{
            const token = await getStorageValue(tokenKey)
            if(!token) return
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/notifications`
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jsonResponse = await response.json()
            if (jsonResponse.status === 200) {
                setUnreadCount(jsonResponse.data.unreadCount)
            }
        }
        catch(error){
            console.error("Gagal memuat jumlah notifikasi:", error);
        }
    }

    async function handleSearch () {
        if (!searchLocation.trim()) return; 

        const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com';
        let api_url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchLocation)}&format=json&limit=7&countrycodes=id`;
        
        let requestHeaders: any = {
            'Accept': 'application/json'
        };

        if (Platform.OS !== 'web') {
            requestHeaders['User-Agent'] = `MyTAppDev/1.0 (${userEmail})`;
        }

        if(currentUserLocation){
            //catatan offset:
            //1 offset = ~11km
            //0.2 offset = ~22km
            const offset = 0.2;
            const left = currentUserLocation.longitude - offset;
            const top = currentUserLocation.latitude + offset;
            const right = currentUserLocation.longitude + offset;
            const bottom = currentUserLocation.latitude - offset;

            api_url += `&viewbox=${left},${top},${right},${bottom}`;
            api_url += `&bounded=1`;
        }

        try {
            console.log(`Mencari lokasi: ${searchLocation}...`);
            const response = await fetch(api_url, {
                headers: {
                    ...requestHeaders,
                    'Accept-Language': 'id'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            if(data.length > 0){
                setSearchResults(data);
                setIsDropdownVisible(true);
                setIsMenuVisible(false);
                setNoResultsFound(false);
                Keyboard.dismiss();
                if (onSearchResults) {
                    onSearchResults(data);
                }
            } else {
                setIsDropdownVisible(false);
                setNoResultsFound(true);
                console.log("Lokasi tidak ditemukan");
            }
        } catch(error) {
            console.log("Gagal melakukan fetch:", error);
            Alert.alert("Error", "Gagal mengambil data dari server pencarian.");
        }
    }

    function handleLocationSelect(item: any){
        setIsDropdownVisible(false);
        setSearchLocation(item.name || item.display_name.split(',')[0]);
        onSearchResults([item]);
    }

    function toggleMenu() {
        setIsMenuVisible(!isMenuVisible);
        if (isDropdownVisible) setIsDropdownVisible(false); 
        Keyboard.dismiss();
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, zIndex: 1000, elevation: 1000, marginRight: onPickLocationMode ? 0 : 10 }}>
                <View style={styles.searchBox}>
                    <TouchableOpacity onPress={handleSearch} style={{ padding: 5 }}>
                        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
                    </TouchableOpacity>

                    <TextInput 
                        style={styles.input} 
                        placeholder="Cari jalan atau daerah..." 
                        placeholderTextColor="#888"
                        value={searchLocation}
                        onChangeText={(text) => {
                            setSearchLocation(text);
                            if (isDropdownVisible) setIsDropdownVisible(false);
                            if (isMenuVisible) setIsMenuVisible(false);
                            if (noResultsFound) setNoResultsFound(false);
                        }}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>

                {isDropdownVisible && searchResults.length > 0 && (
                    <View style={styles.dropdownContainer}>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.place_id.toString()}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => handleLocationSelect(item)}
                                >
                                    <Ionicons name="location-outline" size={18} color="#4B5563" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.itemText} numberOfLines={2}>
                                        {item.display_name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
                
                {noResultsFound && (
                    <View style={styles.dropdownContainer}>
                        <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                            <Text style={{ color: '#6B7280', fontSize: 14 }}>
                                Lokasi "{searchLocation}" tidak ditemukan
                            </Text>
                        </View>
                    </View>
                )}
            </View>
            
            {!onPickLocationMode && (
                <View style={{ zIndex: 1001, elevation: 1001, position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
                    
                    {login && (
                        <TouchableOpacity 
                            onPress={() => {
                                setIsMenuVisible(false)
                                onNotificationPress()
                                setUnreadCount(0)
                            }}
                            style={{ marginRight: 15, position: 'relative', backgroundColor: 'white', padding: 8, borderRadius: 8 }}
                        >
                            <Ionicons name="notifications-outline" size={26} color="#4B5563" />
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute', right: -4, top: -4,
                                    backgroundColor: '#EF4444', borderRadius: 10, width: 18, height: 18,
                                    justifyContent: 'center', alignItems: 'center'
                                }}>
                                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        onPress={toggleMenu}
                        style={{
                            backgroundColor: 'white', padding: 8, borderRadius: 8,
                            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
                        }}
                    >
                        <Ionicons name={isMenuVisible ? "close" : "menu"} size={28} color="#333" />
                    </TouchableOpacity>

                    {isMenuVisible && (
                        <View style={styles.menuDropdown}>
                            {login ? (
                                <>
                                    {userRole === 'admin' && (
                                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                                            setIsMenuVisible(false);
                                            router.push('/admin/dashboard')
                                        }}>
                                            <Ionicons name="construct" size={20} color="#4B5563" />
                                            <Text style={styles.menuText}>Administrator</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setIsMenuVisible(false);
                                        onProfilePress()
                                    }}>
                                        <Ionicons name="person-circle-outline" size={20} color="#4B5563" />
                                        <Text style={styles.menuText}>Profil Saya</Text>
                                    </TouchableOpacity>
                                    
                                    <View style={styles.menuDivider} />

                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setIsMenuVisible(false);
                                        onLogout();
                                    }}>
                                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                        <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setIsMenuVisible(false);
                                        router.push('/login');
                                    }}>
                                        <Ionicons name="log-in-outline" size={20} color="#4B5563" />
                                        <Text style={styles.menuText}>Login</Text>
                                    </TouchableOpacity>
                                    
                                    <View style={styles.menuDivider} />

                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        setIsMenuVisible(false);
                                        router.push('/register');
                                    }}>
                                        <Ionicons name="person-add-outline" size={20} color="#4B5563" />
                                        <Text style={styles.menuText}>Register</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

export default Navbar;