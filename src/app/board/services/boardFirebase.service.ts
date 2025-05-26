import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { BoardInterface } from '../types/board.interface';

@Injectable({ providedIn: 'root' })
export class BoardFirebaseService {
  firestore = inject(Firestore);
  datosCollection = collection(this.firestore, 'datos');

  getTodos(): Observable<BoardInterface[]> {
    return collectionData(this.datosCollection, {
      idField: 'id',
    }) as Observable<BoardInterface[]>;
  }

  addDato(newObject : Object): Observable<string> {
    const promise = addDoc(this.datosCollection, newObject).then(
      (response) => response.id
    );
    return from(promise);
  }

  removeDato(datoId: string): Observable<void> {
    const docRef = doc(this.firestore, 'datos/' + datoId);
    const promise = deleteDoc(docRef);
    return from(promise);
  }

  updateTodo(
    todoId: string,
    dataToUpdate: { text: string; isCompleted: boolean }
  ): Observable<void> {
    const docRef = doc(this.firestore, 'datos/' + todoId);
    const promise = setDoc(docRef, dataToUpdate);
    return from(promise);
  }
}