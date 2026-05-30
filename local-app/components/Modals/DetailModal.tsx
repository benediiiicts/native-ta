import WarningModal from "@/components/Modals/WarningModal";
import { styles } from "@/styles/DetailModal.styles";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Alert, Dimensions, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import AddVersionModal from './AddVersionModal';
import ReportModal from "./ReportModal";
import TagManageModal from "./TagManageModal";
import UserProfileModal from "./UserProfileModal";
import { jwtDecode } from "jwt-decode";

interface DetailModalProps {
    visible: boolean;
    onClose: () => void;
    tagId: number | null;
    currentUserId?: number | null;
    userRole?: string | null;
    onTagUpdated?: () => void;
}

async function getStorageValue(key: string){
    let token = null
    if (Platform.OS === 'web') {
        try {
            token = localStorage.getItem(key);
        } catch (error) {
            console.error(`Local storage is unavailable: ${error}`);
            return null;
        }
    } else {
        token = await SecureStore.getItemAsync(key);
    }

    //cek jika token expire
    if(token){
        try{
            const decoded = jwtDecode(token)
            const currentTime = Date.now() / 1000

            if(decoded.exp && decoded.exp < currentTime){
                if(Platform.OS === 'web') localStorage.removeItem(key)
                else await SecureStore.deleteItemAsync(key)

                return null
            }
        }
        catch(error){
            console.error(`Gagal encoding token: ${error}`)
            return null
        }
    }

    return token
}

function DetailModal({ visible, onClose, tagId, currentUserId, userRole, onTagUpdated }: DetailModalProps) {
    const tokenKey = 'userToken';

    //untuk data detail tag
    const [isLoading, setIsLoading] = useState(false)
    const [tagData, setTagData] = useState<any>(null)
    const [viewedVersionId, setViewedVersionId] = useState<number | null>(null);
    const [manageTagVisible, setManageTagVisible] = useState(false)

    //untuk slide image
    const [activeIndex, setActiveIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)

    //untuk preview image
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    //untuk komentar
    const [tagComments, setTagComments] = useState<any[]>([])
    const [commentMode, setCommentMode] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isReloadingComments, setIsReloadingComments] = useState(false);
    const [tempCommentImage, setTempCommentImage] = useState<any>(null);
    const [commentExpanded, setCommentExpanded] = useState<{num: number, status: boolean} | null>(null)

    //untuk version history
    const [historyMode, setHistoryMode] = useState(false);
    const [versionHistory, setVersionHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    //untuk modal profile
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // State untuk Report Modal
    const [reportVisible, setReportVisible] = useState(false);
    const [reportTargetType, setReportTargetType] = useState<'User' | 'TagVersion' | 'Comment' | null>(null);
    const [reportTargetId, setReportTargetId] = useState<number | null>(null);
    const [reportTargetName, setReportTargetName] = useState<string>('');

    //untuk deskripsi
    const [descExpanded, setDescExpanded] = useState(false)

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
    const [warningOnConfirm, setWarningOnConfirm] = useState<(() => void) | undefined>(undefined);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(()=>{
        if(visible && tagId){
            fetchTagDetail()
        }
        else{
            setTagData(null)
            setCommentMode(false)
            setHistoryMode(false)
            setActiveIndex(0)
            setViewedVersionId(null)
        }
    }, [visible, tagId, viewedVersionId])

    function showWarning(title: string, message: string, onConfirmAction?: () => void){
        setWarningTitle(title);
        setWarningMessage(message);

        if (onConfirmAction) {
            setWarningOnConfirm(() => onConfirmAction);
        } else {
            setWarningOnConfirm(undefined);
        }
        
        setWarningVisible(true);
    }

    async function fetchTagDetail(){
        setIsLoading(true)
        try{
            const token = await getStorageValue(tokenKey)
            let apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/tag-roads/${tagId}/detail`
            if(viewedVersionId){
                apiUrl += `?versionId=${viewedVersionId}`
            }
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

    async function pickCommentImage() {
        try {
            if (Platform.OS === 'web') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/jpeg, image/png, image/webp';
                input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                        setTempCommentImage({
                            uri: URL.createObjectURL(file),
                            mimeType: file.type,
                            fileName: file.name
                        });
                    }
                };
                input.click();
                return;
            }

            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                showWarning('Izin Diperlukan', 'Izin untuk mengakses galeri media diperlukan.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled) {
                const mimeType = result.assets[0].mimeType || 'image/jpeg';
                if (!mimeType.startsWith('image/')) {
                    showWarning("File Ditolak", "Format file tidak didukung.")
                    return
                }
                setTempCommentImage(result.assets[0]);
            }
        } catch (error) {
            console.error(error);
            showWarning("Gagal", "Terjadi kesalahan saat memproses gambar.");
        }
    }

    async function takeCommentPhoto() {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                showWarning('Izin Diperlukan', 'Izin kamera diperlukan.');
                return;
            }
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });
            if (!result.canceled) {
                const mimeType = result.assets[0].mimeType || 'image/jpeg';
                if (!mimeType.startsWith('image/')) {
                    showWarning("File Ditolak", "Format file tidak didukung.")
                    return
                }
                setTempCommentImage(result.assets[0]);
            }
        } catch (error) {
            console.error(error);
            showWarning("Gagal", "Terjadi kesalahan kamera.");
        }
    }

    function handleAddCommentImage() {
        if (Platform.OS === 'web') {
            pickCommentImage();
        } else {
            Alert.alert(
                "Kirim Gambar",
                "Pilih sumber gambar",
                [
                    { text: "Kamera", onPress: takeCommentPhoto },
                    { text: "Galeri", onPress: pickCommentImage },
                    { text: "Batal", style: "cancel" }
                ]
            );
        }
    }

    async function submitComment(){
        if(!newComment.trim()){
            showWarning("Input Kosong", "Silakan tulis komentar terlebih dahulu.");
            return
        }
        const token = await getStorageValue(tokenKey)
        if(!token){
            showWarning("Akses Ditolak", "Silakan login untuk berkomentar.", ()=>{router.push('/login'); onClose()});
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

                if(Platform.OS === 'web'){
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
            if(jsonResponse.status === 201){
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
            if(jsonResponse.status === 200 || jsonResponse.status === 201){
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
            if(jsonResponse.status === 200 && jsonResponse.data){
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
            const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com';
            const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`

            let requestHeaders: any = {
                'Accept': 'application/json'
            }

            if (Platform.OS !== 'web') {
                requestHeaders['User-Agent'] = `MyTAppDev/1.0 (${userEmail})`;
            }
            const response = await fetch(apiUrl, {
                headers: requestHeaders
            })
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

    const currentWidth = sliderWidth > 0 ? sliderWidth : (Platform.OS === 'web' ? 400 : Dimensions.get('window').width);

    function scrollToImage(index: number) {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: index * currentWidth,
                y: 0,
                animated: true
            });
            setActiveIndex(index);
        }
    }

    function handleReport(type: 'User' | 'TagVersion' | 'Comment', id: any, name=null){
        if(!type || !id){
            showWarning("Terjadi kesalahan", "Tidak bisa melakukan report")
            return
        }
        if(!userRole){
            showWarning("Akses Ditolak", "Login untuk dapat melakukan report", ()=>{router.push('/login'); onClose();})
            return
        }
        if(name){
            setReportTargetName(name)
        }
        setReportTargetType(type);
        setReportTargetId(id);
        setReportVisible(true);
    }

    async function handleDeleteComment(commentId : number){
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tags/comment/${commentId}`
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if(response.ok){
                reloadComments()
            }
            else{
                showWarning("Gagal", "Tidak dapat menghapus komentar.");
            }
        }
        catch(error){
            console.error(error)
            showWarning("Error", "Terjadi kesalahan pada jaringan.")
        }
    }

    function handleAddVersion(){
        if(!userRole){
            showWarning("Akses Ditolak", "Login untuk memperbarui infomasi laporan", ()=>{router.push('/login'); onClose();})
            return
        }
        setAddVersionVisible(true)
    }

    function handleAdminTagActions(){
        setManageTagVisible(true)
    }

    function handleScroll(event: any) {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / currentWidth);
        setActiveIndex(index);
    }

    function handleClose (){
        setDescExpanded(false)
        setCommentMode(false);
        setHistoryMode(false);
        onClose();
    };

    function renderDetails(){
        if (isLoading || !tagData) 
            return <Text style={styles.loadingText}>Loading...</Text>

        if (!isLoading && !tagData) 
            return <Text style={styles.loadingText}>Data tidak ditemukan atau sudah dihapus.</Text>

        const activeVersion = tagData.activeVersion
        const images = activeVersion?.images || [];

        const isMainVersion = tagData.activeVersionId == activeVersion.id
        const isVerified = activeVersion.isVerified

        const totalVotes = activeVersion.approveCount + activeVersion.rejectCount
        let reliability = 0
        if (totalVotes > 0) {
            reliability = Math.round((activeVersion.approveCount / totalVotes) * 100);
        }

        const currentUserVote = tagData?.currentUserVote

        const descIsLong = (activeVersion.description?.length ?? 0) > 200 
            || (activeVersion.description?.split('\n').length ?? 0) > 3

        return (
            <>
            <View 
                style={styles.imageWrapper} 
                onLayout={(e) => {
                    const newWidth = e.nativeEvent.layout.width;
                    if (newWidth > 0 && newWidth !== sliderWidth) {
                        setSliderWidth(newWidth);
                    }
                }}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    persistentScrollbar={true}
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
                                    <TouchableOpacity 
                                        key={index} 
                                        style={{ 
                                            width: currentWidth,
                                            height: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                        activeOpacity={0.9}
                                        onPress={() => setPreviewImage(imageUrl)}
                                    >
                                        <Image
                                            source={{uri: imageUrl}}
                                            style={{ width: '100%', height: '100%', backgroundColor: "#E5E7EB" }} 
                                            contentFit="cover"
                                        />
                                    </TouchableOpacity>
                                )
                            })
                    ):(
                        <View 
                            style={{ width: currentWidth, height: '100%' }}
                        >
                            <Image 
                                source={{ uri: "https://via.placeholder.com/400x200?text=Tidak+Ada+Foto" }} 
                                style={{ width: '100%', height: '100%', backgroundColor: "#E5E7EB" }} 
                                contentFit="cover"
                            />
                        </View>
                    )}
                </ScrollView>

                {Platform.OS === 'web' && images.length > 1 && (
                    <>
                        <TouchableOpacity 
                            style={[styles.arrowButton, styles.arrowButtonLeft]} 
                            onPress={() => scrollToImage(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                        >
                            <Ionicons name="chevron-back" size={24} color={activeIndex === 0 ? "rgba(255,255,255,0.3)" : "white"} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.arrowButton, styles.arrowButtonRight]} 
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
                                style={styles.paginationDotWrapper}
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

                <View style={styles.badgeContainer}>
                    <View style={styles.roadNameBadge}>
                        <Text style={styles.roadNameBadgeText} numberOfLines={1}>{roadName}</Text>
                    </View>

                    <View style={styles.statusBadgeRow}>
                        <View style={[
                            styles.versionBadge, 
                            { backgroundColor: isMainVersion ? '#10B981' : '#6B7280' }
                        ]}>
                            <Ionicons name={isMainVersion ? "star" : "time"} size={12} color="white" style={styles.badgeIcon} />
                            <Text style={styles.badgeText}>
                                {isMainVersion ? "Versi Utama" : ""}
                            </Text>
                        </View>

                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={12} color="white" style={styles.badgeIcon} />
                                <Text style={styles.badgeText}>Terverifikasi</Text>
                            </View>
                        )}
                    </View>
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
                        <TouchableOpacity 
                            style={styles.addVersionButton} 
                            onPress={handleAddVersion}
                        >
                            <FontAwesome5 name="pen" size={20} color="#374151" />
                        </TouchableOpacity>
                        {userRole == 'admin' ? (
                            <TouchableOpacity onPress={handleAdminTagActions}>
                                <MaterialCommunityIcons name="wrench" size={28} color="#8B5CF6" />
                            </TouchableOpacity>
                        ):(
                        <TouchableOpacity 
                            onPress={() => {
                                handleReport('TagVersion', activeVersion.id)
                            }}
                        >
                            <MaterialIcons name="report" size={28} color="#374151" />
                        </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 15, color: "#4B5563" }}>Dilaporkan oleh: </Text>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                        if (activeVersion.author?.id) {
                            setSelectedUserId(activeVersion.author.id);
                            setProfileModalVisible(true);
                        }
                    }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3B82F6' }} numberOfLines={1}>
                            {activeVersion.author?.username || 'Anonymous'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 15, color: "#4B5563" }}>
                        {activeVersion?.createdAt 
                            ? new Date(activeVersion.createdAt).toLocaleString('id-ID', {
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit'
                              }) 
                            : '-'}
                    </Text>
                </View>

                <Text style={styles.descLabel}>Deskripsi:</Text>
                <View style={styles.descBox}>
                    <Text
                        style={styles.descText}
                        numberOfLines={descExpanded ? undefined : 4}
                    >
                        {activeVersion.description}
                    </Text>
                    {descIsLong && (
                        <TouchableOpacity onPress={() => setDescExpanded(prev => !prev)}>
                            <Text style={{ color: '#3B82F6', fontSize: 13, marginTop: 4 }}>
                                {descExpanded ? 'Show less' : 'Show more'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.approvalRow}>
                    <FontAwesome5 name="thumbs-up" size={20} color="#1F2937" />
                    <Text style={styles.approvalText}>{reliability}% approved ({totalVotes} votes)</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[
                            styles.outlineButton, 
                            isVoting && styles.buttonDisabled,
                            currentUserVote === 'Approve' && styles.outlineButtonApproveActive,
                        ]}
                        onPress={() => submitVote('Approve')}
                        disabled={isVoting}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            currentUserVote === 'Approve' && styles.outlineButtonTextActive
                        ]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.outlineButton, 
                            isVoting && styles.buttonDisabled,
                            currentUserVote === 'Reject' && styles.outlineButtonRejectActive,
                        ]}
                        onPress={() => submitVote('Reject')}
                        disabled={isVoting}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            currentUserVote === 'Reject' && styles.outlineButtonTextActive
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
                    <Text style={styles.historyText}>Lihat versi lainnya...</Text>
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
        const versions = versionHistory.filter((ver) => ver.id !== tagData?.activeVersion?.id);
        
        const regularVersions = versions.filter((ver) => !ver.isHidden);
        const hiddenVersions = versions.filter((ver) => ver.isHidden);

        const renderCard = (ver: any, isHiddenMark: boolean) => {
            const totalVotes = ver.approveCount + ver.rejectCount;
            const approvePercentage = totalVotes > 0 ? Math.round((ver.approveCount / totalVotes) * 100) : 0;
            const isThumbsUp = approvePercentage >= 50;

            return (
                <TouchableOpacity 
                    key={ver.id} 
                    style={[styles.historyCard, isHiddenMark && { opacity: 0.6, borderColor: '#EF4444' }]}
                    onPress={() => {
                        setViewedVersionId(ver.id)
                        setHistoryMode(false)
                    }}
                >
                    <View style={styles.cardHeader}>
                        <FontAwesome5 
                            name={ver.status === 'Sudah Diperbaiki' ? "check-circle" : "exclamation-triangle"} 
                            size={20} 
                            color={ver.status === 'Sudah Diperbaiki' ? "#10B981" : "#F59E0B"} 
                        />
                        <Text style={styles.statusText}>{ver.status} {isHiddenMark && "(Hidden)"}</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.authorText} numberOfLines={1}>Created by {ver.author?.username}</Text>
                            <Text style={styles.dateText}>{new Date(ver.createdAt).toLocaleDateString('id-ID')}</Text>
                        </View>
                        <View style={styles.voteContainer}>
                            <FontAwesome5 name={isThumbsUp ? "thumbs-up" : "thumbs-down"} size={18} color="#374151" />
                            <Text style={styles.voteText}>{approvePercentage}%</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        };

        return(
            <View style={styles.flex1}>
                <View style={styles.commentHeader}>
                    <View style={styles.roadNamePill}><Text style={styles.roadNameText} numberOfLines={1}>{roadName}</Text></View>
                    <TouchableOpacity onPress={() => setHistoryMode(false)}>
                        <Ionicons name="close-circle" size={32} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer} persistentScrollbar={true}>
                    {isLoadingHistory ? (
                        <Text style={styles.centerMessageText}>Memuat riwayat...</Text>
                    ) : (
                        <>
                            {regularVersions.length === 0 && (!hiddenVersions.length || userRole !== 'admin') ? (
                                <Text style={styles.emptyHistoryText}>Belum ada riwayat versi lain.</Text>
                            ) : (
                                regularVersions.map((ver) => renderCard(ver, false))
                            )}

                            {userRole === 'admin' && hiddenVersions.length > 0 && (
                                <>
                                    <View style={{ marginVertical: 20, flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ flex: 1, height: 1, backgroundColor: 'grey' }} />
                                            <Text style={{ marginHorizontal: 10, color: 'grey', fontWeight: 'bold' }}>Disembunyikan</Text>
                                        <View style={{ flex: 1, height: 1, backgroundColor: 'grey' }} />
                                    </View>
                                    {hiddenVersions.map((ver) => renderCard(ver, true))}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>
        )
    }

    function renderComments () {

        return(
            <View style={styles.flex1}>
                <View style={styles.commentHeader}>
                    <View style={styles.commentsLeft}>
                        <Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
                        <Text style={styles.commentsText}>Comments ({tagComments.length})</Text>
                    </View>
                    
                    <View style={styles.commentHeaderRight}>
                        <TouchableOpacity 
                            onPress={reloadComments} 
                            disabled={isReloadingComments}
                            style={styles.refreshButton}
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

                <ScrollView contentContainerStyle={styles.contentContainer} persistentScrollbar={true}>
                    <View style={styles.commentInputContainer}>
                        {tempCommentImage && (
                            <View style={{ position: 'relative', width: 80, height: 80, marginBottom: 10 }}>
                                <Image source={{ uri: tempCommentImage.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} contentFit="cover" />
                                <TouchableOpacity
                                    style={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'white', borderRadius: 12 }}
                                    onPress={() => setTempCommentImage(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={[styles.commentTextInput, { flex: 1 }]}
                                placeholder="Tulis komentar Anda..."
                                multiline
                                value={newComment}
                                onChangeText={setNewComment}
                            />
                            <TouchableOpacity 
                                style={{ padding: 10, marginLeft: 8, backgroundColor: '#F3F4F6', borderRadius: 8 }}
                                onPress={handleAddCommentImage}
                            >
                                <Ionicons name="image-outline" size={24} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.commentSubmitRow}>
                            <TouchableOpacity 
                                style={styles.commentSubmitButton}
                                onPress={submitComment}
                                disabled={isSubmittingComment}
                            >
                                <Text style={styles.commentSubmitText}>
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
                                    <View key={index} style={styles.commentItemWrapper}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <TouchableOpacity style={{ flex: 1, marginRight: 10 }} onPress={()=>{
                                                const authorId = comment.commentAuthor?.id
                                                if(authorId){
                                                    setSelectedUserId(authorId);
                                                    setProfileModalVisible(true);
                                                }
                                            }}>
                                                <Text style={styles.commentAuthorText} numberOfLines={1}>
                                                    {comment.commentAuthor?.username || 'Anonymous'}
                                                </Text>
                                            </TouchableOpacity>
                                            {userRole == 'admin' ? (
                                                <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                                                    <MaterialIcons name="delete" size={22} color="#EF4444" />
                                                </TouchableOpacity>
                                            ):(
                                                <TouchableOpacity onPress={() => {
                                                    handleReport('Comment', comment.id)
                                                }}>
                                                    <MaterialIcons name="report" size={20} color="#9CA3AF" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={{ marginVertical: 5 }}>
                                            <Text 
                                                style={[styles.commentContentText, { marginTop: 0 }]}
                                                numberOfLines={commentExpanded?.num === index && commentExpanded?.status ? undefined : 4}
                                            >
                                                {comment.content}
                                            </Text>
                                            {((comment.content?.length ?? 0) > 200 || (comment.content?.split('\n').length ?? 0) > 3) && (
                                                <TouchableOpacity onPress={() => setCommentExpanded(
                                                    commentExpanded?.num === index && commentExpanded?.status
                                                        ? { num: index, status: false }
                                                        : { num: index, status: true }
                                                )}>
                                                    <Text style={{ color: '#3B82F6', fontSize: 13, marginTop: 4 }}>
                                                        {commentExpanded?.num === index && commentExpanded?.status ? 'Show less' : 'Show more'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>                        
                                        {commentImage && (
                                            <TouchableOpacity onPress={() => setPreviewImage(commentImage)}>
                                                <Image 
                                                    source={{ uri: commentImage }} 
                                                    style={styles.commentImageStyle} 
                                                    contentFit="cover"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )
                            }
                        )
                    ): (
                        <View style={styles.emptyCommentContainer}>
                            <Text style={styles.emptyCommentText}>Belum ada komentar. Jadilah yang pertama!</Text>
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
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
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
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

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

            <ReportModal 
                visible={reportVisible}
                onClose={() => setReportVisible(false)}
                targetType={reportTargetType}
                targetId={reportTargetId}
                targetName={reportTargetName}
            />

            <UserProfileModal
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                userId={selectedUserId}
                isAdmin={userRole === 'admin'}
                isOwnProfile={selectedUserId === currentUserId} 
                onProfileUpdated={() => fetchTagDetail()}
                onReportPress={(id, name) => {
                    handleReport('User', id, name as any)
                    setProfileModalVisible(false)
                }}
            />

            <TagManageModal
                visible={manageTagVisible}
                onClose={()=>setManageTagVisible(false)}
                tagId={tagId}
                versionId={tagData?.activeVersion?.id || null}
                initialData={tagData?{
                    isVerified: tagData.activeVersion?.isVerified || false,
                    roadIsActive: !tagData.isHidden,
                    versionIsActive: true
                }: null}
                onActionSuccess={()=>{
                    fetchTagDetail()
                    if (onTagUpdated) onTagUpdated()
                    onClose();
                }}
            />

            <Modal visible={!!previewImage} transparent={true} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity 
                        style={{ position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 10, padding: 10 }} 
                        onPress={() => setPreviewImage(null)}
                    >
                        <Ionicons name="close" size={36} color="white" />
                    </TouchableOpacity>
                    
                    {previewImage && (
                        <Image 
                            source={{ uri: previewImage }} 
                            style={{ width: '100%', height: '80%' }} 
                            contentFit="contain"
                        />
                    )}
                </View>
            </Modal>
        </Modal>
    );
}

export default DetailModal;