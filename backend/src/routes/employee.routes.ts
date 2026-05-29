import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createEmployeeSchema, updateEmployeeSchema } from '../validations/employee.validation';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('admin', 'manager'), EmployeeController.getAll);
router.post('/', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(createEmployeeSchema), EmployeeController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'manager'), validateMiddleware(updateEmployeeSchema), EmployeeController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'manager'), EmployeeController.delete);

export default router;
