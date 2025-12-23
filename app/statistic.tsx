import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';

const { width, height } = Dimensions.get('window');

export default function StatisticsScreen() {

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true); 
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuVisible(false); 
  }, []);

  const chartDimensions = useMemo(() => {
    const isSmallScreen = width < 375; 
    const isLargeScreen = width > 414; 
    
    return {
      chartWidth: width - 32, 
      chartHeight: isSmallScreen ? 180 : isLargeScreen ? 250 : 220,
      marginHorizontal: 16,
    };
  }, [width]);

  const monthlyData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        data: [12, 18, 15, 22, 19, 25],
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  const genreData = [
    { name: 'Комедия', population: 35, color: '#FF6B6B', legendFontColor: '#fff', legendFontSize: 12 },
    { name: 'Драма', population: 28, color: '#4ECDC4', legendFontColor: '#fff', legendFontSize: 12 },
    { name: 'Экшн', population: 22, color: '#45B7D1', legendFontColor: '#fff', legendFontSize: 12 },
    { name: 'Фэнтези', population: 18, color: '#96CEB4', legendFontColor: '#fff', legendFontSize: 12 }
  ];

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: width < 375 ? '3' : '4',
      strokeWidth: '2',
      stroke: '#6200ee'
    },
    fillShadowGradient: '#6200ee',      
    fillShadowGradientOpacity: 0.2,      
    useShadowColorFromDataset: false, 
  };

  const barData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        data: [12, 18, 15, 22, 19, 25]
      }
    ]
  };

  return (
    <View style={styles.container}>
      <Header
          title="Статистика"
          onMenuPress={handleMenuPress}
      />

      <ScrollView style={styles.container}>

        
        <Text style={styles.title}>Ваша киностатистика</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>145</Text>
            <Text style={styles.statLabel}>Просмотрено</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>320ч</Text>
            <Text style={styles.statLabel}>Время</Text>
          </View>
        </View>

        {/* Линейный график */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Активность просмотров</Text>
          <LineChart
            data={monthlyData}
            width={chartDimensions.chartWidth} 
            height={chartDimensions.chartHeight}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withInnerLines={true}
            withOuterLines={true}
            withShadow={true}
            withDots={true}
          />
        </View>

        {/* Круговая диаграмма */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Любимые жанры</Text>
          <PieChart
            data={genreData}
            width={chartDimensions.chartWidth} 
            height={chartDimensions.chartHeight}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Столбчатая диаграмма */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Просмотры по месяцам</Text>
          <BarChart
            data={barData}
            width={chartDimensions.chartWidth} 
            height={chartDimensions.chartHeight}
            yAxisLabel=""        
            yAxisSuffix=""      
            chartConfig={chartConfig}
            style={{  
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
      </ScrollView>
      <SideMenu
          isVisible={isMenuVisible}
          onClose={handleCloseMenu}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f0f0f',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 20, 
    marginTop:  Platform.OS === 'web' ? 70 : 100,
    textAlign: 'center' 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statCard: { 
    backgroundColor: '#1a1a1a', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    minWidth: 100,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#6200ee' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#888', 
    marginTop: 4 
  },
  chartSection: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: 12, 
    marginBottom: 16,
    marginHorizontal: 16,
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 12,
    textAlign: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  }
});