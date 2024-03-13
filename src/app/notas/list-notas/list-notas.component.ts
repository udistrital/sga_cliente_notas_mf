import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { PopUpManager } from 'src/app/managers/popup_manager';
import { RegistroNotasDocente } from 'src/data/models/registro-notas-docente';
import { ParametrosService } from 'src/data/services/parametros.service';
import { DataAsignatura, RegistroNotasService } from 'src/data/services/registro_notas.service';
import { SgaMidCalendarioService } from 'src/data/services/sga_mid_calendario.service';
import { SgaMidNotasService } from 'src/data/services/sga_mid_notas.service';
import { TimeService } from 'src/data/services/time.service';
import { UserService } from 'src/data/services/users.service';

@Component({
  selector: 'list-notas',
  templateUrl: './list-notas.component.html',
  styleUrls: ['./list-notas.component.scss']
})
export class ListNotasComponent implements OnInit, OnDestroy {

  //// loading animation ////
  loading: boolean = true;
  
  EstadosRegistro: any

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = ['Nivel', 'Codigo', 'Asignatura', 'Periodo', 'Grupo', 'Inscritos', 'Proyecto_Academico', 'Opcion'];
  nombresColumnas = [];
  
  //// vars validado de fechas califificaciones periodo ////
  proceso: Object;
  validado = {
    corte1: {
      existe: false,
      enFecha: false
    },
    corte2: {
      existe: false,
      enFecha: false
    },
    examen: {
      existe: false,
      enFecha: false
    },
    habilit: {
      existe: false,
      enFecha: false
    }
  };

  //// datos a enviar al siguiente componente crud-notas ////
  dataSend: DataAsignatura = {
    Asignatura_id: "",
    Periodo_id: 0,
    Nivel_id: 0,
    EstadoRegistro_porTiempo: 0,
    EstadoRegistro_porExtemporaneo: 0
  };

  constructor(
    private parametrosService: ParametrosService,
    private router: Router,
    private sgaMidNotasService: SgaMidNotasService,
    private sgaMidCalendarioService: SgaMidCalendarioService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    public regNotService: RegistroNotasService,
    private timeService: TimeService,
  ) { 
    this.nombresColumnas["Nivel"] = "notas.nivel";
    this.nombresColumnas["Codigo"] = "notas.codigo";
    this.nombresColumnas["Asignatura"] = "notas.asignatura";
    this.nombresColumnas["Periodo"] = "notas.periodo";
    this.nombresColumnas["Grupo"] = "notas.grupo";
    this.nombresColumnas["Inscritos"] = "notas.inscritos";
    this.nombresColumnas["Proyecto_Academico"] = "notas.carrera";
    this.nombresColumnas["Opcion"] = "notas.opcion";
  }

  async ngOnInit() {
    try {
      await this.getEstadosRegistros();
      this.loadData();
    } catch (error) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  getEstadosRegistros(){
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?query=TipoParametroId.Id:52&fields=Id,CodigoAbreviacion,Nombre&limit=0').subscribe(
        response => {
          if (response !== null && response.Status == '200') {
            this.EstadosRegistro = { Corte1: 0, Corte2: 0, Examen: 0, Habilit: 0, Definitiva: 0, }
            this.EstadosRegistro.Corte1 = response["Data"].filter(e => e.Nombre == "PRIMER CORTE")[0].Id
            this.EstadosRegistro.Corte2 = response["Data"].filter(e => e.Nombre == "SEGUNDO CORTE")[0].Id
            this.EstadosRegistro.Examen = response["Data"].filter(e => e.Nombre == "EXAMEN FINAL")[0].Id
            this.EstadosRegistro.Habilit = response["Data"].filter(e => e.Nombre == "HABILITACIONES")[0].Id
            this.EstadosRegistro.Definitiva = response["Data"].filter(e => e.Nombre == "DEFINITIVA")[0].Id
            sessionStorage.setItem('EstadosRegistro', JSON.stringify(this.EstadosRegistro));
            resolve(this.EstadosRegistro)
          }
        },
        () => {
          reject("Fail_EstReg")
        }
      )
    });
  }

  cargarDatosTabla(datosCargados: any[]) {
    this.dataSource = new MatTableDataSource(datosCargados);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async validarIngresoaCapturaNotas(asignatura, periodo){
    try {
      var hayExtemporaneo = <number>await this.checkModificacionExtemporanea(asignatura);
      if(hayExtemporaneo > 0){
        if(hayExtemporaneo == this.EstadosRegistro.Corte1){
          this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.modificacion_extemporanea_Corte1')); //"Esta ingresando por extemporaneo corte1"
        } else if (hayExtemporaneo == this.EstadosRegistro.Corte2) {
          this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.modificacion_extemporanea_Corte2')); //"Esta ingresando por extemporaneo corte2"
        } else if (hayExtemporaneo == this.EstadosRegistro.Examen) {
          this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.modificacion_extemporanea_Examen')); //"Esta ingresando por extemporaneo Examen"
        } else if (hayExtemporaneo == this.EstadosRegistro.Habilit) {
          this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.modificacion_extemporanea_Habilit')); //"Esta ingresando por extemporaneo Habilit"
        } else if (hayExtemporaneo == this.EstadosRegistro.Definitiva) {
          this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.modificacion_extemporanea_Definitiva')); //"Esta ingresando por extemporaneo Definitiva"
        }

        this.dataSend.EstadoRegistro_porExtemporaneo = Number(hayExtemporaneo)
        this.router.navigate([`/crud-notas`])
      } else {
        this.dataSend.EstadoRegistro_porExtemporaneo = 0;
        this.bringActivities(periodo);
      }
    } catch(error) {
      this.dataSend.EstadoRegistro_porExtemporaneo = 0;
      this.bringActivities(periodo);
    }
  }


  loadData() {

    var data: RegistroNotasDocente[];

    var docenteId = this.userService.getPersonaId();

    this.loading = true;
    this.sgaMidNotasService.get('docentes/' + docenteId + '/espacios-academicos').subscribe(
      (response: any) => {
        if (response !== null && response.Status == '404') {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_espacios_academicos'));
        } else {
          data = response.Data;
          data.forEach(registro => {
            registro.Opcion = {
              icon: 'edit',
              label: this.translate.instant('notas.register_grades'),
              class: 'icon-primary'
            };
          })
          this.cargarDatosTabla(data);
        }
        this.loading = false;
      },
      () => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      }
    );
  }

  bringActivities(periodo) {
    this.loading = true;
    this.proceso = undefined;
    this.sgaMidCalendarioService.get('calendario-academico/'+periodo).subscribe(
      (response: any) => {
        if (response !== null && response.status == '404') {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calendario'));
        } else {
          this.proceso = response.data[0].proceso.filter(proceso => this.existe(proceso.Proceso,["calificaciones"]))[0];
          if (this.proceso === undefined) {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.no_proceso_calificaciones'));
          } else{
            this.loading = false;
            this.timeService.getDate("BOG").then(t => {
              this.chechDates(t);
            });
          }
        }
        this.loading = false;
      },
      () => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      }
    );
  }

  chechDates(fechaActual){

    this.validado = {
      corte1: {
        existe: false,
        enFecha: false
      },
      corte2: {
        existe: false,
        enFecha: false
      },
      examen: {
        existe: false,
        enFecha: false
      },
      habilit: {
        existe: false,
        enFecha: false
      }
    }

    if (this.proceso !== undefined) {
      this.proceso["Actividades"].forEach((element) => {
        if (this.existe(element.Nombre, ["primer"])) {
          this.validado.corte1.existe = true;
          if (this.enFechas(element.FechaInicio, element.FechaFin, fechaActual)) {
            this.validado.corte1.enFecha = true;
          }
        }

        if (this.existe(element.Nombre,["segundo"])) {
          this.validado.corte2.existe = true;
          if (this.enFechas(element.FechaInicio, element.FechaFin, fechaActual)) {
            this.validado.corte2.enFecha = true;
          }
        }

        if (this.existe(element.Nombre,["ultimo", "examen"])) {
          this.validado.examen.existe = true;
          if (this.enFechas(element.FechaInicio, element.FechaFin, fechaActual)) {
            this.validado.examen.enFecha = true;
          }
        }

        if (this.existe(element.Nombre,["habilitacion", "habilitaciones"])) {
          this.validado.habilit.existe = true;
          if (this.enFechas(element.FechaInicio, element.FechaFin, fechaActual)) {
            this.validado.habilit.enFecha = true;
          }
        }
      });
    }
    
    if (this.validado.corte1.existe && this.validado.corte2.existe && this.validado.examen.existe && this.validado.habilit.existe) {
      if (this.validado.corte1.enFecha) {
        this.dataSend.EstadoRegistro_porTiempo = this.EstadosRegistro.Corte1;
        this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.fecha_corte1')); //"Esta ingresando a fechas 1 corte"
        this.router.navigate([`/crud-notas`])
      } else if(this.validado.corte2.enFecha) {
        this.dataSend.EstadoRegistro_porTiempo = this.EstadosRegistro.Corte2;
        this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.fecha_corte2')); //"Esta ingresando a fechas 2 corte"
        this.router.navigate([`/crud-notas`])
      } else if(this.validado.examen.enFecha) {
        this.dataSend.EstadoRegistro_porTiempo = this.EstadosRegistro.Examen;
        this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.fecha_examen')); //"Esta ingresando a fechas examen"
        this.router.navigate([`/crud-notas`])
      } else if(this.validado.habilit.enFecha) {
        this.dataSend.EstadoRegistro_porTiempo = this.EstadosRegistro.Habilit;
        this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.fecha_habilit')); //"Esta ingresando a fechas habilit"
        this.router.navigate([`/crud-notas`])
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('notas.fuera_fechas')); //"fuera de fechas"
      }
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('notas.falta_actividad_calificacion')); //"Faltan actividades de calificaciones"
    }
  }

  checkModificacionExtemporanea(asignatura) {
    return new Promise((resolve, reject) => {
      this.sgaMidNotasService.get('asignaturas/' + asignatura + '/modificacion-extemporanea').subscribe(
        (response: any) => {
          if (response !== null && response.Status == '200') {
            var estadoRegistro = 0;
            var i = response.Data.findIndex(estadoRegistro => estadoRegistro.modificacion_extemporanea === true);
            if (i > -1){
              estadoRegistro = response.Data[i].estado_registro_id;
            }
            resolve(estadoRegistro)
          }
        },
        () => {
          reject(false)
        }
      );
    });
  }

  existe(variable, textos: string[]) {
    return textos.some( (texto) => variable.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(texto) !== -1 );
  }

  enFechas(fechaIni, fechaFin, fechaActual){
    let fi = moment(fechaIni,"YYYY-MM-DDTHH:mm:ss").toDate();
    let ff = moment(fechaFin,"YYYY-MM-DDTHH:mm:ss").toDate();
    ff.setDate(ff.getDate() + 1);
    let f = moment(fechaActual).tz("America/Bogota").toDate();
    return (fi <= f) && (ff >= f)
  }

  
  ngOnDestroy() {
    this.regNotService.putData(this.dataSend);
  }

  registrarNotas(data: any) {
    this.dataSend.Asignatura_id = data.AsignaturaId;
    this.dataSend.Periodo_id = data.PeriodoId;
    this.dataSend.Nivel_id = data.Nivel_id;
    this.validarIngresoaCapturaNotas(data.AsignaturaId, data.PeriodoId)
    //this.bringActivities(data.PeriodoId);
  }

}
