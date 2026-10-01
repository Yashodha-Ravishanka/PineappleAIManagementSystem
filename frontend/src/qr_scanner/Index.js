import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import Footer from "../component/footer/Index";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import '../../main.css';

const QRScanner = (props) => {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scannerVisible, setScannerVisible] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [predictedResult, setPredictedResult] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [predictError, setPredictError] = useState(null);

    const openScanner = async () => {
        setScanError(null);
        if (!permission || !permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                setScanError("Camera permission is required to scan QR codes.");
                return;
            }
        }
        setScanned(false);
        setScannerVisible(true);
    };

    // ---- Auto-open scanner as soon as the screen loads ----
    useEffect(() => {
        openScanner();
    }, []);

    const handleBarcodeScanned = ({ data }) => {
        if (scanned) return;
        setScanned(true);

        try {
            const parsed = JSON.parse(data);
            setQrData(parsed);
            setPredictedResult(null);
            setPredictError(null);
            setScannerVisible(false);
        } catch (error) {
            console.log("Invalid QR JSON:", error);
            setScanError("Scanned QR code does not contain valid JSON data.");
            setScannerVisible(false);
        }
    };

    const predictFunction = (ob) => {
        const val = {
            "weight_kg": ob.fruitWeight,
            "length_cm": ob.fruitLength,
            "width_cm": ob.fruitWidth,
            "height_cm": ob.fruitHeight,
            "ripeness_score": ob.fruitRipenessScore,
            "quality_score": ob.fruitQualityScore
        };

        setPredicting(true);
        setPredictError(null);
        setPredictedResult(null);

        axios.post('http://192.168.1.45:5002/price_predict', val)
            .then((res) => {
                if (res.data && res.data.success) {
                    setPredictedResult(res.data.data);
                } else {
                    setPredictError("Prediction failed. Please try again.");
                }
            })
            .catch((err) => {
                console.log(err);
                setPredictError("Could not reach prediction server.");
            })
            .finally(() => {
                setPredicting(false);
            });
    };

    const handleClear = () => {
        setQrData(null);
        setPredictedResult(null);
        setPredictError(null);
    };

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
                        <Text style={styles.headerTitle}>QR Scanner</Text>
                        <Text style={styles.headerSubtitle}>Scan fruit batch codes</Text>
                    </View>
                </View>

                {qrData && (
                    <View style={styles.scannedBadge}>
                        <FontAwesome name="check" size={10} color="#2e7d32" />
                        <Text style={styles.scannedBadgeText}>Scanned</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>

                {scanError && (
                    <View style={styles.errorBanner}>
                        <FontAwesome name="exclamation-circle" size={16} color="#c62828" />
                        <Text style={styles.errorBannerText}>{scanError}</Text>
                    </View>
                )}

                {/* ---- Empty state (before any scan) ---- */}
                {!qrData && !scanError && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <FontAwesome name="qrcode" size={36} color="#a5d6a7" />
                        </View>
                        <Text style={styles.emptyTitle}>No Data Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Scan a fruit QR code to view its details and get a price prediction.
                        </Text>
                    </View>
                )}

                {/* ---- Rescan Button ---- */}
                <TouchableOpacity style={styles.qrButton} onPress={openScanner} activeOpacity={0.85}>
                    <FontAwesome name="camera" size={18} color="white" />
                    <Text style={styles.qrButtonText}>
                        {qrData ? "Scan Another Code" : "Open Scanner"}
                    </Text>
                </TouchableOpacity>

                {/* ---- Scanned Data Display ---- */}
                {qrData && (
                    <View style={styles.dataCard}>
                        <View style={styles.stepBadgeRow}>
                            <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeText}>1</Text>
                            </View>
                            <Text style={styles.dataTitle}>Scanned Fruit Data</Text>
                        </View>

                        <View style={styles.resultGrid}>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="balance-scale" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Weight</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitWeight} kg</Text>
                            </View>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="arrows-h" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Length</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitLength} cm</Text>
                            </View>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="arrows-v" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Height</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitHeight} cm</Text>
                            </View>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="expand" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Width</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitWidth} cm</Text>
                            </View>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="star" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Ripeness</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitRipenessScore} / 5</Text>
                            </View>
                            <View style={styles.resultGridItem}>
                                <FontAwesome name="thumbs-up" size={16} color="#2e7d32" />
                                <Text style={styles.resultGridLabel}>Quality</Text>
                                <Text style={styles.resultGridValue}>{qrData.fruitQualityScore} / 5</Text>
                            </View>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClear}
                                activeOpacity={0.7}
                            >
                                <FontAwesome name="times" size={16} color="#666" />
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.predictButton, predicting && styles.predictButtonDisabled]}
                                onPress={() => predictFunction(qrData)}
                                activeOpacity={0.8}
                                disabled={predicting}
                            >
                                <FontAwesome name="magic" size={16} color="white" />
                                <Text style={styles.predictButtonText}>
                                    {predicting ? "Predicting..." : "Predict Price"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {predicting && (
                            <View style={styles.predictLoadingBox}>
                                <ActivityIndicator size="small" color="#2e7d32" />
                                <Text style={styles.predictLoadingText}>Analyzing fruit data...</Text>
                            </View>
                        )}

                        {predictError && (
                            <View style={styles.errorBanner}>
                                <FontAwesome name="exclamation-circle" size={16} color="#c62828" />
                                <Text style={styles.errorBannerText}>{predictError}</Text>
                            </View>
                        )}

                        {predictedResult && (
                            <View style={styles.resultCard}>
                                <View style={styles.stepBadgeRow}>
                                    <View style={[styles.stepBadge, styles.stepBadgeDone]}>
                                        <FontAwesome name="check" size={11} color="white" />
                                    </View>
                                    <Text style={styles.resultHeaderText}>Prediction Complete</Text>
                                </View>

                                <View style={styles.priceBox}>
                                    <Text style={styles.priceLabel}>Estimated Price</Text>
                                    <Text style={styles.priceValue}>
                                        LKR {predictedResult.predicted_price_lkr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ---- QR Scanner Modal ---- */}
            <Modal
                visible={scannerVisible}
                animationType="slide"
                onRequestClose={() => setScannerVisible(false)}
            >
                <View style={styles.scannerContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    />

                    {/* Dimmed corners for a focused scan window effect */}
                    <View style={styles.dimOverlay}>
                        <View style={styles.dimRow} />
                        <View style={styles.dimMiddleRow}>
                            <View style={styles.dimSide} />
                            <View style={styles.scanBox}>
                                <View style={[styles.corner, styles.cornerTL]} />
                                <View style={[styles.corner, styles.cornerTR]} />
                                <View style={[styles.corner, styles.cornerBL]} />
                                <View style={[styles.corner, styles.cornerBR]} />
                            </View>
                            <View style={styles.dimSide} />
                        </View>
                        <View style={styles.dimRow} />
                    </View>

                    <View style={styles.scannerTopBar}>
                        <Text style={styles.scannerTitle}>Scan QR Code</Text>
                        <Text style={styles.scannerHint}>Align the code within the frame</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeScannerButton}
                        onPress={() => setScannerVisible(false)}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="times" size={20} color="white" />
                        <Text style={styles.closeScannerText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

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
    scannedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    scannedBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#2e7d32",
    },

    // ---- Empty state ----
    emptyState: {
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 20,
        paddingVertical: 40,
        paddingHorizontal: 24,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f1f8f1",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
        lineHeight: 19,
    },

    // ---- Error banner ----
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffebee",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        gap: 8,
    },
    errorBannerText: {
        color: "#c62828",
        fontSize: 13,
        flex: 1,
    },

    // ---- QR button ----
    qrButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2e7d32",
        paddingVertical: 15,
        borderRadius: 14,
        gap: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    qrButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },

    // ---- Data card ----
    dataCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        marginTop: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    stepBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    stepBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#e8f5e9",
        alignItems: "center",
        justifyContent: "center",
    },
    stepBadgeDone: {
        backgroundColor: "#2e7d32",
    },
    stepBadgeText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#2e7d32",
    },
    dataTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    resultGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    resultGridItem: {
        width: "31%",
        alignItems: "center",
        backgroundColor: "#fafafa",
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 10,
        gap: 4,
    },
    resultGridLabel: {
        fontSize: 11,
        color: "#888",
        fontWeight: "600",
        marginTop: 2,
    },
    resultGridValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "700",
    },

    // ---- Action buttons ----
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        gap: 12,
    },
    clearButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#f2f2f2",
        borderWidth: 1,
        borderColor: "#ddd",
        gap: 8,
    },
    clearButtonText: {
        color: "#666",
        fontWeight: "600",
        fontSize: 14,
    },
    predictButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#2e7d32",
        gap: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    predictButtonDisabled: {
        opacity: 0.6,
    },
    predictButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 14,
    },
    predictLoadingBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        gap: 8,
    },
    predictLoadingText: {
        fontSize: 13,
        color: "#666",
    },

    // ---- Prediction result ----
    resultCard: {
        backgroundColor: "#fafffa",
        borderRadius: 18,
        padding: 18,
        marginTop: 18,
        borderWidth: 1,
        borderColor: "#e8f5e9",
    },
    resultHeaderText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2e7d32",
    },
    priceBox: {
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        borderRadius: 14,
        paddingVertical: 20,
    },
    priceLabel: {
        fontSize: 12,
        color: "#4a7c4f",
        fontWeight: "700",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    priceValue: {
        fontSize: 34,
        fontWeight: "800",
        color: "#1b5e20",
    },

    // ---- Scanner modal ----
    scannerContainer: {
        flex: 1,
        backgroundColor: "black",
    },
    dimOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: "column",
    },
    dimRow: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    dimMiddleRow: {
        flexDirection: "row",
        height: 260,
    },
    dimSide: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    scanBox: {
        width: 260,
        height: 260,
        position: "relative",
    },
    corner: {
        position: "absolute",
        width: 32,
        height: 32,
        borderColor: "#4caf50",
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    scannerTopBar: {
        position: "absolute",
        top: 70,
        alignSelf: "center",
        alignItems: "center",
    },
    scannerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    scannerHint: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
    },
    closeScannerButton: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        paddingVertical: 12,
        paddingHorizontal: 26,
        borderRadius: 30,
        gap: 8,
    },
    closeScannerText: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
    },
});

export default QRScanner;