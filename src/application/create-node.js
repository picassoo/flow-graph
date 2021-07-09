export default function createNode(type, params) {
    const { inputs, outputs } = params;
  
    function node() {
      if (inputs) {
        Object.keys(inputs).forEach(key => this.addInput(key, inputs[key]));
      }
  
      if (outputs) {
        Object.keys(outputs).forEach(key => this.addOutput(key, outputs[key]));
      }
  
      Object.keys(params).forEach(key => {
        if (key === 'title' || key === 'inputs' || key === 'outputs') return;
        if (typeof params[key] === 'function') return;
  
        this[key] = params[key];
      });
    }
  
    Object.keys(params).forEach(key => {
      if (key === 'title' || key === 'inputs' || key === 'outputs') return;
  
      if (typeof params[key] === 'function') {
        node.prototype[key] = params[key];
      }
    });
  
    if (params.title) {
      node.title = params.title;
    }
  
    LiteGraph.registerNodeType(type, node);
    return node;
  }
  