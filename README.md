# Penjelasan

## 1. Instalasi firebase dan google auth
Mengonfigurasi Firebase dengan menginisialisasi aplikasi dan Google Authentication Provider. Menggunakan GoogleAuthProvider dari Firebase untuk mengintegrasikan login Google.
``` html
// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCPNyI4vdRtBs4dCwVGlpqIbkWypRaOtDQ",
    authDomain: "vue-firebase-5ca33.firebaseapp.com",
    projectId: "vue-firebase-5ca33",
    storageBucket: "vue-firebase-5ca33.firebasestorage.app",
    messagingSenderId: "759883875848",
    appId: "1:759883875848:web:23201337b5e29ef7a073bd"
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
```

## 2. Konfigurasi login dengan google
Di file auth.ts, mendefinisikan store Pinia untuk autentikasi. Fungsi loginWithGoogle menggunakan GoogleAuth dari plugin capacitor-google-auth untuk melakukan autentikasi dengan Google. Setelah pengguna berhasil login, menggunakan GoogleAuthProvider.credential() untuk mendapatkan kredensial dan melakukan autentikasi dengan Firebase.
```
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from '@/utils/firebase';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { alertController } from '@ionic/vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const isAuth = computed(() => user.value !== null);

    const loginWithGoogle = async () => {
        try {
            await GoogleAuth.initialize({
                clientId: 'YOUR_GOOGLE_CLIENT_ID',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });

            const googleUser = await GoogleAuth.signIn();
            const idToken = googleUser.authentication.idToken;
            const credential = GoogleAuthProvider.credential(idToken);
            const result = await signInWithCredential(auth, credential);

            user.value = result.user;
            router.push("/home");
        } catch (error) {
            const alert = await alertController.create({
                header: 'Login Gagal!',
                message: 'Terjadi kesalahan saat login dengan Google. Coba lagi.',
                buttons: ['OK'],
            });
            await alert.present();
        }
    };

    const logout = async () => {
        await signOut(auth);
        await GoogleAuth.signOut();
        user.value = null;
        router.replace("/login");
    };

    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
    });

    return { user, isAuth, loginWithGoogle, logout };
});
```
## 3. Tampilan Login </br>
<img src="https://github.com/user-attachments/assets/0d06c657-a180-4671-9349-96780a552199" width="400">
<img src="https://github.com/user-attachments/assets/cb01267b-7007-483a-b541-c162b9f35b81" width="400"> </br>
Pada halaman login (LoginPage.vue), terdapat tombol untuk login dengan Google.Ketika tombol ini diklik, aplikasi akan memanggil loginWithGoogle() dari store untuk memulai proses login dengan akun Google.

## 4. Tampilan Home </br>
<img src="https://github.com/user-attachments/assets/60ce7017-9eac-459c-8d3c-05c92c098c77" width="400"></br>
Setelah berhasil login, pengguna akan diarahkan ke halaman beranda (/home).
```
<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="home-container">
                <ion-text style="text-align: center;">
                    <h2>Selamat datang, {{ user.displayName }}</h2>
                </ion-text>
                <ion-button expand="block" @click="logout">Logout</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
    setup() {
        const authStore = useAuthStore(); // Mengakses store auth

        // Memanggil metode logout dari store
        const logout = () => {
            authStore.logout();
        };

        return { user: authStore.user, logout };
    },
});
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>
```
## 5. 




