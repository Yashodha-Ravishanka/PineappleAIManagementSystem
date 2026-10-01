import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Footer from "../component/footer/Index";
import { useNavigation } from "@react-navigation/native";
import '../../main.css';

const DEMO_COORDS = [
    { latitude: 6.927079, longitude: 79.861244, place: "Colombo" },
    { latitude: 7.290572, longitude: 80.633726, place: "Kandy" },
    { latitude: 6.032894, longitude: 80.216791, place: "Galle" },
    { latitude: 8.311352, longitude: 80.403650, place: "Anuradhapura" },
    { latitude: 9.661498, longitude: 80.025547, place: "Jaffna" },
];

const REFRESH_INTERVAL = 30; // seconds

const GoogleMap = (props) => {
    const navigation = useNavigation();
    const webViewRef = useRef(null);
    const coordIndexRef = useRef(0);

    const [location, setLocation] = useState(DEMO_COORDS[0]);
    const [mapReady, setMapReady] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchLocation = async () => {
        try {
            const nextIndex = (coordIndexRef.current + 1) % DEMO_COORDS.length;
            const newLocation = DEMO_COORDS[nextIndex];

            coordIndexRef.current = nextIndex;
            setLocation(newLocation);
            setLastUpdated(new Date());
            setSecondsLeft(REFRESH_INTERVAL);
        } catch (error) {
            console.log("Error fetching location:", error);
        }
    };

    useEffect(() => {
        fetchLocation();
        const interval = setInterval(fetchLocation, REFRESH_INTERVAL * 1000);
        return () => clearInterval(interval);
    }, []);

    // Countdown ticker for the "next update in Xs" badge
    useEffect(() => {
        const tick = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        if (webViewRef.current && mapReady) {
            const js = `
                if (window.updateMarker) {
                    window.updateMarker(${location.latitude}, ${location.longitude});
                }
                true;
            `;
            webViewRef.current.injectJavaScript(js);
        }
    }, [location, mapReady]);

    const handleWebViewMessage = (event) => {
        if (event.nativeEvent.data === "MAP_READY") {
            setMapReady(true);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };

    const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
                html, body, #map {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background-color: #e8e8e8;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 10px;
                }
                .pulse-marker {
                    width: 18px;
                    height: 18px;
                    background: #2e7d32;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(46, 125, 50, 0.6);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.6); }
                    70% { box-shadow: 0 0 0 14px rgba(46, 125, 50, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script>
                var initialLat = ${location.latitude};
                var initialLng = ${location.longitude};

                var map = L.map('map', { zoomControl: false }).setView([initialLat, initialLng], 8);

                L.control.zoom({ position: 'bottomright' }).addTo(map);

                var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);

                var pulseIcon = L.divIcon({
                    className: '',
                    html: '<div class="pulse-marker"></div>',
                    iconSize: [18, 18],
                });

                var marker = L.marker([initialLat, initialLng], { icon: pulseIcon }).addTo(map);
                marker.bindPopup("📍 Current Location");

                window.updateMarker = function(lat, lng) {
                    var newLatLng = new L.LatLng(lat, lng);
                    marker.setLatLng(newLatLng);
                    map.flyTo(newLatLng, map.getZoom(), { duration: 1.2 });
                };

                tileLayer.on('load', function () {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage("MAP_READY");
                    }
                });
            </script>
        </body>
        </html>
    `;

    return (
        <LinearGradient
            colors={["#ffffffff", "#bababaff"]}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconCircle}>
                        <Text style={styles.headerIconEmoji}>🍍</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Live Tracking</Text>
                        <Text style={styles.headerSubtitle}>Fruit shipment monitor</Text>
                    </View>
                </View>

                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>

                <View style={styles.mapCard}>
                    <View style={styles.mapContainer}>
                        <WebView
                            ref={webViewRef}
                            style={[styles.map, { opacity: mapReady ? 1 : 0 }]}
                            originWhitelist={["*"]}
                            source={{ html: mapHTML }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            onMessage={handleWebViewMessage}
                        />

                        {!mapReady && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#2e7d32" />
                                <Text style={styles.loadingText}>Loading map...</Text>
                            </View>
                        )}

                        {/* Floating refresh countdown pill */}
                        {mapReady && (
                            <View style={styles.refreshPill}>
                                <FontAwesome name="refresh" size={11} color="#2e7d32" />
                                <Text style={styles.refreshPillText}>Next update in {secondsLeft}s</Text>
                            </View>
                        )}
                    </View>

                    {/* Location info footer inside the card */}
                    <View style={styles.locationInfo}>
                        <View style={styles.locationInfoRow}>
                            <View style={styles.locationIconBox}>
                                <FontAwesome name="map-marker" size={16} color="#2e7d32" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.locationPlace}>{location.place || "Unknown Location"}</Text>
                                <Text style={styles.locationCoords}>
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.locationInfoRow}>
                            <View style={styles.locationIconBox}>
                                <FontAwesome name="clock-o" size={16} color="#2e7d32" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.locationPlace}>Last Updated</Text>
                                <Text style={styles.locationCoords}>{formatTime(lastUpdated)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Route history strip */}
                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>Route Waypoints</Text>
                    <View style={styles.historyList}>
                        {DEMO_COORDS.map((coord, idx) => {
                            const isActive = coord.place === location.place;
                            return (
                                <View key={idx} style={styles.historyItem}>
                                    <View
                                        style={[
                                            styles.historyDot,
                                            isActive && styles.historyDotActive,
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.historyText,
                                            isActive && styles.historyTextActive,
                                        ]}
                                    >
                                        {coord.place}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </ScrollView>
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
    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffebee",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#e53935",
    },
    liveBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#c62828",
        letterSpacing: 0.5,
    },

    // ---- Map card ----
    mapCard: {
        backgroundColor: "white",
        borderRadius: 20,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    mapContainer: {
        height: 420,
        position: "relative",
    },
    map: {
        flex: 1,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e8e8e8",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    refreshPill: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    refreshPillText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#2e7d32",
    },

    // ---- Location info ----
    locationInfo: {
        padding: 16,
    },
    locationInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    locationIconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#e8f5e9",
        alignItems: "center",
        justifyContent: "center",
    },
    locationPlace: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
    },
    locationCoords: {
        fontSize: 12,
        color: "#999",
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginVertical: 12,
    },

    // ---- History strip ----
    historyCard: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 16,
        marginTop: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    historyList: {
        gap: 10,
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    historyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#e0e0e0",
    },
    historyDotActive: {
        backgroundColor: "#2e7d32",
    },
    historyText: {
        fontSize: 13,
        color: "#999",
        fontWeight: "500",
    },
    historyTextActive: {
        color: "#2e7d32",
        fontWeight: "700",
    },
});

export default GoogleMap;