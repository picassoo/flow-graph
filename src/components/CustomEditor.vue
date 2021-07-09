<template>
  <div>
    <canvas ref="canvas" class="graph-canvas"></canvas>
    <!-- <canvas ref="output" class="output-canvas"></canvas> -->
  </div>
</template>

<script>
import { LiteGraph } from "litegraph.js";
// import CustomMultNode from "../class/CustomMultNode.js";
// import ObservableNode from "../class/ObservableNode.js";

export default {
  mounted() {
    class CustomMultNode {
      constructor() {
        this.title = "Multiplication";
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A*B", "number");
        this.properties = { precision: 0.1 };
      }

      onExecute() {
        let a = this.getInputData(0) || 0;
        let b = this.getInputData(1) || 0;

        this.setOutputData(0, a * b);
      }
    }
    class ObservableNode {
      constructor(mutator) {
        this.title = "ObservableNode";
        this.addInput("A", "number");
        this.addOutput("A", "number");
        this.properties = { precision: 0.1 };
        this.mutator = mutator;

        console.log("Created");
      }

      setMutator(callback) {
        this.mutator = callback;
      }

      onExecute() {
        let a = this.getInputData(0) || 0;
        if (this.mutator) this.mutator(a);
        this.setOutputData(0, a);
      }
    }
    LiteGraph.registerNodeType("custom/multiply", CustomMultNode);
    LiteGraph.registerNodeType("custom/observable", ObservableNode);

    var graph = new LiteGraph.LGraph();
    var canvas = new LiteGraph.LGraphCanvas("#graphDiv", graph);

    canvas.allow_searchbox = false;

    // canvas.prompt = (title, value, callback, event) => {
    //   return null;
    // };

    var nodeConstA = LiteGraph.createNode("basic/const");
    nodeConstA.pos = [200, 200];
    nodeConstA.setValue(4.5);
    graph.add(nodeConstA);

    var nodeConstB = LiteGraph.createNode("basic/const");
    nodeConstB.pos = [200, 300];
    nodeConstB.setValue(1.5);
    graph.add(nodeConstB);

    var nodeMult = LiteGraph.createNode("custom/multiply");
    nodeMult.pos = [500, 250];
    graph.add(nodeMult);

    nodeConstA.connect(0, nodeMult, 0);
    nodeConstB.connect(0, nodeMult, 1);

    var nodeWatch = LiteGraph.createNode("basic/watch");
    nodeWatch.pos = [700, 250];
    graph.add(nodeWatch);

    var nodeObserve = LiteGraph.createNode("custom/observable");
    // nodeObserve.setMutator(value => {
    //   results = value;
    // });
    nodeObserve.pos = [700, 350];
    graph.add(nodeObserve);

    nodeMult.connect(0, nodeWatch, 0);
    nodeMult.connect(0, nodeObserve, 0);

    graph.start();
    return graph;
  }
};
</script>

<style>
</style>