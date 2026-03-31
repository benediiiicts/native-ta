// components/Navbar.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '../styles/Navbar.styles';
import { useRouter } from 'expo-router';

function Navbar({ login, onLogout }: { login: boolean; onLogout: () => void }) {
    let router = useRouter()

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#888" style={styles.icon} />
                <TextInput 
                    style={styles.input} 
                    placeholder="Cari jalan di Bandung..." 
                    placeholderTextColor="#888"
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

export default Navbar