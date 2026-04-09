import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Platform, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "@/styles/DetailModal.styles";

interface DetailModalProps {
    visible: boolean;
    onClose: () => void;
    tagId: number | null;
}

function DetailModal({ visible, onClose, tagId }: DetailModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [tagData, setTagData] = useState<any>(null)

    //untuk slide image
    const [activeIndex, setActiveIndex] = useState(0)
    const [sliderWidth, setSliderWidth] = useState(0)

    //untuk komentar
    const [commentMode, setCommentMode] = useState(false)
    const [newComment, setNewComment] = useState('')
    

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
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                >
                    {images.length > 0 ? (
                        images.map(
                            (img: any, index: number) => {
                                let imageUrl = `${process.env.EXPO_PUBLIC_API_URL}/${img.imageUrl}`

                                return (
                                    <Image
                                        key={index}
                                        source={{uri: imageUrl}}
                                        style={[styles.image, {width: sliderWidth > 0 ? sliderWidth : 400}]}
                                    />
                                )
                            })
                    ):(
                        <Image 
                            source={{ uri: "https://via.placeholder.com/400x200?text=Tidak+Ada+Foto" }} 
                            style={[styles.image, { width: sliderWidth > 0 ? sliderWidth : 400 }]} 
                        />
                    )}
                </ScrollView>

                {images.length > 1 && (
                    <View style={styles.paginationWrapper}>
                        {images.map((_: any, index: number) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.dot, 
                                    activeIndex === index ? styles.activeDot : styles.inactiveDot
                                ]} 
                            />
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
                                    commentImage  =`${process.env.EXPO_PUBLIC_API_URL}/${comment.imageUrl}`
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
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export default DetailModal