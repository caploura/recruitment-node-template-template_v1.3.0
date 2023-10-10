import { RequestHandler, Router } from 'express';
import { authMiddleware } from 'middlewares/auth.middleware';
import { validateCreateFarmDto, validateFetchFarms } from 'middlewares/farm-validation.middleware';
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
 *  get:
 *     tags:
 *       - Farm
 *     summary: Fetch farms
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         schema:
 *          type : string
 *       - in: path
 *         name: limit
 *         required: false
 *         schema:
 *          type : integer
 *          example: 100
 *       - in: path
 *         name: offset
 *         required: false
 *         schema:
 *          type : integer
 *          example: 0
 *       - in: path
 *         name: sortOrder
 *         required: false
 *         schema:
 *          type : string
 *          example: ASC
 *       - in: path
 *         name: sortColumn
 *         required: false
 *         schema:
 *          type : string
 *          example: name
 *       - in: path
 *         name: outliers
 *         required: false
 *         schema:
 *          type : boolean
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateFarmDto'
 *      401:
 *        description: Unauthorized
 */
router.post('/', authMiddleware, validateCreateFarmDto, farmsController.create.bind(farmsController) as RequestHandler);
router.get('/', authMiddleware, validateFetchFarms, farmsController.fetch.bind(farmsController) as RequestHandler);

export default router;
