import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', gap: 15 },
    title: { fontSize: 18, fontWeight: 'bold' },
    filterContainer: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: 'white' },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6' },
    filterChipActive: { backgroundColor: '#3B82F6' },
    filterText: { fontSize: 12, color: '#4B5563' },
    filterTextActive: { color: 'white', fontWeight: 'bold' },
    card: { backgroundColor: 'white', marginHorizontal: 15, marginTop: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
    headerInfo: { flex: 1, flexDirection: 'row', gap: 8 },
    targetTypeText: { fontWeight: 'bold', color: '#3B82F6' },
    reasonText: { color: '#374151', flex: 1 },
    cardDetail: { padding: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FAFAFA' },
    detailText: { fontSize: 14, marginBottom: 5, color: '#4B5563' },
    bold: { fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, flex: 1, alignItems: 'center' },
    btnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    btnView: { backgroundColor: '#6B7280' },
    btnResolve: { backgroundColor: '#10B981' },
    btnReject: { backgroundColor: '#EF4444' },
    empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});

export default styles