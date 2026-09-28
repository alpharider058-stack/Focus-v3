# Guía: Compilar Focus a archivo .ipa con GitHub Actions

Esta app está configurada para que al subir tu código a GitHub, un **GitHub Action** en una máquina macOS con Xcode compile el proyecto y genere automáticamente el archivo ejecutable **`Focus.ipa`** para iPhone.

---

## 📁 Archivos configurados en el proyecto

1. **`app.json`**: Configuración de Expo SDK 57 con:
   - Bundle Identifier: `com.focus.discipline`
   - Permisos de **Dynamic Island** (`NSSupportsLiveActivities`: true)
   - Permisos de **Notificaciones** en segundo plano (`UIBackgroundModes`: remote-notification)
   - Iconos y SplashScreen de Focus (`Logo.png`)
2. **`eas.json`**: Configuración oficial de perfiles de compilación de Expo EAS para iOS (`preview` y `production`).
3. **`.github/workflows/build-ipa.yml`**: Flujo de trabajo automatizado que:
   - Se ejecuta en un servidor **macOS 14 (Apple Silicon)** de GitHub Actions.
   - Ejecuta `npx expo prebuild` para generar la estructura nativa de iOS en Xcode.
   - Instala CocoaPods y compila el binario Release de iOS con `xcodebuild`.
   - Empaqueta `Focus.app` dentro del contenedor `Payload` y genera **`Focus.ipa`**.
   - Sube el archivo `.ipa` a la sección **Artifacts** de la ejecución para descargarlo directamente.
4. **`.github/workflows/eas-build.yml`**: Flujo alternativo para compilar con los servidores en la nube de Expo si tienes una cuenta de EAS.

---

## 🚀 Cómo generar el archivo .ipa en GitHub

1. **Sube los cambios a tu repositorio de GitHub**:
   ```bash
   git add .
   git commit -m "feat: configuracion de compilacion a .ipa con GitHub Actions"
   git push origin main
   ```

2. **Ir a GitHub**:
   - Entra a tu repositorio en GitHub: `https://github.com/alpharider058-stack/Focus` (o el que corresponda).
   - Ve a la pestaña **Actions** (en la barra superior del repositorio).
   - En el menú izquierdo, selecciona el workflow **"Build iOS IPA"**.
   - Haz clic en el botón desplegable **"Run workflow"** -> Selecciona la rama `main` -> Pulsa **"Run workflow"**.

3. **Descargar el archivo .ipa**:
   - Espera a que termine la compilación (verás el check verde ✅).
   - Haz clic en la ejecución completada.
   - En la parte inferior de la página, en la sección **Artifacts**, haz clic en **`Focus-iOS-IPA`** para descargar el archivo zip que contiene tu `Focus.ipa`.

---

## 📲 Cómo instalar el archivo .ipa en tu iPhone

Tienes varias opciones sencillas y gratuitas para instalar el `.ipa` en tu iPhone:

### Opción 1: Sideloadly (La más rápida y recomendada)
1. Descarga **Sideloadly** en tu ordenador (Windows o Mac) desde [sideloadly.io](https://sideloadly.io).
2. Conecta tu iPhone por cable al ordenador (o por Wi-Fi una vez emparejado).
3. Arrastra el archivo `Focus.ipa` dentro de la ventana de Sideloadly.
4. Introduce tu Apple ID (el mismo que usas en tu iPhone) y pulsa **Start**.
5. En unos segundos la app aparecerá en tu pantalla de inicio.
6. En tu iPhone, ve a **Ajustes > General > Gestión de dispositivos y VPN**, selecciona tu Apple ID y pulsa **"Confiar"**.

### Opción 2: AltStore
1. Si ya usas **AltStore** en tu iPhone, puedes transferirte el archivo `Focus.ipa` (por AirDrop, Telegram o iCloud Drive).
2. Abre AltStore en tu iPhone, ve a **Mis Apps**, pulsa el icono **+** en la esquina superior y selecciona `Focus.ipa`.

### Opción 3: TestFlight / Cuenta Apple Developer
Si tienes cuenta de desarrollador de Apple ($99/año):
- Puedes configurar tu certificado y perfil en EAS Build (`eas build -p ios`) y subir directamente a TestFlight y la App Store.
