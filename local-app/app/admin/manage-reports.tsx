import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import UserProfileModal from '@/components/Modals/UserProfileModal';
import DetailModal from '@/components/Modals/DetailModal';
import WarningModal from "@/components/Modals/WarningModal";
import styles from '@/styles/manage-reports.styles';

const STATUS_FILTERS = ['Pending', 'Reviewed', 'Resolved', 'Rejected']

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


function ManageReports(){
    const router = useRouter()
    const tokenKey = 'userToken'

    const [reports, setReports] = useState<any[]>([])
    const [statusFilter, setStatusFilter] = useState('Pending')
    const [isLoading, setIsLoading] = useState(false)
    const [expandedReportId, setExpandedReportId] = useState<number | null>(null)

    const [profileVisible, setProfileVisible] = useState(false)
    const [detailVisible, setDetailVisible] = useState(false)
    const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null)

    const [warning, setWarning] = useState({visible: false, title: '', message: ''})
    
    useEffect(()=>{
        fetchReports()
    }, [statusFilter])

    async function fetchReports(){
        setIsLoading(true)
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/reports?status=${statusFilter}`
            const response = await fetch(apiUrl, {
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                setReports(jsonResponse.data)
            }
        }
        catch(error){
            console.error(error)
        }
        finally{
            setIsLoading(false)
        }
    }

    async function handleUpdateStatus(reportId: number, nextStatus: string, notes: string = ''){
        try{
            const token = await getStorageValue(tokenKey)
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/reports/${reportId}/manage`
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus, adminNotes: notes })
            })
                
            const jsonResponse = await response.json()
            if(jsonResponse.status == 200){
                if(nextStatus != 'Reviewed') fetchReports()
                setWarning({ visible: true, title: "Sukses", message: "Tindakan moderasi user berhasil disimpan." });
            }
            else{
                throw new Error(jsonResponse.message);
            }
        }
        catch(error){
            console.error(error)
        }
    }

    function toggleExpand(report: any){
        if(expandedReportId === report.id){
            setExpandedReportId(null)
        }
        else{
            setExpandedReportId(report.id)
            if(report.status === 'Pending'){
                handleUpdateStatus(report.id, 'Reviewed')
                report.status = 'Reviewed' //update lokal
            }
        }
    }

    function renderItem({item}: {item: any}){
        const isExpanded = expandedReportId === item.id

        return (
            <View style={styles.card}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item)}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.targetTypeText}>[{item.targetType}]</Text>
                        <Text style={styles.reasonText} numberOfLines={1}>{item.reason}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.cardDetail}>
                        <Text style={styles.detailText}><Text style={styles.bold}>Pelapor:</Text> {item.reporter?.username}</Text>
                        <Text style={styles.detailText}><Text style={styles.bold}>Keterangan:</Text> {item.description || '-'}</Text>
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={[styles.btn, styles.btnView]} 
                                onPress={() => {
                                    setSelectedTargetId(item.targetId);
                                    if (item.targetType === 'User') setProfileVisible(true);
                                    else setDetailVisible(true);
                                }}
                            >
                                <Text style={styles.btnText}>Lihat Konten</Text>
                            </TouchableOpacity>

                            {item.status !== 'Resolved' && item.status !== 'Rejected' && (
                                <>
                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnResolve]} 
                                        onPress={() => handleUpdateStatus(item.id, 'Resolved', 'Laporan telah ditindaklanjuti.')}
                                    >
                                        <Text style={styles.btnText}>Resolve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnReject]} 
                                        onPress={() => handleUpdateStatus(item.id, 'Rejected', 'Laporan ditolak karena data tidak valid.')}
                                    >
                                        <Text style={styles.btnText}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
                <Text style={styles.title}>Manage Reports</Text>
            </View>

            <View style={styles.filterContainer}>
                {STATUS_FILTERS.map(f => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                        onPress={() => setStatusFilter(f)}
                    >
                        <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>Tidak ada laporan {statusFilter.toLowerCase()}</Text>}
            />

            {/* Modals untuk Lihat Konten */}
            <UserProfileModal 
                visible={profileVisible} 
                onClose={() => setProfileVisible(false)} 
                userId={selectedTargetId} 
                isAdmin={true} 
                isOwnProfile={false} 
                onReportPress={() => {}} 
            />
            
            <DetailModal 
                visible={detailVisible} 
                onClose={() => setDetailVisible(false)} 
                tagId={selectedTargetId} 
                userRole="admin" 
            />

            <WarningModal
                visible={warning.visible}
                title={warning.title}
                message={warning.message}
                confirmText="OK"
                onConfirm={() => {
                    setWarning({ ...warning, visible: false });
                }}
                onCancel={() => setWarning({ ...warning, visible: false })}
            />
        </View>
    );
}

export default ManageReports