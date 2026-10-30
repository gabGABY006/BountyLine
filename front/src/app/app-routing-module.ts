import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './component/inicio.component/inicio.component';
import { RegistroComponent } from './component/registro.component/registro.component';
import { LayoutComponent } from './component/layout/layout.component';
import { AdminComponent } from './component/admin.component/admin.component';
import { GestionUsuariosComponent } from './component/admin.component/gestion-usuarios.component/gestion-usuarios.component';
import { ReportesComponent } from './component/admin.component/reportes/reportes.component';
import { FeedAdminComponent } from './component/admin.component/feed-admin.component/feed-admin.component';
import { BilleteraComponent } from './component/usuario.component/billetera/billetera.component';
import { MiPerfilComponent } from './component/usuario.component/mi-perfil/mi-perfil.component';
import { CatalogosComponent} from './component/admin.component/catalogos/catalogos.component';
import { BitacoraComponent } from './component/admin.component/bitacora/bitacora.component';
import { MisionesComponent } from './component/usuario.component/misiones/misiones.component';
import { CazadoresComponent } from './component/usuario.component/cazadores/cazadores.component';
import { MercadoCazaComponent } from './component/cazarecompensas.component/mercado-caza/mercado-caza.component';
import { GananciasComponent } from './component/cazarecompensas.component/ganancias/ganancias.component';
import { MisTrabajosComponent } from './component/cazarecompensas.component/mis-trabajos/mis-trabajos.component';

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
      { path: 'bitacora', component: BitacoraComponent },
    ],
  },

  {
    path: 'usuario',
    component: LayoutComponent,
    data: { modo: 'NORMAL' },
    children: [
      { path: 'feed', redirectTo: 'misiones', pathMatch: 'full' },
      { path: 'misiones', component: MisionesComponent },
      { path: 'billetera', component: BilleteraComponent },
      { path: 'mi-perfil', component: MiPerfilComponent },
      { path: 'cazadores', component: CazadoresComponent },
    ],
  },

  {
    path: 'cazarrecompensas',
    component: LayoutComponent,
    data: { modo: 'CAZARRECOMPENSAS' },
    children: [
      { path: '', redirectTo: 'mercado', pathMatch: 'full' },
      { path: 'mercado', component: MercadoCazaComponent },
      { path: 'ganancias', component: GananciasComponent },
      { path: 'mi-perfil', component: MiPerfilComponent, data: { mostrarEspecialidades: true } },
      { path: 'trabajos', component: MisTrabajosComponent },
    ],
  },

  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
