import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    menuContainer: { padding: 20 },
    menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
    menuDesc: { fontSize: 13, color: '#6B7280' }
});

export default styles