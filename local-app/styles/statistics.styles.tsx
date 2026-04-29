import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB', gap: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    
    // Pencarian Daerah
    searchSection: { backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderColor: '#E5E7EB', elevation: 2 },
    sectionLabel: { fontSize: 13, color: '#6B7280', fontWeight: 'bold', marginBottom: 8 },
    dropdownRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    dropdownBtn: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', padding: 10, borderRadius: 8 },
    dropdownText: { fontSize: 14, color: '#374151', flex: 1 },
    searchBtnRow: { flexDirection: 'row', gap: 10 },
    searchBtn: { flex: 1, backgroundColor: '#3B82F6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
    searchBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    resetBtn: { backgroundColor: '#FEE2E2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, borderRadius: 8 },
    resetBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },
    activeRegionText: { marginTop: 12, fontSize: 13, color: '#4B5563', fontStyle: 'italic', textAlign: 'center' },

    // Scroll Konten
    contentScroll: { flex: 1, padding: 15 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' },
    
    // Kartu Metrik Utama
    statCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', elevation: 1 },
    iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statTextGroup: { alignItems: 'center' },
    statValue: { fontSize: 26, fontWeight: '900', color: '#1F2937' },
    statTitle: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', textAlign: 'center', marginTop: 2 },
    statSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

    // Bar Charts
    breakdownBox: { backgroundColor: 'white', marginTop: 15, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
    breakdownTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
    chartContainer: { gap: 12 },
    chartRow: { flexDirection: 'row', alignItems: 'center' },
    chartLabelContainer: { width: 100, paddingRight: 10 },
    chartLabel: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
    chartBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    chartBar: { height: 16, borderRadius: 8, minWidth: 5 },
    chartValue: { marginLeft: 8, fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' },

    // Modal Dropdown
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', maxHeight: '70%', backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
    modalTitle: { fontSize: 16, fontWeight: 'bold' },
    listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    listItemText: { fontSize: 15, color: '#374151' }
});

export default styles