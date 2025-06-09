# 🎬 Your Fi&Se - Aplicación Móvil de Películas y Series

<div align="center">
  <img src="MovieSeriesAppExpo/assets/icon.png" alt="App Icon" width="120" height="120">
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
</div>

## 📝 Descripción del Proyecto

**Your Fi&Se** es una aplicación móvil desarrollada en React Native que permite a los usuarios explorar, descubrir y gestionar su biblioteca personal de películas y series. La aplicación utiliza la API de The Movie Database (TMDB) para proporcionar información actualizada y detallada sobre contenido audiovisual.

### ✨ Características Principales

- 🔍 **Búsqueda Avanzada**: Busca películas y series por título con resultados en tiempo real
- 🎭 **Información Detallada**: Visualiza sinopsis, calificaciones, fechas de estreno y más
- 📚 **Biblioteca Personal**: Marca contenido como "visto" y mantén tu propio registro
- ⭐ **Sistema de Calificación**: Califica el contenido del 1 al 10 y añade reseñas personales
- 🏆 **Contenido Popular**: Explora las películas y series más populares del momento
- 🎨 **Interfaz Intuitiva**: Diseño moderno con navegación por pestañas y tema personalizable
- 📱 **Multiplataforma**: Compatible con Android e iOS

### 🛠️ Tecnologías Utilizadas

#### Frontend & Framework
- **React Native**: Framework principal para desarrollo móvil multiplataforma
- **Expo**: Plataforma de desarrollo que simplifica el proceso de construcción y despliegue
- **TypeScript**: Superset de JavaScript que añade tipado estático para mayor robustez
- **React Navigation**: Biblioteca de navegación con stack y tab navigators

#### Gestión de Estado y Datos
- **AsyncStorage**: Almacenamiento local persistente para datos del usuario
- **SQLite**: Base de datos local para gestión de contenido marcado como visto
- **React Hooks**: useState, useEffect, useContext para manejo de estado

#### Servicios y APIs
- **TMDB API**: The Movie Database API para obtener información de películas y series
- **Axios**: Cliente HTTP para realizar peticiones a la API
- **React Native Environment Variables**: Gestión segura de claves de API

#### UI/UX y Estilos
- **StyleSheet**: Sistema de estilos nativo de React Native
- **Context API**: Para manejo de temas y estado global
- **SafeAreaView**: Gestión de áreas seguras en diferentes dispositivos
- **Custom Components**: Componentes reutilizables como MovieCard y SeriesCard

#### Herramientas de Desarrollo
- **EAS CLI**: Expo Application Services para builds de producción
- **Metro Bundler**: Bundler de JavaScript optimizado para React Native
- **ESLint & Prettier**: Herramientas de linting y formateo de código

#### Arquitectura y Patrones
- **Modular Architecture**: Separación clara entre componentes, servicios, screens y utils
- **Type Definitions**: Interfaces TypeScript para tipado fuerte
- **Service Layer**: Abstracción de servicios para API y base de datos

## 🚀 Instalación del Proyecto

### 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### 🔑 Configuración de Cuentas Necesarias

#### 1. Cuenta en TMDB (The Movie Database)
1. Visita [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Crea una cuenta gratuita
3. Ve a tu perfil → Configuración → API
4. Solicita una clave de API (API Key)
5. Anota tanto la **API Key** como el **Access Token** (Bearer Token)

#### 2. Cuenta en Expo
1. Visita [https://expo.dev/](https://expo.dev/)
2. Crea una cuenta gratuita
3. Anota tu nombre de usuario para usar con EAS CLI

### 📱 Instalación para Android

#### Paso 1: Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd MovieSeriesApp/MovieSeriesAppExpo
```

#### Paso 2: Instalar Dependencias
```bash
npm install
```

#### Paso 3: Configurar Variables de Entorno
1. Crea un archivo `.env` en la raíz del proyecto:
```env
TMDB_API_KEY=tu_api_key_aqui
TMDB_ACCESS_TOKEN=tu_access_token_aqui
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
APP_NAME=Your Fi&Se
ANDROID_PACKAGE=com.tuusuario.yourfise
IOS_BUNDLE_IDENTIFIER=com.tuusuario.yourfise
```

#### Paso 4: Instalar EAS CLI
```bash
npm install -g eas-cli
```

#### Paso 5: Configurar EAS Build
```bash
# Iniciar sesión en Expo
eas login

# Configurar el proyecto para EAS Build
eas build:configure
```

#### Paso 6: Configurar app.config.js
Asegúrate de que tu archivo `app.config.js` incluya:
```javascript
export default {
  expo: {
    // ... otras configuraciones
    extra: {
      eas: {
        projectId: "tu-project-id-generado"
      }
    },
    android: {
      package: process.env.ANDROID_PACKAGE,
      // ... otras configuraciones
    }
  }
};
```

#### Paso 7: Subir Variables de Entorno a EAS
```bash
eas env:push --path .env --environment preview
```

#### Paso 8: Construir la APK
```bash
eas build -p android --profile preview
```

Una vez completado el build, EAS te proporcionará:
- Un código QR para descargar la APK
- Un enlace directo para la descarga
- Opción para instalar en emulador

### 🍎 Instalación para iOS

> **Nota**: La instalación en iOS no ha sido probada completamente, pero funciona correctamente con Expo Go durante el desarrollo.

#### Desarrollo con Expo Go
1. Instala Expo Go desde la App Store
2. Ejecuta el proyecto en modo desarrollo:
```bash
npx expo start
```
3. Escanea el código QR con Expo Go

#### Build para iOS (Requiere cuenta de Apple Developer)
```bash
# Configurar tanto Android como iOS
eas build:configure

# Build para iOS (requiere Apple Developer Account)
eas build -p ios --profile preview
```

**Requisitos para iOS:**
- Cuenta de Apple Developer ($99/año)
- Certificados de desarrollo válidos
- Dispositivo iOS para testing

### 🔧 Desarrollo Local

Para ejecutar la aplicación en modo desarrollo:

```bash
# Iniciar el servidor de desarrollo
npx expo start

# Opciones adicionales
npx expo start --android  # Solo Android
npx expo start --ios      # Solo iOS
npx expo start --web      # Versión web
```

### 📁 Estructura del Proyecto

```
MovieSeriesAppExpo/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # Configuración de navegación
│   ├── screens/          # Pantallas de la aplicación
│   ├── services/         # Servicios (API, Database, Storage)
│   ├── styles/           # Temas y estilos
│   ├── types/            # Definiciones de TypeScript
│   └── utils/            # Funciones utilitarias
├── assets/               # Recursos estáticos
├── app.config.js         # Configuración de Expo
├── eas.json             # Configuración de EAS Build
└── package.json         # Dependencias del proyecto
```

### 🐛 Solución de Problemas Comunes

#### Error: "Build concurrency limit reached"
- Espera a que termine otro build en proceso
- Considera upgradeear tu cuenta de Expo para más builds concurrentes

#### Error: Variables de entorno no encontradas
```bash
# Verificar que las variables están subidas
eas env:list --environment preview

# Volver a subir si es necesario
eas env:push --path .env --environment preview
```

#### Error: Apple Account locked
- Para iOS, asegúrate de que tu cuenta de Apple Developer esté activa
- Usa autenticación de dos factores si está habilitada

### 📚 Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Abrir en emulador Android
npm run ios        # Abrir en simulador iOS
npm run web        # Abrir versión web
```

### 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request


### 📞 Soporte

Si encuentras algún problema o tienes preguntas:
- Abre un issue en el repositorio
- Consulta la documentación de [Expo](https://docs.expo.dev/)
- Revisa la documentación de [TMDB API](https://developers.themoviedb.org/3)

---

<div align="center">
  Desarrollado con ❤️ usando React Native y Expo
</div>