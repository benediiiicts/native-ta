import { styles } from "@/styles/DetailModal.styles";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TextInput, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import WarningModal from "@/components/Modals/WarningModal";
import AddVersionModal from './AddVersionModal';

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
    const [tagComments, setTagComments] = useState<any[]>([])
    const [commentMode, setCommentMode] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isReloadingComments, setIsReloadingComments] = useState(false);
    const [tempCommentImage, setTempCommentImage] = useState<any>(null);

    //untuk version history
    const [historyMode, setHistoryMode] = useState(false);
    const [versionHistory, setVersionHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    //untuk nama jalan
    const [roadName, setRoadName] = useState("Memuat Lokasi...");

    //untuk add version
    const [addVersionVisible, setAddVersionVisible] = useState(false);

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
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-roads/${tagId}/detail`
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(apiUrl, {headers})
            const jsonResponse = await response.json()
            if(jsonResponse.data){
                setTagData(jsonResponse.data)
                setTagComments(jsonResponse.data.activeVersion?.comments || [])
                //untuk ambil nama jalan
                getRoadName(jsonResponse.data.latitude, jsonResponse.data.longitude);
            }
        }
        catch(error){
            console.error(error)
        } finally{
            setIsLoading(false)
        }
    }

    async function reloadComments(){
        setIsReloadingComments(true)
        const tagId = tagData?.activeVersion?.id
        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-version/${tagId}/comment`

        try{
            const response = await fetch(apiUrl)
            const jsonResponse = await response.json()
            if(jsonResponse.data){
                setTagComments(jsonResponse.data)
            }
        }
        catch(error){
            console.error(error)
            showWarning("Gagal memuat komentar", "Silahkan cek jaringan anda")
        }
        finally{
            setIsReloadingComments(false)
        }
    }

    async function submitComment(){
        if(!newComment.trim()){
            showWarning("Input Kosong", "Silakan tulis komentar terlebih dahulu.");
            return
        }
        const token = await getStorageValue(tokenKey)
        if(!token){
            showWarning("Akses Ditolak", "Silakan login untuk berkomentar.");
            return
        }
        setIsSubmittingComment(true)
        try{
            const tagId = tagData?.activeVersion?.id
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-version/${tagId}/comment`

            const formData = new FormData()
            formData.append("content", newComment)
            if(tempCommentImage){
                const uriParts = tempCommentImage.uri.split('.')
                const fileExtension = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : 'jpg';

                if(Platform.OS == 'web'){
                    const imgResponse = await fetch(tempCommentImage.uri)
                    const blob = await imgResponse.blob()
                    formData.append("images", blob, `comment_${Date.now()}.${fileExtension}`)
                }
                else{
                    formData.append("images", {
                        uri: tempCommentImage.uri,
                        name: `comment_${Date.now()}.${fileExtension}`,
                        type: tempCommentImage.mimeType || 'image/jpeg',
                    }as any)
                }
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const jsonResponse = await response.json()
            if(jsonResponse.status == 201){
                setNewComment('')
                setTempCommentImage(null)
                reloadComments()
            }
            else{
                showWarning("Gagal", jsonResponse.message || "Gagal mengirim komentar.");
            }
        }
        catch(error){
            console.error(error);
            showWarning("Error Jaringan", "Gagal menghubungi server.");
        }
        finally{
            setIsSubmittingComment(false)
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

    async function fetchVersionHistory(){
        setIsLoadingHistory(true)
        try{
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-roads/${tagId}/versions`;
            const response = await fetch(apiUrl)
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200 && jsonResponse.data){
                setVersionHistory(jsonResponse.data)
            }
        }
        catch(error){
            console.error(error)
        }
        finally{
            setIsLoadingHistory(false)
        }
    }

    async function getRoadName(lat: number, lon: number){
        try{
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            const jsonResponse = await response.json()
            if(jsonResponse && jsonResponse.address){
                const name = jsonResponse.address.road || jsonResponse.address.neighbourhood || jsonResponse.address.village || jsonResponse.address.town || "Unkown"
                setRoadName(name)
            }
            else{
                setRoadName('Unkown')
            }
        }
        catch(error){
            console.error(`Error while fetching road name: ${error}`)
            setRoadName('Unkown')
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
        setHistoryMode(false);
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

        const currentUserVote = tagData?.currentUserVote

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

                <View style={{ position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, zIndex: 10 }}>
                    <Text style={styles.roadNameText}>{roadName}</Text>
                </View>

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
                        <TouchableOpacity 
                            style={{ marginRight: 15 }} 
                            onPress={() => setAddVersionVisible(true)}
                        >
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
                        style={[
                            styles.outlineButton, 
                            isVoting && { opacity: 0.5 },
                            currentUserVote === 'Approve' && { backgroundColor: '#10B981', borderColor: '#10B981' },
                        ]}
                        onPress={() => submitVote('Approve')}
                        disabled={isVoting}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            currentUserVote === 'Approve' && { color: 'white' }
                        ]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.outlineButton, 
                            isVoting && { opacity: 0.5 },
                            currentUserVote === 'Reject' && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
                        ]}
                        onPress={() => submitVote('Reject')}
                        disabled={isVoting}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            currentUserVote === 'Reject' && { color: 'white' }
                        ]}>Reject</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => {
                        setHistoryMode(true);
                        fetchVersionHistory();
                    }}
                >
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

    function renderHistory(){

        return(
            <View style={{ flex: 1 }}>
                {/* Header Riwayat */}
                <View style={styles.commentHeader}>
                    <View style={styles.roadNamePill}>
                        <Text style={styles.roadNameText}>{roadName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setHistoryMode(false)}>
                        <Ionicons name="close-circle" size={32} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {isLoadingHistory ? (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>Memuat riwayat...</Text>
                    ) : versionHistory.filter((ver) => ver.id !== tagData?.activeVersion?.id).length === 0 ? (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>
                            Belum ada riwayat versi lain untuk jalan ini.
                        </Text>
                    ) :
                    (
                        versionHistory.filter((ver) => ver.id !== tagData?.activeVersion?.id)
                            .map((ver) => {
                            const totalVotes = ver.approveCount + ver.rejectCount;
                            const approvePercentage = totalVotes > 0 ? Math.round((ver.approveCount / totalVotes) * 100) : 0;
                            const isThumbsUp = approvePercentage >= 50;

                            return (
                                <View key={ver.id} style={styles.historyCard}>
                                    <View style={styles.cardHeader}>
                                        <FontAwesome5 
                                            name={ver.status === 'Sudah Diperbaiki' ? "check-circle" : "exclamation-triangle"} 
                                            size={20} 
                                            color={ver.status === 'Sudah Diperbaiki' ? "#10B981" : "#F59E0B"} 
                                        />
                                        <Text style={styles.statusText}>{ver.status}</Text>
                                    </View>
                                    
                                    <View style={styles.cardBody}>
                                        <View>
                                            <Text style={styles.authorText}>Created by {ver.author?.username}</Text>
                                            <Text style={styles.dateText}>{new Date(ver.createdAt).toLocaleDateString('id-ID')}</Text>
                                        </View>
                                        <View style={styles.voteContainer}>
                                            <FontAwesome5 name={isThumbsUp ? "thumbs-up" : "thumbs-down"} size={18} color="#374151" />
                                            <Text style={styles.voteText}>{approvePercentage}%</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        )
    }

    function renderComments () {

        return(
            <View style={{ flex: 1 }}>
                <View style={styles.commentHeader}>
                    <View style={styles.commentsLeft}>
                        <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                        <Text style={styles.commentsText}>Comments ({tagComments.length})</Text>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                            onPress={reloadComments} 
                            disabled={isReloadingComments}
                            style={{ marginRight: 15, padding: 5 }}
                        >
                            <Ionicons 
                                name="refresh" 
                                size={22} 
                                color={isReloadingComments ? "#9CA3AF" : "#3B82F6"} 
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setCommentMode(false)}>
                            <Ionicons name="chevron-down" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
                        <TextInput
                            style={{ backgroundColor: 'white', padding: 10, borderRadius: 8, minHeight: 60, textAlignVertical: 'top' }}
                            placeholder="Tulis komentar Anda..."
                            multiline
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                            <TouchableOpacity 
                                style={{ backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                                onPress={submitComment}
                                disabled={isSubmittingComment}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {isSubmittingComment ? "Mengirim..." : "Kirim"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {tagComments.length > 0 ? (
                        tagComments.map(
                            (comment: any, index: number) => {
                                let commentImage = null
                                if(comment.imageUrl){
                                    commentImage = comment.imageUrl.startsWith('http') 
                                        ? comment.imageUrl 
                                        : `${process.env.EXPO_PUBLIC_API_URL}/uploads/${comment.imageUrl}`;
                                }

                                return (
                                    <View key={index} style={{ marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                                        <Text style={{ fontWeight: 'bold', color: '#374151', marginBottom: 5 }}>
                                            {comment.commentAuthor?.username || 'Anonymous'}
                                        </Text>
                                        <Text style={{ color: '#4B5563', marginBottom: 8 }}>
                                            {comment.content}
                                        </Text>
                                        
                                        {commentImage && (
                                            <Image 
                                                source={{ uri: commentImage }} 
                                                style={{ width: '100%', height: 150, borderRadius: 8 }} 
                                                contentFit="cover"
                                            />
                                        )}
                                    </View>
                                )
                            }
                        )
                    ): (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={{ color: '#6B7280' }}>Belum ada komentar. Jadilah yang pertama!</Text>
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
                    {historyMode 
                        ? renderHistory() 
                        : commentMode 
                            ? renderComments() 
                            : renderDetails()
                    }

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
            
            {tagId && (
                <AddVersionModal
                    visible={addVersionVisible}
                    onClose={() => setAddVersionVisible(false)}
                    tagRoadId={tagId}
                    onVersionAdded={() => {
                        fetchTagDetail(); 
                    }}
                />
            )}
        </Modal>
    );
}

export default DetailModal