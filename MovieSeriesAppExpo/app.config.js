export default {
  expo: {
    name: "MovieSeriesAppExpo",
    slug: "MovieSeriesAppExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      statusBar: {
        backgroundColor: "#0066cc",
        barStyle: "light-content"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-sqlite"],
    extra: {
      TMDB_API_KEY: process.env.TMDB_API_KEY || "api_key",
      TMDB_BASE_URL: "https://api.themoviedb.org/3",
      TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
      TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || "access_token"
    }
  }
};