#DolaLogger
> A simple system containing Normal Loggers and LoggerGroups

##Install
```
$ npm install dola-logger
```

#Ussage

### Basic
````js
const group = new LoggerGroup("System");
const logger = group.createLogger("main");
````

### Basic
```js
//Create a logger group
new LoggerGroup("System");            //new Logger group
new LoggerGroup("System", options);   // with options

//Create a logger as a child of a group
group.createLogger("main");          //create a new Logger 
group.createLogger("main", options); //create a new Logger with options

group.getOrCreateLogger("main");     //create or get existing with the name
group.getLogger("main");             //get existing or null

// => group/logger prefix are cut/stretched to 15 characters 
// => '           main'
// => '         System'

new Logger("logger without Group")
// => 'logger without '
```

### With Options
```ts
type options = {
    saveOnExit?: boolean,
    savePeriodically?: boolean,
    saveInterval?: number,
    color?: ForegroundColor
}

type ForegroundColor =
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

```

