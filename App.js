import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Sidebar } from './src/components/Sidebar';
import { InboxQueryProvider } from './src/context/InboxQueryContext';
import { ReviewsProvider, useReviews } from './src/context/ReviewsContext';
import { SettingsProvider } from './src/context/SettingsContext';
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
import { colors, fonts } from './src/theme';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
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

const modalScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: fonts.sansSemiBold },
  contentStyle: { backgroundColor: colors.bg },
  presentation: 'modal',
};

function InboxStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.sansSemiBold },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.sansSemiBold },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="AnalyticsHome"
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function BusinessStack() {
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
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
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
  );
}

function AppStack() {
  const { connected } = useReviews();

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
    </RootStack.Navigator>
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
        <ReviewsProvider>
          <SettingsProvider>
            <UserProvider>
              <InboxQueryProvider>
                <NavigationContainer theme={navTheme}>
                  <StatusBar style="light" />
                  <AppStack />
                </NavigationContainer>
              </InboxQueryProvider>
            </UserProvider>
          </SettingsProvider>
        </ReviewsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
