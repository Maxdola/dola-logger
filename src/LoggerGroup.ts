import "./format"
import Logger from "./Logger";
import moment from "moment";
import fs from "fs";
import {defaultLogDir, addExitFunction} from "./ExitManager";
import {createFolder, createFolderSync} from "./DirectoryUtils";
import stripAnsi from "strip-ansi";
import Log from "./Log";
import {LoggerOptions} from "./LoggerTypes";

const fileDateFormat = "YYYYDDMM_kkmmss";

export default class LoggerGroup {

    private readonly startTime: number;
    private endTime : number;
    private previousLogFile : string;

    private loggerTask;

    private loggers: Logger[] = [];
    private logs: Log[] = [];

    constructor(private name : string, private loggerOptions? : LoggerOptions) {
        this.startTime = Date.now();

        if (loggerOptions) {
            if (loggerOptions.saveOnExit) {
                addExitFunction(() => {
                    const name = this.saveToFileSync();
                    _log(`Saved loggerGroup ${this.name} to ${name}`);
                    if (this.loggerTask) {
                        clearInterval(this.loggerTask);
                    }
                });
            }
            if (loggerOptions.savePeriodically) {
                const interval = loggerOptions.saveInterval ? loggerOptions.saveInterval : 1000 * 100;
                _log(`Saving LoggerGroup ${this.name} every ${interval / 1000}s`);
                this.loggerTask = setInterval(() => {
                    this.saveToFile().then(name => {
                        _log(`Saved loggerGroup ${this.name} to ${name}`);
                    });
                }, interval);
            }
        }
    }

    createLogger(name : string, loggerOptions? : LoggerOptions) : Logger {
        const logger = new Logger(name, this.loggerOptions.color ? {value: this.name, color: this.loggerOptions.color} : this.name, {...loggerOptions, groupSave: this.loggerOptions.saveOnExit || this.loggerOptions.savePeriodically});
        this.loggers.push(logger);
        return logger;
    }

    getLogger(name: string) : Logger | null {
        return this.loggers.find(lg => lg.name === name);
    }

    getOrCreateLogger(name: string) : Logger {
        let logger = this.getLogger(name);
        if (logger) {
            return logger;
        }
        logger = new Logger(name, this.loggerOptions.color ? {value: this.name, color: this.loggerOptions.color} : this.name, {groupSave: this.loggerOptions.saveOnExit || this.loggerOptions.savePeriodically});
        this.loggers.push(logger);
        return logger;
    }

    saveToFile() : Promise<String> {
        _log(`Saving loggerGroup ${this.name} async.`);
        return new Promise<String>(((resolve, reject) => {
            this.deletePreviousLog(false);
            createFolder(defaultLogDir).then(res => {
                const fileName = this.name.replace(/\s+/g,"-") + "_" + moment().format(fileDateFormat) + ".json";
                fs.writeFile(defaultLogDir + fileName, JSON.stringify(this.toObject(), undefined, 2), err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(fileName);
                        this.previousLogFile = fileName;
                    }
                });
            });
        }))
    }

    saveToFileSync() : string {
        _log(`Saving loggerGroup ${this.name} sync.`);
        this.deletePreviousLog(true);
        createFolderSync(defaultLogDir);
        const fileName = stripAnsi(this.name).replace(/\s+/g,"-") + "_" + moment().format(fileDateFormat) + ".json";
        fs.writeFileSync(defaultLogDir + fileName, JSON.stringify(this.toObject(), undefined, 2));
        this.previousLogFile = fileName;
        return fileName;
    }

    private deletePreviousLog(sync : boolean) : void {
        if (this.previousLogFile) {
            _log(`Deleting previous logFile ${this.previousLogFile}`);
            if (sync) {
                fs.unlinkSync(defaultLogDir + this.previousLogFile);
            } else {
                fs.unlink(defaultLogDir + this.previousLogFile, () => {});
            }
            this.previousLogFile = null;
        }
    }

    toObject() {
        return {
            startTime: this.startTime,
            endTime: this.endTime,
            name: this.name,
            loggers: this.loggers.map(lg => lg.toObject()),
        }
    }

}

export const systemLoggerGroup = new LoggerGroup("System", {saveOnExit: false, color: "red"});
export const mainLogger = systemLoggerGroup.createLogger("main", {color: "red"});
let logger = systemLoggerGroup ? systemLoggerGroup.getOrCreateLogger("Logger Manager") : null;

const _log = (object : any) : void => {
    if (!logger && systemLoggerGroup) {
        logger = systemLoggerGroup.getOrCreateLogger("Logger Manager");
    }
    if (logger) {
        logger.debug(object);
    }
}
