<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  (e: 'new-game'): void
  (e: 'open-instructions'): void
  (e: 'open-settings'): void
}>()

const handleNewGame = () => {
  emit('new-game')
}

const handleLoadGame = () => {
  emit('open-instructions')
}

const handleSettings = () => {
  emit('open-settings')
}

// Matrix background
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const fontSize = 16
let columns = 0
let drops: number[] = []
let animationInterval: number | null = null

function updateColumns() {
  const canvas = canvasRef.value
  if (!canvas) return
  columns = canvas.width / fontSize
  drops = Array.from({ length: Math.ceil(columns) }).fill(1)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00FF9C'
  ctx.font = `${fontSize}px monospace`

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)]
    ctx.fillText(text, i * fontSize, drops[i] * fontSize)

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i]++
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resizeCanvas()
  updateColumns()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('resize', updateColumns)
  animationInterval = window.setInterval(draw, 33)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('resize', updateColumns)
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
})
</script>

<template>
  <div class="main-menu">
    <canvas ref="canvasRef" class="matrix-canvas" />

    <div class="scanlines" />
    <div class="vignette" />

    <header class="hud-top">
      <div class="hud-box hud-left">
        <p>&gt; CONEXION ESTABLECIDA</p>
        <p>&gt; SISTEMA OBJETIVO: DESCONOCIDO</p>
        <p>&gt; PERMISOS: INVITADO</p>
        <p class="alert">&gt; ESTADO: AMENAZA DETECTADA</p>
      </div>
      <div class="hud-box hud-right">
        <p>USUARIO: VIRUS_23A</p>
        <div class="xp-line">
          <span>NIVEL 1</span>
          <span>0 / 100 XP</span>
        </div>
        <div class="xp-bar"><span /></div>
      </div>
    </header>

    <div class="title-container">
      <h1 class="title">DIGITAL VOID</h1>
      <p class="subtitle">INFECTATE. EVOLUCIONA. SOBREVIVE.</p>
    </div>

    <div class="menu-layout">
      <nav class="buttons-container">
        <button class="menu-button active" @click="handleNewGame">&gt;_ INICIAR INFECCION</button>
        <button class="menu-button" @click="handleLoadGame">&gt;_ MANUAL DEL VIRUS</button>
        <button class="menu-button" @click="handleSettings">&gt;_ AJUSTES DEL SISTEMA</button>
        <p class="menu-ghost">&gt;_ ESTADISTICAS</p>
        <p class="menu-ghost">&gt;_ DESCONECTAR</p>
      </nav>

      <section class="symbol-panel" aria-hidden="true">
        <div class="circle">
          <span>☣</span>
        </div>
      </section>
    </div>

    <footer class="hud-bottom">
      <div class="hud-box tip-box">
        <p>&gt; CONSEJO: MUEVETE CONSTANTEMENTE.</p>
        <p>EL SISTEMA SIEMPRE TE SIGUE.</p>
      </div>
      <div class="hud-box firewall-box">
        <p>FIREWALL PROXIMO</p>
        <div class="progress"><span /></div>
        <p>ESCAPA. NO PUEDES DERROTARLO.</p>
      </div>
    </footer>

    <div class="corner tl" />
    <div class="corner tr" />
    <div class="corner bl" />
    <div class="corner br" />
    <div class="grid-floor" />
    <div class="ambient-glow" />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

:global(body) {
  font-family: 'Share Tech Mono', monospace;
}

.main-menu {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  background: transparent;
  padding: 0;
  position: relative;
  overflow: hidden;
  color: #33ff99;
}

.matrix-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: black;
}

.scanlines,
.vignette,
.ambient-glow,
.grid-floor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scanlines {
  z-index: 1;
  background: repeating-linear-gradient(
    to bottom,
    rgba(40, 255, 145, 0.04) 0,
    rgba(40, 255, 145, 0.04) 1px,
    transparent 1px,
    transparent 4px
  );
}

.vignette {
  z-index: 2;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.68) 100%);
}

.ambient-glow {
  z-index: 2;
  background: radial-gradient(circle at 50% 35%, rgba(30, 255, 138, 0.22), transparent 60%);
}

.grid-floor {
  z-index: 1;
  top: 58%;
  height: 42%;
  background:
    linear-gradient(to top, rgba(0, 255, 136, 0.2), transparent 60%),
    repeating-linear-gradient(
      to right,
      rgba(0, 255, 136, 0.12) 0,
      rgba(0, 255, 136, 0.12) 1px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(0, 255, 136, 0.09) 0,
      rgba(0, 255, 136, 0.09) 1px,
      transparent 1px,
      transparent 34px
    );
  transform: perspective(420px) rotateX(62deg);
  transform-origin: top;
}

.hud-top,
.title-container,
.menu-layout,
.hud-bottom,
.corner {
  z-index: 3;
}

.hud-top {
  display: flex;
  justify-content: space-between;
  padding: 2rem 2.2rem 0;
}

.hud-box {
  border: 1px solid rgba(50, 255, 150, 0.45);
  box-shadow: 0 0 18px rgba(0, 255, 136, 0.15) inset;
  background: rgba(3, 20, 12, 0.5);
  backdrop-filter: blur(2px);
  padding: 0.8rem 1rem;
}

.hud-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  letter-spacing: 0.04em;
}

.hud-left {
  max-width: 360px;
}

.alert {
  color: #4dff8a;
  text-shadow: 0 0 8px rgba(77, 255, 138, 0.5);
}

.hud-right {
  min-width: 280px;
}

.xp-line {
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.xp-bar {
  margin-top: 0.5rem;
  border: 1px solid rgba(43, 255, 139, 0.55);
  height: 12px;
}

.xp-bar span {
  display: block;
  width: 10%;
  height: 100%;
  background: linear-gradient(90deg, #3dff9e, #13a85f);
}

.title-container {
  margin-top: 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: clamp(3rem, 11vw, 6.2rem);
  font-weight: bold;
  color: #72ffad;
  text-shadow:
    0 0 8px rgba(50, 255, 150, 0.8),
    0 0 30px rgba(30, 255, 129, 0.35);
  margin: 0;
  letter-spacing: 0.08em;
  line-height: 0.95;
  filter: contrast(120%);
}

.subtitle {
  margin: 0.75rem 0 0;
  font-size: clamp(1rem, 2.6vw, 2rem);
  letter-spacing: 0.09em;
  color: rgba(136, 255, 182, 0.95);
}

.menu-layout {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  padding: 1rem 2.2rem;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: min(480px, 92vw);
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.46);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.14);
  padding: 1.3rem;
}

.menu-button {
  text-align: left;
  padding: 0.72rem 0.9rem;
  font-size: clamp(1.2rem, 2.2vw, 1.9rem);
  font-family: 'Share Tech Mono', monospace;
  color: #7bffb5;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.menu-button:hover,
.menu-button.active {
  color: #031e0f;
  background: linear-gradient(90deg, rgba(115, 255, 176, 0.95), rgba(62, 224, 135, 0.9));
  border-color: rgba(112, 255, 178, 0.9);
  box-shadow: 0 0 16px rgba(83, 255, 165, 0.6);
}

.menu-button:active {
  transform: scale(0.99);
}

.menu-ghost {
  margin: 0.22rem 0 0;
  font-size: clamp(1.15rem, 2.1vw, 1.7rem);
  color: rgba(121, 255, 178, 0.88);
  letter-spacing: 0.05em;
}

.symbol-panel {
  flex: 1;
  min-height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle {
  width: min(34vw, 380px);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(76, 255, 155, 0.35);
  box-shadow:
    0 0 18px rgba(0, 255, 136, 0.2),
    inset 0 0 24px rgba(0, 255, 136, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(4rem, 10vw, 7rem);
  color: rgba(110, 255, 173, 0.84);
}

.hud-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 2.2rem 1.6rem;
  gap: 1.4rem;
}

.tip-box,
.firewall-box {
  min-height: 72px;
}

.tip-box {
  width: min(480px, 95vw);
}

.firewall-box {
  width: min(360px, 95vw);
}

.progress {
  margin: 0.45rem 0 0.5rem;
  height: 12px;
  border: 1px solid rgba(80, 255, 165, 0.55);
}

.progress span {
  display: block;
  width: 58%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #43ff9f 0,
    #43ff9f 6px,
    rgba(22, 126, 74, 0.9) 6px,
    rgba(22, 126, 74, 0.9) 10px
  );
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #46ff9f;
  border-style: solid;
  opacity: 0.8;
}

.tl {
  top: 1rem;
  left: 1rem;
  border-width: 2px 0 0 2px;
}

.tr {
  top: 1rem;
  right: 1rem;
  border-width: 2px 2px 0 0;
}

.bl {
  bottom: 1rem;
  left: 1rem;
  border-width: 0 0 2px 2px;
}

.br {
  right: 1rem;
  bottom: 1rem;
  border-width: 0 2px 2px 0;
}

@media (max-width: 900px) {
  .hud-top,
  .menu-layout,
  .hud-bottom {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .hud-top,
  .menu-layout,
  .hud-bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .symbol-panel {
    display: none;
  }

  .firewall-box,
  .tip-box,
  .hud-left,
  .hud-right,
  .buttons-container {
    width: 100%;
    max-width: none;
    min-width: 0;
  }
}
</style>
