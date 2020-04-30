export declare type ILoggerGroup = {
    startTime: number,
    endTime?: number,
    name: string,

    logs: Log[],
    loggers: ILogger[]
}

export declare type ILogger = {
    startTime: number,
    endTime?: number,
    name: string,

    logs: Log[],
}

export declare type Log = {
    timeStamp: number,
    type : LogLevel,
    message: string
}

export declare type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

//FIXME actually import type from chalk
export declare type ForegroundColor =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'grey'
    | 'blackBright'
    | 'redBright'
    | 'greenBright'
    | 'yellowBright'
    | 'blueBright'
    | 'magentaBright'
    | 'cyanBright'
    | 'whiteBright';

export declare type LoggerOptions = {
    saveOnExit?: boolean,
    savePeriodically?: boolean,
    saveInterval?: number,
    color?: ForegroundColor
}

export declare type GroupPrefixOptions = {
    value: string,
    color: ForegroundColor
}

//Serialized Objects

export declare type SerializedLog = {
    timeStamp: number,
    logLevel: LogLevel,
    message: {
        raw : {
            original: string,
            colored: string,
            colorStripped: string
        },
        formatted: string,
        colorStripped: string
    }
}

export declare type ExitFunction = (async? : boolean) => void;
