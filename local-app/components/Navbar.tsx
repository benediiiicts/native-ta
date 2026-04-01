// components/Navbar.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '../styles/Navbar.styles';
import { useRouter } from 'expo-router';

function Navbar({ login, onLogout, onSearchResults }: { login: boolean; onLogout: () => void; onSearchResults: (data: any[]) => void}) {
    let router = useRouter();
    let [searchLocation, setSearchLocation] = useState('');
    let [errorMessage, setErrorMessage] = useState('');

    const handleSearch = async () => {
        if (!searchLocation.trim()) return; 

        const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com';
        let api_url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchLocation)}&format=json&limit=1&email=${userEmail}`;
        
        try {
            console.log(`Mencari lokasi: ${searchLocation}...`);
            const response = await fetch(api_url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Data diterima:", data);
            
            onSearchResults(data);
        }
        catch(error) {
            console.log("Gagal melakukan fetch:", error);
            Alert.alert("Error", "Gagal mengambil data dari server pencarian.");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <TouchableOpacity onPress={handleSearch} style={{ padding: 5 }}>
                    <Ionicons name="search" size={20} color="#888" style={styles.icon} />
                </TouchableOpacity>

                <TextInput 
                    style={styles.input} 
                    placeholder="Cari jalan..." 
                    placeholderTextColor="#888"
                    value={searchLocation}
                    onChangeText={setSearchLocation}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
            </View>
            
            {login ? (
                <TouchableOpacity 
                    style={styles.logoutBtn} 
                    onPress={onLogout}
                >
                    <Text style={styles.loginText}>Logout</Text>
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity 
                        style={styles.loginBtn}
                        onPress={() => router.push('/login')} 
                    >
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginBtn} 
                        onPress={() => router.push('/register')}
                    >
                        <Text style={styles.loginText}>Register</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

export default Navbar;