import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { NotasComponent } from './notas.component';
import { DefinicionCortesComponent } from './definicion-cortes/definicion-cortes.component';
import { ListNotasComponent } from './list-notas/list-notas.component';
import { CapturaNotasComponent } from './captura-notas/captura-notas.component';

const routes: Routes = [{
    path: '',
    component: NotasComponent,
    children: [
        {
            path: 'definicion-cortes',
            component: DefinicionCortesComponent,
//            canActivate: [AuthGuard],
        },
        {
            path: 'list-notas',
            component: ListNotasComponent,
//            canActivate: [AuthGuard],
        },
        {
            path: 'captura-notas',
            component: CapturaNotasComponent,
//            canActivate: [AuthGuard],
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
    CapturaNotasComponent
]
