import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popup_manager';
import { SgaMidService } from 'src/data/services/sga_mid.service';

@Component({
  selector: 'captura-notas',
  templateUrl: './captura-notas.component.html',
  styleUrls: ['./captura-notas.component.scss']
})
export class CapturaNotasComponent implements OnInit {
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = ['Identificacion', 'Docente', 'Codigo', 'Asignatura', 'Nivel', 'Grupo', 'Inscritos', 'Proyecto_Academico', 'Estado'];
  nombresColumnas = [];

  periodos: any;

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    ) {
    this.nombresColumnas["Identificacion"] = "notas.identificacion";
    this.nombresColumnas["Docente"] = "notas.docente";
    this.nombresColumnas["Codigo"] = "notas.codigo";
    this.nombresColumnas["Asignatura"] = "notas.asignatura";
    this.nombresColumnas["Nivel"] = "notas.nivel";
    this.nombresColumnas["Grupo"] = "notas.grupo";
    this.nombresColumnas["Inscritos"] = "notas.inscritos";
    this.nombresColumnas["Proyecto_Academico"] = "notas.carrera";
    this.nombresColumnas["Estado"] = "notas.estado";

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarDatosTabla([]);
    })
  }

  ngOnInit() {
    this.periodosActivos()
    this.cargarDatosTabla([]);
  }

  cargarDatosTabla(datosCargados: any[]) {
    this.dataSource = new MatTableDataSource(datosCargados);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filterPeriodo(periodo) {
    this.sgaMidService.get('notas/EstadosRegistros/' + periodo).subscribe(
      response => {
        if (response !== null && response.Status == '200') {
          this.cargarDatosTabla(response.Data) 
        } else {
          this.popUpManager.showInfoToast(this.translate.instant('notas.no_datos_estados_registros'),3000)
          this.cargarDatosTabla([])
        }
      },
      () => {
        this.popUpManager.showInfoToast(this.translate.instant('notas.no_datos_estados_registros'),3000)
        this.cargarDatosTabla([])
      }
    );
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
  
  periodosActivos() {
    this.sgaMidService.get('calendario_academico?limit=0').subscribe(
      (response: any) => {
        if (response !== null && (response.Response.Code == '404' || response.Response.Code == '400')) {
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
        } else {
          this.periodos = response.Response.Body[1].filter(periodo => periodo.Activo === true);
          if (this.periodos === null) {
            this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
          }
        }
      },
      () => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  get noData(): boolean {
    return this.dataSource && this.dataSource.data.length === 0;
  }

}
