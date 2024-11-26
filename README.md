# Penjelasan Tugas 9

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

```
<!-- src/pages/LoginPage.vue -->
<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="login-container">
                <ion-text style="margin-bottom: 20px; text-align: center;">
                    <h1>Login ke Aplikasi</h1>
                </ion-text>
                <ion-button expand="block" @click="loginWithGoogle">
                    Login dengan Google
                </ion-button>
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

        // Memanggil metode loginWithGoogle dari store
        const loginWithGoogle = () => {
            authStore.loginWithGoogle();
        };

        return { loginWithGoogle };
    },
});
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>
```

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
## 5. Tampilan Halaman Profile
<img src="https://github.com/user-attachments/assets/1b47a65f-daaa-42be-8956-39276be8b9c0" width="400"> </br>

Firebase Auth sudah mengautentikasi pengguna menggunakan Google. Setelah login, informasi pengguna (seperti nama, email, dan foto profil) dapat diambil dari objek user yang ada di Firebase.
Dalam store Pinia (auth.ts), sudah disimpan data pengguna setelah login dengan Google, yang bisa diakses di halaman profil. Selanjutnya akan menampilkan data tersebut di halaman profil.
```
<!-- src/pages/ProfilePage.vue -->
<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="profile-container">
                <ion-text style="text-align: center;">
                    <h2>Profil Pengguna</h2>
                </ion-text>

                <div class="profile-info">
                    <!-- Menampilkan foto profil jika ada -->
                    <ion-img :src="user.photoURL" v-if="user.photoURL" />
                    <ion-text>
                        <h3>{{ user.displayName }}</h3>
                        <p>Email: {{ user.email }}</p>
                    </ion-text>
                </div>

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

        // Fungsi logout
        const logout = () => {
            authStore.logout(); // Memanggil metode logout dari store
        };

        return { user: authStore.user, logout }; // Mengakses data pengguna dari store
    },
});
</script>

<style scoped>
.profile-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.profile-info {
    margin: 20px;
    text-align: center;
}

ion-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
```
# CRUD Tugas 10
## Tampilan Home
<img src="https://github.com/user-attachments/assets/a97845a6-9eee-4c5e-8194-5bc8dc436f80" width="400"> </br>

Tampilan home menampilkan daftar to-do yang aktif dan selesai dengan opsi untuk menambahkan, mengedit, menyelesaikan, atau menghapus to-do. Data ditampilkan berdasarkan filter status (aktif/selesai) dengan activeTodos dan completedTodos:
```
const activeTodos = computed(() => todos.value.filter(todo => !todo.status));
const completedTodos = computed(() => todos.value.filter(todo => todo.status));
```

Tampilan home didapat dari kode berikut:
```
<ion-content :fullscreen="true">
  <!-- Refresh Data -->
  <ion-refresher @ionRefresh="handleRefresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>

  <!-- Daftar Active Todos -->
  <ion-list>
    <ion-item-sliding
      v-for="todo in activeTodos"
      :key="todo.id"
    >
      <ion-item>
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ todo.title }}</ion-card-title>
            <ion-card-subtitle>{{ todo.description }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
      </ion-item>
      <ion-item-options>
        <ion-item-option @click="handleDelete(todo)">
          <ion-icon :icon="trash"></ion-icon>
        </ion-item-option>
        <ion-item-option @click="handleStatus(todo)">
          <ion-icon :icon="checkmarkCircle"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>
</ion-content>
```

## Tampilan Add To Do
### a. Form Add Too
<img src="https://github.com/user-attachments/assets/66a2b4ae-3da6-4e70-8114-b3b0540e2677" width="400">
<img src="https://github.com/user-attachments/assets/c18f1d33-0117-441a-8dd2-51a9d35415b5" width="400"> </br>

Ketika menekan button + pada tampilan home, akan menampilkan halaman add to do yang berisi form dengan input title dan description serta button add todo. Button add todo akan meneruskan data yang diinputkan pengguna dalam modal ke fungsi handleSubmit Tampilan form add to do didapat dari kode berikut:
```
<InputModal
  v-model:isOpen="isOpen"
  @submit="handleSubmit"
/>
```

### b. Alert tittle required
<img src="https://github.com/user-attachments/assets/5e910bd3-6621-4983-b3e7-b0e109b2e89f" width="400"> </br>

Ketika button add toto ditekan, dilakukan validasi input untuk memastikan bahwa properti title pada objek to-do telah diisi. Jika tidak diisi, fungsi showToast akan dipanggil untuk menampilkan pesan peringatan berupa "Title is required." Alert ini berasal dari kode berikut:

```
const handleSubmit = async (todo) => {
  if (!todo.title) {
    await showToast("Title is required", "warning");
    return;
  }
```

### c. Add todo success
<img src="https://github.com/user-attachments/assets/3868af25-c4a6-4220-b3c3-14e7a9285c45" width="400"> </br>

Jika validasi berhasil, data to-do baru akan disimpan ke dalam basis data menggunakan fungsi firestoreService.addTodo(todo), yang terintegrasi dengan Firestore atau layanan basis data lainnya. Terakhir, setelah proses penyimpanan berhasil, fungsi showToast kembali digunakan untuk menampilkan notifikasi keberhasilan dengan pesan "Todo added successfully." Alert ini berasal dari kode berikut:
```
  await firestoreService.addTodo(todo);
  await showToast("Todo added successfully", "success");
};
```

Fungsi showtoast:
```
const showToast = (message, color) => {
  toastController.create({
    message,
    duration: 2000,
    color,
  }).then((toast) => toast.present());
};
```

### Tampilan Edit Todo
### a. Form Edit Todo
<img src="https://github.com/user-attachments/assets/12db41f1-e0b9-4b92-b976-555b6bc0c516" width="400">
<img src="https://github.com/user-attachments/assets/878f6315-882b-431c-8b84-1d21582c5c57" width="400"> </br>

Edit to do dapat dilakukan dengan cara slide to do ke kiri untuk menampilkan option edit. Setelah option edit dipilih, akan menampilkan form edit todo. Akses edit to do ini didapat dari kode:
```
const handleEdit = async (editTodo: Todo) => {
  const slidingItem = itemRefs.value.get(editTodo.id!);
  await slidingItem?.close(); // Menutup sliding menu setelah klik edit

  editingId.value = editTodo.id!; // Menyimpan ID todo yang sedang diedit
  todo.value = { // Mengisi form modal dengan data todo
    title: editTodo.title,
    description: editTodo.description,
  };
  isOpen.value = true; // Membuka modal edit
};
```

Tampilan edit to do didapat dari kode:
```
<ion-modal :is-open="isOpen" @did-dismiss="cancel">
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ editingId ? "Edit" : "Add" }} Todo</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-item>
      <ion-input
        v-model="todo.title"
        label="Title"
        label-placement="floating"
        placeholder="Enter Title"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-textarea
        v-model="todo.description"
        label="Description"
        label-placement="floating"
        placeholder="Enter Description"
      ></ion-textarea>
    </ion-item>
    <ion-button @click="input">{{ editingId ? "Edit" : "Add" }} Todo</ion-button>
  </ion-content>
</ion-modal>
```
Data to-do yang diterima dari props.todo di-bind ke input dan textarea melalui v-model. Tombol @click="input" akan memproses data yang telah dimasukkan pengguna melalui fungsi berikut:
```
const input = () => {
  emit("submit", props.todo); // Emit event untuk menyimpan perubahan
  cancel(); // Menutup modal
};
```

### b. Alert edit success
<img src="https://github.com/user-attachments/assets/807905ff-5502-47ee-9bcf-6ca621d44559" width="400"> </br>

Ketika button edit todo di klik, akan menampilkan alert success yang didapat dari kode:
```
if (editingId.value) {
    await firestoreService.updateTodo(editingId.value, todo as Todo);
    await showToast("Todo updated successfully", "success", checkmarkCircle);
}
```

## Hapus Todo
<img src="https://github.com/user-attachments/assets/b2acd2c1-cae5-4245-a082-36ab1b1df2cd" width="400">
<img src="https://github.com/user-attachments/assets/91e438f2-332a-4de5-a9b7-f36600e0f492" width="400"> </br>

Delete todo dapat dilakukan dengan cara swipe todo ke kanan yang didapat dari kode:
```
<ion-item-options side="start" @ionSwipe="handleDelete(todo)">
  <ion-item-option
    color="danger"
    expandable
    @click="handleDelete(todo)"
  >
    <ion-icon
      slot="icon-only"
      :icon="trash"
      size="large"
    ></ion-icon>
  </ion-item-option>
</ion-item-options>
```
@ionSwipe="handleDelete(todo)" secara otomatis memanggil fungsi handleDelete dengan parameter data todo yang di-swipe. Alternatifnya, pengguna juga dapat mengklik tombol dengan event @click="handleDelete(todo)". Fungsi handleDelete didefinisikan dalam bagian script dan berfungsi menghapus todo dari Firestore melalui firestoreService.deleteTodo dan akan menampilkan alert delete success, seperti berikut:
```
const handleDelete = async (deleteTodo: Todo) => {
  try {
    await firestoreService.deleteTodo(deleteTodo.id!);
    await showToast("Todo deleted successfully", "success", checkmarkCircle);
    loadTodos();
  } catch (error) {
    await showToast("Failed to delete todo", "danger", closeCircle);
    console.error(error);
  }
};
```

## Marked as completed
<img src="https://github.com/user-attachments/assets/28328cf8-098f-4658-a519-d371f918c136" width="400">
<img src="https://github.com/user-attachments/assets/b575f2c7-0269-49b4-82ba-ae276bfb67d4" width="400"> 
<img src="https://github.com/user-attachments/assets//7a9ff5fd-21ae-4289-990f-06757fa1b085" width="400"> </br>

Marked as complete dapat dilakukan dengan swipe todo ke kiri yang kemudian akan menampilkan alert todo marked as complete dan todo akan tampil di bagian completed. Proses marked as complete ini didapat dari kode:
```const handleStatus = async (statusTodo: Todo) => {
  const slidingItem = itemRefs.value.get(statusTodo.id!);
  await slidingItem?.close();
  try {
    await firestoreService.updateStatus(statusTodo.id!, !statusTodo.status);
    await showToast(
      `Todo marked as ${!statusTodo.status ? "completed" : "active"}`,
      "success",
      checkmarkCircle
    );
    loadTodos();
  } catch (error) {
    await showToast("Failed to update status", "danger", closeCircle);
    console.error(error);
  }
};
```

## Marked as active
<img src="https://github.com/user-attachments/assets//9c0655bd-7e45-43bf-b846-82a31e3a6736" width="400">
<img src="https://github.com/user-attachments/assets//6d21d056-3943-46a0-a8b6-a6e2794ea1b8" width="400"> </br>

Todo yang sudah marked as complet dapat dijadikan aktid kembali dengan cara swipe todo completed ke kiri sampai muncul alert todo marked as active dan todo akan pindah ke bagian active todo. Proses marked as active ini didapat dari kode:
```
const handleStatus = async (statusTodo: Todo) => {
  const slidingItem = itemRefs.value.get(statusTodo.id!); // Mendapatkan elemen terkait
  await slidingItem?.close(); // Menutup elemen sliding

  try {
    // Mengubah status todo (completed <-> active)
    await firestoreService.updateStatus(statusTodo.id!, !statusTodo.status);
    await showToast(
      `Todo marked as ${!statusTodo.status ? "completed" : "active"}`, // Menampilkan notifikasi
      "success",
      checkmarkCircle
    );
    loadTodos(); // Memuat ulang data todo
  } catch (error) {
    await showToast("Failed to update status", "danger", closeCircle);
    console.error(error);
  }
};
```















