export class RegistroNotasDocente {
    Nivel: string;
    Nivel_id: number;
    Codigo: number;
    Asignatura: string;
    Periodo: string;
    PeriodoId: number;
    Grupo: string;
    Inscritos: number;
    Proyecto_Academico: string;
    AsignaturaId: string;
    Opcion: {
        icon: 'edit',
        label: 'Registrar notas',
        class: "icon-primary"
    };
}

/* export interface RegistroNotasDocente {
    Nivel: string;
    Nivel_id: number;
    Codigo: number;
    Asignatura: string,
    Periodo: string,
    PeriodoId: number,
    Grupo: string,
    Inscritos: number
    Proyecto_Academico: string,
    AsignaturaId: string,
    Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Registrar notas',
        class: "btn btn-primary"
    };
} */