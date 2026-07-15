import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoChecklist } from './src/components/DemoChecklist';
import { DemoNewReviewToast } from './src/components/DemoNewReviewToast';
import { DemoWaitlistModal } from './src/components/DemoWaitlistModal';
import { Sidebar } from './src/components/Sidebar';
import { DemoProvider, useDemo } from './src/context/DemoContext';
import { InboxQueryProvider } from './src/context/InboxQueryContext';
import { ReviewsProvider, useReviews } from './src/context/ReviewsContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import { AboutScreen } from './src/screens/AboutScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { BusinessScreen } from './src/screens/BusinessScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PrivacyScreen } from './src/screens/PrivacyScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReviewDetailScreen } from './src/screens/ReviewDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ShareGraphicScreen } from './src/screens/ShareGraphicScreen';
import { WidgetCodeScreen } from './src/screens/WidgetCodeScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function useStackScreenOptions() {
  const { colors, fonts } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      headerTitleStyle: { fontFamily: fonts.sansSemiBold },
      contentStyle: { backgroundColor: colors.bg },
    }),
    [colors, fonts]
  );
}

function useModalScreenOptions() {
  const stackOptions = useStackScreenOptions();
  return useMemo(
    () => ({
      ...stackOptions,
      presentation: 'modal',
    }),
    [stackOptions]
  );
}

function InboxStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="InboxList"
        component={InboxScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewDetail"
        component={ReviewDetailScreen}
        options={{ title: 'Reply' }}
      />
    </Stack.Navigator>
  );
}

function AnalyticsStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="AnalyticsHome"
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function BusinessStack() {
  const modalScreenOptions = useModalScreenOptions();
  return (
    <Stack.Navigator screenOptions={modalScreenOptions}>
      <Stack.Screen
        name="BusinessHome"
        component={BusinessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Website' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  const modalScreenOptions = useModalScreenOptions();
  return (
    <Stack.Navigator screenOptions={modalScreenOptions}>
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Website' }}
      />
      <Stack.Screen
        name="WidgetCode"
        component={WidgetCodeScreen}
        options={{ title: 'Website widget' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: 'left',
        }}
      >
        <Tab.Screen name="Inbox" component={InboxStack} />
        <Tab.Screen name="Analytics" component={AnalyticsStack} />
        <Tab.Screen name="Business" component={BusinessStack} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>
      <DemoChecklist />
      <DemoNewReviewToast />
      <DemoWaitlistModal />
    </View>
  );
}

function AppStack() {
  const { connected } = useReviews();
  const modalScreenOptions = useModalScreenOptions();

  return (
    <RootStack.Navigator screenOptions={modalScreenOptions}>
      {connected ? (
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <RootStack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      )}
      <RootStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <RootStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Website' }}
      />
      <RootStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', presentation: 'modal' }}
      />
      <RootStack.Screen
        name="ShareGraphic"
        component={ShareGraphicScreen}
        options={{ title: 'Share review', presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
}

function readDemoQueryParam() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('demo') === '1';
  } catch {
    return false;
  }
}

function DemoDeepLink() {
  const { connected } = useReviews();
  const { demoActive, startDemo, beginDemoSession } = useDemo();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!readDemoQueryParam() || startedRef.current) return;
    startedRef.current = true;
    if (connected) {
      if (!demoActive) beginDemoSession();
      return;
    }
    startDemo();
  }, [connected, demoActive, startDemo, beginDemoSession]);

  return null;
}

function AppNavigation() {
  const { colors, fonts, themeId } = useTheme();

  const navTheme = useMemo(() => {
    const base = themeId === 'daylight' ? DefaultTheme : DarkTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.surfaceAlt,
        primary: colors.accent,
      },
      fonts: {
        regular: { fontFamily: fonts.sans, fontWeight: '400' },
        medium: { fontFamily: fonts.sansMedium, fontWeight: '500' },
        bold: { fontFamily: fonts.sansSemiBold, fontWeight: '600' },
        heavy: { fontFamily: fonts.sansBold, fontWeight: '700' },
      },
    };
  }, [colors, fonts, themeId]);

  const statusBarStyle = themeId === 'daylight' ? 'dark' : 'light';

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={statusBarStyle} />
      <DemoDeepLink />
      <AppStack />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ReviewsProvider>
            <SettingsProvider>
              <UserProvider>
                <InboxQueryProvider>
                  <DemoProvider>
                    <AppNavigation />
                  </DemoProvider>
                </InboxQueryProvider>
              </UserProvider>
            </SettingsProvider>
          </ReviewsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
