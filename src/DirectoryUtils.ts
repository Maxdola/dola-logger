import fs from "fs";

export const createFolder = (dirPath : string): Promise<boolean> => {
    return new Promise<boolean>(((resolve, reject) => {
        (async () => {
            if (!fs.existsSync(dirPath)) {
                fs.mkdir(dirPath, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                })
            } else {
                resolve(true);
            }
        })();
    }))
}

export const createFolderSync = (dirPath : string) : void  => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}