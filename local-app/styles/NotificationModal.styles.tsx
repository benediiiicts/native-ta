import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { height: '80%', backgroundColor: '#F9FAFB', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    actionRow: { alignItems: 'flex-end', padding: 10, paddingHorizontal: 15 },
    markReadText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 13 },
    notificationCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    unreadCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    iconContainer: { marginRight: 15, justifyContent: 'center' },
    textContainer: { flex: 1 },
    title: { fontSize: 15, color: '#1F2937', marginBottom: 4 },
    boldText: { fontWeight: 'bold' },
    message: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
    date: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', alignSelf: 'center', marginLeft: 10 },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 }
});

export default styles