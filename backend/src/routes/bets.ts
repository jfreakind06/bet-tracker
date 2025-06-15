import { Router } from 'express';
import { addBet, getBets, getROI } from '../controllers/betController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, addBet);
router.get('/', authenticate, getBets);
router.get('/roi', authenticate, getROI);

export default router;
