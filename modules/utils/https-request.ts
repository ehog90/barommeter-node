import * as https from "https";
import {RequestOptions} from "https";

export function customHttpRequestAsync<T>(opts: RequestOptions, message: any): Promise<string> {
    return new Promise((resolve,reject) => {
        const request: any = https.request(opts,
            res => {
                let d: string;
                res.on('data',
                    chunk => {
                        d += chunk;
                    });
                res.on('end',
                    () => {
                        resolve(d);
                    });
            })
            .on('error',
                e => {
                    reject(e);
                });
        request.end(JSON.stringify(message));
    });
}
