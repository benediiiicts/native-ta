import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: 'white', height: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    content: { padding: 20 },
    label: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
    reasonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    reasonChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
    reasonChipActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
    reasonText: { color: '#4B5563', fontWeight: '500' },
    reasonTextActive: { color: 'white' },
    textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 15, minHeight: 100, backgroundColor: '#F9FAFB' },
    imageScroll: { flexDirection: 'row', marginBottom: 30 },
    addImageBtn: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', marginRight: 10 },
    imagePreviewContainer: { position: 'relative', marginRight: 15 },
    imagePreview: { width: 80, height: 80, borderRadius: 10 },
    removeImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    submitBtn: { backgroundColor: '#EF4444', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default styles