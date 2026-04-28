import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform, Modal, ScrollView, Image } from 'react-native';
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


function ManageReports() {
    const router = useRouter();
    const tokenKey = 'userToken';

    const [reports, setReports] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [isLoading, setIsLoading] = useState(false);

    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [reportDetailVisible, setReportDetailVisible] = useState(false);

    const [profileVisible, setProfileVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

    const [warning, setWarning] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    async function fetchReports() {
        setIsLoading(true);
        try {
            const token = await getStorageValue(tokenKey);
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/reports?status=${statusFilter}`;
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jsonResponse = await response.json();
            if (jsonResponse.status == 200) {
                setReports(jsonResponse.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdateStatus(reportId: number, nextStatus: string, notes: string = '') {
        try {
            const token = await getStorageValue(tokenKey);
            const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/reports/${reportId}/manage`;
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus, adminNotes: notes })
            });

            const jsonResponse = await response.json();
            if (jsonResponse.status == 200) {
                if (nextStatus !== 'Reviewed') {
                    setReportDetailVisible(false)
                    fetchReports();
                }
            } else {
                throw new Error(jsonResponse.message);
            }
        } catch (error) {
            console.error(error);
            setWarning({ visible: true, title: "Error", message: "Gagal mengupdate status laporan." });
        }
    }

    function openReportDetail(report: any) {
        setSelectedReport(report);
        setReportDetailVisible(true);
        
        if (report.status === 'Pending') {
            handleUpdateStatus(report.id, 'Reviewed');
            report.status = 'Reviewed'
        }
    }

    function handleViewContent() {
        if (!selectedReport) return;
        
        setSelectedTargetId(selectedReport.targetId);
        if (selectedReport.targetType === 'User') {
            setProfileVisible(true)
        } else {
            setDetailVisible(true)
        }
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => openReportDetail(item)}>
            <View style={styles.cardHeader}>
                <View style={styles.headerInfo}>
                    <Text style={styles.targetTypeText}>[{item.targetType}]</Text>
                    <Text style={styles.reasonText} numberOfLines={1}>{item.reason}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginLeft: 10 }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Utama */}
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
                <Text style={styles.title}>Manage Reports</Text>
            </View>

            {/* Filter Status */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {STATUS_FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                            onPress={() => setStatusFilter(f)}
                        >
                            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Daftar Laporan */}
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>Tidak ada laporan {statusFilter.toLowerCase()}</Text>}
            />

            <Modal visible={reportDetailVisible} animationType="slide" transparent={false}>
                {selectedReport && (
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setReportDetailVisible(false)} style={styles.modalBackBtn}>
                                <Ionicons name="arrow-back" size={24} color="#374151" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Detail Laporan</Text>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.topSection}>
                                <View style={styles.infoSection}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Reported by:</Text>
                                        <Text style={styles.infoValueHighlight}>{selectedReport.reporter?.username || 'Anonymous'}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Reported at:</Text>
                                        <Text style={styles.infoValue}>{new Date(selectedReport.createdAt).toLocaleDateString('id-ID')}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Report type:</Text>
                                        <Text style={styles.infoValue}>{selectedReport.targetType}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Cause:</Text>
                                        <Text style={styles.infoValue}>{selectedReport.reason}</Text>
                                    </View>
                                </View>

                                <View style={styles.evidenceSection}>
                                    <Text style={styles.infoLabel}>Evidence:</Text>
                                    {selectedReport.imageUrls && selectedReport.imageUrls.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.imageScroll}>
                                            {selectedReport.imageUrls.map((imgUrl: string, idx: number) => (
                                                <Image 
                                                    key={idx}
                                                    source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${imgUrl}` }} 
                                                    style={styles.evidenceImage}
                                                    resizeMode="cover"
                                                />
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <View style={styles.noEvidenceBox}>
                                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                                            <Text style={styles.noEvidenceText}>Tidak ada bukti gambar</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Bagian Deskripsi */}
                            <View style={styles.descriptionSection}>
                                <Text style={styles.infoLabel}>Description:</Text>
                                <View style={styles.descriptionBox}>
                                    <Text style={styles.descriptionText}>{selectedReport.description || 'Tidak ada deskripsi tambahan.'}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.actionBtn, styles.btnViewContent]} onPress={handleViewContent}>
                                <Ionicons name="open-outline" size={18} color="white" />
                                <Text style={styles.actionBtnText}>Lihat Konten</Text>
                            </TouchableOpacity>

                            {selectedReport.status !== 'Resolved' && selectedReport.status !== 'Rejected' && (
                                <View style={styles.resolveRejectRow}>
                                    <TouchableOpacity 
                                        style={[styles.actionBtn, styles.btnResolve]} 
                                        onPress={() => handleUpdateStatus(selectedReport.id, 'Resolved', 'Laporan telah ditindaklanjuti.')}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                        <Text style={styles.actionBtnText}>Selesai (Resolve)</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.actionBtn, styles.btnReject]} 
                                        onPress={() => handleUpdateStatus(selectedReport.id, 'Rejected', 'Laporan ditolak karena tidak valid.')}
                                    >
                                        <Ionicons name="close-circle-outline" size={18} color="white" />
                                        <Text style={styles.actionBtnText}>Tolak (Reject)</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </Modal>

            {/* Modals Konten Eksternal */}
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
                onConfirm={() => setWarning({ ...warning, visible: false })}
                onCancel={() => setWarning({ ...warning, visible: false })}
            />
        </View>
    );
}

export default ManageReports