export class CustomMultNode {
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