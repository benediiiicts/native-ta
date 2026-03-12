import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { styles } from '../styles/LoginRegister.styles'

function Register(){
    const router = useRouter();
    return(
        <View style={styles.container}>
            <View style={styles.formWrapper}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>
                        Welcome
                    </Text>
                    <Text style={styles.subHeaderText}>
                        masukkan email dan kata sandi untuk mendaftar
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
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="••••••••" 
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={true}  
                    />
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
                    <Text style={styles.loginButtonText}>Register</Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Have an account already?</Text>
                    <Link href={'/login'} asChild>
                        <TouchableOpacity>
                            <Text style={styles.registerLink}>Log in</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    )
}

export default Register
