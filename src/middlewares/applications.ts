import { body, param, query } from 'express-validator';
import { Stage } from '../../generated/prisma/client';

const STAGE_VALUES = Object.values(Stage);
const SORTABLE_FIELDS = ['dateApplied', 'createdAt', 'updatedAt', 'role'];

export const postValidators = [
    body('role').notEmpty().withMessage('Role is required'),
    body('companyId').notEmpty().withMessage('companyId is required'),
    body('stage').optional().isIn(STAGE_VALUES).withMessage(`Stage must be one of: ${STAGE_VALUES.join(', ')}`),
    body('skills').optional().isArray().withMessage('skills must be an array of strings'),
    body('skills.*').optional().isString().withMessage('each skill must be a string'),
    body('dateApplied').optional().isISO8601().withMessage('dateApplied must be a valid date'),
]

export const getValidators = [
    query('stage').optional().isIn(STAGE_VALUES).withMessage(`Stage must be one of: ${STAGE_VALUES.join(', ')}`),
    query('companyId').optional().isString(),
    query('role').optional().isString(),
    query('sortBy').optional().isIn(SORTABLE_FIELDS).withMessage(`sortBy must be one of: ${SORTABLE_FIELDS.join(', ')}`),
    query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('pageSize must be between 1 and 100'),
]

export const stageValidators = [
    param('id').notEmpty().withMessage('Application id is required'),
    body('stage').notEmpty().isIn(STAGE_VALUES).withMessage(`Stage must be one of: ${STAGE_VALUES.join(', ')}`),
]
