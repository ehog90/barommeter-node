import {Request} from "express";
import {Response} from "express";
import {queryAllEntities} from "../data-access/data-access";

export async function getAllEntities(req: Request, res: Response) {
    const allEntities = await queryAllEntities();
    res.json(allEntities)
}