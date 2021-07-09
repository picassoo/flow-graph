<template>
  <div>
    <canvas ref="canvas" class="graph-canvas"></canvas>
    <!-- <canvas ref="output" class="output-canvas"></canvas> -->
  </div>
</template>

<script>
/* eslint-disable */
import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";
import uuid4 from "uuid";
import "litegraph.js/css/litegraph.css";

export default {
  name: "HelloWorld",

  data() {
    return {
      outputContext: null,
      context: null,
      graph: null,
      lGraphCanvas: null
    };
  },
  /* eslint-disable */
  mounted() {
    const that = this;
    window.addEventListener("resize", this.resize);

    const { canvas } = this.$refs;
    this.context = canvas.getContext("2d");
    this.resize();

    const output = document.createElement("canvas");
    const outputContext = (this.outputContext = output.getContext("2d"));

    const bufferCanvas = document.createElement("canvas");
    const bufferContext = bufferCanvas.getContext("2d");

    this.graph = new LGraph();
    this.lGraphCanvas = new LGraphCanvas(canvas, this.graph);
    this.graph.start();

    this.createNode("modV/visualInput", {
      title: "Visual Input",
      outputs: {
        context: "renderContext"
      },
      onExecute() {
        if (
          this.outputs[0] &&
          this.outputs[0].links &&
          !this.outputs[0].links.length
        ) {
          return;
        }

        this.setOutputData(0, {
          canvas: bufferCanvas,
          context: bufferContext,
          delta: Date.now()
        });
      }
    });

    this.createNode("modV/visualOutput", {
      title: "Visual Output",
      inputs: {
        context: "renderContext"
      },
      onExecute() {
        const renderContext = this.getInputData(0);
        if (!renderContext) {
          return;
        }
        outputContext.clearRect(0, 0, output.width, output.height);
        outputContext.drawImage(renderContext.canvas, 0, 0);
      }
    });

    this.createNode("modV/contextSplitter", {
      title: "Context Splitter",
      inputs: {
        context: "renderContext"
      },
      outputs: {
        canvas: "canvas",
        canvasContext: "canvasContext",
        delta: "number"
      },
      onExecute() {
        const renderContext = this.getInputData(0);
        if (!renderContext) return;

        const { canvas, context, delta } = renderContext;

        this.setOutputData(0, canvas);
        this.setOutputData(1, context);
        this.setOutputData(2, delta);
      }
    });

    this.createNode("modV/visualMonitor", {
      title: "Visual Monitor",
      inputs: {
        context: "renderContext"
      },
      size: [300, 200],
      onExecute() {
        this._renderContext = this.getInputData(0);
        this.setDirtyCanvas(true, false);
      },
      onDrawForeground(nodeContext) {
        const [width, height] = this.size;
        const { _renderContext: rCtx } = this;
        if (!rCtx) return;

        const { canvas } = rCtx;
        nodeContext.drawImage(canvas, 0, 0, width, height);
      }
    });

    this.createNode("modV/contextJoiner", {
      title: "Context Joiner",
      inputs: {
        canvas: "canvas",
        canvasContext: "canvasContext",
        delta: "number"
      },
      outputs: {
        context: "renderContext"
      },
      onExecute() {
        const canvas = this.getInputData(0);
        const context = this.getInputData(1);
        const delta = this.getInputData(2);

        this.setOutputData(0, { canvas, context, delta });
      }
    });

    this.createNode("modV/modules/circle", {
      title: "Circle",
      inputs: {
        context: "renderContext",
        circleSize: "number"
      },
      outputs: {
        context: "renderContext"
      },
      onExecute() {
        const renderContext = this.getInputData(0);
        const circleSize = this.getInputData(1) || 1;

        if (
          renderContext &&
          this.outputs[0] &&
          this.outputs[0].links &&
          this.outputs[0].links.length
        ) {
          const { canvas, context, delta } = renderContext;
          const { width, height } = canvas;
          const newSize = circleSize * (2 + Math.sin(delta / 1000) * 1.1);

          context.strokeStyle = context.fillStyle = "rgba(0,0,0,0.001)";
          context.fillRect(0, 0, width, height);
          context.strokeStyle = context.fillStyle = `hsl(${delta /
            40}, 80%, 50%)`;
          context.beginPath();
          context.arc(width / 2, height / 2, newSize, 0, Math.PI * 2);
          // context.closePath();
          context.stroke();
        }

        this.setOutputData(0, renderContext);
      }
    });

    this.createNode("modV/modules/squishy", {
      title: "Squishy",
      inputs: {
        context: "renderContext"
      },
      outputs: {
        context: "renderContext"
      },
      onExecute() {
        const renderContext = this.getInputData(0);

        if (
          renderContext &&
          this.outputs[0] &&
          this.outputs[0].links &&
          this.outputs[0].links.length
        ) {
          const { canvas, context, delta } = renderContext;
          const { width, height } = canvas;
          context.drawImage(
            canvas,
            Math.cos(delta / 900) * 5 + Math.cos(delta / 100),
            Math.sin(delta / 5000 + 5 * Math.sin(delta / 500)) * 10 -
              Math.cos(delta / 500),
            width + 20 * Math.sin(delta / 800),
            height + 20 * Math.cos(delta / 600 + 2 * Math.sin(delta / 500))
          );
        }

        this.setOutputData(0, renderContext);
      }
    });

    this.createNode("modV/modules/blockColor", {
      title: "Block Colour",
      inputs: {
        context: "renderContext",
        r: "number",
        g: "number",
        b: "number",
        a: "number"
      },
      outputs: {
        context: "renderContext"
      },
      onExecute() {
        const renderContext = this.getInputData(0);
        const r = this.getInputData(1);
        const g = this.getInputData(2);
        const b = this.getInputData(3);
        const a = this.getInputData(4);

        if (
          renderContext &&
          this.outputs[0] &&
          this.outputs[0].links &&
          this.outputs[0].links.length
        ) {
          const { canvas, context, delta } = renderContext;
          const { width, height } = canvas;
          context.fillStyle = `rgba(${r * 255},${g * 255},${b * 255},${a *
            255})`;
          context.fillRect(0, 0, width, height);
        }

        this.setOutputData(0, renderContext);
      }
    });
  },

  methods: {
    resize() {
      const { canvas } = this.$refs;
      const { devicePixelRatio: dpr } = window;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    },
    createNode(type, params) {
      const { inputs, outputs } = params;

      function node() {
        if (inputs) {
          Object.keys(inputs).forEach(key => this.addInput(key, inputs[key]));
        }

        if (outputs) {
          Object.keys(outputs).forEach(key =>
            this.addOutput(key, outputs[key])
          );
        }

        Object.keys(params).forEach(key => {
          if (key === "title" || key === "inputs" || key === "outputs") return;
          if (typeof params[key] === "function") return;

          this[key] = params[key];
        });
      }

      Object.keys(params).forEach(key => {
        if (key === "title" || key === "inputs" || key === "outputs") return;

        if (typeof params[key] === "function") {
          node.prototype[key] = params[key];
        }
      });

      if (params.title) {
        node.title = params.title;
      }

      LiteGraph.registerNodeType(type, node);
      return node;
    }
  }
};
</script>

<style>
canvas.graph-canvas {
  position: fixed;
  top: 0;
  left: 0;
}

canvas.output-canvas {
  position: fixed;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
</style>

