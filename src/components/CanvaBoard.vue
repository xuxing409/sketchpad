<template>
  <div class="canvaWrap" @click="handleClearSelect">
    <base-board
      msg="几何画板"
      ref="boardDom"
      :onMouseChange="handleMouseChange"
    >
      <div class="shapeWrap">
        <div
          v-for="item in canvasBox.rect"
          :key="item.key"
          :class="['shape', 'rect', curSelect === item.key ? 'active' : '']"
          :style="{
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            height: item.style.height,
          }"
          :data-key="item.key"
          @dblclick.stop="handleSelected(item.key)"
        >
          <span v-if="curSelect === item.key" @click="handleDel(item.key)"
            >x</span
          >
        </div>
      </div>
    </base-board>
    <div class="toolbar">
      <div
        :class="['toolItem', curShape === 'rect' ? 'active' : '']"
        @click="handleShapeClick('rect')"
      >
        <svg width="20" height="16">
          <rect
            x="0"
            y="0"
            width="20"
            height="16"
            style="fill: transparent; stroke: #fff; stroke-width: 2"
          />
        </svg>
      </div>
      <div
        class="toolItem"
        :class="['toolItem', curShape === 'circle' ? 'active' : '']"
        @click="handleShapeClick('circle')"
      >
        <svg width="22" height="22">
          <circle
            cx="11"
            cy="11"
            r="10"
            stroke="#fff"
            stroke-width="1"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="toolItem"
        :class="['toolItem', curShape === 'line' ? 'active' : '']"
        @click="handleShapeClick('line')"
      >
        <svg width="22" height="22">
          <line
            x1="2"
            y1="2"
            x2="20"
            y2="20"
            style="stroke: rgb(255, 255, 255); stroke-width: 1"
          />
        </svg>
      </div>
      <div class="toolItem" :class="['toolItem']">
        <span>图层</span>
      </div>
      <div class="toolItem" :class="['toolItem']" @click="undo">
        <span>撤销</span>
      </div>
      <div class="toolItem" :class="['toolItem']" @click="redo">
        <span>重做</span>
      </div>
      <div class="toolItem" :class="['toolItem']" @click="handleClear">
        <span>清空</span>
      </div>
      <div class="toolItem" :class="['toolItem']">
        <span>下载</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseBoard from "./BaseBoard.vue";
import { ref, unref, onMounted, onUnmounted, watch, computed } from "vue";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import {
  generateRectangleMeta,
  generateCircleMeta,
  generateLineMeta,
  generateLinesMeta,
} from "../utils/math";
import { diff } from "../utils/tool";
// import { debounce, cloneDeep } from "xijs";

type shapeType = "rect" | "circle" | "line";

interface IBaseShapeProp {
  type: shapeType;
  key: string;
  style: any;
}

const curShape = ref<shapeType | "">("");
const boardDom = ref<any>(null);
const cardOffset = ref({
  x: 0,
  y: 0,
});
const mouseAbsPos = ref({
  x: 0,
  y: 0,
});
const curSelect = ref("");
let templateDot: any[] = [];

const canvasBox = ref<{ [key in shapeType]: IBaseShapeProp[] }>({
  rect: [],
  circle: [],
  line: [],
});

const recordManager = ref<any>({
  snapshots: [
    {
      rect: [],
      circle: [],
      line: [],
    },
  ],
  curIndex: 0,
  maxLimit: 50,
});

const handleShapeClick = (type: "circle" | "rect" | "line") => {
  curShape.value = type === curShape.value ? "" : type;
};

const handleMouseChange = (x: number, y: number) => {
  mouseAbsPos.value = { x, y };
  // 如果有选中的元素, 则判断为移动当前选中元素
  if (curSelect.value && templateDot.length) {
    const [x0, y0] = templateDot;
    canvasBox.value["rect"] = canvasBox.value["rect"].map((v) => {
      if (v.key === curSelect.value) {
        const { left, top } = v.style;
        templateDot = [x, y];
        return {
          ...v,
          style: {
            ...v.style,
            left: parseFloat(left) + (x - x0) + "px",
            top: parseFloat(top) + (y - y0) + "px",
          },
        };
      }
      return v;
    });
    return;
  }
  // 否则则生成元素
  const [a1, b1, key] = templateDot;
  if (curShape.value && templateDot.length) {
    let dx = x - a1;
    let dy = y - b1;
    let curIndex = canvasBox.value["rect"].findIndex((v) => v.key === key);
    if (curIndex > -1) {
      canvasBox.value["rect"][curIndex] = {
        ...canvasBox.value["rect"][curIndex],
        style: {
          left: (dx > 0 ? a1 : x) + "px",
          top: (dy > 0 ? b1 : y) + "px",
          width: Math.abs(dx) + "px",
          height: Math.abs(dy) + "px",
        },
      };
    }
  }
};

const handleMouseDown = () => {
  const { x, y } = mouseAbsPos.value;
  if (curShape.value) {
    templateDot = [x, y];
    if (!curSelect.value) {
      templateDot[2] = Date.now() + "";
      canvasBox.value["rect"].push({
        type: "rect",
        key: templateDot[2],
        style: {},
      });
    } else {
      // templateDot[2] = curSelect.value;
    }
  }
};

const handleMouseUp = () => {
  const { x, y } = mouseAbsPos.value;
  if (curShape.value) {
    // 1. 如果开始点和结束点一样,则不创建
    if (templateDot[0] === x && templateDot[1] === y) {
      canvasBox.value["rect"] = canvasBox.value["rect"].filter(
        (v) => v.key !== templateDot[2]
      );
      templateDot = [];
      return;
    }
  }
  // 重置
  templateDot = [];
};

const handleSelected = (key: string) => {
  curSelect.value = key;
};

const handleClearSelect = (e: any) => {
  if (e.target && e.target.getAttribute("data-key") !== curSelect.value) {
    curSelect.value = "";
  }
};

const handleDel = (key: string) => {
  canvasBox.value["rect"] = canvasBox.value["rect"].filter(
    (v) => v.key !== key
  );
  curSelect.value = "";
  templateDot = [];
};

const handleClear = () => {
  canvasBox.value["rect"] = [];
};

const undo = () => {
  // 撤销
  const { snapshots, maxLimit, curIndex } = recordManager.value;
  if (curIndex === 0) return;
  recordManager.value.curIndex--;
  //   canvasBox.value = cloneDeep(
  //     recordManager.value.snapshots[recordManager.value.curIndex]
  //   );
};

const redo = () => {
  // 重做
  const { snapshots, maxLimit, curIndex } = recordManager.value;
  if (curIndex >= snapshots.length - 1) {
    return;
  }
  recordManager.value.curIndex++;
  canvasBox.value = recordManager.value.snapshots[recordManager.value.curIndex];
};

const pushRecordFn = (
  state: { [key in shapeType]: IBaseShapeProp[] },
  prevState: { [key in shapeType]: IBaseShapeProp[] }
) => {
  const { snapshots, maxLimit, curIndex } = recordManager.value;
  // 如果两个状态相同, 则不推入历史记录
  if (!diff(state, snapshots[curIndex])) {
    return;
  }
  // 如果在撤销的过程中重新执行了新的操作, 则覆盖上一个状态
  if (snapshots.length - 1 !== curIndex) {
    snapshots.splice(curIndex + 1, snapshots.length);
  }
  // 超过了最大限制记录
  if (snapshots.length >= maxLimit) {
    snapshots.shift();
  }

  recordManager.value.snapshots.push(cloneDeep(state));
  recordManager.value.curIndex = recordManager.value.snapshots.length - 1;
};

watch(canvasBox, debounce(pushRecordFn, 300), { deep: true });

onMounted(() => {
  const board = boardDom?.value?.boardDom;
  const { offsetTop, offsetLeft } = board;
  cardOffset.value.x = offsetLeft;
  cardOffset.value.y = offsetTop;
  board.addEventListener("mousedown", handleMouseDown, false);
  board.addEventListener("mouseup", handleMouseUp, false);
});

onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.canvaWrap {
  position: relative;
  //   color: @primary;
  .toolbar {
    position: absolute;
    top: 70px;
    left: 16px;
    width: 42px;
    height: 546px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    .toolItem {
      height: 28px;
      margin: 4px 6px 6px;
      border-radius: 4px;
      background-color: rgb(87, 86, 86);
      text-align: center;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
      span {
        line-height: 28px;
      }
      &.active {
        background-color: rgb(144, 139, 139);
      }
      svg {
        vertical-align: middle;
      }
    }
  }
  .shapeWrap {
    .shape {
      position: absolute;
      border: 1px solid #646cff;
      background-color: transparent;
      &.active {
        border-width: 2px;
        cursor: move;
        span {
          position: absolute;
          right: -10px;
          top: -10px;
          user-select: none;
          width: 20px;
          height: 20px;
          text-align: center;
          line-height: 18px;
          border-radius: 50%;
          background-color: red;
          color: #fff;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
