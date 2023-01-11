import PDFDocument from 'pdfkit'
import { Readable } from 'stream'

interface CertificateData {
  studentName: string
  courseTitle: string
  teacherName: string
  completedAt: Date
  certificateId: string
}

export function generateCertificatePDF(data: CertificateData): Buffer {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f6f0')

    // Border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke('#2563eb')

    doc
      .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
      .lineWidth(1)
      .stroke('#93c5fd')

    // Logo area
    doc
      .fontSize(32)
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .text('EduFlow', 0, 60, { align: 'center' })

    doc
      .fontSize(12)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text('Plataforma de Ensino Online', 0, 100, { align: 'center' })

    doc
      .moveTo(120, 125)
      .lineTo(doc.page.width - 120, 125)
      .lineWidth(1)
      .stroke('#d1d5db')

    // Certificate title
    doc
      .fontSize(22)
      .fillColor('#374151')
      .font('Helvetica')
      .text('CERTIFICADO DE CONCLUSÃO', 0, 145, { align: 'center' })

    // Body text
    doc
      .fontSize(14)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text('Certificamos que', 0, 195, { align: 'center' })

    // Student name
    doc
      .fontSize(30)
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .text(data.studentName, 0, 220, { align: 'center' })

    doc
      .moveTo(200, 265)
      .lineTo(doc.page.width - 200, 265)
      .lineWidth(1)
      .stroke('#9ca3af')

    doc
      .fontSize(14)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text('concluiu com êxito o curso', 0, 278, { align: 'center' })

    // Course title
    doc
      .fontSize(22)
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .text(data.courseTitle, 0, 305, { align: 'center' })

    const dateStr = data.completedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    doc
      .fontSize(12)
      .fillColor('#9ca3af')
      .font('Helvetica')
      .text(`Concluído em ${dateStr}`, 0, 345, { align: 'center' })

    // Footer
    const footerY = doc.page.height - 110

    doc
      .moveTo(120, footerY)
      .lineTo(280, footerY)
      .lineWidth(1)
      .stroke('#374151')

    doc
      .fontSize(11)
      .fillColor('#374151')
      .font('Helvetica-Bold')
      .text(data.teacherName, 120, footerY + 6, { width: 160, align: 'center' })

    doc
      .fontSize(10)
      .fillColor('#9ca3af')
      .font('Helvetica')
      .text('Instrutor(a)', 120, footerY + 20, { width: 160, align: 'center' })

    doc
      .fontSize(8)
      .fillColor('#d1d5db')
      .text(`ID: ${data.certificateId}`, 0, footerY + 45, { align: 'center' })

    doc.end()
  }) as unknown as Buffer
}
