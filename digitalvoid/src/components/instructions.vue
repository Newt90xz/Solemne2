<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  (e: 'go-back'): void
}>()

const handleBack = () => {
  emit('go-back')
}

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
  drops = Array.from({ length: Math.ceil(columns) }).fill(1) as number[]
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

  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00ff9c'
  ctx.font = `${fontSize}px monospace`

  for (let i = 0; i < drops.length; i++) {
    const text = letters.charAt(Math.floor(Math.random() * letters.length))
    ctx.fillText(text, i * fontSize, drops[i]! * fontSize)

    if (drops[i]! * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i] = drops[i]! + 1
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
  <section class="instructions-view">
    <canvas ref="canvasRef" class="matrix-canvas" />
    <div class="scanlines" />
    <div class="vignette" />

    <header class="hud-top">
      <div class="hud-box">
        <p>&gt; MODULO ABIERTO: MANUAL DEL VIRUS</p>
        <p>&gt; ESTADO: CONSULTA SEGURA</p>
      </div>
      <div class="hud-box compact">
        <p>USUARIO: VIRUS_23A</p>
        <p>NIVEL 1</p>
      </div>
    </header>

    <div class="title-wrap">
      <h1 class="title">MANUAL DEL VIRUS</h1>
      <p class="subtitle">PROTOCOLOS DE SUPERVIVENCIA EN DIGITAL VOID</p>
    </div>

    <div class="instructions-content">
      <article class="panel">
        <h2>Controles del jugador</h2>
        <ul>
          <li><strong>W / A / S / D</strong>: movimiento arriba, izquierda, abajo y derecha.</li>
          <li><strong>Click Izquierda</strong>: accion principal (ataque o habilidad, segun equipo).</li>
          <li><strong>Click Derecho</strong>: dash por unos segundos para esquivar amenazas.</li>
          <li><strong>F</strong>: interactuar con objetos y terminales.</li>
          <li><strong>Esc</strong>: pausar y abrir menu rapido.</li>
          <li><strong>1-5 / Q / E</strong>: accion principal (ataque o habilidad, segun equipo).</li>
        </ul>
      </article>

      <article class="panel">
        <h2>Lore del juego</h2>
        <p>
          Eres un virus tratando de escapar del sistema, mas conocido como
          <strong>Digital Void</strong>. Eres uno de los ultimos virus capaces de sobrevivir en este
          entorno hostil.
        </p>
        <p>
          Cada sector del vacio guarda secretos sobre el origen de la caida. Mientras avanzas,
          descubriras que no solo estas intentando salvarte: tambien reconstruyes tu identidad.
        </p>
      </article>
    </div>

    <div class="title-wrap" style="margin-top: 1.5rem;">
      <h2 class="title" style="font-size: clamp(1.8rem, 6vw, 3.5rem);">ENCICLOPEDIA DE ENEMIGOS</h2>
    </div>

    <div class="instructions-content">
      <article class="panel">
        <h3>Enemigos comunes</h3>
        <ul class="enemy-list">
          <li>
            <strong>Grunt</strong>: El enemigo basico. Se acerca al jugador y le causa 10 puntos de daño. Vida: 60 HP. Experiencia: 25.
          </li>
          <li>
            <strong>Runner</strong>: Enemigo rapido. Corre hacia el jugador y le causa 8 puntos de daño. Vida: 20 HP. Experiencia: 35.
          </li>
          <li>
            <strong>Tank</strong>: Enemigo resistente. Vida: 80 HP. Causa 15 puntos de daño. Experiencia: 50.
          </li>
          <li>
            <strong>Shooter</strong>: Enemigo que dispara proyectiles. Se mantiene a distancia. Vida: 40 HP. Causa 18 puntos de daño. Experiencia: 55.
          </li>
        </ul>
      </article>

      <article class="panel">
        <h3>Jefes</h3>
        <ul class="enemy-list">
          <li>
            <strong>McAffe</strong>: Aparece al matar 100 enemigos. Usa tornados de proyectiles y explosivos. Vida: 520 HP. Experiencia: 250.
          </li>
          <li>
            <strong>Norton</strong>: Aparece al matar 200 enemigos. Usa disparos relampagos y se teletransporta. Vida: 420 HP. Experiencia: 340.
          </li>
          <li>
            <strong>Windows Defender</strong>: Aparece al matar 300 enemigos. INMORTAL, debes escapar a la salida que aparece. ¡Su contacto causa muerte instantánea!
          </li>
        </ul>
      </article>
    </div>

    <footer class="instructions-footer">
      <button class="menu-button" @click="handleBack">&gt;_ VOLVER AL MENU</button>
    </footer>

    <div class="corner tl" />
    <div class="corner tr" />
    <div class="corner bl" />
    <div class="corner br" />
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.instructions-view {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  padding: 1.4rem 2rem;
  box-sizing: border-box;
  color: #7bffb5;
  font-family: 'Share Tech Mono', monospace;
}

.matrix-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: black;
  pointer-events: none;
}

.scanlines,
.vignette {
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
  z-index: 1;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.7) 100%);
}

.hud-top,
.title-wrap,
.instructions-content,
.instructions-footer,
.corner {
  z-index: 2;
}

.hud-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.hud-box {
  border: 1px solid rgba(50, 255, 150, 0.45);
  box-shadow: inset 0 0 18px rgba(0, 255, 136, 0.15);
  background: rgba(3, 20, 12, 0.5);
  padding: 0.7rem 1rem;
}

.hud-box p {
  margin: 0;
  line-height: 1.4;
}

.compact {
  min-width: 200px;
  text-align: right;
}

.title-wrap {
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(2.2rem, 7vw, 4.4rem);
  letter-spacing: 0.08em;
  color: #72ffad;
  text-shadow: 0 0 8px rgba(50, 255, 150, 0.8);
}

.subtitle {
  margin: 0.4rem 0 0;
  color: rgba(136, 255, 182, 0.95);
  letter-spacing: 0.06em;
}

.instructions-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.panel {
  border: 1px solid rgba(63, 255, 155, 0.35);
  background: rgba(0, 18, 8, 0.46);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.14);
  padding: 1rem;
}

.panel h2,
.panel h3 {
  margin-top: 0;
  color: #9affc5;
  letter-spacing: 0.04em;
}

.panel p,
.panel li {
  color: rgba(188, 255, 217, 0.9);
  line-height: 1.55;
}

.panel ul {
  margin: 0;
  padding-left: 1.2rem;
}

.enemy-list li {
  margin-bottom: 0.8rem;
}

.instructions-footer {
  display: flex;
  justify-content: flex-start;
}

.menu-button {
  text-align: left;
  padding: 0.72rem 1rem;
  font-size: 1.05rem;
  font-family: 'Share Tech Mono', monospace;
  color: #031e0f;
  background: linear-gradient(90deg, rgba(115, 255, 176, 0.95), rgba(62, 224, 135, 0.9));
  border: 1px solid rgba(112, 255, 178, 0.9);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 0 16px rgba(83, 255, 165, 0.6);
}

.menu-button:hover {
  filter: brightness(1.08);
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
  .instructions-view {
    padding: 1rem;
  }

  .hud-top {
    flex-direction: column;
  }

  .compact {
    text-align: left;
  }
}
</style>
