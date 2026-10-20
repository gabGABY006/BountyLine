import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './component/inicio.component/inicio.component';
import { RegistroComponent } from './component/registro.component/registro.component';
import { LayoutComponent } from './component/layout/layout.component';
import { AdminComponent } from './component/admin.component/admin.component';
import { GestionUsuariosComponent } from './component/admin.component/gestion-usuarios.component/gestion-usuarios.component';
import { ReportesComponent } from './component/admin.component/reportes/reportes.component';
import { FeedAdminComponent } from './component/admin.component/feed-admin.component/feed-admin.component';
import { MisMisionesComponent } from './component/usuario.component/mis-misiones.component/mis-misiones.component';
import { NuevaMisionComponent } from './component/usuario.component/nueva-mision.component/nueva-mision.component';
import { DetalleMisionComponent } from './component/usuario.component/detalle-mision.component/detalle-mision.component';
import { BilleteraComponent } from './component/usuario.component/billetera.component/billetera.component';
import { MiPerfilComponent } from './component/usuario.component/mi-perfil/mi-perfil.component';
import { FeedComponent } from './component/usuario.component/feed.component/feed.component';
import { MisionesDisponiblesComponent } from './component/cazarecompensas.component/misiones-disponibles.component/misiones-disponibles.component';
import { MisMisionesCazaComponent } from './component/cazarecompensas.component/mis-misiones-caza.component/mis-misiones-caza.component';
import { DetalleMisionCazaComponent } from './component/cazarecompensas.component/detalle-mision-caza.component/detalle-mision-caza.component';
import { MiCalificacionComponent } from './component/cazarecompensas.component/mi-calificacion.component/mi-calificacion.component';
import { FeedCazaComponent } from './component/cazarecompensas.component/feed-caza.component/feed-caza.component';
import { CatalogosComponent} from './component/admin.component/catalogos/catalogos.component';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'registro', component: RegistroComponent },

  {
    path: 'admin',
    component: LayoutComponent,
    data: { modo: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: AdminComponent },
      { path: 'usuarios', component: GestionUsuariosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'feed', component: FeedAdminComponent },
      { path: 'catalogos', component: CatalogosComponent },
    ],
  },

  {
    path: 'usuario',
    component: LayoutComponent,
    data: { modo: 'NORMAL' },
    children: [
      { path: '', redirectTo: 'mis-misiones', pathMatch: 'full' },
      { path: 'mis-misiones', component: MisMisionesComponent },
      { path: 'nueva-mision', component: NuevaMisionComponent },
      { path: 'detalle/:id', component: DetalleMisionComponent },
      { path: 'billetera', component: BilleteraComponent },
      { path: 'mi-perfil', component: MiPerfilComponent },
      { path: 'feed', component: FeedComponent },
    ],
  },

  {
    path: 'cazarrecompensas',
    component: LayoutComponent,
    data: { modo: 'CAZARRECOMPENSAS' },
    children: [
      { path: '', redirectTo: 'misiones-disponibles', pathMatch: 'full' },
      { path: 'misiones-disponibles', component: MisionesDisponiblesComponent },
      { path: 'mis-misiones', component: MisMisionesCazaComponent },
      { path: 'detalle/:id', component: DetalleMisionCazaComponent },
      { path: 'mi-calificacion', component: MiCalificacionComponent },
      { path: 'billetera', component: BilleteraComponent },
      { path: 'mi-perfil', component: MiPerfilComponent },
      { path: 'feed', component: FeedCazaComponent },
    ],
  },

  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
