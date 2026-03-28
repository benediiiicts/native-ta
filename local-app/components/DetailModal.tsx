import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles/DetailModal.styles";

function DetailModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    let [commentMode, setCommentMode] = useState(false);
    let reliability = 75;

    let handleClose = () => {
        setCommentMode(false);
        onClose();
    };

    function renderDetails(){
        return (
            <>
            <View style={styles.imageWrapper}>
                <Image 
                    source={{ uri: "https://via.placeholder.com/400x200" }} 
                    style={styles.image} 
                />
                
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close-circle" size={32} color="#4B5563" />
                </TouchableOpacity>

                <View style={styles.streetLabel}>
                    <Text style={styles.streetLabelText}>St. Street 123 No. 4</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                
                <View style={styles.headerRow}>
                    <View style={styles.statusGroup}>
                        <MaterialCommunityIcons name="traffic-cone" size={28} color="#1F2937" />
                        <Text style={styles.statusText}>Unresolved Issue</Text>
                    </View>
                    <View style={styles.actionGroup}>
                        <TouchableOpacity style={{ marginRight: 15 }}>
                            <FontAwesome5 name="pen" size={20} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MaterialIcons name="report" size={28} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.authorText}>Created by User123</Text>

                <Text style={styles.descLabel}>Description:</Text>
                <View style={styles.descBox}>
                    <Text style={styles.descText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed facilisis leo.
                    </Text>
                </View>

                <View style={styles.approvalRow}>
                    <FontAwesome5 name="thumbs-up" size={20} color="#1F2937" />
                    <Text style={styles.approvalText}>{reliability}% approved</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.historyButton}>
                    <MaterialCommunityIcons name="history" size={24} color="#374151" />
                    <Text style={styles.historyText}>See other versions...</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.commentsRow} onPress={() => setCommentMode(!commentMode)}>
                    <View style={styles.commentsLeft}>
                        <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                        <Text style={styles.commentsText}>Comments</Text>
                    </View>
                    <Ionicons name="chevron-up" size={24} color="#1F2937" />
                </TouchableOpacity>
            </ScrollView>
        </>
        );
    };

    function renderComments () {
        return(
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.commentHeader} onPress={() => setCommentMode(!commentMode)}>
                    <View style={styles.commentsLeft}>
                        <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                        <Text style={styles.commentsText}>Comments</Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color="#1F2937" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.commentItem}>
                        <Text style={styles.commentUser}>User123</Text>
                        <Text style={styles.commentText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed facilisis leo.
                        </Text>
                        <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.commentImage} />
                    </View>

                    {/* Komentar 2 (Tanpa Gambar) */}
                    <View style={styles.commentItem}>
                        <Text style={styles.commentUser}>User456</Text>
                        <Text style={styles.commentText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed facilisis leo.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType={Platform.OS === "web" ? "fade" : "slide"} 
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.modalContainer}>
                    {commentMode ? renderComments() : renderDetails()}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export default DetailModal