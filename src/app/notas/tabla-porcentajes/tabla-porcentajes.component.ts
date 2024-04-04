import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PorcentajesAsignatura } from "src/data/models/porcentajes-asignatura";

@Component({
  selector: "app-tabla-porcentajes",
  templateUrl: "./tabla-porcentajes.component.html",
  styleUrls: ["./tabla-porcentajes.component.scss"],
})
export class TablaPorcentajesComponent implements OnChanges {
  @Input() modeloPorcentajes: PorcentajesAsignatura[] = [];
  porcentajesFormGroup: FormGroup;
  formularioListo: boolean = false;

  constructor() {
    this.porcentajesFormGroup = new FormGroup({});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["modeloPorcentajes"].currentValue != undefined) {
      console.log(
        "Datos de entrada:",
        changes["modeloPorcentajes"].currentValue
      );

      this.construirFormulario();
    }
  }

  private construirFormulario(): void {
    this.porcentajesFormGroup = new FormGroup({});
    this.modeloPorcentajes.forEach((porcentajeAsignatura) => {
      porcentajeAsignatura.fields.field.forEach((field) => {
        const campoValidadores = [Validators.min(0), Validators.max(100)]
        const campoNombre = field.name;
        const campoValorPorDefecto = field.perc;
        console.log("porcentaje", campoValorPorDefecto)
        this.porcentajesFormGroup.addControl(
          campoNombre,
          new FormControl(campoValorPorDefecto, campoValidadores)
        );
      });
    });
    this.formularioListo = true;
    console.log("Formulario construido:", this.porcentajesFormGroup);
  }
}
