import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popup_manager';
import { SgaMidCalendarioService } from 'src/data/services/sga_mid_calendario.service';
import { SgaMidNotasService } from 'src/data/services/sga_mid_notas.service';

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
    private sgaMidNotasService: SgaMidNotasService,
    private sgaMidCalendarioService: SgaMidCalendarioService,
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
    this.sgaMidNotasService.get('periodos/' + periodo + '/estados-registros').subscribe(
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
    this.sgaMidCalendarioService.get('calendario-academico?limit=0').subscribe(
      (response: any) => {
        if (response !== null && (response.status == '404' || response.status == '400')) {
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
        } else {
          this.periodos = response.data.filter(periodo => periodo.Activo === true);
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
