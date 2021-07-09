export class ObservableNode {
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