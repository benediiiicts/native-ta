import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { styles } from "../styles/LoginRegister.styles";
import * as SecureStore from 'expo-secure-store';

async function saveStorage(key: string, value: string) {
    if(Platform.OS == 'web'){
        try{
            localStorage.setItem(key, value);
        }
        catch(error){
            console.error(`Local storage error: ${error}`);
        }
    }
    else{
        await SecureStore.setItemAsync(key, value);
    }
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

function Login() {
    const router = useRouter();

    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [errorMessage, setErrorMessage] = useState('');
    let [successMessage, setSuccessMessage] = useState('');
    let [isLoading, setIsLoading] = useState(false); 

    async function handleLogin() {
        setErrorMessage('');
        setSuccessMessage('');

        if (!email || !password) {
            setErrorMessage("Email dan password tidak boleh kosong.");
            return;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Format email tidak valid (contoh: test@gmail.com).");
            return;
        }

        if (password.length < 8) {
            setErrorMessage("Password harus memiliki minimal 8 karakter.");
            return;
        }

        try {
            setIsLoading(true);
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/login`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const jsonResponse = await response.json();

            if (response.status === 200) {
                if (jsonResponse.data && jsonResponse.data.token) {
                    await saveStorage('userToken', jsonResponse.data.token);
                    const userId = jsonResponse.data.user?.id || jsonResponse.data.id;
                    if (userId) {
                        await saveStorage('myUserId', String(userId));
                    }
                }
                setSuccessMessage("Login berhasil! Mengalihkan...");

                setTimeout(() => {
                    setIsLoading(false);
                    router.replace('/home');
                }, 2000); 
            } else {
                setErrorMessage(jsonResponse.message);
                setIsLoading(false);
            }
        }
        catch (error) {
            console.error(error);
            setErrorMessage("Kesalahan Jaringan. Tidak dapat terhubung ke server.");
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.formWrapper}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Welcome back</Text>
                    <Text style={styles.subHeaderText}>
                        Silakan masukkan email dan kata sandi Anda untuk melanjutkan.
                    </Text>
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="example@email.com" 
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••••" 
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={true} 
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                    />
                </View>
                
                {errorMessage ? (
                    <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 10, fontSize: 14 }}>
                        {errorMessage}
                    </Text>
                ) : null}

                {successMessage ? (
                    <Text style={{ color: '#10B981', textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
                        {successMessage}
                    </Text>
                ) : null}

                <TouchableOpacity 
                    style={[styles.loginButton, isLoading && { opacity: 0.7 }]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? "Memproses..." : "Log in"}
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity disabled={isLoading}>
                            <Text style={styles.registerLink}>Register</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

export default Login;