import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "@/styles/AddTagModal.styles";

function AddTagModal({ visible, onClose }: {visible: boolean; onClose: () => {}}) {
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContainer}>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Add Picture</Text>
            </TouchableOpacity>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Enter location or use </Text>
              <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#333" />
              <Text style={styles.label}> current location</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter location...."
                value={location}
                onChangeText={setLocation}
              />
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select tag type</Text>
            <TouchableOpacity style={styles.dropdownButton}>
              <Text style={styles.dropdownText}>Tag types</Text>
              <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.inputWrapper, styles.textArea]}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.footer}>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Post a tag</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default AddTagModal;