// components/Modals/WarningModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '@/styles/ConfirmationModal.style';

interface WarningModalProps {
    visible: boolean;
    title: string;
    message: string;
    onCancel: ()=> void,
    onConfirm: () => void;
    confirmText?: string;  // Opsional, default: "Ya"
}

function WarningModal({ 
    visible, 
    title, 
    message,
    onCancel,
    onConfirm,
    confirmText = "Ya"
}: WarningModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.destructiveBtn]} 
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

export default WarningModal;