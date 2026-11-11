import { Injectable } from '@angular/core';

const CLAVE = 'bountyline.zonas.imagenes.v1';
const FOTOS_MISION = [
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=520',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85&sat=-35',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85'
];

@Injectable({ providedIn: 'root' })
export class ZonaImagenService {
  obtener(idZona: number | null | undefined, idMision: number): string {
    const personalizada = idZona == null ? null : this.leer()[String(idZona)];
    if (personalizada) return personalizada;
    const indice = Math.abs(((idZona ?? 0) * 31 + idMision) % FOTOS_MISION.length);
    return FOTOS_MISION[indice];
  }

  obtenerPersonalizada(idZona: number): string {
    return this.leer()[String(idZona)] ?? '';
  }

  guardar(idZona: number, url: string): void {
    const imagenes = this.leer();
    if (url) imagenes[String(idZona)] = url;
    else delete imagenes[String(idZona)];
    try {
      localStorage.setItem(CLAVE, JSON.stringify(imagenes));
    } catch {
      // El catálogo sigue funcionando aunque el navegador bloquee el almacenamiento local.
    }
  }

  private leer(): Record<string, string> {
    try {
      const valor = localStorage.getItem(CLAVE);
      return valor ? JSON.parse(valor) as Record<string, string> : {};
    } catch {
      return {};
    }
  }
}
