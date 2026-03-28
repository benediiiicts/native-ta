// components/Navbar.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { styles } from '../styles/Navbar.styles';
import { useRouter } from 'expo-router';

export default function Navbar() {
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
            
            <TouchableOpacity 
                style={styles.loginBtn} 
                onPress={() => router.push('../login')}
            >
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}