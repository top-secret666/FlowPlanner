import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from 'lucide-react-native';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import KnowledgeScreen from './src/screens/KnowledgeScreen';
import ScrapbookScreen from './src/screens/ScrapbookScreen';

const Tab = createBottomTabNavigator();

export default function App() {
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
          tabBarActiveTintColor: '#0d9488',
          tabBarInactiveTintColor: '#475569',
          tabBarStyle: {
            backgroundColor: '#0f172a',
            borderTopWidth: 1,
            borderTopColor: '#1e293b',
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
            backgroundColor: '#0f172a',
            borderBottomWidth: 1,
            borderBottomColor: '#1e293b',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: '#f1f5f9',
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