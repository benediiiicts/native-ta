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
    flex1: {
        flex: 1,
    },
    loadingText: {
        padding: 20,
    },

    // --- INNER CONTENT STYLES ---
    imageWrapper: {
        height: 220,
        position: "relative",
    },
    scrollViewImage: {
        flex: 1,
        width: '100%',
    },
    scrollViewImageContent: {
        flexDirection: 'row',
    },
    sliderItemContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderPlaceholderContainer: {
        height: '100%',
    },
    sliderImage: {
        width: '100%',
        height: '100%',
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
    
    // --- BADGES OVER IMAGE ---
    badgeContainer: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10,
    },
    roadNameBadge: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    roadNameBadgeText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statusBadgeRow: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    versionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedBadge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeIcon: {
        marginRight: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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

    // --- BODY CONTENT ---
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
    addVersionButton: {
        marginRight: 15,
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

    // --- BUTTONS ---
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
    buttonDisabled: {
        opacity: 0.5,
    },
    outlineButtonApproveActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    outlineButtonRejectActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    outlineButtonTextActive: {
        color: 'white',
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

    // --- PAGINATION & ARROWS ---
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
    paginationDotWrapper: {
        padding: 5,
    },
    arrowButton: {
        position: 'absolute',
        top: '50%',
        marginTop: -15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    arrowButtonLeft: {
        left: 10,
    },
    arrowButtonRight: {
        right: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "#9CA3AF",
        marginBottom: 15,
    },

    // --- COMMENTS STYLES ---
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
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    commentHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshButton: {
        marginRight: 15,
        padding: 5,
    },
    commentInputContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    commentTextInput: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    commentSubmitRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    commentSubmitButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    commentSubmitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    commentItemWrapper: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    commentAuthorText: {
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 5,
    },
    commentContentText: {
        color: '#4B5563',
        marginBottom: 8,
    },
    commentImageStyle: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    emptyCommentContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyCommentText: {
        color: '#6B7280',
    },

    // --- HISTORY STYLES ---
    roadNamePill: { 
        borderWidth: 1, 
        borderColor: '#374151', 
        borderRadius: 8, 
        paddingVertical: 6, 
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
    },
    roadNameText: { 
        fontWeight: 'bold', 
        color: '#1F2937',
        fontSize: 15,
    },
    historyCard: { 
        borderWidth: 1, 
        borderColor: '#374151', 
        borderRadius: 8, 
        padding: 15, 
        marginBottom: 15, 
        backgroundColor: '#FFFFFF' 
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15 
    },
    cardBody: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end' 
    },
    dateText: { 
        color: '#6B7280', 
        fontSize: 14 
    },
    voteContainer: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    voteText: { 
        marginLeft: 8, 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: '#1F2937' 
    },
    centerMessageText: {
        textAlign: 'center',
        marginTop: 20,
    },
    emptyHistoryText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6B7280',
    }
});