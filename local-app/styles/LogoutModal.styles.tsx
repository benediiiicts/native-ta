import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1F2937',
    },
    message: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelBtn: {
        backgroundColor: '#E5E7EB',
    },
    confirmBtn: {
        backgroundColor: '#EF4444',
    },
    cancelText: {
        color: '#374151',
        fontWeight: 'bold',
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export { styles }