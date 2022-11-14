<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useMouse } from "../hooks/useMouse";
import {
  generateRectangleMeta,
  generateCircleMeta,
  generateLineMeta,
  generateLinesMeta,
} from "../utils/math";

defineProps<{ msg: string }>();

const isOutRectangle = ref(false);
const isOutCircle = ref(false);
const cardOffset = ref({ x: 0, y: 0 });

const rectangle = generateRectangleMeta([100, 100], 200, 100);

const circle = generateCircleMeta([200, 400], 100);

const line = generateLineMeta([
  [200, 400],
  [500, 400],
]);

const tringle = generateLinesMeta(
  [
    [400, 200],
    [600, 400],
    [300, 300],
  ],
  false
);

const { x, y } = useMouse(window, (x, y) => {
  const { x: x0, y: y0 } = cardOffset.value;
  const dotX = x - x0;
  const dotY = y - y0;
  const { startPos, endPos } = rectangle;
  if (
    startPos[0] <= dotX &&
    endPos[0] >= dotX &&
    startPos[1] <= dotY &&
    endPos[1] >= dotY
  ) {
    console.log("inset");
    isOutRectangle.value = false;
  } else {
    // console.log("out");
    isOutRectangle.value = true;
  }
});

useMouse(window, (x, y) => {
  const { x: x0, y: y0 } = cardOffset.value;
  const dotX = x - x0;
  const dotY = y - y0;
  const { pos, r } = circle;
  const r1 = Math.sqrt(Math.pow(dotX - pos[0], 2) + Math.pow(dotY - pos[1], 2));
  if (r >= r1) {
    console.log("inset");
    isOutCircle.value = false;
  } else {
    // console.log("out");
    isOutCircle.value = true;
  }
});

onMounted(() => {
  const { offsetTop, offsetLeft } = document.querySelector(
    "#boundCard"
  ) as HTMLElement;
  cardOffset.value.x = offsetLeft;
  cardOffset.value.y = offsetTop;
});

onUnmounted(() => {});
</script>

<template>
  <section>
    <h3>{{ msg }}</h3>
    <div class="card" id="boundCard">
      <div
        class="shape rectangle"
        :style="{
          left: rectangle.startPos[0] + 'px',
          top: rectangle.startPos[1] + 'px',
          width: rectangle.w + 'px',
          height: rectangle.h + 'px',
          backgroundColor: isOutRectangle ? '#fff' : '#646cff',
        }"
      ></div>

      <div
        class="shape circle"
        :style="{
          left: circle.startPos[0] + 'px',
          top: circle.startPos[1] + 'px',
          width: 2 * circle.r + 'px',
          height: 2 * circle.r + 'px',
          borderRadius: '50%',
          backgroundColor: isOutCircle ? '#fff' : '#646cff',
        }"
      ></div>

      <div
        class="line"
        :style="{
          width: line.l + 'px',
          left: line.startPos[0] + 'px',
          top: line.startPos[1] + 'px',
          transform: `rotate(${line.angle}deg)`,
        }"
      ></div>

      <div
        class="line"
        v-for="(line, i) in tringle"
        :key="i"
        :style="{
          width: line.l + 'px',
          left: line.startPos[0] + 'px',
          top: line.startPos[1] + 'px',
          transform: `rotate(${line.angle}deg)`,
        }"
      ></div>

      x: {{ x - cardOffset.x }} , y: {{ y - cardOffset.y }}
    </div>
  </section>
</template>

<style scoped>
section .card {
  position: relative;
  height: 480px;
  margin: 16px;
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  background-image: radial-gradient(rgba(9, 89, 194, 0.3) 6%, transparent 0),
    radial-gradient(#faf9f8 6%, transparent 0);
  background-size: 10px 10px;
  background-position: 0 0, 2px 2px;
}

.card .shape {
  position: absolute;
  border: 1px solid #646cff;
  background-color: #fff;
}

.card .line {
  position: absolute;
  height: 1px;
  background-color: #646cff;
  transform-origin: 0;
}
</style>
