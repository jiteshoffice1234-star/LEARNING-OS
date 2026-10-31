# Building LEARNING OS for Android

This guide explains how to build the LEARNING OS Android APK from source.

## Prerequisites

### Required Software

1. **Node.js** 18+ and npm
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Android Studio**
   - Download: https://developer.android.com/studio
   - Includes Android SDK, build tools, and emulator

3. **Java JDK** 17+
   - Usually included with Android Studio
   - Verify: `java -version`

### Environment Setup

#### Windows

Add to system PATH:
```
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\tools
```

Set environment variables:
```
ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

#### macOS/Linux

Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

## Build Steps

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/learning-os.git
cd learning-os
npm install
```

### 2. Build Web Bundle

```bash
npm run build
```

This creates the `dist/` folder with the production web app.

### 3. Sync with Capacitor

```bash
npx cap sync android
```

This copies the web bundle into the Android project and updates dependencies.

### 4. Build APK

#### Debug APK (for testing)

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (for distribution)

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### 5. Sign the APK (Optional but Recommended)

For public distribution, you should sign your APK:

1. Generate a keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties`:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=alias_name
storeFile=../my-release-key.keystore
```

3. Update `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

⚠️ **Never commit keystore files or passwords to git!**

### 6. Install on Device

#### Via ADB (USB debugging)

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

#### Manual installation

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Open the APK file and follow installation prompts

## Troubleshooting

### Build fails with "SDK location not found"

Create `android/local.properties`:
```properties
sdk.dir=/path/to/Android/Sdk
```

### Gradle build fails

Try:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### APK won't install

- Check minimum Android version (requires 5.1+ / API 22+)
- Ensure "Unknown Sources" is enabled
- Try uninstalling previous version first

### App crashes on launch

- Check Android Studio logcat for errors
- Verify `capacitor.config.ts` settings
- Ensure web bundle was built before `cap sync`

## Build Configuration

### Version Information

Edit `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2        // Increment for each release
    versionName "1.0.1"  // User-facing version
}
```

### App ID

Change in `capacitor.config.ts`:
```typescript
appId: 'com.yourname.learningos',
```

Then rebuild:
```bash
npx cap sync android
```

### App Name

Change in `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

## Continuous Integration

See `.github/workflows/android-build.yml` for automated builds using GitHub Actions.

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Build Guide](https://developer.android.com/studio/build)
- [APK Signing](https://developer.android.com/studio/publish/app-signing)

---

For installation instructions, see [INSTALLATION.md](INSTALLATION.md).
