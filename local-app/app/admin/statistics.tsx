import WarningModal from "@/components/Modals/WarningModal";
import styles from '@/styles/statistics.styles';
import NotFoundPage from '@/components/NotFoundPage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { JwtPayload } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Modal, FlatList, ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DecodedToken extends JwtPayload {
    id: number;
    email: string;
    role: string;
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

function AdminStatistics(){
    const router = useRouter()
    const tokenKey = 'userToken'

    const [isLoading, setIsLoading] = useState(false)
    const [statsData, setStatsData] = useState<any>(null)

    const [provinces, setProvinces] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])
    const [selectedProvince, setSelectedProvince] = useState<any>(null)
    const [selectedCity, setSelectedCity] = useState<any>(null)

    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [dropdownMode, setDropdownMode] = useState<'province'|'city'>('province')
    
    const [currentRegionLabel, setCurrentRegionLabel] = useState('Nasional (Semua Daerah)')
    const [warning, setWarning] = useState({ visible: false, title: '', message: '' })

    useEffect(()=>{
        fetchStats()
        fetchProvinces()
    }, [])

    //fetch provinsi dan kota dengan API dari 'emsifa'
    async function fetchProvinces() {
        try {
            const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            const data = await res.json();
            setProvinces(data);
        } 
        catch(error) { 
            console.error(`Gagal memuat API Provinsi: ${error}`) 
        }
    }

    async function fetchCities(provinceId: string) {
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
            const data = await res.json();
            setCities(data);
        } catch(error) { 
            console.error(`Gagal memuat API Kota: ${error}`) 
        }
    }

    async function fetchStats(bbox:any = null){
        setIsLoading(true)
        try{
            const token = await getStorageValue(tokenKey)
            let apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/admin/statistics`
            
            if(bbox){
                apiUrl += `?minLat=${bbox.minLat}&maxLat=${bbox.maxLat}&minLon=${bbox.minLon}&maxLon=${bbox.maxLon}`;
            }
            
            const response = await fetch(apiUrl,{
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            const jsonResponse = await response.json()

            if(jsonResponse.status == 200){
                setStatsData(jsonResponse.data)
            }
        }
        catch(error){
            console.error(error)
            setWarning({ visible: true, title: "Error", message: "Gagal memuat statistik" });
        }
        finally{
            setIsLoading(false)
        }
    }

    async function handleSearchRegion(){
        if(!selectedCity || !selectedProvince) {
            setWarning({ visible: true, title: "Pilih Daerah", message: "Pilih Provinsi dan Kota/Kabupaten terlebih dahulu dari menu Dropdown." })
            setSelectedProvince(null)
            setSelectedCity(null)
            return;
        }
        setIsLoading(true)
        try{
            const queryName = `${selectedCity.name}, ${selectedProvince.name}`
            const userEmail = process.env.EXPO_PUBLIC_EMAIL || 'test@example.com'
            const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryName)}&format=json&limit=1&countrycodes=id`
        
            let requestHeaders: any = {
                'Accept': 'application/json'
            };
    
            if (Platform.OS !== 'web') {
                requestHeaders['User-Agent'] = `MyTAppDev/1.0 (${userEmail})`
            }

            const response = await fetch(apiUrl, { headers: requestHeaders })
            const jsonResponse = await response.json()
            if(jsonResponse && jsonResponse.length > 0){
                const location = jsonResponse[0]
                const bbox = {
                    minLat: location.boundingbox[0],
                    maxLat: location.boundingbox[1],
                    minLon: location.boundingbox[2],
                    maxLon: location.boundingbox[3]
                }

                setCurrentRegionLabel(`${location.display_name} (dan sekitarnya)`)
                fetchStats(bbox)
            }
            else {
                setWarning({ visible: true, title: "Tidak Ditemukan", message: "Daerah tidak ditemukan. Coba gunakan nama kota atau kabupaten yang lebih spesifik." })
                setIsLoading(false)
            }
        }
        catch(error){
            console.error(error)
            setWarning({ visible: true, title: "Error", message: "Gagal mencari daerah." })
        }
        finally{
            setIsLoading(false)
        }
    }

    function resetToNasional() {
        setSelectedProvince(null);
        setSelectedCity(null);
        setCurrentRegionLabel('Nasional (Semua Daerah)');
        fetchStats(null);
    }

    function StatCard ({ icon, title, value, subtitle, bgColor, iconColor }: any) {
        return (
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    <Ionicons name={icon} size={28} color={iconColor} />
                </View>
                <View style={styles.statTextGroup}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        )
    }

    function CustomBarChart({data, labelKey, color}: {data: any[], labelKey: string, color: string}){
        if (!data || data.length === 0) {
            return (
                <Text style={styles.emptyText}>Tidak ada data</Text>
            )
        }

        const maxCount = Math.max(...data.map(d => parseInt(d.count, 10)));

        return (
            <View style={styles.chartContainer}>
                {data.map((item, idx) => {
                    const widthPct = maxCount === 0 ? 0 : (parseInt(item.count, 10) / maxCount) * 100;
                    return (
                        <View key={idx} style={styles.chartRow}>
                            <View style={styles.chartLabelContainer}>
                                <Text style={styles.chartLabel} numberOfLines={1}>{item[labelKey]}</Text>
                            </View>
                            <View style={styles.chartBarContainer}>
                                <View style={[styles.chartBar, { width: `${widthPct}%`, backgroundColor: color }]} />
                                <Text style={styles.chartValue}>{item.count}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1F2937" /></TouchableOpacity>
                <Text style={styles.title}>Statistik Laporan</Text>
            </View>

            <View style={styles.searchSection}>
                <Text style={styles.sectionLabel}>Filter Daerah:</Text>
                <View style={styles.dropdownRow}>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={()=>{ setDropdownMode('province'); setDropdownVisible(true); }}>
                        <Text style={styles.dropdownText} numberOfLines={1}>{selectedProvince ? selectedProvince.name : "Pilih Provinsi..."}</Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.dropdownBtn, !selectedProvince && {opacity: 0.5}]} 
                        disabled={!selectedProvince}
                        onPress={()=>{ setDropdownMode('city'); setDropdownVisible(true); }}
                    >
                        <Text style={styles.dropdownText} numberOfLines={1}>{selectedCity ? selectedCity.name : "Pilih Kota/Kab..."}</Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBtnRow}>
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearchRegion}>
                        <Ionicons name="search" size={18} color="white" style={{marginRight: 6}} />
                        <Text style={styles.searchBtnText}>Terapkan Filter</Text>
                    </TouchableOpacity>
                    
                    {selectedProvince && (
                        <TouchableOpacity style={styles.resetBtn} onPress={resetToNasional}>
                            <Ionicons name="refresh" size={18} color="#EF4444" style={{marginRight: 6}} />
                            <Text style={styles.resetBtnText}>Reset ke Nasional</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.activeRegionText}>Menampilkan data: <Text style={{fontWeight: 'bold', color: '#3B82F6'}}>{currentRegionLabel}</Text></Text>
            </View>

            <ScrollView style={styles.contentScroll} contentContainerStyle={{ paddingBottom: 40 }}>
                {isLoading || !statsData ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Ringkasan (3 Bulan Terakhir)</Text>
                        <View style={{flexDirection: 'row', gap: 10}}>
                            <View style={{flex: 1}}>
                                <StatCard icon="people" title="Laporan Warga" value={statsData.engagementStats.totalNewReports} bgColor="#DBEAFE" iconColor="#3B82F6" />
                            </View>
                            <View style={{flex: 1}}>
                                <StatCard icon="warning" title="Titik Kerusakan" value={statsData.infrastructureStats.totalDamagePoints} bgColor="#FEF3C7" iconColor="#D97706" />
                            </View>
                        </View>

                        {/* Bar Chart Kategori */}
                        <View style={styles.breakdownBox}>
                            <Text style={styles.breakdownTitle}>Persebaran Kategori Kerusakan</Text>
                            <CustomBarChart data={statsData.infrastructureStats.byCategory} labelKey="issueType" color="#F59E0B" />
                        </View>

                        {/* Bar Chart Status */}
                        <View style={styles.breakdownBox}>
                            <Text style={styles.breakdownTitle}>Perkembangan Status Penanganan</Text>
                            <CustomBarChart data={statsData.infrastructureStats.byStatus} labelKey="status" color="#10B981" />
                        </View>
                    </>
                )}
            </ScrollView>

            <Modal visible={dropdownVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih {dropdownMode === 'province' ? 'Provinsi' : 'Kota/Kabupaten'}</Text>
                            <TouchableOpacity onPress={() => setDropdownVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={dropdownMode === 'province' ? provinces : cities}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.listItem} onPress={() => {
                                    if(dropdownMode === 'province'){
                                        setSelectedProvince(item);
                                        setSelectedCity(null);
                                        fetchCities(item.id);
                                    } else {
                                        setSelectedCity(item);
                                    }
                                    setDropdownVisible(false);
                                }}>
                                    <Text style={styles.listItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <WarningModal visible={warning.visible} title={warning.title} message={warning.message} confirmText="OK" onConfirm={() => setWarning({ ...warning, visible: false })} onCancel={() => setWarning({ ...warning, visible: false })} />
        </View>
    )
}

export default AdminStatistics