import { body } from 'express-validator';

export const postValidators = [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('status').optional().isIn(['applied', 'interviewing', 'rejected', 'offer']).withMessage('Status must be one of: applied, interviewing, rejected, offer'),
]

export const patchValidators = [
    body('status').optional().isIn(['applied', 'interviewing', 'rejected', 'offer']).withMessage('Status must be one of: applied, interviewing, rejected, offer'),
    body('notes').optional().isString().withMessage('Notes must be string'),
]
