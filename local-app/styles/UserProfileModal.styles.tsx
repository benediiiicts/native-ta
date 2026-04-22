import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', maxWidth: 400, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 5 },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, padding: 5 },
    header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    username: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
    memberSince: { fontSize: 14, color: '#6B7280' },
    statsContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 15, width: '100%', marginBottom: 20 },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: '#E5E7EB' },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 },
    statLabel: { fontSize: 13, color: '#4B5563' },
    reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, width: '100%', borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 10 },
    reportButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }
});

export default styles