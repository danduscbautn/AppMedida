import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme // <-- Importamos el sensor
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SwipeListView } from 'react-native-swipe-list-view';
import { MedicionesAPI } from '../../../services/api/api';

const screenWidth = Dimensions.get("window").width;

const HistorialScreen = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- LA PALETA DE COLORES DINÁMICA ---
  const esOscuro = useColorScheme() === 'dark';
  const colores = {
    fondo: esOscuro ? '#121212' : '#f5f5f5',
    tarjeta: esOscuro ? '#1E1E1E' : 'white',
    textoPrincipal: esOscuro ? '#ffffff' : '#333333',
    textoSecundario: esOscuro ? '#aaaaaa' : '#888888',
    separador: esOscuro ? '#333333' : '#eeeeee',
    graficoFondo: esOscuro ? '#1E1E1E' : '#ffffff',
    graficoTexto: esOscuro ? 'rgba(255,255,255,0.7)' : 'rgba(100,100,100,1)'
  };

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
              await MedicionesAPI.eliminarMedicion(id);
              setHistorial(historialActual => historialActual.filter(item => item.id !== id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            }
          }
        }
      ]
    );
  };

  const ultimasMediciones = [...historial].slice(0, 6).reverse();
  const mostrarGrafico = ultimasMediciones.length > 0;
  
  const datosGrafico = mostrarGrafico ? {
    labels: ultimasMediciones.map(item => {
      const d = new Date(item.fecha);
      return `${d.getDate()}/${d.getMonth() + 1}`; 
    }),
    datasets: [{ data: ultimasMediciones.map(item => item.peso), strokeWidth: 3 }]
  } : null;

  const renderItem = (data) => {
    const item = data.item;
    const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.card, { backgroundColor: colores.tarjeta }]}>
        <Text style={[styles.fecha, { color: colores.textoSecundario, borderBottomColor: colores.separador }]}>{fechaFormateada}</Text>
        <View style={styles.fila}>
          <Text style={[styles.dato, { color: colores.textoSecundario }]}>⚖️ Peso: <Text style={styles.valor}>{item.peso} kg</Text></Text>
        </View>
        {(item.circunferenciaAbdominal || item.circunferenciaBrazo) && (
          <View style={styles.fila}>
            {item.circunferenciaAbdominal && <Text style={[styles.dato, { color: colores.textoSecundario }]}>📏 Abd: <Text style={styles.valor}>{item.circunferenciaAbdominal} cm</Text></Text>}
            {item.circunferenciaBrazo && <Text style={[styles.dato, { color: colores.textoSecundario }]}>💪 Brazo: <Text style={styles.valor}>{item.circunferenciaBrazo} cm</Text></Text>}
          </View>
        )}
      </View>
    );
  };

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
    <View style={[styles.container, { backgroundColor: colores.fondo }]}>
      <Text style={[styles.title, { color: colores.textoPrincipal }]}>Mi Historial</Text>
      
      {cargando ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />
      ) : (
        <>
          {mostrarGrafico && (
            <View style={styles.chartContainer}>
              <Text style={[styles.chartTitle, { color: colores.textoPrincipal }]}>Tu Progreso Reciente</Text>
              <LineChart
                data={datosGrafico}
                width={screenWidth - 40} 
                height={220}
                yAxisSuffix=" kg"
                yAxisInterval={1} 
                chartConfig={{
                  backgroundColor: colores.graficoFondo, 
                  backgroundGradientFrom: colores.graficoFondo, 
                  backgroundGradientTo: colores.graficoFondo,
                  decimalPlaces: 1, 
                  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                  labelColor: () => colores.graficoTexto,
                  style: { borderRadius: 16 }, 
                  propsForDots: { r: "5", strokeWidth: "2", stroke: "#0056b3" }
                }}
                bezier 
                style={styles.grafico}
              />
            </View>
          )}

          <SwipeListView
            data={historial}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-90} 
            disableRightSwipe={true} 
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colores.textoSecundario }]}>Aún no tienes registros guardados.</Text>}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  chartContainer: { marginBottom: 20, alignItems: 'center' },
  chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, alignSelf: 'flex-start' },
  grafico: { borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  card: { padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  fecha: { fontSize: 14, marginBottom: 10, borderBottomWidth: 1, paddingBottom: 5 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dato: { fontSize: 16 },
  valor: { fontWeight: 'bold', color: '#007BFF' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  hiddenCard: { backgroundColor: '#dc3545', padding: 15, borderRadius: 10, marginBottom: 15, flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  deleteButton: { width: 80, height: '100%', justifyContent: 'center', alignItems: 'center' },
  deleteText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default HistorialScreen;