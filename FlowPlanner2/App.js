import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = { Note: 'create-outline', Settings: 'settings-outline' };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0d9488',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: { backgroundColor: '#111827' },
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#f9fafb',
        })}
      >
        <Tab.Screen name="Note" component={NoteEditorScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}