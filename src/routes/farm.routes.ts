import { RequestHandler, Router } from 'express';
import { validateCreateFarmDto } from 'middlewares/farm-validation.middleware';
import { FarmsController } from 'modules/farms/farms.controller';

const router = Router();
const farmsController = new FarmsController();

/**
 * @openapi
 * '/api/farms':
 *  post:
 *     tags:
 *       - Farm
 *     summary: Create a farm
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateFarmDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateFarmDto'
 *      400:
 *        description: Bad request
 */
router.post('/', validateCreateFarmDto, farmsController.create.bind(farmsController) as RequestHandler);

export default router;
