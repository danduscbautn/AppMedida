import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native'; // <-- Importamos el sensor de color
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const insets = useSafeAreaInsets(); 
  const tema = useColorScheme(); // Averiguamos qué tema tiene el celular
  const esOscuro = tema === 'dark';

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007BFF', 
      tabBarInactiveTintColor: esOscuro ? '#888' : '#888',  
      headerShown: false, 
      tabBarStyle: { 
        backgroundColor: esOscuro ? '#1E1E1E' : '#ffffff', // Barra oscura o blanca
        borderTopColor: esOscuro ? '#333' : '#eee', // Borde oscuro o claro
        paddingBottom: insets.bottom + 5, 
        height: 60 + insets.bottom, 
      } 
    }}>
      
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scale-outline" size={size} color={color} />
          )
        }} 
      />

      <Tabs.Screen 
        name="historial" 
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}