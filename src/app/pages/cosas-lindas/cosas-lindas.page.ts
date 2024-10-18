import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingController, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonTabs, IonTab, IonTabButton, IonIcon, IonTabBar, IonImg, IonList, IonItem, IonThumbnail, IonLabel, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, cloudUploadOutline, analyticsOutline, imageOutline, heartOutline, heart, arrowBack, camera, add } from 'ionicons/icons';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, increment, setDoc, query, where, getDocs, deleteDoc, orderBy } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TimestampFormatPipe } from 'src/app/pipes/timestamp-format.pipe';
import { Chart, ChartEvent } from 'chart.js/auto';



// import Swal from 'sweetalert2';



@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.page.html',
  styleUrls: ['./cosas-lindas.page.scss'],
  standalone: true,
  imports: [TimestampFormatPipe, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonTabs, IonTab, IonTabButton, IonIcon, IonTabBar, IonImg, IonList, IonItem, IonThumbnail, IonLabel, CommonModule, FormsModule]
})
export class CosasLindasPage implements OnDestroy {
  selectedImages: string[] = [];
  userId: string | null | undefined;
  username: string | null | undefined;
  images: any[] = []; 
  imagesUser: any[] = [];
  loading!: HTMLIonLoadingElement;
  chart: any;
  selectedImage: string | undefined; 


  constructor(private firestore: Firestore, private authService: AuthService, private router: Router, private alertController: AlertController, private loadingCtrl: LoadingController) { 
    addIcons({ homeOutline, cloudUploadOutline, analyticsOutline, imageOutline, heartOutline, heart, arrowBack, camera, add });

    this.username = this.authService.getUser();
    this.userId = this.authService.getIdUser();

    console.log(this.userId);
    
    this.loadingCtrl.create()
      .then(loading => {
        this.loading = loading;
        this.loadImages();
        console.log("Cargando imágenes...");
      });
  }
  
  ngOnDestroy(): void {
    this.selectedImages = [];
  }

  volver() {
    this.router.navigate(['/home']);
  }

  // Cargar los datos de "likes" desde Firestore
  async loadLikesData() {
    const querySnapshot = await getDocs(collection(this.firestore, 'imagenes-lindas'));

    const imageLabels: string[] = [];   // Nombre o ID de la imagen
    const likesData: number[] = [];     // Cantidad de likes de cada imagen

    querySnapshot.forEach((doc) => {
      const imageData = doc.data();
      imageLabels.push(imageData['url']); // Puedes usar el nombre o ID de la imagen
      likesData.push(imageData['likesCount'] || 0); // Contador de "likes"
    });

    // Crear el gráfico con los datos obtenidos
    this.createChart(imageLabels,likesData);
  }

  createChart(labels: string[], data: number[]) {
    const tipo = 'pie';
  
    const ctx = document.getElementById('likesChart') as HTMLCanvasElement;
  
    // Si ya existe un gráfico, destrúyelo antes de crear uno nuevo
    if (this.chart) {
      this.chart.destroy();
    }
  
    const options: any = {
      responsive: true,
      plugins: {
        legend: {
          display: tipo !== 'pie' // Ocultar leyenda para gráficos de torta
        }
      },
      onClick: (event: ChartEvent, elements: any[]) => {
        if (elements.length > 0) {
          const index = elements[0].index; // Índice de la imagen seleccionada
          this.displayImage(labels[index]); // Mostrar la imagen correspondiente
        }
      }
    };
  
    //   if (tipo === 'bar') {
    //     options.scales = {
    //       x: {
    //         display: false // Ocultar etiquetas del eje X
    //       },
    //       y: {
    //         ticks: {
    //             // Muestra solo números enteros
    //             stepSize: 1,
    //             callback: function(value) {
    //                 return Number.isInteger(value) ? value : '';
    //             }
    //         },
    //         beginAtZero: true
    //     }
    //   };
    // }

  
    this.chart = new Chart(ctx, {
      type: tipo,
      data: {
        labels: labels,
        datasets: [{
          label: 'Me gusta',
          data: data,
          backgroundColor: tipo === 'pie' ? [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ] : 'rgba(75, 192, 192, 0.2)',
          borderColor: tipo === 'pie' ? [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ] : 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: options
    });
  }
  // Función para mostrar la imagen
  displayImage(imageLabel: string): void {
    // Asume que las imágenes tienen nombres relacionados con las etiquetas
    this.selectedImage = imageLabel 
  }

  async loadImages() {
    this.images = [];  // Reiniciar el array de imágenes
    this.loading.present();
    
    const imagesCollection = collection(this.firestore, `imagenes-lindas`);

    // Consulta para ordenar por timestamp de manera descendente (más reciente primero)
    const q = query(
      imagesCollection,
      orderBy('timestamp', 'desc')
    );
    const snapshotTodas = await getDocs(q);
    for (const imageDoc of snapshotTodas.docs) {
      const imageData = imageDoc.data();
      const likeDocRef = doc(this.firestore, `likes-lindas/${this.userId}_${imageDoc.id}`);
      const likeDocSnap = await getDoc(likeDocRef);

      // if(imageData['userId'] == this.userId){
        // Add image to the array
        this.images.push({
          id: imageDoc.id,
          url: imageData['url'],
          liked: likeDocSnap.exists(),
          likesCount: imageData['likesCount'] || 0,
          timestamp: imageData['timestamp'],
          userName: imageData['userName']
        });
        this.loading.dismiss();
      // }

      this.loading.dismiss();
    }

    this.loading.dismiss();
  }

  async loadImagesUser() {
    this.imagesUser = [];
    this.loading.present();
    
    const imagesCollection = collection(this.firestore, `imagenes-lindas`);

    // Consulta para ordenar por timestamp de manera descendente (más reciente primero)
    const q = query(
      imagesCollection,
      orderBy('timestamp', 'desc')
    );
    const snapshotTodas = await getDocs(q);
    for (const imageDoc of snapshotTodas.docs) {
      const imageData = imageDoc.data();
      const likeDocRef = doc(this.firestore, `likes-lindas/${this.userId}_${imageDoc.id}`);
      const likeDocSnap = await getDoc(likeDocRef);

      if(imageData['userId'] == this.userId){
        // Add image to the array
        this.imagesUser.push({
          id: imageDoc.id,
          url: imageData['url'],
          liked: likeDocSnap.exists(),
          likesCount: imageData['likesCount'] || 0,
          timestamp: imageData['timestamp'],
          userName: imageData['userName']
        });
        this.loading.dismiss();
      }

      this.loading.dismiss();
    }

    this.loading.dismiss();
  }

  async toggleLike(image: any) {

    const likeDocRef = doc(this.firestore, `likes-lindas/${this.userId}_${image.id}`);

    const imageDocRef = doc(this.firestore, `imagenes-lindas/${image.id}`);

    // Si la imagen no estaba likeada, tengo que buscar si ya hbaia likeado otra imagen
    if(!image.liked){

      // Verificar si el usuario ya ha dado "like" a alguna imagen
      const likesQuery = query(
        collection(this.firestore, `likes-lindas`),
        where('userId', '==', this.userId)
      );
      
      const likesSnapshot = await getDocs(likesQuery);
      console.log(likesSnapshot.empty);

      if (likesSnapshot.empty == false) {

        return
      }

      await setDoc(likeDocRef, { userId: this.userId, imageId: image.id });

      const imageDocSnap = await getDoc(imageDocRef);

      if (imageDocSnap.exists()) {
        // Incrementar el conteo de likes en la imagen
        await updateDoc(imageDocRef, {
          likesCount: increment(1)
        });

        // Actualiza el estado local de liked
        image.liked = true;
        image.likesCount++;

      } else {
        console.error("El documento de la imagen no existe:", image.id);
      }

    }

    // si la imagen estaba likeada, borro el like 
    else {

      await deleteDoc(likeDocRef); // Eliminar el documento de "like"

      await updateDoc(imageDocRef, {
        likesCount: increment(-1) // Restar 1 al contador de "likes"
      });

      image.liked = false;
      image.likesCount--;
    }
  }

  
  async alertaSubidas() {
    const alert = await this.alertController.create({
      header: '¡Imágenes cargadas exitosamente!',
      message: 'Las imágenes se han cargado correctamente a la web.',
      buttons: ['Aceptar'],
    });

    await alert.present();
  }

  async alertaErrorSubida() {
    const alert = await this.alertController.create({
      header: '¡Error al cargar las imágenes!',
      message: 'Ha ocurrido un error al cargar las imágenes a la web. Inténtalo de nuevo.',
      buttons: ['Aceptar'],
    });

    await alert.present();
  }


  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear // Abre la cámara trasera por defecto
      });
  
      if (image && image.dataUrl) {
        console.log("Imagen capturada:", image.dataUrl); // Verifica el formato del dataUrl
        this.selectedImages.push(image.dataUrl); // Almacena la imagen para previsualización
      } else {
        console.error("No se capturó ninguna imagen o el formato es incorrecto.");
      }
    } catch (error) {
      console.error("Error al tomar la foto:", error);
    }
  }
  
  // Método que se ejecuta cuando el usuario confirma la subida
  async confirmUpload() {
    this.loading.present();

    if (!this.username) {
      console.error('El nombre de usuario no está disponible todavía. Espera a que se cargue.');
      return;
    }
  
    if (this.selectedImages.length === 0) {
      console.error('No hay imágenes seleccionadas para subir.');
      return;
    }
  
    console.log("Confirmando la subida...");
  
    const uploadPromises = this.selectedImages.map((imageDataUrl, index) => {
      return this.uploadToFirebase(imageDataUrl, `imagen${index}.jpg`);
    });
  
    try {
      await Promise.all(uploadPromises); // Espera todas las subidas
      console.log('Todas las imágenes se han subido correctamente');

      this.loading.dismiss();
      this.alertaSubidas();
      this.selectedImages = [];

    } catch (error) {
      console.error('Error durante la subida de imágenes:', error);
      this.loading.dismiss();
      this.alertaErrorSubida();
    }
    
    this.loading.dismiss();
  }

  
  // Método para subir imágenes a Firebase Storage y luego guardarlas en Firestore
  async uploadToFirebase(dataUrl: string, fileName: string) {
    console.log("Iniciando la subida a Firebase...");
  
    const blob = this.dataURLtoBlob(dataUrl); // Convertir a Blob
    const storage = getStorage();
    const storageRef = ref(storage, `imagenes/${this.username}_${fileName}`);
  
    const uploadTask = uploadBytesResumable(storageRef, blob);
  
    return new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso de subida: ${progress}%`);
        },
        (error) => {
          console.error('Error al subir la imagen:', error);
          this.alertaErrorSubida();
          reject(error); // Manejo de error en la subida
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Imagen disponible en:', downloadURL);
            await this.saveImageToFirestore(downloadURL, `${this.username}_${fileName}`);
            
            this.images = []
            this.loadImages();

            resolve(); // Subida exitosa
          } catch (error) {
            console.error('Error al obtener el URL de la imagen:', error);
            this.alertaErrorSubida();
            reject(error);
          }
        }
      );
    });
  }
  

  // Método para convertir dataURL a Blob
  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // Método para guardar la URL de la imagen en Firestore
  async saveImageToFirestore(downloadURL: string, imageName: string) {

    console.log("SAVE IMAGES TO FIRESTORE");

    try {
      const imageCollection = collection(this.firestore, `imagenes-lindas`); // Referencia a la colección de Firestore
      await addDoc(imageCollection, {
        url: downloadURL, // URL de la imagen subida
        imageName: imageName, // Nombre del archivo
        userId: this.userId, // ID del usuario que subió la imagen
        userName: this.username, // Nombre del usuario
        timestamp: new Date(), // Fecha de subida
        likesCount: 0 // Inicializa los likes en 0
      });
      console.log('Imagen guardada en Firestore con éxito');
    } catch (error) {
      this.alertaErrorSubida();
      console.error('Error al guardar la imagen en Firestore:', error);
    }
  }

  // Método para eliminar una imagen de la lista de seleccionadas
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }
}