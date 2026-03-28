import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    // --- STYLE WEB ---
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40, 
        left: 15,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 999, 
    },

    // --- STYLE MOBILE & UMUM ---
    searchBox: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 50,
        borderRadius: 25, 
        paddingHorizontal: 15,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5, 
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    loginBtn: {
        backgroundColor: '#0064FF',
        height: 50,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    loginText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    }
});