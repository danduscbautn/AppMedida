import axios from 'axios';

// 1. Configuramos la URL base de tu backend en Java
// Si pruebas en el emulador de Android hacia tu PC, suele ser 10.0.2.2
// Si pruebas en web o iOS, suele ser localhost o tu IP local (ej. 192.168.1.X)
const BASE_URL = 'http://192.168.0.7:8080/api/v1'; 

// 2. Creamos la instancia de Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // Si el backend Java tarda más de 10 segundos, corta la petición
});

// 3. (Opcional pero recomendado) Interceptores para el futuro
// Aquí es donde, más adelante, adjuntarás el Token de sesión del usuario a cada petición
apiClient.interceptors.request.use(
  async (config) => {
    // const token = await obtenerTokenDelStorage();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Exportamos los "Endpoints" (Las rutas de tu backend)
// Organízalos por dominio de negocio (mediciones, usuarios, etc.)
export const MedicionesAPI = {
  // Enviar un nuevo registro de peso (POST)
  guardarMedicion: async (datosMedicion) => {
    const response = await apiClient.post('/mediciones', datosMedicion);
    return response.data;
  },
  
  // Obtener el historial del usuario (GET)
  obtenerHistorial: async (usuarioId) => {
    const response = await apiClient.get(`/mediciones/usuario/${usuarioId}`);
    return response.data;
  },

  // NUEVA FUNCIÓN: Llama a Java para borrar un registro por su ID
  eliminarMedicion: async (id) => {
    const response = await apiClient.delete(`/mediciones/${id}`);
    return response.data;
  }
};

export const DietasAPI = {
  // Espacio preparado para cuando construyas el módulo de dietas
};

export default apiClient;