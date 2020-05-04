import LoggerGroup from "../src/LoggerGroup";

const lg = new LoggerGroup("System", {color: "red"});
const logger = lg.createLogger("main");

logger.debug("String:", "Hello npm");
logger.info("Number: ", 1337);
logger.info("Numbers: ", 1, 3 ,3 ,7);
logger.warn("Array: ", [1,3,3,7]);
logger.error("Object: ", {a: "b", d: {c: "e"}});
