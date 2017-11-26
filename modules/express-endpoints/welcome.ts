import {Request} from "express";
import {Response} from "express";

export function welcome(req: Request, res: Response) {
    res.end('BaromMeter rest server');
}