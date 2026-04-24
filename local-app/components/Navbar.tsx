import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Keyboard, Platform, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { styles } from '../styles/Navbar.styles'; 

interface NavbarProps {
    login: boolean;
    onLogout: () => void;
    onSearchResults: (data: any[]) => void;
    onPickLocationMode: boolean;
    currentUserLocation?: {latitude: number, longitude: number} | null;
    onProfilePress: () => void
    userRole: string
}

function Navbar({ login, onLogout, onSearchResults, onPickLocationMode, currentUserLocation, onProfilePress, userRole }: NavbarProps) {
    let router = useRouter();

    const [searchLocation, setSearchLocation] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

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
                Keyboard.dismiss();
                if (onSearchResults) {
                    onSearchResults(data);
                }
            } else {
                setIsDropdownVisible(false);
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
            </View>
            
            {!onPickLocationMode && (
                <View style={{ zIndex: 1001, elevation: 1001, position: 'relative' }}>
                    <TouchableOpacity 
                        onPress={toggleMenu}
                        style={{
                            backgroundColor: 'white',
                            padding: 8,
                            borderRadius: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Ionicons name={isMenuVisible ? "close" : "menu"} size={28} color="#333" />
                    </TouchableOpacity>

                    {isMenuVisible && (
                        <View style={styles.menuDropdown}>
                            {login ? (
                                <>
                                {userRole == 'admin' && (
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