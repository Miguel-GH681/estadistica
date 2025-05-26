import { Injectable, signal } from '@angular/core';
import { BoardEnum } from '../types/board.enum';
import { BoardInterface } from '../types/board.interface';


@Injectable({
  providedIn: 'root',
})
export class BoardService {
  valueSig = signal<BoardInterface[]>([]);
  filterSig = signal<BoardEnum>(BoardEnum.all);

//   changeFilter(filterName: BoardEnum): void {
//     this.filterSig.set(filterName);
//   }

    addRow(valorX: number, valorY: number): void {
        const newTodo: BoardInterface = {
            valorX,
            valorY,
        };
        this.valueSig.update((todos) => [...todos, newTodo]);
    }

//   changeTodo(id: string, text: string): void {
//     this.todosSig.update((todos) =>
//       todos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
//     );
//   }

//   removeTodo(id: string): void {
//     this.todosSig.update((todos) => todos.filter((todo) => todo.id !== id));
//   }

//   toggleTodo(id: string): void {
//     this.todosSig.update((todos) =>
//       todos.map((todo) =>
//         todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
//       )
//     );
//   }

//   toggleAll(isCompleted: boolean): void {
//     this.todosSig.update((todos) =>
//       todos.map((todo) => ({ ...todo, isCompleted }))
//     );
//   }
}