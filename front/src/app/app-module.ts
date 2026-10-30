import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InicioComponent } from './component/inicio.component/inicio.component';
import { RegistroComponent } from './component/registro.component/registro.component';
import { UsuarioComponent } from './component/usuario.component/usuario.component';
import { CazarecompensasComponent } from './component/cazarecompensas.component/cazarecompensas.component';
import { AdminComponent } from './component/admin.component/admin.component';
import { BilleteraComponent } from './component/usuario.component/billetera.component/billetera.component';
import { MiPerfilComponent } from './component/usuario.component/mi-perfil/mi-perfil.component';
import { FeedAdminComponent } from './component/admin.component/feed-admin.component/feed-admin.component';
import { ReportesComponent } from './component/admin.component/reportes/reportes.component';
import { GestionUsuariosComponent } from './component/admin.component/gestion-usuarios.component/gestion-usuarios.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { NotificacionComponent } from './component/navbar/notificacion/notificacion.component';
import { LayoutComponent } from './component/layout/layout.component';
import { CatalogosComponent } from './component/admin.component/catalogos/catalogos.component';
import { BitacoraComponent } from './component/admin.component/bitacora/bitacora.component';
import { CazadoresComponent } from './component/usuario.component/cazadores.component/cazadores.component';
import { MercadoCazaComponent } from './component/cazarecompensas.component/mercado-caza.component/mercado-caza.component';
import { GananciasComponent } from './component/cazarecompensas.component/ganancias.component/ganancias.component';
import { MisionesComponent } from './component/usuario.component/misiones/misiones.component';
import { MisTrabajosComponent } from './component/cazarecompensas.component/mis-trabajos.component/mis-trabajos.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    RegistroComponent,
    UsuarioComponent,
    CazarecompensasComponent,
    AdminComponent,
    BilleteraComponent,
    MiPerfilComponent,
    FeedAdminComponent,
    ReportesComponent,
    GestionUsuariosComponent,
    NavbarComponent,
    SidebarComponent,
    NotificacionComponent,
    LayoutComponent,
    CatalogosComponent,
    BitacoraComponent,
    CazadoresComponent,
    MercadoCazaComponent,
    GananciasComponent,
    MisionesComponent,
    MisTrabajosComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, CommonModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent],
})
export class AppModule {}
