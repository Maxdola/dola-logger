import path from "path";
import {ExitFunction} from "./LoggerTypes";

const exitFunctions : ExitFunction[] =  []

export const addExitFunction = (ef : ExitFunction) => {
    exitFunctions.push(ef);
}

export let defaultLogDir = path.join(process.cwd(), "logs") + "\\";
export const setLogDir = dirPath => {
    defaultLogDir = path.resolve(dirPath);
}