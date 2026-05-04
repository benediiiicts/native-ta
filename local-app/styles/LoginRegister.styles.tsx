import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    // --- STYLE WEB ---
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    formWrapper: {
        width: '100%',
        maxWidth: 400,
    },

    // --- STYLE MOBILE & UMUM---
    headerContainer: {
        marginBottom: 40,
    },
    headerText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        fontWeight: '700',
    },
    input: {
        backgroundColor: '#F3F4F6',
        height: 55,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 15,
    },
    registerLink: {
        color: '#3B82F6',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    orText: { marginHorizontal: 10, color: '#9CA3AF', fontSize: 12, fontWeight: 'bold' },
    googleButton: { flexDirection: 'row', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    googleButtonText: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
});