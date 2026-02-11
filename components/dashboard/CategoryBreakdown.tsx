import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import { Badge, Card, Loading, ProgressBar, Text } from '@components/common';
import { colors } from '@config/colors';
import { useCurrency } from '@hooks/useCurrency';

interface CategoryBreakdownProps {
  period?: 'month' | 'quarter' | 'year' | 'all';
  viewMode?: 'chart' | 'list' | 'grid' | 'comparison';
  showBudget?: boolean;
  showTrends?: boolean;
  showRecommendations?: boolean;
  interactive?: boolean;
  compact?: boolean;
  maxCategories?: number;
  onCategoryPress?: (category: CategoryData) => void;
  onBudgetPress?: (category: CategoryData) => void;
  onRecommendationPress?: (recommendation: Recommendation) => void;
}

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  subscriptionCount: number;
  averageAmount: number;
  trend: number; // -1 down, 0 stable, 1 up
  trendAmount: number;
  budget?: number;
  budgetUsed?: number;
  budgetStatus?: 'under' | 'over' | 'warning';
  metadata?: Record<string, any>;
}

interface Recommendation {
  id: string;
  type: 'savings' | 'consolidation' | 'cancellation' | 'optimization';
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  action?: () => void;
}

interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  period = 'month',
  viewMode = 'chart',
  showBudget = true,
  showTrends = true,
  showRecommendations = true,
  interactive = true,
  compact = false,
  maxCategories = 8,
  onCategoryPress,
  onBudgetPress,
  onRecommendationPress,
}) => {
  const { formatAmount } = useCurrency();
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [pieRotation, setPieRotation] = useState(0);
  const [currentViewMode, setCurrentViewMode] = useState<'chart' | 'list' | 'grid' | 'comparison'>(viewMode);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  
  const screenWidth = Dimensions.get('window').width - 32;
  const chartSize = compact ? 180 : 240;
  const chartRadius = chartSize / 2;

  // Enable LayoutAnimation
  if (Platform.OS === 'android' && LayoutAnimation) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  // Load data
  useEffect(() => {
    loadData();
  }, [period, showBudget, showRecommendations]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual data from analytics service
      const catData: CategoryData[] = [];
      const budgetData: any[] = [];
      const recData: Recommendation[] = [];
      
      // Combine with budget data
      const combinedData = catData.map((cat: any) => {
        const budget = budgetData.find((b: any) => b.category === cat.id);
        return {
          ...cat,
          budget: budget?.amount,
          budgetUsed: budget?.used,
          budgetStatus: calculateBudgetStatus(cat.amount, budget?.amount),
        };
      });
      
      // Sort by amount descending
      combinedData.sort((a: any, b: any) => b.amount - a.amount);
      
      setCategories(combinedData);
      setRecommendations(recData);
      
      // Calculate comparison data
      if (period !== 'all') {
        const compData = await getCategoryComparison(period);
        setComparisonData(compData);
      }
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(chartAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Failed to load category data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBudgetStatus = (amount: number, budget?: number): 'under' | 'over' | 'warning' | undefined => {
    if (!budget) return undefined;
    
    const percentage = (amount / budget) * 100;
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    return 'under';
  };

  const getCategoryComparison = async (period: string): Promise<ComparisonData[]> => {
    // This would be implemented in analytics service
    return [];
  };

  const handleCategoryPress = useCallback((category: CategoryData) => {
    if (!interactive) return;
    
    setSelectedCategory(category);
    onCategoryPress?.(category);
    
    if (expandedCategory === category.id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category.id);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [interactive, expandedCategory, onCategoryPress]);

  const handleBudgetPress = useCallback((category: CategoryData) => {
    if (!interactive) return;
    
    onBudgetPress?.(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [interactive, onBudgetPress]);

  const handleRecommendationPress = useCallback((recommendation: Recommendation) => {
    onRecommendationPress?.(recommendation);
    recommendation.action?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [onRecommendationPress]);

  const rotatePie = useCallback(() => {
    Animated.timing(chartAnim, {
      toValue: pieRotation + 0.5,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setPieRotation(prev => prev + 0.5));
  }, [pieRotation, chartAnim]);

  // Calculate totals and statistics
  const statistics = useMemo(() => {
    if (categories.length === 0) return null;
    
    const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);
    const averagePerCategory = totalAmount / categories.length;
    const highestCategory = categories[0];
    const lowestCategory = categories[categories.length - 1];
    const categoriesWithBudget = categories.filter(cat => cat.budget).length;
    const overBudgetCategories = categories.filter(cat => cat.budgetStatus === 'over').length;
    
    return {
      totalAmount,
      averagePerCategory,
      highestCategory,
      lowestCategory,
      categoriesWithBudget,
      overBudgetCategories,
      categoryCount: categories.length,
    };
  }, [categories]);

  // Prepare data for pie chart
  const pieData = useMemo(() => {
    const displayCategories = showAllCategories ? categories : categories.slice(0, maxCategories);
    
    return displayCategories.map(cat => ({
      value: cat.amount,
      svg: {
        fill: cat.color,
        onPress: () => handleCategoryPress(cat),
      },
      arc: {
        outerRadius: hoveredCategory === cat.id ? '110%' : '100%',
        padAngle: 0.02,
      },
      key: cat.id,
      category: cat,
    }));
  }, [categories, showAllCategories, maxCategories, hoveredCategory, handleCategoryPress]);

  // Get category color
  const getCategoryColor = useCallback((categoryName: string): string => {
    const colorMap: Record<string, string> = {
      entertainment: colors.primary[500],
      utilities: colors.info[500],
      productivity: colors.success[500],
      health: colors.error[500],
      education: colors.warning[500],
      software: colors.secondary[500],
      streaming: colors.primary[600],
      fitness: colors.success[600],
      other: colors.neutral[600],
    };
    return colorMap[categoryName.toLowerCase()] || colors.neutral[600];
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((categoryName: string): string => {
    const iconMap: Record<string, string> = {
      entertainment: 'filmstrip',
      utilities: 'home',
      productivity: 'briefcase',
      health: 'heart',
      education: 'school',
      software: 'laptop',
      streaming: 'play',
      fitness: 'dumbbell',
      other: 'folder',
    };
    return iconMap[categoryName.toLowerCase()] || 'folder';
  }, []);

  // Render category item
  const renderCategoryItem = useCallback((category: CategoryData, index: number) => {
    const isSelected = selectedCategory?.id === category.id;
    const isExpanded = expandedCategory === category.id;
    const isOverBudget = category.budgetStatus === 'over';
    const isNearBudget = category.budgetStatus === 'warning';
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemSelected,
          isOverBudget && styles.categoryItemOverBudget,
          isNearBudget && styles.categoryItemNearBudget,
        ]}
        onPress={() => handleCategoryPress(category)}
        onPressIn={() => setHoveredCategory(category.id)}
        onPressOut={() => setHoveredCategory(null)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <Icon name={category.icon} size={20} color={category.color} />
          </View>
          
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName} numberOfLines={1}>
              {category.name}
            </Text>
            <Text style={styles.categoryMeta}>
              {category.subscriptionCount} subscription{category.subscriptionCount !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.categoryAmount}>
            <Text style={styles.amountText}>
              {formatAmount(category.amount)}
            </Text>
            <Text style={styles.percentageText}>
              {category.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        {/* Trend indicator */}
        {showTrends && category.trend !== 0 && (
          <View style={styles.trendIndicator}>
            <Icon 
              name={category.trend > 0 ? 'trending-up' : 'trending-down'} 
              size={14} 
              color={category.trend > 0 ? colors.error[500] : colors.success[500]} 
            />
            <Text style={[
              styles.trendText,
              { color: category.trend > 0 ? colors.error[500] : colors.success[500] },
            ]}>
              {category.trend > 0 ? '+' : ''}{category.trendAmount.toFixed(0)}%
            </Text>
          </View>
        )}
        
        {/* Budget progress */}
        {showBudget && category.budget && (
          <TouchableOpacity
            style={styles.budgetSection}
            onPress={() => handleBudgetPress(category)}
            activeOpacity={0.7}
          >
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetAmount}>
                {formatAmount(category.budget || 0)}
              </Text>
            </View>
            <ProgressBar
              progress={(category.amount / category.budget) * 100}
              color={category.budgetStatus === 'over' ? colors.error : 
                     category.budgetStatus === 'warning' ? colors.warning : colors.success}
              height={6}
              showLabel={false}
            />
            <Text style={styles.budgetUsage}>
              {((category.amount / category.budget) * 100).toFixed(0)}% used
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Expanded details */}
        {isExpanded && (
          <Animated.View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Average per subscription:</Text>
              <Text style={styles.detailValue}>
                {formatAmount(category.averageAmount)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rank:</Text>
              <Text style={styles.detailValue}>#{index + 1}</Text>
            </View>
            
            {comparisonData.find(c => c.category === category.name) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Change from last period:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: comparisonData.find(c => c.category === category.name)?.change! >= 0 
                    ? colors.error[500] : colors.success[500] },
                ]}>
                  {comparisonData.find(c => c.category === category.name)?.change! >= 0 ? '+' : ''}
                  {comparisonData.find(c => c.category === category.name)?.change!.toFixed(1)}%
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  }, [
    selectedCategory, expandedCategory, showTrends, showBudget, comparisonData,
    handleCategoryPress, handleBudgetPress, formatAmount
  ]);

  // Render recommendation card
  const renderRecommendationCard = useCallback((recommendation: Recommendation) => {
    const difficultyColor = {
      easy: colors.success[500],
      medium: colors.warning[500],
      hard: colors.error[500],
    }[recommendation.difficulty];
    
    const typeIcon = {
      savings: 'piggy-bank',
      consolidation: 'merge',
      cancellation: 'cancel',
      optimization: 'chart-line',
    }[recommendation.type];
    
    return (
      <TouchableOpacity
        key={recommendation.id}
        style={styles.recommendationCard}
        onPress={() => handleRecommendationPress(recommendation)}
        activeOpacity={0.7}
      >
        <View style={styles.recommendationHeader}>
          <View style={[styles.recommendationIcon, { backgroundColor: difficultyColor + '20' }]}>
            <Icon name={typeIcon} size={20} color={difficultyColor} />
          </View>
          
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationCategory}>{recommendation.category}</Text>
          </View>
          
          <Badge
            text={recommendation.difficulty}
            color={difficultyColor}
            size="small"
          />
        </View>
        
        <Text style={styles.recommendationDescription}>
          {recommendation.description}
        </Text>
        
        <View style={styles.recommendationFooter}>
          <Text style={styles.potentialSavings}>
            Potential savings: {formatAmount(recommendation.potentialSavings)}
          </Text>
          <Icon name="chevron-right" size={20} color={colors.neutral[600]} />
        </View>
      </TouchableOpacity>
    );
  }, [handleRecommendationPress, formatAmount]);

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Loading message="Analyzing category breakdown..." />
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.emptyState}>
          <Icon name="folder-open" size={48} color={colors.neutral[600]} />
          <Text style={styles.emptyTitle}>No Category Data</Text>
          <Text style={styles.emptyDescription}>
            Add subscriptions with categories to see breakdown
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card style={compact ? styles.compactCard : styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Category Breakdown</Text>
            <Text style={styles.subtitle}>
              {statistics ? `${formatAmount(statistics.totalAmount)} total • ${statistics.categoryCount} categories` : ''}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            {viewMode === 'chart' && (
              <TouchableOpacity
                style={styles.rotateButton}
                onPress={rotatePie}
                activeOpacity={0.7}
              >
                <Icon name="rotate-right" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            )}
            
            <Badge
              text={`${statistics?.overBudgetCategories || 0} over budget`}
              variant={statistics?.overBudgetCategories ? 'danger' : 'outline'}
              size="small"
            />
          </View>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewModeSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['chart', 'list', 'grid', 'comparison'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.viewModeButtonActive,
                ]}
                onPress={() => setCurrentViewMode(mode)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={getViewModeIcon(mode)} 
                  size={16} 
                  color={currentViewMode === mode ? colors.primary[500] : colors.neutral[600]} 
                />
                <Text style={[
                  styles.viewModeText,
                  viewMode === mode && styles.viewModeTextActive,
                ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart View */}
{currentViewMode === 'chart' && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Chart Center Display */}
            <View style={styles.chartCenter}>
              <Text style={styles.chartCenterTitle}>Total</Text>
              <Text style={styles.chartCenterValue}>
                {statistics ? formatAmount(statistics.totalAmount) : ''}
              </Text>
              <Text style={styles.chartCenterSubtitle}>
                {categories.length} categories
              </Text>
            </View>
            
            {/* Chart Legend */}
            <View style={styles.legend}>
              {categories.slice(0, 4).map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.legendItem}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.legendColor, { backgroundColor: cat.color }]} />
                  <Text style={styles.legendLabel}>{cat.name}</Text>
                  <Text style={styles.legendPercentage}>
                    {cat.percentage.toFixed(0)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <ScrollView style={styles.listContainer}>
            {categories.map((cat, index) => renderCategoryItem(cat, index))}
            
            {categories.length > maxCategories && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => setShowAllCategories(!showAllCategories)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={showAllCategories ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={colors.primary[500]} 
                />
                <Text style={styles.showAllText}>
                  {showAllCategories ? 'Show Less' : `Show All ${categories.length} Categories`}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <View style={styles.gridContainer}>
            {categories.slice(0, 6).map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.gridItem,
                  { backgroundColor: cat.color + '10', borderLeftColor: cat.color },
                ]}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.7}
              >
                <View style={styles.gridIcon}>
                  <Icon name={cat.icon} size={24} color={cat.color} />
                </View>
                <Text style={styles.gridName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.gridAmount}>
                  {formatAmount(cat.amount)}
                </Text>
                <Text style={styles.gridPercentage}>
                  {cat.percentage.toFixed(0)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comparison View */}
        {viewMode === 'comparison' && comparisonData.length > 0 && (
          <ScrollView style={styles.comparisonContainer}>
            <Text style={styles.comparisonTitle}>vs Last Period</Text>
            {comparisonData.map((comp, index) => (
              <View key={index} style={styles.comparisonItem}>
                <View style={styles.comparisonHeader}>
                  <Text style={styles.comparisonCategory}>{comp.category}</Text>
                  <Text style={styles.comparisonChange}>
                    {comp.change >= 0 ? '+' : ''}{comp.change.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.comparisonBarContainer}>
                  <View style={styles.comparisonBarLabels}>
                    <Text style={styles.comparisonBarLabel}>Previous</Text>
                    <Text style={styles.comparisonBarLabel}>Current</Text>
                  </View>
                  <View style={styles.comparisonBars}>
                    <View 
                      style={[
                        styles.comparisonBar,
                        styles.comparisonBarPrevious,
                        { width: `${(comp.previous / Math.max(comp.current, comp.previous)) * 100}%` },
                      ]} 
                    />
                    <View 
                      style={[
                        styles.comparisonBar,
                        styles.comparisonBarCurrent,
                        { width: `${(comp.current / Math.max(comp.current, comp.previous)) * 100}%` },
                      ]} 
                    />
                  </View>
                  <View style={styles.comparisonValues}>
                    <Text style={styles.comparisonValue}>
                      {formatAmount(comp.previous)}
                    </Text>
                    <Text style={styles.comparisonValue}>
                      {formatAmount(comp.current)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Recommendations */}
        {showRecommendations && recommendations.length > 0 && viewMode !== 'comparison' && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.slice(0, 3).map(renderRecommendationCard)}
            </ScrollView>
          </View>
        )}

        {/* Statistics Footer */}
        {!compact && statistics && (
          <View style={styles.statisticsFooter}>
            <View style={styles.statFooterItem}>
              <Text style={styles.statFooterLabel}>Highest</Text>
              <Text style={styles.statFooterValue}>
                {statistics.highestCategory.name}
              </Text>
              <Text style={styles.statFooterSubvalue}>
                {formatAmount(statistics.highestCategory.amount)}
              </Text>
            </View>
            
            <View style={styles.statFooterItem}>
              <Text style={styles.statFooterLabel}>Average</Text>
              <Text style={styles.statFooterValue}>
                {formatAmount(statistics.averagePerCategory)}
              </Text>
              <Text style={styles.statFooterSubvalue}>
                per category
              </Text>
            </View>
            
            <View style={styles.statFooterItem}>
              <Text style={styles.statFooterLabel}>Budget Tracking</Text>
              <Text style={styles.statFooterValue}>
                {statistics.categoriesWithBudget}/{statistics.categoryCount}
              </Text>
              <Text style={styles.statFooterSubvalue}>
                categories
              </Text>
            </View>
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

// Helper functions
const getViewModeIcon = (mode: string): string => {
  switch (mode) {
    case 'chart': return 'chart-pie';
    case 'list': return 'format-list-bulleted';
    case 'grid': return 'view-grid';
    case 'comparison': return 'chart-bar';
    default: return 'chart-pie';
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  compactCard: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rotateButton: {
    padding: 8,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
  },
  viewModeSelector: {
    marginBottom: 16,
  },
  viewModeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary[500] + '20',
    borderColor: colors.primary[500],
  },
  viewModeText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  viewModeTextActive: {
    color: colors.primary[500],
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -30 }],
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    padding: 8,
  },
  chartCenterTitle: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: 2,
  },
  chartCenterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  chartCenterSubtitle: {
    fontSize: 10,
    color: colors.neutral[600],
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.neutral[900],
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  listContainer: {
    maxHeight: 400,
  },
  categoryItem: {
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  } as const,
  categoryItemSelected: {
    backgroundColor: colors.primary[500] + '10',
    borderColor: colors.primary[500],
  } as const,
  categoryItemOverBudget: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[500] + '10',
  } as const,
  categoryItemNearBudget: {
    borderColor: colors.warning[500],
    backgroundColor: colors.warning[500] + '10',
  } as const,
  categoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  } as const,
  categoryMeta: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  categoryAmount: {
    alignItems: 'flex-end' as const,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  } as const,
  percentageText: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  trendIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  } as const,
  budgetSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  } as const,
  budgetHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  } as const,
  budgetUsage: {
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 4,
    textAlign: 'right' as const,
  } as const,
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  } as const,
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.neutral[600],
  } as const,
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  } as const,
  showAllButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  showAllText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    justifyContent: 'space-between' as const,
  },
  gridItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center' as const,
  },
  gridIcon: {
    marginBottom: 8,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
    textAlign: 'center' as const,
  } as const,
  gridAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  } as const,
  gridPercentage: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  comparisonContainer: {
    maxHeight: 300,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 16,
  } as const,
  comparisonItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  comparisonHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  comparisonCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  } as const,
  comparisonChange: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  } as const,
  comparisonBarContainer: {
    gap: 8,
  },
  comparisonBarLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  comparisonBarLabel: {
    fontSize: 11,
    color: colors.neutral[600],
  } as const,
  comparisonBars: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  comparisonBar: {
    height: 8,
    borderRadius: 4,
  },
  comparisonBarPrevious: {
    backgroundColor: colors.neutral[600] + '40',
  },
  comparisonBarCurrent: {
    backgroundColor: colors.primary[500],
  },
  comparisonValues: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  comparisonValue: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  recommendationsContainer: {
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 12,
  } as const,
  recommendationCard: {
    width: 280,
    padding: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  recommendationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  } as const,
  recommendationCategory: {
    fontSize: 12,
    color: colors.neutral[600],
  } as const,
  recommendationDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: 12,
    lineHeight: 20,
  } as const,
  recommendationFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  potentialSavings: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success[500],
  } as const,
  statisticsFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: 12,
  },
  statFooterItem: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  statFooterLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statFooterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  } as const,
  statFooterSubvalue: {
    fontSize: 11,
    color: colors.neutral[600],
  } as const,
  emptyState: {
    alignItems: 'center' as const,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginTop: 16,
    marginBottom: 8,
  } as const,
  emptyDescription: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center' as const,
  } as const,
});

export default CategoryBreakdown;
