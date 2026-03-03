import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, MapPin, Trash2, CheckCircle2, Home, Briefcase } from 'lucide-react-native';
import { useAppState } from '@/contexts/AppStateContext';
import { getAddresses, ApiAddress, deleteAddress, updateAddress, createAddress } from '@/lib/api';

export default function AddressManagementScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { session, isLoggedIn } = useAppState();

    const [addresses, setAddresses] = useState<ApiAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
    });

    useEffect(() => {
        if (isLoggedIn && session?.token) {
            loadAddresses();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, session?.token]);

    const loadAddresses = async () => {
        if (!session?.token) return;
        try {
            const data = await getAddresses(session.token);
            setAddresses(data);
        } catch (error) {
            console.error('Failed to load addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (!session?.token) return;
                    try {
                        await deleteAddress(session.token, id);
                        setAddresses((prev) => prev.filter((a) => a.id !== id));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete address. It may be used in an order.');
                    }
                },
            },
        ]);
    };

    const handleSetDefault = async (id: string) => {
        if (!session?.token) return;
        try {
            await updateAddress(session.token, id, { isDefault: true });
            loadAddresses();
        } catch (error) {
            console.error('Failed to set default address:', error);
        }
    };

    const handleAddAddress = async () => {
        if (!form.addressLine1 || !form.city || !form.state || !form.zipCode) {
            Alert.alert('Missing Fields', 'Please fill in all required address fields.');
            return;
        }

        if (!session?.token) return;

        setAdding(true);
        try {
            await createAddress(session.token, {
                ...form,
                isDefault: addresses.length === 0 ? true : form.isDefault
            });
            setShowAddModal(false);
            setForm({
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India',
                isDefault: false
            });
            loadAddresses();
        } catch (error) {
            console.error('Failed to add address:', error);
            Alert.alert('Error', 'Could not save address. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#DC2626" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
                    <ChevronLeft size={22} color="#111827" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Addresses</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {addresses.map((item) => (
                    <View key={item.id} style={[styles.card, item.isDefault && styles.cardActive]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.typeBox}>
                                <Text style={styles.typeText}>{item.isDefault ? 'PRIMARY' : 'ADDRESS'}</Text>
                            </View>
                            {item.isDefault && <CheckCircle2 size={20} color="#16A34A" fill="#FFFFFF" />}
                        </View>

                        <Text style={styles.nameText}>{item.name || 'Saved Address'}</Text>
                        <Text style={styles.addressText}>
                            {item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}
                            {'\n'}{item.city}, {item.state} {item.zipCode}
                        </Text>
                        <Text style={styles.phoneText}>{item.phone || 'No phone provided'}</Text>

                        <View style={styles.cardFooter}>
                            {!item.isDefault && (
                                <TouchableOpacity style={styles.footerBtn} onPress={() => handleSetDefault(item.id)}>
                                    <Text style={styles.footerBtnText}>Set as Default</Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                <Trash2 size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {addresses.length === 0 && (
                    <View style={styles.emptyWrap}>
                        <MapPin size={48} color="#E5E7EB" strokeWidth={1.5} />
                        <Text style={styles.emptyTitle}>No saved addresses</Text>
                        <Text style={styles.emptySub}>Add an address to speed up your checkout process.</Text>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                <TouchableOpacity
                    style={styles.addBtn}
                    activeOpacity={0.9}
                    onPress={() => setShowAddModal(true)}>
                    <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.addBtnText}>ADD NEW ADDRESS</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showAddModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddModal(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}>
                        <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Address</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Text style={styles.closeBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. John Doe"
                                        value={form.name}
                                        onChangeText={(t) => setForm(f => ({ ...f, name: t }))}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit mobile number"
                                        keyboardType="phone-pad"
                                        value={form.phone}
                                        onChangeText={(t) => setForm(f => ({ ...f, phone: t }))}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address Line 1*</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="House/Plot/Apartment No."
                                        value={form.addressLine1}
                                        onChangeText={(t) => setForm(f => ({ ...f, addressLine1: t }))}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Address Line 2</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Area, Street, Locality"
                                        value={form.addressLine2}
                                        onChangeText={(t) => setForm(f => ({ ...f, addressLine2: t }))}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>City*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="City"
                                            value={form.city}
                                            onChangeText={(t) => setForm(f => ({ ...f, city: t }))}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                        <Text style={styles.label}>State*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="State"
                                            value={form.state}
                                            onChangeText={(t) => setForm(f => ({ ...f, state: t }))}
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Zip Code*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Pincode"
                                            keyboardType="numeric"
                                            value={form.zipCode}
                                            onChangeText={(t) => setForm(f => ({ ...f, zipCode: t }))}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                        <Text style={styles.label}>Country*</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Country"
                                            value={form.country}
                                            onChangeText={(t) => setForm(f => ({ ...f, country: t }))}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.checkboxRow}
                                    activeOpacity={0.8}
                                    onPress={() => setForm(f => ({ ...f, isDefault: !f.isDefault }))}>
                                    <View style={[styles.checkbox, form.isDefault && styles.checkboxActive]}>
                                        {form.isDefault && <CheckCircle2 size={16} color="#FFFFFF" />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Set as default address</Text>
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.saveBtn, adding && { opacity: 0.7 }]}
                                onPress={handleAddAddress}
                                disabled={adding}>
                                {adding ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>SAVE ADDRESS</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
    scroll: { padding: 16, gap: 14 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardActive: { borderColor: '#DC2626' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    typeBox: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    typeText: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 0.5 },
    nameText: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
    addressText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 10 },
    phoneText: { fontSize: 13, color: '#111827', fontWeight: '600', marginBottom: 16 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 },
    footerBtn: { paddingVertical: 4 },
    footerBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
    deleteBtn: { padding: 4 },
    bottomBar: { backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    addBtn: {
        backgroundColor: '#DC2626',
        borderRadius: 14,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
    emptyWrap: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 16, marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    closeBtnText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    formScroll: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        height: 48,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#DC2626',
        borderColor: '#DC2626',
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    saveBtn: {
        backgroundColor: '#111827',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
    },
});
