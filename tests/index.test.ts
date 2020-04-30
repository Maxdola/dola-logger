import LoggerGroup from "../src/LoggerGroup";

const lg = new LoggerGroup("System", {color: "red"});
const ml = lg.createLogger("main");

setInterval(() => {

    ml.debug("String: Hello a");
    ml.info("Number: ", 1337);
    ml.warn("Array: ", [1,3,3,7]);
    ml.error("Object: ", {a: "b", d: {c: "e"}});

}, 5000);