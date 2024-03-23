import { APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmptyRouteComponent } from "./empty-route/empty-route.component";

export const routes: Routes = [
  {
    path: 'empty-route',
    component: EmptyRouteComponent
  },
  {
    path: '',
    loadChildren: () => import ('./notas/notas.module').then(m => m.NotasModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/notas/" }],
})
export class AppRoutingModule {}
