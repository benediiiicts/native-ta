import { StyleSheet, Platform } from 'react-native';


const styles = StyleSheet.create({
    wrapper: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    // STYLES BARU UNTUK BOTTOM SHEET MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end', // Agar muncul di bawah (Bottom Sheet)
    },
    bottomSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%', 
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    clusterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#374151'
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2
    }
});

export default styles