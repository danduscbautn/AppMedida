import { useState } from 'react';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

// 1. EL ESCUDO: Solo creamos el manager si NO estamos en la web
let bleManager = null;
if (Platform.OS !== 'web') {
  try {
    bleManager = new BleManager();
  } catch (error) {
    console.warn("Módulo nativo de Bluetooth no disponible.");
  }
}

export const useBluetoothBalanza = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peso, setPeso] = useState(null);
  const [error, setError] = useState(null);

  const scanAndConnect = async () => {
    // 2. LA BARRERA INFRANQUEABLE
    // Si no hay antena (estamos en web o Expo Go), frenamos TODO aquí mismo.
    if (!bleManager) {
      setError("Bluetooth no disponible en Web/Expo Go. Compila la app nativa para usarlo.");
      setIsScanning(false);
      return; // <-- Esta es la palabra mágica que evita el choque
    }

    // Si pasamos la barrera, significa que tenemos antena real
    setError(null);
    setIsScanning(true);

    try {
      // 3. AQUÍ RECIÉN LLAMAMOS AL ESCÁNER
      bleManager.startDeviceScan(null, null, (scanError, device) => {
        if (scanError) {
          setError(scanError.message);
          setIsScanning(false);
          return;
        }

        // Aquí irá la lógica futura para leer tu balanza G07
        // if (device.name === 'G07') { ... }
        
      });

      // Detener el escaneo después de 10 segundos para no agotar la batería
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 10000);

    } catch (err) {
      setError("Error inesperado al intentar usar el Bluetooth.");
      setIsScanning(false);
    }
  };

  return { scanAndConnect, isScanning, peso, error };
};