import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '@/styles/LogoutModal.styles';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.title}>Konfirmasi Logout</Text>
                    <Text style={styles.message}>Apakah Anda yakin ingin keluar dari akun ini?</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                            <Text style={styles.cancelText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
                            <Text style={styles.confirmText}>Ya, Keluar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


export default LogoutModal;