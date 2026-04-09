// components/Navbar.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '../styles/Navbar.styles';
import { useRouter } from 'expo-router';

function Navbar({ login, onLogout, onSearchResults, onPickLocationMode }: { login: boolean; onLogout: () => void; onSearchResults: (data: any[]) => void; onPickLocationMode: boolean}) {
    let router = useRouter();
    let [searchLocation, setSearchLocation] = useState('');
    let [errorMessage, setErrorMessage] = useState('');
    let [searchResults, setSearchResults] = useState<any[]>([])
    let [isDropdownVisible, setIsDropdownVisible] = useState(false)

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

        try {
            console.log(`Mencari lokasi: ${searchLocation}...`);
            const response = await fetch(api_url, {
                headers: requestHeaders
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            if(data.length > 0){
                setSearchResults(data)
                setIsDropdownVisible(true)
                Keyboard.dismiss()
            }
            else{
                setIsDropdownVisible(false)
                console.log("Lokasi tidak ditemukan")
            }
        }
        catch(error) {
            console.log("Gagal melakukan fetch:", error);
            Alert.alert("Error", "Gagal mengambil data dari server pencarian.");
        }
    }

    function handleLocationSelect(item: any){
        setIsDropdownVisible(false)
        setSearchLocation(item.name || item.display_name.split(',')[0])
        onSearchResults([item])
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, zIndex: 1000, elevation: 1000 }}>
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
            
            {!onPickLocationMode && !isDropdownVisible && (
                login ? (
                    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                        <Text style={styles.loginText}>Logout</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/register')}>
                            <Text style={styles.loginText}>Register</Text>
                        </TouchableOpacity>
                    </>
                )
            )}
        </View>
    )
}

export default Navbar;