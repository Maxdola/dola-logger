import chalk from "chalk";
import moment from "moment";
import {type} from "os";
import {inspect} from "util";
import stripAnsi from "strip-ansi";
import {LogLevel, SerializedLog} from "./LoggerTypes";

const logDateFormat = "DD-MM-YYYY kk:mm:ss.SSS";
const levelFormat = "%-5s";

export default class Log {

    private timeStamp : number;
    public readonly formattedMessage : string;

    constructor(private rawMessage : any,
                private logLevel : LogLevel,
                private messagePrefix? : string) {
        this.timeStamp = Date.now();
        this.formattedMessage = this.format();
    }

    private format() : string {
        const message : string[] = [];
        message.push(chalk.gray.underline(moment().format(logDateFormat)));
        message.push(this.formatLevel());
        message.push((this.messagePrefix ? this.messagePrefix : "") + ":");
        message.push(this.rawMessageToString());
        return message.join(" ");
    }

    private rawMessageToString() : string {
        if (Array.isArray(this.rawMessage)) {
            const msgParts : string[] = [];
            this.rawMessage.forEach(raw => {
                const str =  typeof raw === 'object' ?
                    inspect(raw, false, null, true) :
                    typeof raw === 'number' ? chalk.yellow(raw) : raw;
                msgParts.push(str);
            })
            return msgParts.join(" ");
        } else {
            return typeof this.rawMessage === 'object' ?
                inspect(this.rawMessage, false, null, true) :
                this.rawMessage;
        }
    }

    private formatLevel() : string {
        switch (this.logLevel) {
            case "INFO":
                return chalk.cyan(levelFormat.format("INFO"));
            case "WARN":
                return chalk.yellow(levelFormat.format("WARN"));
            case "DEBUG":
                return chalk.magenta(levelFormat.format("DEBUG"));
            case "ERROR":
                return chalk.red(levelFormat.format("ERROR"));
        }
    }

    toObject() : SerializedLog {
        return {
            timeStamp: this.timeStamp,
            logLevel: this.logLevel,
            message: {
                raw : {
                    original: this.rawMessage,
                    colored: this.rawMessageToString(),
                    colorStripped: stripAnsi(this.rawMessageToString())
                },
                formatted: this.formattedMessage,
                colorStripped: stripAnsi(this.formattedMessage)
            }
        }
    }

}