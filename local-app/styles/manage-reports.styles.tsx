import {StyleSheet, Platform} from 'react-native'

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB', gap: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    filterContainer: { padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10 },
    filterChipActive: { backgroundColor: '#3B82F6' },
    filterText: { fontSize: 14, color: '#4B5563' },
    filterTextActive: { color: 'white', fontWeight: 'bold' },
    
    // Style Daftar Card
    card: { backgroundColor: 'white', marginHorizontal: 15, marginTop: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
    headerInfo: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
    targetTypeText: { fontWeight: 'bold', color: '#3B82F6', fontSize: 13 },
    reasonText: { color: '#374151', flex: 1, fontSize: 15, fontWeight: '500' },
    dateText: { fontSize: 12, color: '#9CA3AF' },
    empty: { textAlign: 'center', marginTop: 40, color: '#9CA3AF', fontSize: 16 },

    // Style Modal Detail (Wireframe)
    modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    modalBackBtn: { marginRight: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    modalContent: { flex: 1, padding: 20 },
    
    topSection: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 20, marginBottom: 20 },
    infoSection: { flex: 1, gap: 15 },
    infoRow: { flexDirection: 'column', gap: 4 },
    infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    infoValue: { fontSize: 16, color: '#1F2937' },
    infoValueHighlight: { fontSize: 16, color: '#3B82F6', fontWeight: 'bold', textDecorationLine: 'underline' },
    
    evidenceSection: { flex: Platform.OS === 'web' ? 1 : undefined, height: 200 },
    imageScroll: { marginTop: 8, borderRadius: 8, overflow: 'hidden' },
    evidenceImage: { width: 250, height: 180, marginRight: 10, borderRadius: 8, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB' },
    noEvidenceBox: { marginTop: 8, height: 180, backgroundColor: '#F3F4F6', borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    noEvidenceText: { color: '#9CA3AF', marginTop: 8 },

    descriptionSection: { marginTop: 10 },
    descriptionBox: { marginTop: 8, backgroundColor: 'white', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', minHeight: 120 },
    descriptionText: { fontSize: 15, color: '#374151', lineHeight: 22 },

    modalFooter: { backgroundColor: 'white', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderColor: '#E5E7EB', gap: 10 },
    resolveRejectRow: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionBtnText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    btnViewContent: { backgroundColor: '#4B5563' }, // Abu-abu gelap
    btnResolve: { backgroundColor: '#10B981' }, // Hijau
    btnReject: { backgroundColor: '#EF4444' }, // Merah

    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    closePreviewBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
    fullImage: { width: '100%', height: '80%' }
});

export default styles