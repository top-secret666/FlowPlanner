import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from 'lucide-react-native';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import KnowledgeScreen from './src/screens/KnowledgeScreen';
import ScrapbookScreen from './src/screens/ScrapbookScreen';

const Tab = createBottomTabNavigator();

function SplashScreen({ onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      <Text style={styles.splashEmoji}>🌙</Text>
      <Text style={styles.splashTitle}>FlowPlanner</Text>
      <Text style={styles.splashSub}>✨ Твой дневник знаний</Text>
    </Animated.View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <SplashScreen onDone={() => setReady(true)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Note: 'create-outline',
              Knowledge: 'book-outline',
              Scrapbook: 'color-palette-outline',
              Settings: 'settings-outline',
            };
            if (route.name === 'Scrapbook') {
              return <Palette size={size} color={color} strokeWidth={2.2} />;
            }
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#f4a7c3',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#1a0f2e',
            borderTopWidth: 1,
            borderTopColor: 'rgba(244,167,195,0.15)',
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: '#1a0f2e',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(244,167,195,0.15)',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#f0e8ff',
            fontSize: 17,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Note" component={NoteEditorScreen} />
        <Tab.Screen name="Knowledge" component={KnowledgeScreen} options={{ title: 'Knowledge' }} />
        <Tab.Screen name="Scrapbook" component={ScrapbookScreen} options={{ title: '🎨 Скрап' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#1a0f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashEmoji: { fontSize: 64, marginBottom: 16 },
  splashTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f0e8ff',
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif',
    letterSpacing: 1,
  },
  splashSub: { fontSize: 14, color: '#9b7fa6', marginTop: 8 },
});