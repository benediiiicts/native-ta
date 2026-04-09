import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
    // --- MODAL & RESPONSIVE LAYOUT ---
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: Platform.OS === "web" ? "flex-start" : "flex-end",
        alignItems: Platform.OS === "web" ? "flex-start" : "center",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        ...(Platform.OS === "web"
            ? {//for web
                  width: 400, // Fixed width on web
                  maxWidth: "90%", // Safety net for small browser windows
                  height: "100%", // Full height on the left side
                  shadowColor: "#000",
                  shadowOffset: { width: 5, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
              }
            : {//for mobile
                  width: "100%", // Full width on mobile
                  height: "75%", // Covers 75% from bottom to top
                  borderTopLeftRadius: 20, // Rounded top corners for bottom sheet
                  borderTopRightRadius: 20,
              }),
    },

    // --- INNER CONTENT STYLES ---
    imageWrapper: {
        height: 220,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        backgroundColor: "#E5E7EB", 
    },
    closeButton: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
    },
    streetLabel: {
        position: "absolute",
        bottom: 15,
        left: 15,
        backgroundColor: "#FFFFFF",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1F2937",
    },
    streetLabelText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1F2937",
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40, // Extra padding at the bottom for scrolling
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    statusGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginLeft: 8,
    },
    actionGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    authorText: {
        fontSize: 15,
        color: "#4B5563",
        marginBottom: 20,
    },
    descLabel: {
        fontSize: 15,
        color: "#1F2937",
        marginBottom: 8,
    },
    descBox: {
        borderWidth: 1,
        borderColor: "#4B5563",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    descText: {
        fontSize: 15,
        color: "#374151",
        lineHeight: 22,
    },
    approvalRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    approvalText: {
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 10,
        color: "#1F2937",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    outlineButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#1F2937",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginHorizontal: 5,
        backgroundColor: "#FFFFFF",
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    historyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E5E7EB",
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    historyText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#374151",
        marginLeft: 8,
    },
    paginationWrapper: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: 10,
        height: 10,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    divider: {
        height: 1,
        backgroundColor: "#9CA3AF",
        marginBottom: 15,
    },
    commentsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    commentsLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    commentsText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1F2937",
        marginLeft: 10,
    },

    // --- COMMENTS STYLES ---
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    commentItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        paddingBottom: 15,
    },
    commentUser: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
        marginBottom: 10,
    },
    commentImage: {
        width: 120,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
        marginTop: 5,
    },
    
});