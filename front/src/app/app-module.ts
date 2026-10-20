import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InicioComponent } from './component/inicio.component/inicio.component';
import { RegistroComponent } from './component/registro.component/registro.component';
import { FeedComponent } from './component/usuario.component/feed.component/feed.component';
import { UsuarioComponent } from './component/usuario.component/usuario.component';
import { CazarecompensasComponent } from './component/cazarecompensas.component/cazarecompensas.component';
import { AdminComponent } from './component/admin.component/admin.component';
import { NuevaMisionComponent } from './component/usuario.component/nueva-mision.component/nueva-mision.component';
import { MisMisionesComponent } from './component/usuario.component/mis-misiones.component/mis-misiones.component';
import { BilleteraComponent } from './component/usuario.component/billetera.component/billetera.component';
import { MiPerfilComponent } from './component/usuario.component/mi-perfil/mi-perfil.component';
import { FeedCazaComponent } from './component/cazarecompensas.component/feed-caza.component/feed-caza.component';
import { MisionesDisponiblesComponent } from './component/cazarecompensas.component/misiones-disponibles.component/misiones-disponibles.component';
import { MisMisionesCazaComponent } from './component/cazarecompensas.component/mis-misiones-caza.component/mis-misiones-caza.component';
import { MiCalificacionComponent } from './component/cazarecompensas.component/mi-calificacion.component/mi-calificacion.component';
import { FeedAdminComponent } from './component/admin.component/feed-admin.component/feed-admin.component';
import { ReportesComponent } from './component/admin.component/reportes/reportes.component';
import { GestionUsuariosComponent } from './component/admin.component/gestion-usuarios.component/gestion-usuarios.component';
import { DetalleMisionComponent } from './component/usuario.component/detalle-mision.component/detalle-mision.component';
import { DetalleMisionCazaComponent } from './component/cazarecompensas.component/detalle-mision-caza.component/detalle-mision-caza.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { NotificacionComponent } from './component/navbar/notificacion/notificacion.component';
import { LayoutComponent } from './component/layout/layout.component';
import { CatalogosComponent } from './component/admin.component/catalogos/catalogos.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    RegistroComponent,
    FeedComponent,
    UsuarioComponent,
    CazarecompensasComponent,
    AdminComponent,
    NuevaMisionComponent,
    MisMisionesComponent,
    BilleteraComponent,
    MiPerfilComponent,
    FeedCazaComponent,
    MisionesDisponiblesComponent,
    MisMisionesCazaComponent,
    MiCalificacionComponent,
    FeedAdminComponent,
    ReportesComponent,
    GestionUsuariosComponent,
    DetalleMisionComponent,
    DetalleMisionCazaComponent,
    NavbarComponent,
    SidebarComponent,
    NotificacionComponent,
    LayoutComponent,
    CatalogosComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, CommonModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent],
})
export class AppModule {}
