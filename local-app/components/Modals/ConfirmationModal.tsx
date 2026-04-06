// components/Modals/ConfirmModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '@/styles/ConfirmationModal.style';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;   // Opsional, default: "Batal"
    confirmText?: string;  // Opsional, default: "Ya"
    isDestructive?: boolean; // Jika true, tombol konfirmasi jadi warna Merah (untuk Hapus/Logout)
}

function ConfirmModal({ 
    visible, 
    title, 
    message, 
    onCancel, 
    onConfirm, 
    cancelText = "Batal", 
    confirmText = "Ya",
    isDestructive = false 
}: ConfirmModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel} // Menangani tombol "Back" fisik di Android
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                isDestructive ? styles.destructiveBtn : styles.primaryBtn
                            ]} 
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default ConfirmModal;