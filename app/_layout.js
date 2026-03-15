import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- 1. Importamos el medidor

export default function AppLayout() {
  const insets = useSafeAreaInsets(); // <-- 2. Medimos los botones de tu Xiaomi

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007BFF', 
      tabBarInactiveTintColor: '#888',  
      headerShown: false, 
      tabBarStyle: { 
        // 3. Le sumamos el tamaño de tus botones (insets.bottom) al espacio de la barra
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