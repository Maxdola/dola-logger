import chalk from "chalk";
import moment from "moment";
import Log from "./Log";
import fs from "fs";
import {createFolder, createFolderSync} from "./DirectoryUtils";
import {defaultLogDir, addExitFunction} from "./ExitManager";
import {GroupPrefixOptions, LoggerOptions, LogLevel, SerializedLog} from "./LoggerTypes";
import {systemLoggerGroup} from "./LoggerGroup";

const fileDateFormat = "YYYYDDMM_kkmmss";
const groupFormat = "%15s";
const nameFormat = "%15s";

let logger = systemLoggerGroup ? systemLoggerGroup.getOrCreateLogger("Logger Manager") : null;

export default class Logger {

    private startTime: number;
    private endTime?: number;
    private previousLogFile : string;

    private readonly messagePrefix : string;
    private loggerTask;

    private _logs: Log[] = [];

    get logs() {
        return this._logs;
    }
    get name() {
        return this._name;
    }

    constructor(private _name : string, private groupPrefix?: string | GroupPrefixOptions, private loggerOptions? : LoggerOptions & {groupSave?: boolean}) {
        this.startTime = Date.now();
        this.messagePrefix = this.formatMessagePrefix();

        if (loggerOptions) {
            if (loggerOptions.saveOnExit) {
                addExitFunction(() => {
                    const name = this.saveToFileSync();
                    _log(`Saved Logger ${this.name} to ${name}`);
                    if (this.loggerTask) {
                        clearInterval(this.loggerTask);
                    }
                });
            }
            if (loggerOptions.savePeriodically) {
                const interval = loggerOptions.saveInterval ? loggerOptions.saveInterval : 1000 * 30;
                _log(`Saving Logger ${this.name} every ${interval / 1000}s`);
                this.loggerTask = setInterval(() => {
                    this.saveToFile().then(name => {
                        _log(`Saved Logger ${this.name} to ${name}`);
                    });
                }, interval);
            }
        }
    }

    end() {
        this.debug("Logger shutdown.")
        this.endTime = Date.now();
    }

    saveToFile() : Promise<String> {
        _log(`Saving Logger ${this.name} async.`);
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
        _log(`Saving Logger ${this.name} sync.`);
        this.deletePreviousLog(true);
        createFolderSync(defaultLogDir);
        const fileName = this.name.replace(/\s+/g,"-") + "_" + moment().format(fileDateFormat) + ".json";
        fs.writeFileSync(defaultLogDir + fileName, JSON.stringify(this.toObject(), undefined, 2));
        this.previousLogFile = fileName;
        return fileName;
    }

    private deletePreviousLog(sync : boolean) : void {
        if (this.previousLogFile) {
            logger.log(`Deleting previous logFile ${this.previousLogFile}`);
            if (sync) {
                fs.unlinkSync(defaultLogDir + this.previousLogFile);
            } else {
                fs.unlink(defaultLogDir + this.previousLogFile, () => {});
            }
            this.previousLogFile = null;
        }
    }

    toObject() : object {
        const logs : SerializedLog[] = this.logs.map(l => l.toObject());
        return {
            startTime: this.startTime,
            endTime: this.endTime,
            name: this.name,
            logs: logs,
            rawLogs: logs.map(l => l.message.colorStripped)
        }
    }

    private formatMessagePrefix() : string {
        const messagePrefix : string[] = [];
        //if (this.groupPrefix) messagePrefix.push(groupFormat.format(this.groupPrefix));
        if (this.groupPrefix) {
            if (typeof this.groupPrefix === "string") {
                messagePrefix.push(`[${groupFormat.format(this.groupPrefix)}]`);
            } else {
                this.groupPrefix = <GroupPrefixOptions> this.groupPrefix;
                messagePrefix.push(`[${chalk[this.groupPrefix.color](groupFormat.format(this.groupPrefix.value))}]`);
            }
        }
        //messagePrefix.push(chalk.blueBright(nameFormat.format(this.name)));
        if (this.loggerOptions && this.loggerOptions.color) {
            messagePrefix.push(chalk[this.loggerOptions.color](nameFormat.format(this.name)));
        } else {
            messagePrefix.push(chalk.blueBright(nameFormat.format(this.name)));
        }
        return messagePrefix.join(" ");
    }

    private createLog(message : any, logLevel = <LogLevel> "INFO") : Log {
        return new Log(message, logLevel, this.messagePrefix);
    }

    clearStack() {
        this._logs.splice(0, this._logs.length);
    }

    log(message : any, logLevel = <LogLevel> "INFO") : void {
        const log = this.createLog(message, logLevel);
        if (this.loggerOptions.savePeriodically || this.loggerOptions.saveOnExit || this.loggerOptions.groupSave) this._logs.push(log);
        console.log(log.formattedMessage);
    }

    info(...message : any) : void {
        this.log(message);
    }

    debug(...message : any) : void {
        this.log(message, "DEBUG");
    }

    warn(...message : any) : void {
        this.log(message, "WARN");
    }

    error(...message : any) : void {
        this.log(message, "ERROR");
    }

}

const _log = (object : any) : void => {
    if (!logger && systemLoggerGroup) {
        logger = systemLoggerGroup.getOrCreateLogger("Logger Manager");
    }
    if (logger) {
        logger.debug(object);
    }
}
