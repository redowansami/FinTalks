import { Router } from 'express';
import { userController } from '../containers/userContainer';

const router = Router();

router.post('/', userController.create.bind(userController));
router.get('/', userController.findAll.bind(userController));
router.get('/:userId', userController.findOne.bind(userController));
router.put('/:userId', userController.putUpdate.bind(userController));
router.patch('/:userId', userController.patchUpdate.bind(userController));
router.delete('/:userId', userController.delete.bind(userController));

export default router;
