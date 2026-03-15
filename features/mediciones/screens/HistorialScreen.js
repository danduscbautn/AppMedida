import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SwipeListView } from 'react-native-swipe-list-view'; // <-- La nueva lista deslizable
import { MedicionesAPI } from '../../../services/api/api';

const screenWidth = Dimensions.get("window").width;

const HistorialScreen = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const datos = await MedicionesAPI.obtenerHistorial(1);
      setHistorial(datos.reverse()); 
    } catch (error) {
      Alert.alert('Error', 'No pudimos traer tu historial.');
    } finally {
      setCargando(false);
    }
  };

  // --- NUEVA FUNCIÓN: ALERTA Y BORRADO ---
  const confirmarEliminacion = (id) => {
    Alert.alert(
      "Eliminar Registro",
      "¿Estás seguro de que quieres borrar esta medición? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Le decimos a Java que lo borre de la base de datos
              await MedicionesAPI.eliminarMedicion(id);
              
              // 2. Lo borramos de la pantalla del celular al instante (sin recargar todo)
              setHistorial(historialActual => historialActual.filter(item => item.id !== id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          }
        }
      ]
    );
  };

  // --- PREPARAMOS LOS DATOS PARA EL GRÁFICO ---
  const ultimasMediciones = [...historial].slice(0, 6).reverse();
  const mostrarGrafico = ultimasMediciones.length > 0;
  
  const datosGrafico = mostrarGrafico ? {
    labels: ultimasMediciones.map(item => {
      const d = new Date(item.fecha);
      return `${d.getDate()}/${d.getMonth() + 1}`; 
    }),
    datasets: [{ data: ultimasMediciones.map(item => item.peso), strokeWidth: 3 }]
  } : null;

  // --- CÓMO SE VE LA TARJETA (FRENTE) ---
  const renderItem = (data) => {
    const item = data.item;
    const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={styles.card}>
        <Text style={styles.fecha}>{fechaFormateada}</Text>
        <View style={styles.fila}>
          <Text style={styles.dato}>⚖️ Peso: <Text style={styles.valor}>{item.peso} kg</Text></Text>
        </View>
        {(item.circunferenciaAbdominal || item.circunferenciaBrazo) && (
          <View style={styles.fila}>
            {item.circunferenciaAbdominal && <Text style={styles.dato}>📏 Abd: <Text style={styles.valor}>{item.circunferenciaAbdominal} cm</Text></Text>}
            {item.circunferenciaBrazo && <Text style={styles.dato}>💪 Brazo: <Text style={styles.valor}>{item.circunferenciaBrazo} cm</Text></Text>}
          </View>
        )}
      </View>
    );
  };

  // --- CÓMO SE VE EL BOTÓN OCULTO DE BORRAR (ATRÁS) ---
  const renderHiddenItem = (data) => (
    <View style={styles.hiddenCard}>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => confirmarEliminacion(data.item.id)}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Historial</Text>
      
      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* EL GRÁFICO */}
          {mostrarGrafico && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Tu Progreso Reciente</Text>
              <LineChart
                data={datosGrafico}
                width={screenWidth - 40} 
                height={220}
                yAxisSuffix=" kg"
                yAxisInterval={1} 
                chartConfig={{
                  backgroundColor: "#ffffff", backgroundGradientFrom: "#ffffff", backgroundGradientTo: "#f8f9fa",
                  decimalPlaces: 1, color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                  style: { borderRadius: 16 }, propsForDots: { r: "5", strokeWidth: "2", stroke: "#0056b3" }
                }}
                bezier 
                style={styles.grafico}
              />
            </View>
          )}

          {/* LA LISTA DESLIZABLE */}
          <SwipeListView
            data={historial}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-90} // Cuánto espacio se abre al deslizar hacia la izquierda
            disableRightSwipe={true} // Solo permitimos deslizar hacia la izquierda
            ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes registros guardados.</Text>}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  chartContainer: { marginBottom: 20, alignItems: 'center' },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, alignSelf: 'flex-start' },
  grafico: { borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  
  // Estilos de la tarjeta frontal
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  fecha: { fontSize: 14, color: '#888', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dato: { fontSize: 16, color: '#555' },
  valor: { fontWeight: 'bold', color: '#007BFF' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },

  // Estilos del botón rojo oculto (atrás)
  hiddenCard: {
    backgroundColor: '#dc3545', // Rojo peligro
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end', // Empuja el botón a la derecha
    alignItems: 'center'
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default HistorialScreen;