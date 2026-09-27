/**
 * DeployLab App
 *
 * @format
 */

import React, { useRef, useState } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  useAuthStore,
} from './src/features/auth';
import { DashboardScreen } from './src/features/dashboard';
import { CatalogScreen, CourseDetailScreen } from './src/features/courses';
import { MyCoursesScreen } from './src/features/learning';
import { SettingsScreen } from './src/features/settings';
import { BottomNav, type TabKey } from './src/shared/components';
import { ThemeProvider, useTheme } from './src/shared/context/ThemeContext';
import type { RootStackParamList } from './src/shared/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ORDER: Record<TabKey, number> = {
  dashboard: 0,
  catalog: 1,
  'my-courses': 2,
  settings: 3,
};

type MainTabsProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

function MainTabsScreen({ navigation, route }: Readonly<MainTabsProps>) {
  const { colors } = useTheme();
  const initialTab = route.params?.initialTab ?? 'dashboard';
  const [currentTab, setCurrentTab] = useState<TabKey>(initialTab);

  // Tab transition animated values
  const tabFade = useRef(new Animated.Value(1)).current;
  const tabTranslateX = useRef(new Animated.Value(0)).current;

  const handleSelectTab = (nextTab: TabKey) => {
    if (nextTab === currentTab) return;

    const prevIdx = TAB_ORDER[currentTab];
    const nextIdx = TAB_ORDER[nextTab];
    const isRight = nextIdx > prevIdx;
    const enterOffset = isRight ? 22 : -22;

    setCurrentTab(nextTab);

    // Animate tab content entrance
    tabFade.setValue(0);
    tabTranslateX.setValue(enterOffset);

    Animated.parallel([
      Animated.timing(tabFade, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(tabTranslateX, {
        toValue: 0,
        duration: 200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.mainContent}>
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onLogout={handleLogout}
            onNavigateToProfile={() => handleSelectTab('settings')}
            onContinueCourse={course =>
              navigation.navigate('CourseDetail', { course, autoPlay: true })
            }
          />
        )}
        {currentTab === 'catalog' && (
          <CatalogScreen
            onSelectCourse={(course, cardLayout) =>
              navigation.navigate('CourseDetail', { course, cardLayout })
            }
          />
        )}
        {currentTab === 'my-courses' && (
          <MyCoursesScreen
            onExploreCatalog={() => handleSelectTab('catalog')}
            onContinueLesson={(course, cardLayout) =>
              navigation.navigate('CourseDetail', { course, cardLayout, autoPlay: true })
            }
          />
        )}
        {currentTab === 'settings' && (
          <SettingsScreen onLogout={handleLogout} />
        )}
      </View>
      <BottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />
    </View>
  );
}

function NavigationRoot() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.accent,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'default',
            freezeOnBlur: false,
          }}>
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen
                onFinish={() => props.navigation.replace('Onboarding')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Onboarding">
            {props => (
              <OnboardingScreen
                onDone={() => props.navigation.replace('Login')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Login">
            {props => (
              <LoginScreen
                onLoginSuccess={() => props.navigation.replace('MainTabs')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="MainTabs"
            component={MainTabsScreen}
            options={{
              animation: 'fade',
              freezeOnBlur: false,
            }}
          />

          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'none',
              contentStyle: { backgroundColor: 'transparent' },
              freezeOnBlur: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NavigationRoot />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
});

export default App;
