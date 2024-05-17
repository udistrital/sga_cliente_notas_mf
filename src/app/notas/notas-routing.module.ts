import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { NotasComponent } from './notas.component';
import { DefinicionCortesComponent } from './definicion-cortes/definicion-cortes.component';
import { ListNotasComponent } from './list-notas/list-notas.component';
import { CapturaNotasComponent } from './captura-notas/captura-notas.component';
import { CrudNotasComponent } from './crud-notas/crud-notas.component';

const routes: Routes = [{
    path: '',
    component: NotasComponent,
    children: [
        {
            path: 'definicion-cortes',
            component: DefinicionCortesComponent,
        },
        {
            path: 'listado',
            component: ListNotasComponent,
        },
        {
            path: 'captura',
            component: CapturaNotasComponent,
        },
        {
            path: 'crud',
            component: CrudNotasComponent,
        }
    ],
}];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class NotasRoutingComponent { }

export const routedComponents = [
    NotasComponent,
    DefinicionCortesComponent,
    ListNotasComponent,
    CapturaNotasComponent,
    CrudNotasComponent
]
