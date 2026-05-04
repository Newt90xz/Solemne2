<script setup lang="ts">
const emit = defineEmits<{
	(e: 'go-back'): void
}>()

const handleBack = () => {
	emit('go-back')
}
</script>

<template>
	<section class="instructions-view">
		<header class="instructions-header">
			<h1>Instrucciones</h1>
			<p>Aprende a sobrevivir en Digital Void.</p>
		</header>

		<div class="instructions-content">
			<article class="panel">
				<h2>Controles del jugador</h2>
				<ul>
					<li><strong>W / A / S / D</strong>: movimiento arriba, izquierda, abajo y derecha.</li>
					<li><strong>Shift</strong>: correr por unos segundos para esquivar amenazas.</li>
					<li><strong>E</strong>: interactuar con objetos y terminales.</li>
					<li><strong>Espacio</strong>: acción principal (ataque o habilidad, según equipo).</li>
					<li><strong>Esc</strong>: pausar y abrir menú rápido.</li>
				</ul>
			</article>

			<article class="panel">
				<h2>Lore del juego</h2>
				<p>
					Eres un virus tratando de escapar del sistema, mas conocido como  <strong>Digital Void</strong>. Eres uno de los últimos virus capaces
                    de sobrevivir en este entorno hostil, y tu misión es encontrar una forma de salir antes de que el sistema te elimine por completo.
				</p>
				<p>
					Cada sector del vacío guarda secretos sobre el origen de la caída. Mientras avanzas,
					descubrirás que no solo estás intentando salvar la ciudad: también estás reconstruyendo
					tu propia identidad.
				</p>
			</article>
		</div>

		<footer class="instructions-footer">
			<button class="back-button" @click="handleBack">Volver al menú</button>
		</footer>
	</section>
</template>

<style scoped>
.instructions-view {
	min-height: 100vh;
	width: 100%;
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 24px;
	background: radial-gradient(circle at 10% 10%, #17384f 0%, #0e1726 55%, #090d16 100%);
	color: #e8f7ff;
	box-sizing: border-box;
}

.instructions-header h1 {
	margin: 0;
	font-size: clamp(2rem, 4vw, 3rem);
	letter-spacing: 1px;
	color: #5be0ff;
}

.instructions-header p {
	margin: 8px 0 0;
	color: #bdd7e6;
}

.instructions-content {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 18px;
}

.panel {
	background: rgba(20, 40, 60, 0.7);
	border: 1px solid rgba(91, 224, 255, 0.3);
	border-radius: 14px;
	padding: 18px;
	backdrop-filter: blur(4px);
}

.panel h2 {
	margin-top: 0;
	color: #8becff;
}

.panel ul {
	margin: 0;
	padding-left: 20px;
	line-height: 1.55;
}

.panel p {
	margin-top: 0;
	line-height: 1.6;
	color: #d4ecf8;
}

.instructions-footer {
	margin-top: auto;
}

.back-button {
	padding: 12px 20px;
	border-radius: 8px;
	border: 1px solid #5be0ff;
	background: rgba(91, 224, 255, 0.12);
	color: #e8f7ff;
	cursor: pointer;
	font-weight: 700;
	letter-spacing: 0.5px;
	transition: all 0.2s ease;
}

.back-button:hover {
	transform: translateY(-1px);
	background: rgba(91, 224, 255, 0.25);
	box-shadow: 0 8px 20px rgba(91, 224, 255, 0.18);
}
</style>
