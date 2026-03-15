import { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { MedicionesAPI } from '../../../services/api/api';
import { useBluetoothBalanza } from '../hooks/useBluetoothBalanza';

const RegistrarPesoScreen = () => {
  // 1. ESTADOS (Aquí es donde guardamos lo que el usuario escribe)
  const [cargando, setCargando] = useState(false);
  const [pesoManual, setPesoManual] = useState('');
  const [circAbdominal, setCircAbdominal] = useState('');
  const [circBrazo, setCircBrazo] = useState('');

  // 2. MAGIA DEL BLUETOOTH
  const { scanAndConnect, isScanning, peso, error: errorBluetooth } = useBluetoothBalanza();

  // 3. FUNCIÓN PARA GUARDAR EN LA BASE DE DATOS
  const handleGuardarPeso = async () => {
    // Si la balanza nos dio un peso, usamos ese. Si no, usamos el que el usuario escribió a mano.
    const pesoFinal = peso ? peso : parseFloat(pesoManual);

    if (!pesoFinal) {
      Alert.alert('Atención', 'Debes ingresar un peso manual o conectarte a la balanza.');
      return;
    }

    setCargando(true);
    
    // Armamos el "paquete" de datos para enviar a Java
    const nuevaMedicion = {
      usuarioId: 1, 
      peso: pesoFinal,
      circunferenciaAbdominal: circAbdominal ? parseFloat(circAbdominal) : null,
      circunferenciaBrazo: circBrazo ? parseFloat(circBrazo) : null, 
      //circunferenciaBrazoIzq
      //circunferenciaMusloDer
      //circunferenciaMusloIzq
      //Pecho
      fecha: new Date().toISOString()
    };

    try {
      const resultado = await MedicionesAPI.guardarMedicion(nuevaMedicion);
      Alert.alert('Éxito', '¡Medición guardada correctamente en tu historial!');
      
      // Limpiamos los campos de texto para que queden vacíos después de guardar
      setPesoManual('');
      setCircAbdominal('');
      setCircBrazo('');
      
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar en la base de datos. Revisa la consola.');
      console.error('Error en la API:', error);
    } finally {
      setCargando(false);
    }
  };

  // 4. LA PANTALLA
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Nuevo Registro</Text>

      {/* --- SECCIÓN BLUETOOTH --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Peso (Balanza G07)</Text>
        
        {errorBluetooth && <Text style={styles.errorText}>{errorBluetooth}</Text>}
        
        <Text style={styles.pesoText}>
          {peso ? `${peso} kg` : '-- kg'}
        </Text>

        <Button 
          title={isScanning ? "Buscando balanza OKOK..." : "Conectar Balanza"} 
          onPress={scanAndConnect} 
          disabled={isScanning}
        />
      </View>

      {/* --- SECCIÓN MANUAL --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Ingreso Manual (Prueba)</Text>

        <Text style={styles.label}>Peso Manual (kg):</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: 75.5"
          keyboardType="numeric"
          value={pesoManual}
          onChangeText={setPesoManual} 
        />
        
        <Text style={styles.label}>Circunferencia Abdominal (cm):</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: 85.5"
          keyboardType="numeric"
          value={circAbdominal}
          onChangeText={setCircAbdominal} 
        />

        <Text style={styles.label}>Circunferencia de Brazo (cm):</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: 32.0"
          keyboardType="numeric"
          value={circBrazo}
          onChangeText={setCircBrazo}
        />
      </View>

      {/* --- BOTÓN DE GUARDAR --- */}
      <View style={styles.buttonContainer}>
        <Button 
          title={cargando ? "Guardando en Java..." : "Guardar en mi Historial"} 
          color="#28a745" 
          onPress={handleGuardarPeso} 
          disabled={cargando} 
        />
      </View>

    </ScrollView>
  );
};

// 5. ESTILOS VISUALES
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444'
  },
  pesoText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#007BFF' 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30
  }
});

export default RegistrarPesoScreen;