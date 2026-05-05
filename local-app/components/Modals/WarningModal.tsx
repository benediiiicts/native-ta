// components/Modals/WarningModal.tsx
import styles from '@/styles/ConfirmationModal.style';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface WarningModalProps {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string; 
}

function WarningModal({ 
    visible, 
    title, 
    message,
    onCancel,
    onConfirm,
    confirmText = "Ya",
    cancelText = "Batal"
}: WarningModalProps) {
    const isSingleButton = !onConfirm;

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
                        {!isSingleButton && (
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelBtn]} 
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                            style={[styles.button, styles.primaryBtn, isSingleButton && { flex: 1, marginLeft: 0 }]} 
                            onPress={isSingleButton ? onCancel : onConfirm}
                        >
                            <Text style={styles.confirmText}>
                                {isSingleButton ? "OK" : confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default WarningModal;