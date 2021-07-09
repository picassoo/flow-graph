<template>
  <div>
    <h1>CircleCI Configuration Creator</h1>
    <p>right click for context menu</p>
    <div class="controls">
      <button @click="addNode('circleci/workflow')">Workflow</button>
      <button @click="addNode('circleci/job')">Job</button>
      <button @click="addNode('circleci/executor')">Executor</button>
      <button @click="addNode('circleci/checkout')">Checkout</button>
      <button @click="process()">Generate</button>
    </div>
    <div class="app">
      <canvas id="mycanvas" height="500" width="1000"></canvas>
      <pre><code id="config">{ version:2.1, workflows:{},  jobs:{}}</code></pre>
    </div>
  </div>
</template>

<script>
import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";

export default {
   data() {
    return {
      graph: null,
      canvas: null,
    };
  },
  methods: {
    process() {
      let workflows = this.graph.findNodesByType("circleci/workflow");
      let config = "";
      workflows.forEach(workflow => {
        config += JSON.stringify(workflow.getOutputData(0), null, 2) + "\n";
      });
      document.getElementById("config").innerHTML = config;
    },
    addNode(node){
      this.graph.add(LiteGraph.createNode(node));
    }
  },
  mounted() {
    let baseConfig = { version: 2.1, workflows: {}, jobs: {} };

    function WorkflowNode() {
      this.addInput("Job 1", "job");
      this.addOutput("Workflow", "workflow");
      this.addProperty("Name", "build");
      this.widget = this.addWidget("text", "Name", "build", "Name");
    }
    WorkflowNode.title = "Workflow";
    WorkflowNode.prototype.onExecute = function() {
      let inputs = this.inputs;
      if (this.getInputData(inputs.length - 1) != undefined) {
        this.addInput(`Job ${inputs.length + 1}`, "job");
      }
      let thisWorkflowConfig = baseConfig;
      thisWorkflowConfig["workflows"][this.getInputOrProperty("Name")] = {};
      for (let i = 0; i < inputs.length; i++) {
        let val = this.getInputData(i);
        for (var y in val) {
          thisWorkflowConfig["jobs"][y] = val[y];
          if (
            !thisWorkflowConfig["workflows"][this.getInputOrProperty("Name")][
              "jobs"
            ]
          ) {
            thisWorkflowConfig["workflows"][this.getInputOrProperty("Name")][
              "jobs"
            ] = [];
          }
          thisWorkflowConfig["workflows"][this.getInputOrProperty("Name")][
            "jobs"
          ].push(y);
        }
      }
      this.setOutputData(0, thisWorkflowConfig);
    };
    LiteGraph.registerNodeType("circleci/workflow", WorkflowNode);

    // Job node.
    function JobNode() {
      this.addInput("Executor", "executor");
      this.addProperty("Name", "build");
      this.widget = this.addWidget("text", "Name", "build", "Name");
      this.addInput("Step 1", "step");
      this.addOutput("Job", "job");
    }
    JobNode.title = "Job";
    JobNode.prototype.onExecute = function() {
      let inputs = this.inputs;
      // Step inputs start @ 1.
      if (this.getInputData(inputs.length - 1) != undefined) {
        this.addInput(`Step ${inputs.length}`, "step");
      }
      let exec = this.getInputData(0);
      let jobStruct = { [this.getInputOrProperty("Name")]: { steps: [] } };
      for (var v in exec) {
        jobStruct[this.getInputOrProperty("Name")][v] = exec[v];
      }
      if (this.getInputData(1)) {
        for (let i = 1; i < inputs.length - 1; i++) {
          let val = this.getInputData(i);
          if (typeof val == "object") {
            for (var j in val) {
              jobStruct[this.getInputOrProperty("Name")]["steps"].push({
                [j]: val[j]
              });
            }
          } else {
            jobStruct[this.getInputOrProperty("Name")]["steps"].push(val);
          }
        }
      }
      this.setOutputData(0, jobStruct);
    };
    LiteGraph.registerNodeType("circleci/job", JobNode);

    // Checkout node.
    function CheckoutNode() {
      this.addProperty("Command", "checkout");
      this.addOutput("Step", "step");
    }
    CheckoutNode.title = "Checkout";
    CheckoutNode.prototype.onExecute = function() {
      this.setOutputData(0, this.getInputOrProperty("Command"));
    };
    LiteGraph.registerNodeType("circleci/checkout", CheckoutNode);

    // Step node.
    function StepNode() {
      this.addProperty("Run Command", "string");
      this.widget = this.addWidget("text", "Run Command", "", "Run Command");
      this.addOutput("Step", "step");
    }
    StepNode.title = "Run Command";
    StepNode.prototype.onExecute = function() {
      this.setOutputData(0, { run: this.getInputOrProperty("Run Command") });
    };

    LiteGraph.registerNodeType("circleci/run", StepNode);

    // Executor node.
    function ExecutorNode() {
      this.addProperty("Type", "executorType");
      this.widget = this.addWidget("text", "Type", "", "Type");
      this.addProperty("Image", "executorImagemage");
      this.widget = this.addWidget("text", "Image", "", "Image");
      this.addOutput("Executor", "executor");
    }
    ExecutorNode.title = "Executor";
    ExecutorNode.prototype.onExecute = function() {
      let execImg = this.getInputOrProperty("Image");
      let execType = this.getInputOrProperty("Type");

      let execObj = { [execType]: [{ image: execImg }] };
      this.setOutputData(0, execObj);
    };

    LiteGraph.registerNodeType("circleci/executor", ExecutorNode);

    // Actual graph.
    this.graph = new LGraph();

    this.canvas = new LGraphCanvas("#mycanvas", this.graph);
    this.graph.start();
    var ctx = document.getElementById("mycanvas").getContext("2d");
    ctx.canvas.width = window.innerWidth * 0.6;
    ctx.canvas.height = window.innerHeight * 0.8;
  }
};
</script>

<style>
body {
  font-family: sans-serif;
  width: 100%;
  height: 100%;
}

#mycanvas {
  border: 1px solid;
}

button {
  display: block;
  padding: 10px;
  font-size: 20px;
}

.controls {
  display: flex;
  justify-content: center;
}

.app {
  display: flex;
  justify-content: space-evenly;
}

pre {
  height: 100%;
  width: 30%;
  border: 1px solid black;
  border-radius: 3px;
  background-color: #fafafa;
  padding: 5px;
}
</style>