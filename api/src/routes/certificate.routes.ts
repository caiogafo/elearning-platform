import { Router } from 'express'
import { issueCertificate, downloadCertificate } from '../controllers/certificate.controller'
import { authenticate } from '../middlewares/auth.middleware'

export const certificateRoutes = Router()

certificateRoutes.post('/:enrollmentId/issue', authenticate, issueCertificate)
certificateRoutes.get('/:enrollmentId/download', authenticate, downloadCertificate)
