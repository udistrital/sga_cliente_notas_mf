import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { PopUpManager } from 'src/app/managers/popup_manager';
import { NivelFormacion } from 'src/data/models/nivel_formacion';
import { EventoService } from 'src/data/services/evento.service';
import { ProyectoAcademicoService } from 'src/data/services/proyecto_academico.service';
import { SgaMidCalendarioService } from 'src/data/services/sga_mid_calendario.service';

@Component({
  selector: 'definicion-cortes',
  templateUrl: './definicion-cortes.component.html',
  styleUrls: ['./definicion-cortes.component.scss']
})
export class DefinicionCortesComponent implements OnInit {

  selectedLevel: FormControl;
  selectedPeriod: FormControl;
  niveles: NivelFormacion[];
  periodos: Object[] = [];
  proceso: Object;

  corte1_index = -1;
  corte2_index = -1;
  examen_index = -1;
  habilit_index = -1;

  settingDates: FormGroup;

  constructor(
    private proyectoService: ProyectoAcademicoService,
    private sgaMidCalendarioService: SgaMidCalendarioService,
    private eventoService: EventoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {
    this.selectedLevel = new FormControl('', Validators.required);
    this.selectedPeriod = new FormControl('', Validators.required);
  }

  ngOnInit() {
    this.settingDates = new FormGroup({
      corte1_inicio: new FormControl('', Validators.required),
      corte1_fin: new FormControl('', Validators.required),
      corte2_inicio: new FormControl('', Validators.required),
      corte2_fin: new FormControl('', Validators.required),
      examen_inicio: new FormControl('', Validators.required),
      examen_fin: new FormControl('', Validators.required),
      habilit_inicio: new FormControl('', Validators.required),
      habilit_fin: new FormControl('', Validators.required)
    });
    this.settingDates.disable();

    this.proyectoService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        if (response === null) {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_niveles'));//"No se encuentra niveles"
        } else {
          this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null);
          if (this.niveles === null) {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_nivel_especifico'));//"No se encuentran los niveles especificados"
          }
        }
      },
      () => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  onSelectLevel(): void {
    this.settingDates.reset();
    this.settingDates.disable();
    if (this.selectedLevel.value !== '') {
      this.sgaMidCalendarioService.get('calendario-academico?limit=0').subscribe(
        (response: any) => {
          if (response !== null && (response.status == '404' || response.status == '400')) {
            this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
          } else {
            this.periodos = response.data.filter(periodo => periodo.Nivel === this.selectedLevel.value && periodo.Activo === true);
            if (this.periodos === null) {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calendario_nivel'));//"no hay calendarios para este nivel o no se encuentran activos"
            }
            this.selectedPeriod.setValue('');
          }
        },
        () => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      );
    }
  }

  onSelectPeriod(): void {
    this.settingDates.reset();
    this.settingDates.disable();
    if (this.selectedPeriod.value !== '') {
      this.proceso = undefined;
      this.sgaMidCalendarioService.get('calendario-academico/' + this.selectedPeriod.value).subscribe(
        (response: any) => {
          if (response === null || !response.success) {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calendario_periodo'));//"No se encuentra calendario para periodo"
          } else {
            this.proceso = response.data[0].proceso != null ? response.data[0].proceso.filter(proceso => this.existe(proceso.Proceso, ["calificaciones"]))[0] : undefined;
            if (this.proceso === undefined) {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.no_proceso_calificaciones'));//"No hay proceso de calificaciones"
            } else {
              this.organizeData();
            }
          }
        },
        () => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      );
    }
  }

  organizeData(): void {
    this.corte1_index = -1;
    this.corte2_index = -1;
    this.examen_index = -1;
    this.habilit_index = -1;

    this.proceso["Actividades"].forEach((element, index) => {
      if (this.existe(element.Nombre, ["primer"])) {
        this.corte1_index = index;
      }
      if (this.existe(element.Nombre, ["segundo"])) {
        this.corte2_index = index;
      }
      if (this.existe(element.Nombre, ["ultimo", "examen"])) {
        this.examen_index = index;
      }
      if (this.existe(element.Nombre, ["habilitacion", "habilitaciones"])) {
        this.habilit_index = index;
      }
    });

    if (this.corte1_index === -1) {
      this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_corte1'));
    } else if (this.corte2_index === -1) {
      this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_corte2'));
    } else if (this.examen_index === -1) {
      this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_examen'));
    } else if (this.habilit_index === -1) {
      this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_habilit'));
    } else {
      this.settingDates.patchValue({
        corte1_inicio: moment(this.proceso["Actividades"][this.corte1_index].FechaInicio, "YYYY-MM-DDTHH:mm:ss").toDate(),
        corte1_fin: moment(this.proceso["Actividades"][this.corte1_index].FechaFin, "YYYY-MM-DDTHH:mm:ss").toDate(),
        corte2_inicio: moment(this.proceso["Actividades"][this.corte2_index].FechaInicio, "YYYY-MM-DDTHH:mm:ss").toDate(),
        corte2_fin: moment(this.proceso["Actividades"][this.corte2_index].FechaFin, "YYYY-MM-DDTHH:mm:ss").toDate(),
        examen_inicio: moment(this.proceso["Actividades"][this.examen_index].FechaInicio, "YYYY-MM-DDTHH:mm:ss").toDate(),
        examen_fin: moment(this.proceso["Actividades"][this.examen_index].FechaFin, "YYYY-MM-DDTHH:mm:ss").toDate(),
        habilit_inicio: moment(this.proceso["Actividades"][this.habilit_index].FechaInicio, "YYYY-MM-DDTHH:mm:ss").toDate(),
        habilit_fin: moment(this.proceso["Actividades"][this.habilit_index].FechaFin, "YYYY-MM-DDTHH:mm:ss").toDate(),
      });
      this.settingDates.enable();
    }
  }

  onSubmit(): void {
    if (this.settingDates.valid) {
      this.proceso["Actividades"][this.corte1_index].FechaInicio = moment(this.settingDates.get("corte1_inicio").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.corte1_index].FechaFin = moment(this.settingDates.get("corte1_fin").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.corte2_index].FechaInicio = moment(this.settingDates.get("corte2_inicio").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.corte2_index].FechaFin = moment(this.settingDates.get("corte2_fin").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.examen_index].FechaInicio = moment(this.settingDates.get("examen_inicio").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.examen_index].FechaFin = moment(this.settingDates.get("examen_fin").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.habilit_index].FechaInicio = moment(this.settingDates.get("habilit_inicio").value).format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.proceso["Actividades"][this.habilit_index].FechaFin = moment(this.settingDates.get("habilit_fin").value).format('YYYY-MM-DDTHH:mm:ss[Z]');

      this.proceso["Actividades"].forEach(actividad => {
        this.eventoService.get('calendario_evento/' + actividad.actividadId).subscribe(
          response => {
            if (response === null) {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_actividad'));//"No se encuentra la actividad");
            } else {
              const actividadEditada = response;
              actividadEditada.FechaInicio = actividad.FechaInicio;
              actividadEditada.FechaFin = actividad.FechaFin;
              this.eventoService.put('calendario_evento', actividadEditada).subscribe(
                () => {
                  this.popUpManager.showSuccessAlert(this.translate.instant('notas.ajuste_exitoso'));//"Ajuste de fechas exitoso"
                },
                () => {
                  this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
                },
              );
            }
          },
          () => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      })
    }
  }

  cleanAll(): void {
    this.selectedLevel.reset();
    this.selectedLevel.setErrors(null);
    this.selectedPeriod.reset();
    this.selectedPeriod.setErrors(null);
    this.settingDates.reset();
    this.settingDates.disable();
  }

  existe(variable: string, textos: string[]): boolean {
    return textos.some((texto) => variable.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(texto) !== -1);
  }

}