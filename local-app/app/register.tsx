import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { styles } from '../styles/LoginRegister.styles';

function Register() {
    const router = useRouter();

    let [username, setUsername] = useState('');
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [confirmPassword, setConfirmPassword] = useState('');
    
    // State untuk mengelola UI balasan
    let [errorMessage, setErrorMessage] = useState('');
    let [successMessage, setSuccessMessage] = useState('');
    let [isLoading, setIsLoading] = useState(false); 

    async function handleRegister() {
        setErrorMessage('');
        setSuccessMessage('');

        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage("Semua kolom harus diisi.");
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

        if (password !== confirmPassword) {
            setErrorMessage("Password dan Confirm Password tidak cocok.");
            return;
        }

        try {
            setIsLoading(true);
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/register`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const jsonResponse = await response.json();
            
            if (response.status === 201) {
                setSuccessMessage("Akun berhasil terdaftar! Mengalihkan ke halaman login...");
                
                setTimeout(() => {
                    setIsLoading(false);
                    router.replace('/login');
                }, 2000); 

            } else {
                setErrorMessage(jsonResponse.message);
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Kesalahan Jaringan. Tidak dapat terhubung ke server.");
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.formWrapper}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Welcome</Text>
                    <Text style={styles.subHeaderText}>
                        Masukkan data diri Anda untuk mendaftar
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="johndoe123" 
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                        editable={!isLoading}
                    />
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

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="••••••••" 
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={true}  
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
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
                    onPress={handleRegister}
                    disabled={isLoading} 
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? "Memproses..." : "Register"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Have an account already?</Text>
                    <Link href={'/login'} asChild>
                        <TouchableOpacity disabled={isLoading}>
                            <Text style={styles.registerLink}>Log in</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

export default Register;