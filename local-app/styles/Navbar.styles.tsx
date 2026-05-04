import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    // --- STYLE WEB ---
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30, 
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
    logoutBtn: {
        backgroundColor: '#d81919',
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
    },
    dropdownContainer: {
        position: 'absolute',
        top: 50, // Sesuaikan dengan tinggi searchBox Anda
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 220, // KUNCI PENTING: Batasi tinggi agar bisa di-scroll walau limit 7
        elevation: 5, // Bayangan di Android
        shadowColor: '#000', // Bayangan di iOS/Web
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 1000,
    },
    dropdownItem: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemText: {
        flex: 1,
        fontSize: 13,
        color: '#1F2937',
        lineHeight: 18,
    },
     menuDropdown: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        width: 160,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuText: {
        fontSize: 15,
        color: '#4B5563',
        marginLeft: 10,
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 10,
    }
});