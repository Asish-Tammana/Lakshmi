import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { TransactionService } from '../services/TransactionService';
import { CategoryService } from '../services/CategoryService';
import { TransactionEngine } from '../services/TransactionEngine';
import Category from '../database/Category';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Premium Color Palettes (similar to modern banking apps)
const CHART_COLORS = [
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#F97316', // Orange
    '#06B6D4', // Cyan
];

interface AnalysisData {
    categoryData: Record<string, number>;
    trendData: { value: number; label: string }[];
}

interface PieDataItem {
    value: number;
    color: string;
    text: string;
    focused?: boolean;
}

const AnalysisScreen = () => {
    const theme = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [activeTab, setActiveTab] = useState('Insights');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [cats, analysis] = await Promise.all([
                CategoryService.getAllCategories(),
                TransactionService.getAnalysisData(currentMonth.getTime())
            ]);
            setCategoryList(cats);
            setAnalysisData(analysis);
        } catch (error) {
            console.error('Error fetching analysis data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const prevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentMonth(prev);
    };

    const nextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + 1);
        setCurrentMonth(next);
    };

    const monthLabel = useMemo(() => {
        try {
            const month = currentMonth.toLocaleString('en-US', { month: 'short' });
            const year = currentMonth.getFullYear().toString().slice(-2);
            return `${month} '${year}`;
        } catch (e) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[currentMonth.getMonth()]} '${currentMonth.getFullYear().toString().slice(-2)}`;
        }
    }, [currentMonth]);

    const pieData = useMemo<PieDataItem[]>(() => {
        if (!analysisData || !categoryList.length) return [];

        const sortedCats = Object.entries(analysisData.categoryData)
            .sort((a, b) => b[1] - a[1]);

        return sortedCats.map(([catId, amount], index) => {
            const category = categoryList.find(c => c.id === catId);
            return {
                value: amount,
                color: CHART_COLORS[index % CHART_COLORS.length],
                text: category?.name || 'Other',
                focused: index === 0,
            };
        }).filter(d => d.value > 0);
    }, [analysisData, categoryList]);

    const lineData = useMemo(() => analysisData?.trendData || [], [analysisData]);

    const totalExpense = useMemo(() => pieData.reduce((sum, item) => sum + item.value, 0), [pieData]);

    return (
        <Screen style={{ backgroundColor: theme.colors.surface }}>
            {/* Header Section (Blue Gradient vibes) */}
            <View style={[styles.blueHeader, { backgroundColor: '#3b82f6' }]}>
                <View style={styles.topBar}>
                    <IconButton icon="arrow-left" iconColor="white" onPress={() => { }} />
                    <Text variant="titleLarge" style={styles.passbookTitle}>Passbook</Text>
                    <View style={styles.topIcons}>
                        <IconButton icon="magnify" iconColor="white" size={24} />
                        <IconButton icon="help-circle-outline" iconColor="white" size={24} />
                    </View>
                </View>

                <View style={styles.summaryContainer}>
                    <View>
                        <Text variant="bodyMedium" style={styles.summaryLabel}>Total spends</Text>
                        <Text variant="displaySmall" style={styles.totalAmount}>
                            ₹ {TransactionEngine.formatCurrencySimple(totalExpense)}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.monthPill} onPress={() => { }}>
                        <MaterialCommunityIcons name="calendar-month" size={18} color="#3b82f6" />
                        <Text style={[styles.monthPillText, { color: '#3b82f6' }]}>{monthLabel}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content Area */}
            <View style={[styles.mainContent, { backgroundColor: theme.colors.surface }]}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Area Chart Section */}
                        <View style={styles.chartWrapper}>
                            {LineChart ? (
                                <LineChart
                                    data={lineData}
                                    width={width - 40}
                                    height={180}
                                    spacing={width / (lineData.length || 30) - 2}
                                    color="#3b82f6"
                                    thickness={4}
                                    startFillColor="#3b82f6"
                                    startOpacity={0.2}
                                    endOpacity={0.01}
                                    areaChart
                                    curved
                                    hideDataPoints
                                    hideRules
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    initialSpacing={0}
                                    endSpacing={0}
                                    pointerConfig={{
                                        pointerStripHeight: 160,
                                        pointerStripColor: '#3b82f6',
                                        pointerStripWidth: 2,
                                        pointerStripUptoDataPoint: true,
                                        pointerColor: '#3b82f6',
                                        radius: 5,
                                        pointerLabelComponent: (items: any) => (
                                            <View style={styles.pointerLabel}>
                                                <Text style={styles.pointerText}>
                                                    ₹{TransactionEngine.formatCurrencySimple(items[0].value)}
                                                </Text>
                                            </View>
                                        ),
                                    }}
                                />
                            ) : null}
                            <View style={styles.xAxisLabels}>
                                <Text style={styles.axisLabel}>01</Text>
                                <Text style={styles.axisLabel}>07</Text>
                                <Text style={styles.axisLabel}>14</Text>
                                <Text style={styles.axisLabel}>21</Text>
                            </View>
                        </View>

                        {/* Tabs Placeholder */}
                        <View style={styles.tabsContainer}>
                            {['Transactions', 'Insights', 'Payees'].map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab, { borderBottomColor: activeTab === tab ? '#3b82f6' : 'transparent' }]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, { color: activeTab === tab ? '#3b82f6' : theme.colors.onSurfaceVariant }]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Divider style={styles.divider} />

                        {/* Category Breakdown Section */}
                        <View style={styles.breakdownContainer}>
                            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Category Breakdown</Text>
                            <View style={styles.pieRow}>
                                {PieChart && pieData.length > 0 ? (
                                    <View style={styles.pieWrapper}>
                                        <PieChart
                                            data={pieData}
                                            donut
                                            radius={75}
                                            innerRadius={60}
                                            showGradient
                                            centerLabelComponent={() => (
                                                <View style={styles.pieCenterLabel}>
                                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Spent</Text>
                                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                                        ₹{totalExpense.toFixed(0)}
                                                    </Text>
                                                </View>
                                            )}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No data for this month</Text>
                                    </View>
                                )}

                                <View style={styles.legend}>
                                    {pieData.map((item, index) => (
                                        <View key={index} style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                            <Text numberOfLines={1} style={[styles.legendText, { color: theme.colors.onSurface }]}>{item.text}</Text>
                                            <Text style={[styles.legendValue, { color: theme.colors.onSurfaceVariant }]}>
                                                {((item.value / totalExpense) * 100).toFixed(0)}%
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.spacing} />
                    </ScrollView>
                )}
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    blueHeader: {
        paddingTop: 10,
        paddingBottom: 60,
        paddingHorizontal: 8,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    passbookTitle: {
        color: 'white',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    topIcons: {
        flexDirection: 'row',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginTop: 10,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
    },
    totalAmount: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 4,
    },
    monthPill: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        elevation: 2,
    },
    monthPillText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    mainContent: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
    },
    scrollContent: {
        padding: 24,
    },
    chartWrapper: {
        marginTop: 10,
        marginBottom: 20,
    },
    xAxisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 8,
    },
    axisLabel: {
        color: 'rgba(0,0,0,0.3)',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
    },
    activeTab: {},
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    divider: {
        marginBottom: 24,
        opacity: 0.3,
    },
    breakdownContainer: {
        marginTop: 0,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 20,
    },
    pieRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pieWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieCenterLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    legend: {
        flex: 1,
        marginLeft: 24,
        gap: 14,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 3,
        marginRight: 10,
    },
    legendText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
    },
    legendValue: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 8,
    },
    pointerLabel: {
        backgroundColor: '#333',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        position: 'absolute',
        top: -45,
        left: -40,
        elevation: 5,
    },
    pointerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyState: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spacing: {
        height: 60,
    },
});

export default AnalysisScreen;
