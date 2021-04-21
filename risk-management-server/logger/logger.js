class Logger {
    constructor() {
      this.separator = "|";
      this.methodStart = "METHOD START";
      this.methodEnd = "METHOD END";
    }
  
    info(methodName, message) {
      console.log(
        "INFO" +
          this.separator +
          methodName +
          this.separator +
          message +
          this.separator
      );
    }
  
    error(methodName, exception) {
      console.log(
        "ERROR" +
          this.separator +
          methodName +
          this.separator +
          exception +
          this.separator
      );
    }
  }
  
  module.exports = Logger;
  