// Scroll story for /dino. One requestAnimationFrame loop, running only while the track is on screen, reads scrollY once
// per frame and writes only opacity, transform and CSS custom properties. Layout values are cached on load and resize.

const ANIMATED_CLASS = 'story--animated';
const SCENE_COUNT = 6;
/** Half-width of the cross-fade at each scene boundary, in scenes. */
const FADE = 0.12;
const TEXT_SLIDE_PX = 44;

interface Layout {
  trackTop: number;
  range: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** 0 before `from`, 1 after `to`, linear in between. */
function ramp(value: number, from: number, to: number): number {
  return clamp01((value - from) / (to - from));
}

/** Opacity of scene `index` when the story is `position` scenes in (0..6). */
function sceneOpacity(index: number, position: number): number {
  const fadeIn = index === 0 ? 1 : ramp(position, index - FADE, index + FADE);
  const fadeOut = index === SCENE_COUNT - 1 ? 1 : 1 - ramp(position, index + 1 - FADE, index + 1 + FADE);
  return Math.min(fadeIn, fadeOut);
}

function sceneEntering(index: number, position: number): number {
  return index === 0 ? 1 : ramp(position, index - FADE, index + FADE);
}

class Story {
  private readonly track: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly scenes: HTMLElement[];
  private readonly texts: HTMLElement[];
  private readonly bgs: HTMLElement[];
  private readonly dots: HTMLAnchorElement[];
  private readonly motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  private layout: Layout = { trackTop: 0, range: 1 };
  private frame = 0;
  private lastScroll = -1;
  private activeIndex = -1;
  private visible = false;
  private observers: { resize: ResizeObserver; intersect: IntersectionObserver } | null = null;

  constructor(track: HTMLElement) {
    this.track = track;
    this.stage = track.querySelector<HTMLElement>('[data-stage]')!;
    this.scenes = Array.from(track.querySelectorAll<HTMLElement>('[data-scene]'));
    this.texts = this.scenes.map((scene) => scene.querySelector<HTMLElement>('[data-text]')!);
    this.bgs = Array.from(track.querySelectorAll<HTMLElement>('[data-bg]'));
    this.dots = Array.from(track.querySelectorAll<HTMLAnchorElement>('[data-dot]'));
  }

  start(): void {
    this.motion.addEventListener('change', () => this.syncMode());
    this.dots.forEach((dot, index) => dot.addEventListener('click', (event) => this.onDotClick(event, index)));
    this.syncMode();
  }

  private isAnimated(): boolean {
    return document.documentElement.classList.contains(ANIMATED_CLASS);
  }

  private syncMode(): void {
    document.documentElement.classList.toggle(ANIMATED_CLASS, this.motion.matches);
    if (this.motion.matches) this.enable();
    else this.disable();
  }

  private enable(): void {
    if (this.observers) return;
    const resize = new ResizeObserver(() => this.measure());
    resize.observe(this.track);
    resize.observe(this.stage);
    const intersect = new IntersectionObserver(
      (entries) => this.setVisible(entries[entries.length - 1].isIntersecting),
      { rootMargin: '10% 0px' },
    );
    intersect.observe(this.track);
    this.observers = { resize, intersect };
    this.measure();
    this.lastScroll = -1;
    this.render(window.scrollY);
    if (import.meta.env.DEV) console.debug('[story] animated mode on');
  }

  private disable(): void {
    this.observers?.resize.disconnect();
    this.observers?.intersect.disconnect();
    this.observers = null;
    this.setVisible(false);
    this.clearInlineStyles();
    this.activeIndex = -1;
    if (import.meta.env.DEV) console.debug('[story] animated mode off (reduced motion)');
  }

  private measure(): void {
    // The stage pins `top` px below the viewport edge (under the sticky bar), so the story starts that much earlier.
    const pinTop = parseFloat(getComputedStyle(this.stage).top) || 0;
    this.layout = {
      trackTop: this.track.getBoundingClientRect().top + window.scrollY - pinTop,
      range: Math.max(1, this.track.offsetHeight - this.stage.offsetHeight),
    };
    this.lastScroll = -1;
  }

  private setVisible(visible: boolean): void {
    if (visible === this.visible) return;
    this.visible = visible;
    if (visible) this.loop();
    else cancelAnimationFrame(this.frame);
  }

  private loop = (): void => {
    const scroll = window.scrollY;
    if (scroll !== this.lastScroll) this.render(scroll);
    this.frame = requestAnimationFrame(this.loop);
  };

  private render(scroll: number): void {
    this.lastScroll = scroll;
    const progress = clamp01((scroll - this.layout.trackTop) / this.layout.range);
    const position = progress * SCENE_COUNT;
    this.scenes.forEach((scene, index) => this.renderScene(scene, index, position));
    this.bgs.forEach((bg, index) => {
      if (index > 0) bg.style.opacity = String(sceneEntering(index, position));
    });
    this.markActive(Math.min(SCENE_COUNT - 1, Math.floor(position)));
  }

  private renderScene(scene: HTMLElement, index: number, position: number): void {
    const opacity = sceneOpacity(index, position);
    scene.style.opacity = opacity.toFixed(3);
    if (opacity === 0) return;
    const local = clamp01(position - index);
    scene.style.setProperty('--sp', local.toFixed(4));
    const entering = sceneEntering(index, position);
    const leaving = index === SCENE_COUNT - 1 ? 1 : 1 - ramp(position, index + 1 - FADE, index + 1 + FADE);
    const slide = (1 - entering) * TEXT_SLIDE_PX - (1 - leaving) * (TEXT_SLIDE_PX / 2);
    this.texts[index].style.transform = `translate3d(${slide.toFixed(1)}px,0,0)`;
  }

  private markActive(index: number): void {
    if (index === this.activeIndex) return;
    this.activeIndex = index;
    this.dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  private onDotClick(event: MouseEvent, index: number): void {
    if (!this.isAnimated()) return;
    event.preventDefault();
    const target = this.layout.trackTop + ((index + 0.5) / SCENE_COUNT) * this.layout.range;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  private clearInlineStyles(): void {
    this.scenes.forEach((scene) => {
      scene.style.removeProperty('opacity');
      scene.style.removeProperty('--sp');
    });
    this.texts.forEach((text) => text.style.removeProperty('transform'));
    this.bgs.forEach((bg) => bg.style.removeProperty('opacity'));
    this.dots.forEach((dot) => dot.removeAttribute('aria-current'));
  }
}

const track = document.querySelector<HTMLElement>('[data-story]');
if (track) new Story(track).start();
