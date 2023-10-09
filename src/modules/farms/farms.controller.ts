import { NextFunction, Request, Response } from 'express';

import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmsService } from './farms.service';

export class FarmsController {
  private readonly farmService: FarmsService;

  constructor() {
    this.farmService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmService.createFarm(req.body as CreateFarmDto);
      res.status(201).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
