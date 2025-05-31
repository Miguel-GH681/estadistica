import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardFirebaseService } from '../../services/boardFirebase.service';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { CommonModule } from '@angular/common';
import { jStat } from 'jstat';
import Swal from 'sweetalert2'

PlotlyModule.plotlyjs = PlotlyJS;


@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PlotlyModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent implements OnInit{
  formulario!: FormGroup;
  boardFirebaseSerice = inject(BoardFirebaseService);
  history : Array<any> = [];
  graphData: Array<any> = [];
  layout: any;
  problemSelected : any = null;

  constructor(private formBuilder : FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {    
    this.getHistory();
    this.generateGraph(90, '', '', 1);
  }

  generateGraph(mean : number, l1 : string, l2 : string, tipo : number){
    this.graphData = [];
    const std = 10;

    const x = Array.from({ length: 800 }, (_, i) => mean - 40 + i * 0.1);
    const y = x.map((xi) => (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((xi - mean) / std, 2)));

    this.graphData.push({
      x,
      y,
      type: 'scatter',
      mode: 'lines',
      name: 'Distribución normal',
      line: { color: 'blue' },
    });
    this.graphData.push(this.verticalLine(mean, 'M = ' + mean.toString(), 'red'));

    if(tipo == 1 && l1 != ''){
      this.graphData.push(this.verticalLine(mean + Number(l1) * std, l1, 'green'));
      this.graphData.push(this.verticalLine(mean + Number(l2) * std, l2, 'red'));
    } else if(l1 != ''){
    this.graphData.push(this.verticalLine(mean + Number(l1) * std, l1, 'red'));
    this.graphData.push(this.verticalLine(mean + Number(l2) * std, l2, 'red'));
    }

    this.layout = {
      title: 'Campana de Gauss',
      xaxis: { title: 'X' },
      yaxis: { title: 'Densidad de probabilidad' },
      showlegend: false,
      shapes: [],
      annotations: [],
    };
  }

  verticalLine(x: number, label: string, color : string) {
    return {
      x: [x, x],
      y: [0, 0.05],
      mode: 'lines+text',
      type: 'scatter',
      line: { dash: 'dot', width: 2, color: color },
      text: [null, label],
      textposition: 'top center',
      hoverinfo: 'none'
    };
  }

  initForm(){
    this.formulario = this.formBuilder.group({
      nombre: [null, [Validators.required]],
      tamanioMuestra: [null, [Validators.required]],
      significacion: [null, [Validators.required]],
      tipoDesviacionEstandar: [null, [Validators.required]],
      desviacionEstandar: [null, [Validators.required]],
      mediaMuestral: [null, [Validators.required]],
      restriccion: [null, [Validators.required]],
      parametroDeInteres: [null, [Validators.required]]
    });
  }

  async getHistory(){
    try{
      await this.boardFirebaseSerice.getTodos().subscribe((history) =>{
        this.history = history;
      });
    } catch(err){
      console.log('Error al obtener datos');
    }
  }

  calcularZ(valores : any){
    let z0 = 0;
    if(valores['tipoDesviacionEstandar'] = 1){
      z0 = jStat.studentt.inv(valores['significacion'], valores['tamanioMuestra']);
    } else{
      z0 = jStat.normal.inv(valores['significacion'], 0,1);
    }

    if(valores['restriccion'] == 2){
      z0 = Math.abs(z0);
    }
    
    const z1 = (valores['mediaMuestral'] - valores['parametroDeInteres']) / (valores['desviacionEstandar'] / Math.sqrt(valores['tamanioMuestra']))
    this.problemSelected = {z0, z1, ...valores};
    this.generateGraph(valores['mediaMuestral'], z0.toFixed(2), z1.toFixed(2), valores['restriccion']);
  }

  deleteItem(index : number){
    this.boardFirebaseSerice.removeDato(this.history[index]['id']).subscribe(()=>{
      this.getHistory();
    })    
  }

  loadData(index : number){
    this.problemSelected = this.history[index];
    this.calcularZ(this.problemSelected);
  }

  validarRechazoAceptacion(){    
    if(Number(this.problemSelected['z1']) > Number(this.problemSelected['z0'])){
      return this.problemSelected['z1'].toFixed(2) + '>' + this.problemSelected['z0'].toFixed(2)
    } else{
      return this.problemSelected['z1'].toFixed(2) + '<' + this.problemSelected['z0'].toFixed(2)
    }
  }

  conclusionRechazoAceptacion(){
    let tipoOperacion = this.problemSelected['restriccion'];

    if(tipoOperacion == 1){
      if(this.problemSelected['z0'] > this.problemSelected['z1']){
        return 'Se rechaza la hipótesis';
      } else{
        return 'Se acepta la hipótesis';
      }
    } else{
      if(this.problemSelected['z0'] < this.problemSelected['z1']){
        return 'Se rechaza la hipótesis';
      } else{
        return 'Se acepta la hipótesis';
      }
    }
  }

  async onSubmit() {
    if(this.problemSelected){
      this.problemSelected = null;
      return;
    }

    if (this.formulario.valid) {
      const { tamanioMuestra, mediaMuestral, desviacionEstandar, significacion, parametroDeInteres, nombre, restriccion, tipoDesviacionEstandar } = this.formulario.value;
      const newObject = {
        tamanioMuestra,
        mediaMuestral,
        desviacionEstandar, 
        significacion,
        parametroDeInteres,
        nombre,
        restriccion,
        tipoDesviacionEstandar
      }
      try {
        this.calcularZ(newObject);
        await this.boardFirebaseSerice.addDato(this.problemSelected).subscribe(() =>{
          this.formulario.reset();
        })
      } catch (err) {
        console.error('Error al almacenar dato:', err);
      }
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "error",
        title: "Complete el formulario"
      });      
    }
  }
}
