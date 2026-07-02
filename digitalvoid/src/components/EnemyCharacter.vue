<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import enemySpritesheet from '../assets/charactersprites/enemy_spritesheet.png'

interface Enemy {
  id: number
  x: number
  y: number
  size: number
  speed: number
  hp: number
  maxHp: number
  color: string
  type: 'grunt' | 'runner' | 'tank' | 'shooter' | 'mcaffe' | 'norton' | 'windows-defender'
  shootTimer?: number
  shootCooldown?: number
  tornadoTimer?: number
  tornadoCooldown?: number
  explosiveTimer?: number
  explosiveCooldown?: number
  lastHitBy?: 'host' | 'guest'
}

interface Props {
  enemy: Enemy
  camera: { x: number; y: number }
}

const props = defineProps<Props>()

const enemyStyle = computed(() => {
  const screenX = Math.round(props.enemy.x - props.camera.x - props.enemy.size / 2)
  const screenY = Math.round(props.enemy.y - props.camera.y - props.enemy.size / 2)

  const frameIndexByType: Record<Enemy['type'], number> = {
    grunt: 0,
    runner: 1,
    tank: 2,
    shooter: 3,
    mcaffe: 0,
    norton: 1,
    'windows-defender': 2,
  }

  const frameIndex = frameIndexByType[props.enemy.type] ?? 0
  const frameSize = props.enemy.size

  return {
    width: `${frameSize}px`,
    height: `${frameSize}px`,
    transform: `translate(${screenX}px, ${screenY}px)`,
    backgroundImage: `url(${enemySpritesheet})`,
    backgroundSize: `${frameSize * 4}px ${frameSize}px`,
    backgroundPosition: `-${frameIndex * frameSize}px 0px`,
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    imageRendering: 'pixelated',
    borderRadius: '0px',
    zIndex: 7,
  } as CSSProperties
})
</script>

<template>
  <div class="enemy" :class="`enemy-${enemy.type}`" :style="enemyStyle"></div>
</template>

<style scoped>
.enemy {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}

.enemy-mcaffe {
  filter: saturate(1.15);
}
</style>
