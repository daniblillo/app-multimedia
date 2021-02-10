
import { Component, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ActionSheetController, Platform,AlertController } from '@ionic/angular';
import {
  MediaCapture,
  MediaFile,
  CaptureError
} from '@ionic-native/media-capture/ngx';


import { File, FileEntry } from '@ionic-native/File/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


const MEDIA_FOLDER_NAME = 'Media';
var duracion=0;
var calidad=0;
var NameCarpeta='';
var DirectorioCarpeta='';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page implements OnInit {
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
    private camera: Camera,
    public alertController: AlertController,

  ) {}
 
  ngOnInit() {
    this.plt.ready().then(() => {
      let path = this.file.dataDirectory;
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
    this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
        this.files = res;
      },
      err => console.log('error loading files: ', err)
    );
  }
  async selectMedia() {
    const actionSheet = await this.actionSheetController.create({
      header: 'What would you like to add?',
      buttons: [
        {
          text: 'Capture Image',
          handler: () => {
            this.captureImage();
          }
        },
        {
          text: 'Record Video',
          handler: () => {
            this.recordVideo();
          }
        },
        {
          text: 'Record Audio',
          handler: () => {
            this.recordAudio();
          }
        },
        {
          text: 'Load multiple',
          handler: () => {
            this.pickImages();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
 
  getPicturee(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100
    }
    this.camera.getPicture( options )
    .then(imageData => {
      this.image = `data:image/jpeg;base64,${imageData}`;
    })
    .catch(error =>{
      console.error( error );
    });
  }

  pickImages() {
    this.imagePicker.getPictures({}).then(
      results => {
        for (var i = 0; i < results.length; i++) {
          this.copyFileToLocalDir(results[i]);
        }
      }
    );
 
    // If you get problems on Android, try to ask for Permission first
    // this.imagePicker.requestReadPermission().then(result => {
    //   console.log('requestReadPermission: ', result);
    //   this.selectMultiple();
    // });
  }
 
  async captureImage() {
 
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
  

  async presentAlertCamera() {
  
    console.log("entraaa")
    const alert = await this.alertController.create({
      header: 'Opciones Imagen',
     inputs:[
       {
        name:'Nombre',
        type:'text',
        placeholder:"Nombre"
       },
       {
         name:'Carpeta', type:'text', placeholder:"Carpeta"
       }
      
      
     ],
     buttons:[
       {
         text:'ok'
       }
     ]
    });
console.log("entraa")
    await alert.present();
     let result = await alert.onDidDismiss();
     NameCarpeta= result.data.values.Nombre;
     DirectorioCarpeta= result.data.values.Carpeta;
     console.log(NameCarpeta);
     console.log(DirectorioCarpeta);
     let path = 'file:///storage/emulated/0/';
     if(DirectorioCarpeta!=''){
         this.file.checkDir(path, DirectorioCarpeta).then(
           () => {
             console.log("La carpeta ya existe");
           },
           err => {
             console.log("Carpeta creada")
             this.file.createDir(path, DirectorioCarpeta, false);
           }
         );
     }
  }
  async presentAlert() {
    console.log("entraaa")
    const alert = await this.alertController.create({
      header: 'Escoga la Calidad y Duración',
     inputs:[
       {
        name:'Calidad',
        type:'text',
        placeholder:"Calidad"
       },
       {
         name:'Duracion', type:'text', placeholder:"Duracion"
       }
      
      
     ],
     buttons:[
       {
         text:'ok'
       }
     ]
    });
console.log("entraa")
    await alert.present();
     let result = await alert.onDidDismiss();
     calidad= result.data.values.Calidad;
     duracion= result.data.values.Duracion;
  }

  async  recordVideo() {
    await   this.presentAlert();
console.log(calidad+"calidad ");
console.log(duracion+"duracion");
if(calidad >1){
  calidad=1;
}else if (calidad <0){
  calidad=0;
}
    this.mediaCapture.captureVideo({ limit: 1, quality:calidad, duration:duracion}).then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }

  async  copyFileToLocalDir(fullPath) {
    let myPath = fullPath;
    // Make sure we copy from the right location
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }
 
    const ext = myPath.split('.').pop();
    const d = Date.now();

    var newn=ext.replace(/%20/g,' ');
    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    var nombre='';
    var carpeta='';
    await this.presentAlertCamera();
    console.log(NameCarpeta);
    console.log(DirectorioCarpeta);
    if(NameCarpeta==''){
      nombre=`${d}.${ext}`;

    }else{
      nombre=`${NameCarpeta}.${ext}`;

    }

    if(DirectorioCarpeta==''){
      carpeta=MEDIA_FOLDER_NAME;
    }else{
      carpeta=DirectorioCarpeta;
    }


    this.file.copyFile(copyFrom, newn, 'file:///storage/emulated/0/'+carpeta, nombre).then(
      success => {
        this.loadFiles();
      },
      error => {
        console.log('error: ', error);
      }
    );
  }
 
  openFile(f: FileEntry) {
    if (f.name.indexOf('.wav') > -1) {
      // We need to remove file:/// from the path for the audio plugin to work
      const path =  f.nativeURL.replace(/^file:\/\//, '');
      const audioFile: MediaObject = this.media.create(path);
      audioFile.play();
    } else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
      // E.g: Use the Streaming Media plugin to play a video
      this.streamingMedia.playVideo(f.nativeURL);
    } else if (f.name.indexOf('.jpg') > -1) {
      // E.g: Use the Photoviewer to present an Image
      this.photoViewer.show(f.nativeURL, 'MY awesome image');
    }
  }
 
  deleteFile(f: FileEntry) {
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
    this.file.removeFile(path, f.name).then(() => {
      this.loadFiles();
    }, err => console.log('error remove: ', err));
  }

  getPicture(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA
    }
    this.camera.getPicture( options )
    .then(imageData => {
      this.image = `data:image/jpeg;base64,${imageData}`;
    })
    .catch(error =>{
      console.error( error );
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
      //this.image = this.webView.convertFileSrc(imageData);
    }, (err) => {
      console.log(err);
    });
  }
}