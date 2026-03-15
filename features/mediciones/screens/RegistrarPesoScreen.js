import { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme // <-- Importamos el sensor
} from 'react-native';
import { MedicionesAPI } from '../../../services/api/api';
import { useBluetoothBalanza } from '../hooks/useBluetoothBalanza';

const RegistrarPesoScreen = () => {
  const [cargando, setCargando] = useState(false);
  const [pesoManual, setPesoManual] = useState('');
  const [circAbdominal, setCircAbdominal] = useState('');
  const [circBrazo, setCircBrazo] = useState('');

  const { scanAndConnect, isScanning, peso, error: errorBluetooth, estadoConexion } = useBluetoothBalanza();

  // --- LA PALETA DE COLORES DINÁMICA ---
  const esOscuro = useColorScheme() === 'dark';
  const colores = {
    fondo: esOscuro ? '#121212' : '#f5f5f5',
    tarjeta: esOscuro ? '#1E1E1E' : 'white',
    textoPrincipal: esOscuro ? '#ffffff' : '#333333',
    textoSecundario: esOscuro ? '#aaaaaa' : '#666666',
    inputFondo: esOscuro ? '#2C2C2C' : '#fafafa',
    inputBorde: esOscuro ? '#444444' : '#cccccc',
  };

  const handleGuardarPeso = async () => {
    const pesoFinal = peso ? peso : parseFloat(pesoManual);

    if (!pesoFinal) {
      Alert.alert('Atención', 'Debes ingresar un peso manual o conectarte a la balanza.');
      return;
    }

    setCargando(true);
    
    const nuevaMedicion = {
      usuarioId: 1, 
      peso: pesoFinal,
      circunferenciaAbdominal: circAbdominal ? parseFloat(circAbdominal) : null,
      circunferenciaBrazo: circBrazo ? parseFloat(circBrazo) : null, 
      fecha: new Date().toISOString()
    };

    try {
      const resultado = await MedicionesAPI.guardarMedicion(nuevaMedicion);
      Alert.alert('Éxito', '¡Medición guardada correctamente en tu historial!');
      
      setPesoManual('');
      setCircAbdominal('');
      setCircBrazo('');
      
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar en la base de datos.');
      console.error('Error en la API:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colores.fondo }]}>
      
      <Text style={[styles.title, { color: colores.textoPrincipal }]}>Nuevo Registro</Text>

      <View style={[styles.card, { backgroundColor: colores.tarjeta }]}>
        <Text style={[styles.sectionTitle, { color: colores.textoPrincipal }]}>1. Peso (Balanza G07)</Text>
        
        {errorBluetooth && <Text style={styles.errorText}>{errorBluetooth}</Text>}
        
        {/* NUEVO TEXTO: Muestra si está buscando, conectando o conectado */}
        <Text style={{ textAlign: 'center', color: colores.textoSecundario, marginBottom: 5 }}>
          Estado: {estadoConexion}
        </Text>

        <Text style={styles.pesoText}>
          {peso ? `${peso} kg` : '-- kg'}
        </Text>

        <Button 
          title={isScanning ? "Buscando balanza OKOK..." : "Conectar Balanza"} 
          onPress={scanAndConnect} 
          disabled={isScanning}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colores.tarjeta }]}>
        <Text style={[styles.sectionTitle, { color: colores.textoPrincipal }]}>2. Ingreso Manual</Text>

        <Text style={[styles.label, { color: colores.textoSecundario }]}>Peso Manual (kg):</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colores.inputFondo, borderColor: colores.inputBorde, color: colores.textoPrincipal }]}
          placeholder="Ej: 75.5"
          placeholderTextColor={colores.textoSecundario}
          keyboardType="numeric"
          value={pesoManual}
          onChangeText={setPesoManual} 
        />
        
        <Text style={[styles.label, { color: colores.textoSecundario }]}>Circunferencia Abdominal (cm):</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colores.inputFondo, borderColor: colores.inputBorde, color: colores.textoPrincipal }]}
          placeholder="Ej: 85.5"
          placeholderTextColor={colores.textoSecundario}
          keyboardType="numeric"
          value={circAbdominal}
          onChangeText={setCircAbdominal} 
        />

        <Text style={[styles.label, { color: colores.textoSecundario }]}>Circunferencia de Brazo (cm):</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colores.inputFondo, borderColor: colores.inputBorde, color: colores.textoPrincipal }]}
          placeholder="Ej: 32.0"
          placeholderTextColor={colores.textoSecundario}
          keyboardType="numeric"
          value={circBrazo}
          onChangeText={setCircBrazo}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title={cargando ? "Guardando..." : "Guardar en mi Historial"} 
          color="#28a745" 
          onPress={handleGuardarPeso} 
          disabled={cargando} 
        />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { padding: 20, borderRadius: 10, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  pesoText: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#007BFF' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16 },
  buttonContainer: { marginTop: 10, marginBottom: 30 }
});

export default RegistrarPesoScreen;