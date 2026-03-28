import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { styles } from "../styles/LoginRegister.styles";

export default function Login() {
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
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••••" 
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={true} 
                    />
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/home')}>
                    <Text style={styles.loginButtonText}>Log in</Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.registerLink}>Register</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

            </View>
        </View>
    );
}