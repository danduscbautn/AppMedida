import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

let bleManager = null;
if (Platform.OS !== 'web') {
  try {
    bleManager = new BleManager();
  } catch (error) {
    console.warn("Módulo nativo de Bluetooth no disponible.");
  }
}

const MAC_BALANZA = '80:F4:16:E5:D4:CA';

const decodificarBase64 = (base64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === "=") bufferLength--;
  if (base64[base64.length - 2] === "=") bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    let e1 = chars.indexOf(base64[i]);
    let e2 = chars.indexOf(base64[i + 1]);
    let e3 = chars.indexOf(base64[i + 2]);
    let e4 = chars.indexOf(base64[i + 3]);

    bytes[p++] = (e1 << 2) | (e2 >> 4);
    bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return Array.from(bytes);
};

export const useBluetoothBalanza = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peso, setPeso] = useState(null); // ¡AQUÍ GUARDAMOS EL PESO REAL!
  const [error, setError] = useState(null);
  const [estadoConexion, setEstadoConexion] = useState('Desconectado');

  const solicitarPermisosBluetooth = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const scanAndConnect = async () => {
    if (!bleManager) return setError("Bluetooth no disponible.");

    const tienePermisos = await solicitarPermisosBluetooth();
    if (!tienePermisos) return setError("Permisos denegados.");

    setError(null);
    setIsScanning(true);
    setEstadoConexion('Súbete a la balanza...');
    setPeso(null); // Limpiamos el peso anterior

    try {
      bleManager.startDeviceScan(null, null, (scanError, device) => {
        if (scanError) {
          setError(scanError.message);
          setIsScanning(false);
          setEstadoConexion('Error de escáner');
          return;
        }

        // Si escuchamos a nuestra balanza...
        if (device && device.id === MAC_BALANZA) {
          if (device.manufacturerData) {
            const numeros = decodificarBase64(device.manufacturerData);
            
            // --- LA FÓRMULA MÁGICA ---
            const pesoCalculado = ((numeros[2] * 256) + numeros[3]) / 100;
            
            if (pesoCalculado > 0) {
              setPeso(pesoCalculado); // Esto actualiza el número en tu pantalla al instante
              setEstadoConexion('¡Leyendo peso en vivo!');
            }
          }
        }
      });

      // El escáner se quedará leyendo en vivo durante 15 segundos y luego se apagará solo
      setTimeout(() => {
        if (isScanning) {
          bleManager.stopDeviceScan();
          setIsScanning(false);
          setEstadoConexion('Peso capturado.');
        }
      }, 15000);

    } catch (err) {
      setError("Error al encender Bluetooth.");
      setIsScanning(false);
    }
  };

  return { scanAndConnect, isScanning, peso, error, estadoConexion };
};