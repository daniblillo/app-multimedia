import { Component, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ActionSheetController, Platform, AlertController } from '@ionic/angular';
import { MediaCapture, MediaFile, CaptureError } from '@ionic-native/media-capture/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

const MEDIA_FOLDER_NAME = 'my_media';
var duracion = 0;
var calidad = 0;
var NameCarpeta = '';
var DirectorioCarpeta = '';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {
  files = [];
  image: string = null;
  recording: boolean = false;
  filePath: string;
  fileName: string;
  audio: MediaObject;

  constructor(
    private imagePicker: ImagePicker,
    private mediaCapture: MediaCapture,
    private file: File,
    private media: Media,
    private streamingMedia: StreamingMedia,
    private photoViewer: PhotoViewer,
    private actionSheetController: ActionSheetController,
    private plt: Platform,
    public alertController: AlertController,
    private camera: Camera
  ) { }

  ngOnInit() {
    this.plt.ready().then(() => {
      let path = 'file:///storage/emulated/0/';
      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
        () => {
          this.loadFiles();
        },
        err => {
          this.file.createDir(path, MEDIA_FOLDER_NAME, false);
        }
      );
    });
  }

  loadFiles() {
    this.file.listDir('file:///storage/emulated/0/', MEDIA_FOLDER_NAME).then(
      res => {
        this.files = res;
      },
      err => console.log('Error al cargar archivos: ', err)
    );
  }
  async selectMedia() {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Qué le gustaría añadir?',
      buttons: [
        {
          text: 'Capturar imagen',
          handler: () => {
            this.captureImage();
          }
        },
        {
          text: 'Grabar vídeo',
          handler: () => {
            this.recordVideo();
          }
        },
        {
          text: 'Grabar audio',
          handler: () => {
            this.recordAudio();
          }
        },
        {
          text: 'Explorar archivos',
          handler: () => {
            this.pickImages();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  pickImages() {
    this.imagePicker.getPictures({}).then(
      results => {
        for (var i = 0; i < results.length; i++) {
          this.copyFileToLocalDir(results[i]);
        }
      }
    );
  }

  captureImage() {
    this.mediaCapture.captureImage().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }

  recordAudio() {
    this.mediaCapture.captureAudio().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }

  //Nombre y ruta capturar imagen
  async presentAlertCamera() {
    const alert = await this.alertController.create({
      header: 'Opciones Imagen',
      inputs: [
        {
          name: 'Nombre',
          type: 'text',
          placeholder: "Nombre"
        },
        {
          name: 'Carpeta',
          type: 'text',
          placeholder: "Carpeta"
        }
      ],
      buttons: [
        {
          text: 'Confirmar'
        }
      ]
    });

    console.log("Imagen guardada")

    await alert.present();
    let result = await alert.onDidDismiss();

    NameCarpeta = result.data.values.Nombre;
    DirectorioCarpeta = result.data.values.Carpeta;
    console.log(NameCarpeta);
    console.log(DirectorioCarpeta);
    let path = 'file:///storage/emulated/0/';

    if (DirectorioCarpeta != '') {
      this.file.checkDir(path, DirectorioCarpeta).then(
        () => {
          console.log("La ruta ya existe");
        },
        err => {
          console.log("Ruta creada")
          this.file.createDir(path, DirectorioCarpeta, false);
        }
      );
    }
  }

  //Calidad y duración vídeo
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Características de grabación',
      inputs: [
        {
          name: 'Calidad',
          type: 'text',
          placeholder: "Calidad"
        },
        {
          name: 'Duracion',
          type: 'text',
          placeholder: "Duracion"
        }
      ],
      buttons: [
        {
          text: 'Grabar'
        }
      ]
    });

    console.log("Grabación de vídeo en curso")

    await alert.present();
    let result = await alert.onDidDismiss();

    calidad = result.data.values.Calidad;
    duracion = result.data.values.Duracion;
    console.log("Duración: " + duracion + " segundos");
  }

  async recordVideo() {
    await this.presentAlert();
    console.log("Calidad: " + calidad + " Duración: " + duracion);
    if (calidad > 1) {
      calidad = 1;
    } else if (calidad < 0) {
      calidad = 0;
    }

    if (duracion != 0) {
      this.mediaCapture.captureVideo({ limit: 1, quality: calidad, duration: duracion }).then(
        (data: MediaFile[]) => {
          if (data.length > 0) {
            this.copyFileToLocalDir(data[0].fullPath);
          }
        },
        (err: CaptureError) => console.error(err)
      );
    } else {
      this.mediaCapture.captureVideo({ limit: 1, quality: calidad }).then(
        (data: MediaFile[]) => {
          if (data.length > 0) {
            this.copyFileToLocalDir(data[0].fullPath);
          }
        },
        (err: CaptureError) => console.error(err)
      );
    }
  }

  async copyFileToLocalDir(fullPath) {
    let myPath = fullPath;
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }

    const ext = myPath.split('.').pop();
    const d = Date.now();
    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    var newn = name.replace(/%20/g, ' ');
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);

    console.log("name " + name);
    console.log("newn " + newn);
    console.log("copyto " + copyFrom);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    var nombre = '';
    var carpeta = '';
    await this.presentAlertCamera();
    console.log(NameCarpeta);
    console.log(DirectorioCarpeta);
    if (NameCarpeta == '') {
      nombre = `${d}.${ext}`;

    } else {
      nombre = `${NameCarpeta}.${ext}`;

    }

    if (DirectorioCarpeta == '') {
      carpeta = MEDIA_FOLDER_NAME;
    } else {
      carpeta = DirectorioCarpeta;
    }


    this.file.copyFile(copyFrom, newn, 'file:///storage/emulated/0/' + carpeta, nombre).then(
      success => {
        this.loadFiles();
      },
      error => {
        let path = 'file:///storage/emulated/0/';
        this.file.checkDir(path, carpeta).then(
          () => {
            this.file.copyFile(copyFrom, newn, 'file:///storage/emulated/0/' + carpeta, nombre)
          }
        );
      }
    );
  }

  openFile(f: FileEntry) {
    if (f.name.indexOf('.mp3') > -1) {
      this.streamingMedia.playAudio(f.nativeURL);

    } else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
      this.streamingMedia.playVideo(f.nativeURL);

    } else if (f.name.indexOf('.jpg') > -1) {
      this.photoViewer.show(f.nativeURL, 'Imagen creada por DanielGV');

    } else if (f.name.indexOf('.amr') > -1) {
      this.streamingMedia.playAudio(f.nativeURL);
    }
  }

  deleteFile(f: FileEntry) {
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
    this.file.removeFile(path, f.name).then(() => {
      this.loadFiles();
    }, err => console.log('Error al eliminar: ', err));
  }

  getPicture() {
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA
    }
    this.camera.getPicture(options)
      .then(imageData => {
        this.image = `data:image/jpeg;base64,${imageData}`;
      })
      .catch(error => {
        console.error(error);
      });
  }

  takePicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    };
    this.camera.getPicture(options)
      .then((imageData) => {
      }, (err) => {
        console.log(err);
      });
  }
}