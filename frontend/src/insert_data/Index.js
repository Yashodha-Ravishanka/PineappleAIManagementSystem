import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import Footer from "../component/footer/Index";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import '../../main.css';

const GRADE_OPTIONS = ["A", "B", "C"];

const REQUIRED_FIELDS = [
    "batchId", "warehouseId", "fruitWeight", "aromaScore", "sweetnessBrix",
    "fruitLength", "fruitWidth", "fruitHeight", "fruitRipenessScore", "fruitQualityScore",
];

const NewForm = (props) => {
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        batchId: "",
        warehouseId: "",
        fruitWeight: "",
        sizeGrade: "A",
        marketPrice: "0",
        aromaScore: "",
        sweetnessBrix: "",
        fruitLength: "",
        fruitWidth: "",
        fruitHeight: "",
        fruitRipenessScore: "",
        fruitQualityScore: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const updateField = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: null }));
        }
    };

    const filledCount = REQUIRED_FIELDS.filter((key) => String(formData[key]).trim() !== "").length;
    const progressPercent = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);

    const validate = () => {
        const newErrors = {};

        if (!formData.batchId.trim()) newErrors.batchId = "Batch ID is required";
        if (!formData.warehouseId.trim()) newErrors.warehouseId = "Warehouse ID is required";
        if (!formData.fruitWeight) newErrors.fruitWeight = "Required";
        if (!formData.aromaScore) newErrors.aromaScore = "Required";
        if (!formData.sweetnessBrix) newErrors.sweetnessBrix = "Required";
        if (!formData.fruitLength) newErrors.fruitLength = "Required";
        if (!formData.fruitWidth) newErrors.fruitWidth = "Required";
        if (!formData.fruitHeight) newErrors.fruitHeight = "Required";
        if (!formData.fruitRipenessScore) newErrors.fruitRipenessScore = "Required";
        if (!formData.fruitQualityScore) newErrors.fruitQualityScore = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = () => ({
        batchId: formData.batchId.trim(),
        warehouseId: formData.warehouseId.trim(),
        fruitWeight: parseFloat(formData.fruitWeight) || 0,
        sizeGrade: formData.sizeGrade,
        marketPrice: parseFloat(formData.marketPrice) || 0,
        aromaScore: parseFloat(formData.aromaScore) || 0,
        sweetnessBrix: parseFloat(formData.sweetnessBrix) || 0,
        fruitLength: parseFloat(formData.fruitLength) || 0,
        fruitWidth: parseFloat(formData.fruitWidth) || 0,
        fruitHeight: parseFloat(formData.fruitHeight) || 0,
        fruitRipenessScore: parseFloat(formData.fruitRipenessScore) || 0,
        fruitQualityScore: parseFloat(formData.fruitQualityScore) || 0,
    });

    const handleSubmit = () => {
        if (!validate()) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        const payload = buildPayload();
        console.log("Form payload:", payload);

        setSubmitting(true);

        axios.post('http://192.168.1.45:5005/api/qr/generate', payload)
            .then((res) => {
                console.log(res.data);
                Alert.alert("Success", "Batch data submitted successfully.");
                handleReset();
            })
            .catch((err) => {
                console.log(err);
                Alert.alert("Error", "Failed to submit batch data.");
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handleReset = () => {
        setFormData({
            batchId: "",
            warehouseId: "",
            fruitWeight: "",
            sizeGrade: "A",
            marketPrice: "0",
            aromaScore: "",
            sweetnessBrix: "",
            fruitLength: "",
            fruitWidth: "",
            fruitHeight: "",
            fruitRipenessScore: "",
            fruitQualityScore: "",
        });
        setErrors({});
    };

    // Reusable labeled input
    const renderInput = (label, key, icon, options = {}) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputWrapper, errors[key] && styles.inputWrapperError]}>
                <FontAwesome name={icon} size={16} color={errors[key] ? "#e57373" : "#888"} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={formData[key]}
                    onChangeText={(text) => updateField(key, text)}
                    placeholder={options.placeholder || ""}
                    placeholderTextColor="#aaa"
                    keyboardType={options.keyboardType || "default"}
                />
                {options.suffix && (
                    <Text style={styles.inputSuffix}>{options.suffix}</Text>
                )}
            </View>
            {errors[key] && (
                <View style={styles.fieldErrorRow}>
                    <FontAwesome name="exclamation-circle" size={11} color="#e57373" />
                    <Text style={styles.fieldError}>{errors[key]}</Text>
                </View>
            )}
        </View>
    );

    const renderSectionHeader = (number, title, icon) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{number}</Text>
            </View>
            <FontAwesome name={icon} size={15} color="#2e7d32" style={{ marginLeft: 2 }} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    return (
        <LinearGradient
            colors={["#ffffffff", "#bababaff"]}
            style={styles.container}
        >
            {/* ---- Header ---- */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconCircle}>
                        <Text style={styles.headerIconEmoji}>🍍</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>New Batch Entry</Text>
                        <Text style={styles.headerSubtitle}>Register fruit batch details</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ---- Progress bar ---- */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressTopRow}>
                            <Text style={styles.progressLabel}>Form Progress</Text>
                            <Text style={styles.progressPercent}>{progressPercent}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressSubtext}>
                            {filledCount} of {REQUIRED_FIELDS.length} required fields completed
                        </Text>
                    </View>

                    {/* ---- Section 1: Batch Info ---- */}
                    <View style={styles.sectionCard}>
                        {renderSectionHeader(1, "Batch Information", "archive")}

                        {renderInput("Batch ID", "batchId", "hashtag", {
                            placeholder: "e.g. BATCH001",
                        })}
                        {renderInput("Warehouse ID", "warehouseId", "building", {
                            placeholder: "e.g. WH001",
                        })}
                    </View>

                    {/* ---- Section 2: Physical Measurements ---- */}
                    <View style={styles.sectionCard}>
                        {renderSectionHeader(2, "Physical Measurements", "cube")}

                        {renderInput("Weight", "fruitWeight", "balance-scale", {
                            placeholder: "e.g. 2.5",
                            keyboardType: "decimal-pad",
                            suffix: "kg",
                        })}
                        {renderInput("Length", "fruitLength", "arrows-h", {
                            placeholder: "e.g. 1.8",
                            keyboardType: "decimal-pad",
                            suffix: "cm",
                        })}
                        {renderInput("Width", "fruitWidth", "expand", {
                            placeholder: "e.g. 14",
                            keyboardType: "decimal-pad",
                            suffix: "cm",
                        })}
                        {renderInput("Height", "fruitHeight", "arrows-v", {
                            placeholder: "e.g. 13.5",
                            keyboardType: "decimal-pad",
                            suffix: "cm",
                        })}
                    </View>

                    {/* ---- Section 3: Quality Attributes ---- */}
                    <View style={styles.sectionCard}>
                        {renderSectionHeader(3, "Quality Attributes", "star")}

                        {/* Size Grade segmented control */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Size Grade</Text>
                            <View style={styles.gradeRow}>
                                {GRADE_OPTIONS.map((grade) => (
                                    <TouchableOpacity
                                        key={grade}
                                        style={[
                                            styles.gradeOption,
                                            formData.sizeGrade === grade && styles.gradeOptionActive,
                                        ]}
                                        onPress={() => updateField("sizeGrade", grade)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.gradeOptionText,
                                                formData.sizeGrade === grade && styles.gradeOptionTextActive,
                                            ]}
                                        >
                                            {grade}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {renderInput("Aroma Score", "aromaScore", "leaf", {
                            placeholder: "1 - 10",
                            keyboardType: "number-pad",
                            suffix: "/ 10",
                        })}
                        {renderInput("Sweetness (Brix)", "sweetnessBrix", "tint", {
                            placeholder: "e.g. 14",
                            keyboardType: "decimal-pad",
                            suffix: "°Bx",
                        })}
                        {renderInput("Ripeness Score", "fruitRipenessScore", "clock-o", {
                            placeholder: "1 - 5",
                            keyboardType: "number-pad",
                            suffix: "/ 5",
                        })}
                        {renderInput("Quality Score", "fruitQualityScore", "thumbs-up", {
                            placeholder: "1 - 5",
                            keyboardType: "number-pad",
                            suffix: "/ 5",
                        })}
                    </View>

                    {/* ---- Section 4: Market Info ---- */}
                    <View style={styles.sectionCard}>
                        {renderSectionHeader(4, "Market Info", "money")}

                        {renderInput("Market Price", "marketPrice", "money", {
                            placeholder: "0",
                            keyboardType: "decimal-pad",
                            suffix: "LKR",
                        })}
                    </View>

                    {/* ---- Action Buttons ---- */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleReset}
                            activeOpacity={0.7}
                        >
                            <FontAwesome name="refresh" size={16} color="#666" />
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            <FontAwesome name="check" size={16} color="white" />
                            <Text style={styles.submitButtonText}>
                                {submitting ? "Submitting..." : "Submit Batch"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Footer />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    contentContainer: {
        paddingHorizontal: 14,
        paddingTop: 16,
        paddingBottom: 100,
    },

    // ---- Header ----
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 70,
        backgroundColor: "white",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e8f5e9",
        alignItems: "center",
        justifyContent: "center",
    },
    headerIconEmoji: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#2b2b2b",
    },
    headerSubtitle: {
        fontSize: 11,
        color: "#999",
        marginTop: 1,
    },

    // ---- Progress card ----
    progressCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    progressTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333",
    },
    progressPercent: {
        fontSize: 13,
        fontWeight: "800",
        color: "#2e7d32",
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#eee",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#2e7d32",
        borderRadius: 4,
    },
    progressSubtext: {
        fontSize: 11,
        color: "#999",
        marginTop: 8,
    },

    // ---- Section cards ----
    sectionCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    sectionBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#2e7d32",
        alignItems: "center",
        justifyContent: "center",
    },
    sectionBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "white",
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2e7d32",
    },

    // ---- Inputs ----
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        paddingHorizontal: 12,
        height: 46,
    },
    inputWrapperError: {
        borderColor: "#e57373",
        backgroundColor: "#fff5f5",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        height: "100%",
    },
    inputSuffix: {
        fontSize: 12,
        color: "#999",
        fontWeight: "600",
        marginLeft: 6,
    },
    fieldErrorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 5,
        marginLeft: 2,
    },
    fieldError: {
        fontSize: 11,
        color: "#e57373",
    },

    // ---- Grade selector ----
    gradeRow: {
        flexDirection: "row",
        gap: 10,
    },
    gradeOption: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#f7f7f7",
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    gradeOptionActive: {
        backgroundColor: "#2e7d32",
        borderColor: "#2e7d32",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    gradeOptionText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#888",
    },
    gradeOptionTextActive: {
        color: "white",
    },

    // ---- Action buttons ----
    actionButtonsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    resetButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#f2f2f2",
        borderWidth: 1,
        borderColor: "#ddd",
        gap: 8,
    },
    resetButtonText: {
        color: "#666",
        fontWeight: "600",
        fontSize: 14,
    },
    submitButton: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#2e7d32",
        gap: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
});

export default NewForm;