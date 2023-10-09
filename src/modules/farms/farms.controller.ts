import { NextFunction, Request, Response } from 'express';

import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmsService } from './farms.service';
import { UsersService } from 'modules/users/users.service';
import { EntityNotFoundError } from 'typeorm';
import { User } from 'modules/users/entities/user.entity';

export class FarmsController {
  private readonly farmService: FarmsService;
  private readonly userService: UsersService;

  constructor() {
    this.userService = new UsersService();
    this.farmService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;

      const user = await this.userService.findOneBy({ id: userId });

      if (!user) {
        throw new EntityNotFoundError(User, `userId: ${userId}`);
      }

      const farm = await this.farmService.createFarm(req.body as CreateFarmDto);
      res.status(201).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
