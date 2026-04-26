import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useTheme } from '../src/context/ThemeContext';
import { subscription, subscriptionAPI } from '../src/services/api';
import { showConfirm, showNotification } from '../src/utils/notifications';


export default function SubscriptionScreen() {
    const [isMenuVisible, setIsMenuVisible] = React.useState<boolean>(false);
    const [plans, setPlans] = useState<subscription[]>([]);
    const { theme } = useTheme(); 
    const styles = getStyles(theme);
    const handleMenuPress = () => setIsMenuVisible(true);
    const handleCloseMenu = () => setIsMenuVisible(false);

    useEffect(() => {
        const fetchPlans = async () => {
        try {
            const response = await subscriptionAPI.getPlans();
            setPlans(response.data || []); 
        } catch (error) {
            console.error("Ошибка при загрузке планов:", error);
        }
    };
    fetchPlans();
    }, []);

    const handleSubscribe = (planId: number, planName: string) => {

      showConfirm(
          "Подтверждение",
          `Вы хотите активировать тариф "${planName}" на 1 месяц?`,
          async () => {
              try {
                  console.log("Подтверждено. Идёт процесс подписки... План ID:", planId, "Название:", planName);
                  const res = await subscriptionAPI.subscribe(planId);
                  if (res.success) {
                      showNotification("Теперь вам доступны все фильмы.", "success");
                      router.push('/')
                  }
              } catch (e) {
                  showNotification("Проверьте соединение с сетью", "error");
              }
          },
          "Да, купить" // Текст для главной кнопки
      );
    };

    const renderPlan = ({ item }: { item: any }) => (
        <View style={styles.planCard}>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>{item.price} ₽/месяц</Text>
        <Text style={styles.planDescription}>{item.description}</Text>
        
        <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(item.subscription_plans_id, item.name)}
        >
            <Text style={styles.buttonText}>Выбрать</Text>
        </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title="Покупка подписки" onMenuPress={handleMenuPress} />
                <View style={styles.container}>
                    <Text style={styles.title}>Выберите ваш тариф</Text>
                    <View style={styles.listWrapper}>
                      <FlatList
                          data={plans.slice(1)}
                          renderItem={renderPlan}
                          keyExtractor={(item) => item.subscription_plans_id.toString()}
                          horizontal={true}
                          snapToInterval={320}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={[styles.list, { flexGrow: 1, justifyContent: 'center' }]}
                      />
                    </View>
                </View>
           
            <SideMenu
                isVisible={isMenuVisible}
                onClose={handleCloseMenu}
            />
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40, 
  },
  listWrapper: {
    justifyContent: 'center', 
  },
  list: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    marginRight: 20, 
    justifyContent: 'space-between',
    width: 300,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.accent,
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  planDescription: {
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: theme.accent,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});