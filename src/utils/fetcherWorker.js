
export class MyClass {
    constructor(value = 1) {
      this.value = value;
    }
    increment() {
      this.value++;
    }
    // Tip: async functions make the interface identical
    async getValue() {
      return this.value;
    }
}