import { Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { generateCertificatePDF } from '../services/certificate.service'

export async function issueCertificate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { enrollmentId } = req.params
    const studentId = req.user!.id

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        course: { include: { teacher: true } },
        certificate: true,
      },
    })

    if (!enrollment) throw new AppError(404, 'Matrícula não encontrada.')
    if (enrollment.studentId !== studentId) throw new AppError(403, 'Acesso negado.')
    if (!enrollment.completedAt) throw new AppError(400, 'Curso ainda não foi concluído.')

    if (enrollment.certificate) {
      return res.json(enrollment.certificate)
    }

    const pdfBuffer = await generateCertificatePDF({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      teacherName: enrollment.course.teacher.name,
      completedAt: enrollment.completedAt,
      certificateId: enrollmentId,
    })

    // In production: upload pdfBuffer to Cloudinary and save URL
    // For now we store a placeholder URL
    const certificate = await prisma.certificate.create({
      data: {
        enrollmentId,
        userId: studentId,
        fileUrl: `/api/certificates/${enrollmentId}/download`,
      },
    })

    return res.json(certificate)
  } catch (err) {
    next(err)
  }
}

export async function downloadCertificate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { enrollmentId } = req.params

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        course: { include: { teacher: true } },
        certificate: true,
      },
    })

    if (!enrollment) throw new AppError(404, 'Certificado não encontrado.')
    if (enrollment.studentId !== req.user!.id) throw new AppError(403, 'Acesso negado.')
    if (!enrollment.completedAt || !enrollment.certificate) {
      throw new AppError(400, 'Certificado não disponível.')
    }

    const pdfBuffer = await generateCertificatePDF({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      teacherName: enrollment.course.teacher.name,
      completedAt: enrollment.completedAt,
      certificateId: enrollmentId,
    })

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${enrollment.course.title.replace(/\s+/g, '-')}.pdf"`,
      'Content-Length': (pdfBuffer as unknown as Buffer).length,
    })

    return res.send(pdfBuffer)
  } catch (err) {
    next(err)
  }
}
