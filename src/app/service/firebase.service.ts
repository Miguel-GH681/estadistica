import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface Datos {
  valorX: number;
  valorY: number;
  tituloX: string;
  tituloY: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private coleccion = 'datos';

  constructor(private firestore: AngularFirestore) {}

  agregarDato(dato: Datos) {
    return this.firestore.collection<Datos>(this.coleccion).add(dato);
  }

  obtenerDatos(): Observable<Datos[]> {
    return this.firestore.collection<Datos>(this.coleccion).valueChanges();
  }
}