import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
    closeButton: { position: 'absolute', top: 15, right: 15 },
    header: { alignItems: 'center', marginBottom: 20 },
    avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    username: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    email: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    input: { borderBottomWidth: 1, borderBottomColor: '#3B82F6', fontSize: 20, fontWeight: 'bold', textAlign: 'center', width: 200 },
    memberSince: { fontSize: 12, color: '#9CA3AF', marginTop: 5 },
    statsContainer: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20, marginBottom: 20 },
    statBox: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
    statLabel: { fontSize: 12, color: '#6B7280' },
    actionButton: { flexDirection: 'row', padding: 12, borderRadius: 10, width: '100%', justifyContent: 'center', alignItems: 'center' },
    actionButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    reportButton: { flexDirection: 'row', alignItems: 'center' },
    reportButtonText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 5 }
});

export default styles