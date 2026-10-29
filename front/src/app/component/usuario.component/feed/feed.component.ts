import { Component } from '@angular/core';

interface Post {
  alias: string;
  initials: string;
  time: string;
  text: string;
  tags: string[];
  reactions: number;
  comments: number;
  tone: 'cyan' | 'pink' | 'amber';
  liked?: boolean;
}

interface Hunter {
  alias: string;
  initials: string;
  zone: string;
  specialty: string;
  rating: string;
  jobs: number;
  match: number;
  tone: 'cyan' | 'pink' | 'amber';
}

@Component({
  selector: 'app-feed',
  standalone: false,
  styleUrl: './feed.component.css',
  templateUrl: './feed.component.html',
})
export class FeedComponent {
  // Datos de ejemplo: reemplazar por el servicio cuando exista el back
  readonly miAlias = 'AXIOM_47';
  readonly miIniciales = 'AX';
  readonly stars: number[] = [1, 2, 3, 4, 5];
  readonly motivos: string[] = ['Contenido inapropiado', 'Fraude o engaño', 'Suplantación'];

  posts: Post[] = [
    { alias: 'KIRA_09', initials: 'K9', time: 'HACE 12 MIN', text: 'Perdí un cargamento cerca del anillo industrial. Ya publiqué la misión; necesito a alguien que conozca los accesos del sector.', tags: ['#RECUPERACIÓN', '#INDUSTRIAL'], reactions: 28, comments: 6, tone: 'amber' },
    { alias: 'VANTA_K', initials: 'VK', time: 'HACE 34 MIN', text: 'Trabajo cerrado en Distrito Centro. Pago liberado y cliente a salvo. La reputación siempre deja rastro.', tags: ['#MISIÓN_CERRADA', '#PROTECCIÓN'], reactions: 84, comments: 12, tone: 'cyan' },
  ];

  hunters: Hunter[] = [
    { alias: 'VANTA_K', initials: 'VK', zone: 'Distrito Centro', specialty: 'Recuperación', rating: '4.9', jobs: 87, match: 98, tone: 'cyan' },
    { alias: 'RØNIN_X', initials: 'RX', zone: 'Puerto', specialty: 'Protección', rating: '4.8', jobs: 72, match: 92, tone: 'pink' },
    { alias: 'NIGHTMARE', initials: 'NM', zone: 'Zona industrial', specialty: 'Rastreo', rating: '4.7', jobs: 64, match: 89, tone: 'amber' },
  ];

  selectedHunter = '';
  reportOpen = false;
  toast = '';

  // ---------- Publicar ----------
  agregarEtiqueta(area: HTMLTextAreaElement): void {
    const separador = area.value && !area.value.endsWith(' ') ? ' ' : '';
    area.value += `${separador}#`;
    area.focus();
  }

  publicar(event: Event, area: HTMLTextAreaElement): void {
    event.preventDefault();
    const original = area.value.trim();
    if (!original) return;

    const regex = /#[\wÁÉÍÓÚÑáéíóúñ]+/g;
    const tags = (original.match(regex) ?? []).map((t) => t.toUpperCase());
    const text = original.replace(regex, '').replace(/\s{2,}/g, ' ').trim() || original;

    this.posts = [
      { alias: this.miAlias, initials: this.miIniciales, time: 'AHORA', text, tags, reactions: 0, comments: 0, tone: 'cyan' },
      ...this.posts,
    ];
    area.value = '';
    this.notify('Publicación enviada a la red');
  }

  // ---------- Interacciones ----------
  reaccionar(post: Post): void {
    post.liked = !post.liked;
    post.reactions += post.liked ? 1 : -1;
    if (post.liked) this.notify('Reacción registrada');
  }

  comentar(event: Event, post: Post, input: HTMLInputElement): void {
    event.preventDefault();
    if (!input.value.trim()) return;
    post.comments += 1;
    input.value = '';
    this.notify('Comentario añadido');
  }

  // ---------- Reporte ----------
  abrirReporte(): void {
    this.reportOpen = true;
  }

  cerrarReporte(): void {
    this.reportOpen = false;
  }

  enviarReporte(event: Event): void {
    event.preventDefault();
    this.reportOpen = false;
    this.notify('Reporte enviado a moderación');
  }

  private notify(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2800);
  }
}
