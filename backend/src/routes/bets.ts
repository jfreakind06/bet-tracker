import { Router } from 'express';
import { addBet, getBets, getROI, updateBet } from '../controllers/betController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, addBet);
router.get('/', authenticate, getBets);
router.get('/roi', authenticate, getROI);
router.put('/:id', authenticate, updateBet);

export default router;
