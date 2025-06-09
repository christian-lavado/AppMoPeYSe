export default {
  expo: {
    name: "Your Fi&Se",
    slug: "MovieSeriesAppExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || "bundleIdentifier.yourfise",
    },
    android: {
      package: process.env.ANDROID_PACKAGE || "package.yourfise",
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      statusBar: {
        backgroundColor: "#0066cc",
        barStyle: "light-content"
      }
    },
    web: {
      favicon: "./assets/logo.png"
    },
    plugins: ["expo-sqlite"],
    extra: {
      TMDB_API_KEY: process.env.TMDB_API_KEY || "api_key",
      TMDB_BASE_URL: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
      TMDB_IMAGE_BASE_URL: process.env.TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500",
      TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || "access_token",
      eas: {
        projectId: "d36ed526-785f-4135-aeeb-b6ab0e296bf1"
      }
    }
  }
};