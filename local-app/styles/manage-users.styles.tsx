import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    backBtn: { marginRight: 15 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, height: 40, borderWidth: 1, borderColor: '#D1D5DB' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16 },
    listContainer: { padding: 15 },
    userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#374151', elevation: 1 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    usernameText: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
    adminBadge: { fontSize: 12, color: '#3B82F6', fontWeight: 'bold' },
    bannedText: { fontSize: 12, color: '#EF4444', marginTop: 2 },
    actionGroup: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { marginLeft: 15 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#6B7280', fontSize: 16 },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
    },
    pageBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pageBtnDisabled: {
        borderColor: '#F3F4F6',
    },
    pageInfo: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
});

export default styles