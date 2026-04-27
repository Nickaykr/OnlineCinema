import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useAuth } from '../src/context/AuthContext';
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
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const { user } = useAuth();
    const [promoCode, setPromoCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

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
    },[]);

    useEffect(() => {
      console.log(user)
      if (user?.subscription?.isActive) {
        setActivePlanId(user.subscription.subscription_plans_id);
      } else {
        console.log("Активной подписки не найдено в объекте user");
      }
    }, [user]);

    const handleSubscribe = (planId: number, planName: string) => {

      showConfirm(
          "Подтверждение",
          `Вы хотите активировать тариф "${planName}" на 1 месяц?`,
          async () => {
              try {
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

    const applyPromo = async () => {
      try {
        const res = await subscriptionAPI.setPromoCode(promoCode);
        if (res.success && res.percent) {
          setDiscountPercent(res.percent);
          showNotification(`Промокод применен! Скидка: ${res.percent}%`, "success");
        }
      } catch (e) {
        showNotification("Неверный код", "error");
      }
    };

    const renderPlan = ({ item }: { item: subscription }) => {
      const isActive = item.subscription_plans_id === activePlanId;
      const hasDiscount = discountPercent > 0 && !isActive;
      const finalPrice = isActive 
        ? item.price 
        : item.price * (1 - discountPercent / 100);

      return (
        <View style={[styles.planCard, isActive && styles.activeCard]}>
          {isActive && <Text style={styles.activeBadge}>Ваш тариф</Text>}
          <Text style={styles.planName}>{item.name}</Text>
          
          <View style={{ alignItems: 'center' }}>
            {/* Показываем старую цену, если есть скидка */}
            {hasDiscount && (
              <Text style={{ 
                textDecorationLine: 'line-through', 
                color: 'gray', 
                fontSize: 14 
              }}>
                {item.price} ₽
              </Text>
            )}
            
            <Text style={styles.planPrice}>
              {Math.round(finalPrice)} ₽/месяц
            </Text>
          </View>

          <Text style={styles.planDescription}>{item.description}</Text>
          
          <TouchableOpacity 
            style={[styles.subscribeButton, isActive && styles.renewButton]}
            onPress={() => handleSubscribe(item.subscription_plans_id, item.name)}
          >
            <Text style={styles.buttonText}>
              {isActive ? "Продлить" : "Выбрать"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    return (
        <View style={styles.container}>
            <Header title="Покупка подписки" onMenuPress={handleMenuPress} />
               
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

            <View style={styles.promoContainer}>
              <TextInput 
                  style={styles.input} 
                  placeholder="Промокод" 
                  onChangeText={setPromoCode}
              />
              <TouchableOpacity onPress={applyPromo} style={styles.applyButton}>
                  <Text>Применить</Text>
              </TouchableOpacity>
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
    overflow: 'visible',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  activeCard: {
    borderColor: theme.accent, 
    borderWidth: 2,
    transform: [{ scale: 1.02 }], 
  },
  activeBadge: {
    color: theme.accent,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  renewButton: {
    backgroundColor: '#4CAF50', 
  },
  promoContainer: {
    justifyContent: 'center',
    width: '70%',
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 20,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: theme.accent,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});