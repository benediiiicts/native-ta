import { styles } from "@/styles/DetailModal.styles";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import WarningModal from "@/components/Modals/WarningModal";

interface DetailModalProps {
    visible: boolean;
    onClose: () => void;
    tagId: number | null;
}

async function getStorageValue(key: string){
    if (Platform.OS === 'web') {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Local storage is unavailable: ${error}`);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
}

function DetailModal({ visible, onClose, tagId }: DetailModalProps) {
    const tokenKey = 'userToken';

    const [isLoading, setIsLoading] = useState(false)
    const [tagData, setTagData] = useState<any>(null)

    //untuk slide image
    const [activeIndex, setActiveIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)

    //untuk komentar
    const [commentMode, setCommentMode] = useState(false)
    const [newComment, setNewComment] = useState('')

    //untuk vote
    const [isVoting, setIsVoting] = useState(false)

    //untuk warning modal
    const [warningVisible, setWarningVisible] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [warningOnConfirm, setWarningOnConfirm] = useState<() => void>(() => () => setWarningVisible(false));

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(()=>{
        if(visible && tagId){
            fetchTagDetail()
        }
        else{
            setTagData(null)
            setCommentMode(false)
            setActiveIndex(0)
        }
    }, [visible, tagId])

    function showWarning(title: string, message: string, onConfirmAction?: () => void){
        setWarningTitle(title);
        setWarningMessage(message);

        if (onConfirmAction) {
            setWarningOnConfirm(() => onConfirmAction);
        } else {
            setWarningOnConfirm(() => () => setWarningVisible(false));
        }
        
        setWarningVisible(true);
    }

    async function fetchTagDetail(){
        setIsLoading(true)
        try{
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-roads/${tagId}/detail`
            const response = await fetch(apiUrl)
            const jsonResponse = await response.json()
            if(jsonResponse.data){
                setTagData(jsonResponse.data)
            }
        }
        catch(error){
            console.error(error)
        } finally{
            setIsLoading(false)
        }
    }

    async function submitVote(voteType: 'Approve' | 'Reject'){
        const token = await getStorageValue(tokenKey)
        if(!token){
            showWarning("Akses Ditolak", "Silakan login terlebih dahulu untuk memberikan suara.");
            return
        }

        setIsVoting(true)
        try{
            const activeVersionId = tagData?.activeVersion?.id
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-version/${activeVersionId}/vote`

            const response = await fetch(apiUrl, 
                {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({voteType})
                }
            )

            const jsonResponse = await response.json()
            if(jsonResponse.status == 200 || jsonResponse.status == 201){
                fetchTagDetail()
            }
            else{
                showWarning("Gagal", jsonResponse.message || "Gagal melakukan vote.");
            }
        }
        catch(error){
            console.error(`Voting error ${error}`)
            showWarning("Error Jaringan", "Terjadi kesalahan saat menghubungi server. Pastikan internet Anda stabil.");
        } finally{
            setIsVoting(false)
        }
    }

    function scrollToImage (index: number){
        if (scrollViewRef.current && sliderWidth > 0) {
            scrollViewRef.current.scrollTo({
                x: index * sliderWidth,
                y: 0,
                animated: true
            });
            setActiveIndex(index)
        }
    }

    function handleScroll(event: any){
        const scrollPosition = event.nativeEvent.contentOffset.x
        const index = Math.round(scrollPosition/ sliderWidth)
        setActiveIndex(index)
    }

    function handleClose (){
        setCommentMode(false);
        onClose();
    };

    function renderDetails(){
        if (isLoading || !tagData) 
            return <Text style={{padding: 20}}>Loading...</Text>;

        const activeVersion = tagData.activeVersion
        const images = activeVersion?.images || [];

        const totalVotes = activeVersion.approveCount + activeVersion.rejectCount
        let reliability = 0
        if (totalVotes > 0) {
            reliability = Math.round((activeVersion.approveCount / totalVotes) * 100);
        }

        return (
            <>
            <View style={styles.imageWrapper} onLayout={(e) => {setSliderWidth(e.nativeEvent.layout.width)}}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={{ flex: 1, width: '100%' }}  
                    contentContainerStyle={{ flexGrow: 1, flexDirection: 'row' }}
                >
                    {images.length > 0 ? (
                        images.map(
                            (img: any, index: number) => {
                                let imageUrl = img.imageUrl.startsWith('http') 
                                    ? img.imageUrl 
                                    : `${process.env.EXPO_PUBLIC_API_URL}/uploads/${img.imageUrl}`;
                                return (
                                    <View 
                                        key={index} 
                                        style={{ 
                                            width: sliderWidth > 0 ? sliderWidth : '100%',
                                            height: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Image
                                            source={{uri: imageUrl}}
                                            style={{ width: '100%', height: '100%' }} 
                                            contentFit="cover"
                                        />
                                    </View>
                                )
                            })
                    ):(
                        <View style={{ width: sliderWidth > 0 ? sliderWidth : Dimensions.get('window').width, height: '100%' }}>
                            <Image 
                                source={{ uri: "https://via.placeholder.com/400x200?text=Tidak+Ada+Foto" }} 
                                style={{ width: '100%', height: '100%' }} 
                                contentFit="cover"
                            />
                        </View>
                    )}
                </ScrollView>

                {Platform.OS === 'web' && images.length > 1 && (
                    <>
                        <TouchableOpacity 
                            style={[styles.arrowButton, { left: 10 }]} 
                            onPress={() => scrollToImage(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                        >
                            <Ionicons name="chevron-back" size={24} color={activeIndex === 0 ? "rgba(255,255,255,0.3)" : "white"} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.arrowButton, { right: 10 }]} 
                            onPress={() => scrollToImage(Math.min(images.length - 1, activeIndex + 1))}
                            disabled={activeIndex === images.length - 1}
                        >
                            <Ionicons name="chevron-forward" size={24} color={activeIndex === images.length - 1 ? "rgba(255,255,255,0.3)" : "white"} />
                        </TouchableOpacity>
                    </>
                )}

                {images.length > 1 && (
                    <View style={styles.paginationWrapper}>
                        {images.map((_: any, index: number) => (
                            <TouchableOpacity 
                                key={index} 
                                onPress={() => scrollToImage(index)}
                                style={{ padding: 5 }}
                            >
                                <View 
                                    style={[
                                        styles.dot, 
                                        activeIndex === index ? styles.activeDot : styles.inactiveDot
                                    ]} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close-circle" size={32} color="#4B5563" />
                </TouchableOpacity>

                <View style={styles.streetLabel}>
                    <Text style={styles.streetLabelText}>{tagData.issueType}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <View style={styles.statusGroup}>
                        <MaterialCommunityIcons name="traffic-cone" size={28} color="#1F2937" />
                        <Text style={styles.statusText}>{activeVersion.status}</Text>
                    </View>

                    <View style={styles.actionGroup}>
                        {/* untuk add version */}
                        <TouchableOpacity style={{ marginRight: 15 }}>
                            <FontAwesome5 name="pen" size={20} color="#374151" />
                        </TouchableOpacity>
                        {/* untuk report version */}
                        <TouchableOpacity>
                            <MaterialIcons name="report" size={28} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.authorText}>Dilaporkan oleh: {activeVersion.author?.username || 'Anonymous'}</Text>

                <Text style={styles.descLabel}>Description:</Text>
                <View style={styles.descBox}>
                    <Text style={styles.descText}>{activeVersion.description}</Text>
                </View>

                <View style={styles.approvalRow}>
                    <FontAwesome5 name="thumbs-up" size={20} color="#1F2937" />
                    <Text style={styles.approvalText}>{reliability}% approved ({totalVotes} votes)</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.outlineButton, isVoting && { opacity: 0.5 }]}
                        onPress={() => submitVote('Approve')}
                        disabled={isVoting}
                    >
                        <Text style={styles.outlineButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.outlineButton, isVoting && { opacity: 0.5 }]}
                        onPress={() => submitVote('Reject')}
                        disabled={isVoting}
                    >
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
        const comments = tagData?.activeVersion?.comments || [];

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
                    {comments.length > 0 ? (
                        comments.map(
                            (comment: any, index: number) => {
                                let commentImage = null
                                if(comment.imageUrl){
                                    commentImage = comment.imageUrl.startsWith('http') 
                                        ? comment.imageUrl 
                                        : `${process.env.EXPO_PUBLIC_API_URL}/${comment.imageUrl}`;
                                }

                                return (
                                    <View
                                        key={index}
                                        style={styles.commentImage}
                                    >
                                        <Text style={styles.commentUser}>
                                            {comment.commentAuthor?.username || 'Anonymous'}
                                        </Text>
                                        <Text style={styles.commentText}>
                                            {comment.content}
                                        </Text>
                                        
                                        {commentImage && (
                                            <Image 
                                                source={{ uri: commentImage }} 
                                                style={styles.commentImage} 
                                                contentFit="cover"
                                            />
                                        )}
                                    </View>
                                )
                            }
                        )
                    ): (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={{ color: '#6B7280' }}>Belum ada komentar.</Text>
                        </View>
                    )}

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
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {commentMode ? renderComments() : renderDetails()}

                    <WarningModal
                        visible={warningVisible}
                        title={warningTitle}
                        message={warningMessage}
                        confirmText="OK"
                        onConfirm={warningOnConfirm}
                        onCancel={() => setWarningVisible(false)}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export default DetailModal