import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { Link, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from "react";
import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/LoginRegister.styles";
import { jwtDecode } from 'jwt-decode';

WebBrowser.maybeCompleteAuthSession();

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

const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke'
}

function Login() {
    const router = useRouter();

    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [errorMessage, setErrorMessage] = useState('');
    let [successMessage, setSuccessMessage] = useState('');
    let [isLoading, setIsLoading] = useState(false); 

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: `${process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID}`,
            scopes: ['profile', 'email'],
            responseType: ResponseType.Token,
            usePKCE: false,
            redirectUri: makeRedirectUri({})
        }, 
        discovery
    )
    
    useEffect(()=>{
        if(response?.type == 'success'){
            const { access_token } = response.params
            handleGoogleLogin(access_token)
        }
        else if(response?.type == 'error'){
            setErrorMessage("Google Login gagal atau dibatalkan.")
        }
    }, [response])

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

            if (jsonResponse.status === 200) {
                if (jsonResponse.data && jsonResponse.data.token) {
                    await saveStorage('userToken', jsonResponse.data.token);
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
    
    async function handleGoogleLogin(token: string | undefined){
        if(!token) return
        setIsLoading(true)
        try{
            const googleApiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'
            const googleResponse = await fetch(googleApiUrl,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            const googleJsonResponse = await googleResponse.json()
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/google-login`
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: googleJsonResponse.email,
                    username: googleJsonResponse.name || googleJsonResponse.given_name
                })
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                if(jsonResponse.data && jsonResponse.data.token){
                    await saveStorage('userToken', jsonResponse.data.token)
                }
                setSuccessMessage("Login Google berhasil! Mengalihkan...")
                setTimeout(()=>{
                    setIsLoading(false)
                    router.replace('/home')
                }, 2000)
            }
            else{
                setErrorMessage(jsonResponse.message)
                setIsLoading(false)
            }
        }
        catch(error){
            console.error(error)
            setErrorMessage("Gagal memproses data dari Google.")
        }
        finally{
            setIsLoading(false)
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

                <View style={styles.dividerContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>ATAU</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity 
                    style={styles.googleButton} 
                    onPress={() => promptAsync()}
                    disabled={!request || isLoading}
                >
                    <Ionicons name="logo-google" size={20} color="#4B5563" style={{ marginRight: 10 }} />
                    <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
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
    )
}

export default Login;