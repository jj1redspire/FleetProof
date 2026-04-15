import jsPDF from 'jspdf'
import type { FPVehicle, FPSession, FPDamageRecord } from '@/types'

const FOREST = [45, 80, 22] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]
const CHARCOAL = [33, 37, 41] as [number, number, number]
const GRAY = [108, 117, 125] as [number, number, number]
const LIGHT_GRAY = [222, 226, 230] as [number, number, number]
const RED = [220, 53, 69] as [number, number, number]
const GREEN = [25, 135, 84] as [number, number, number]
const YELLOW = [255, 193, 7] as [number, number, number]

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...FOREST)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('FleetProof', 14, 10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 17)
  doc.setFontSize(8)
  doc.text(subtitle, 196, 10, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 16, { align: 'right' })
}

function addFooter(doc: jsPDF, page: number, total: number) {
  const h = doc.internal.pageSize.height
  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(0, h - 10, 210, 10, 'F')
  doc.setTextColor(...GRAY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('FleetProof — fleetproof.io', 14, h - 4)
  doc.text(`Page ${page} of ${total}`, 196, h - 4, { align: 'right' })
}

function checkPageBreak(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > doc.internal.pageSize.height - 15) {
    doc.addPage()
    return 30
  }
  return y
}

export function generateSessionReport(
  vehicle: FPVehicle,
  session: FPSession,
  locationName: string
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const sessionId = session.id.slice(0, 8).toUpperCase()

  addHeader(doc, 'Vehicle Session Report', `Session ${sessionId}`)

  let y = 30

  // Vehicle + session info
  doc.setFillColor(248, 249, 250)
  doc.roundedRect(12, y, 186, 42, 2, 2, 'F')
  doc.setTextColor(...CHARCOAL)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${vehicle.vehicle_number} — ${vehicle.vehicle_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`, 18, y + 9)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`Location: ${locationName}`, 18, y + 17)
  doc.text(`Driver: ${session.driver_name}`, 18, y + 24)
  doc.text(`Checkout: ${new Date(session.checkout_time).toLocaleString()}`, 18, y + 31)
  if (session.return_time) {
    doc.text(`Return: ${new Date(session.return_time).toLocaleString()}`, 18, y + 38)
  }
  const status = session.damage_detected ? 'DAMAGE DETECTED' : 'NO DAMAGE'
  const statusColor = session.damage_detected ? RED : GREEN
  doc.setTextColor(...statusColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(status, 190, y + 9, { align: 'right' })

  y += 50

  // AI comparison summary
  if (session.return_ai_report) {
    const report = session.return_ai_report as { summary?: string; attribution_statement?: string; new_damage?: Array<{ location: string; severity: string; description: string }> }
    if (report.attribution_statement) {
      doc.setFillColor(...(session.damage_detected ? [255, 243, 243] as [number, number, number] : [243, 255, 243] as [number, number, number]))
      doc.roundedRect(12, y, 186, 18, 2, 2, 'F')
      doc.setTextColor(session.damage_detected ? 180 : 25, session.damage_detected ? 30 : 135, session.damage_detected ? 30 : 84)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('AI FINDING:', 18, y + 7)
      doc.setFont('helvetica', 'normal')
      const stmt = doc.splitTextToSize(report.attribution_statement, 160)
      doc.text(stmt, 42, y + 7)
      y += 26
    }

    // Damage items
    if (session.damage_detected && report.new_damage && report.new_damage.length > 0) {
      doc.setTextColor(...CHARCOAL)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('New Damage Items', 14, y)
      y += 6

      report.new_damage.forEach((dmg: { location: string; severity: string; description: string }, i: number) => {
        y = checkPageBreak(doc, y, 20)
        const sevColor = dmg.severity === 'major' ? RED : dmg.severity === 'moderate' ? [253, 126, 20] as [number, number, number] : YELLOW
        doc.setFillColor(248, 249, 250)
        doc.roundedRect(12, y, 186, 18, 2, 2, 'F')
        doc.setFillColor(...sevColor)
        doc.roundedRect(14, y + 4, 18, 8, 1, 1, 'F')
        doc.setTextColor(...(dmg.severity === 'minor' ? CHARCOAL : WHITE))
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(dmg.severity.toUpperCase(), 23, y + 9.5, { align: 'center' })
        doc.setTextColor(...CHARCOAL)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`${i + 1}. ${dmg.location}`, 36, y + 8)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...GRAY)
        doc.text(dmg.description.slice(0, 100), 36, y + 14)
        y += 21
      })
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i, pageCount)
  }

  return doc.output('blob')
}

export function generateInsuranceReport(
  vehicle: FPVehicle,
  sessions: FPSession[],
  damageRecords: FPDamageRecord[],
  locationName: string
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  addHeader(doc, 'Vehicle Insurance / Damage History Report', vehicle.vehicle_number)

  let y = 30

  // Vehicle summary
  doc.setFillColor(248, 249, 250)
  doc.roundedRect(12, y, 186, 28, 2, 2, 'F')
  doc.setTextColor(...CHARCOAL)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Vehicle: ${vehicle.vehicle_number}`, 18, y + 8)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`Type: ${vehicle.vehicle_type.replace('_', ' ')}  |  Location: ${locationName}`, 18, y + 15)
  doc.text(`Total Sessions: ${sessions.length}  |  Damage Incidents: ${damageRecords.length}`, 18, y + 22)
  const totalCost = damageRecords.reduce((s, r) => s + (r.repair_cost || 0), 0)
  if (totalCost > 0) {
    doc.setTextColor(...RED)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Damage Cost: $${totalCost.toLocaleString()}`, 150, y + 22)
  }

  y += 36

  // Damage records
  if (damageRecords.length === 0) {
    doc.setTextColor(...GREEN)
    doc.setFontSize(11)
    doc.text('No damage records found for this vehicle.', 105, y, { align: 'center' })
  } else {
    doc.setTextColor(...CHARCOAL)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Damage History', 14, y)
    y += 6

    damageRecords.forEach((rec, i) => {
      y = checkPageBreak(doc, y, 22)
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250)
      doc.rect(12, y, 186, 20, 'F')
      doc.setTextColor(...CHARCOAL)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`${new Date(rec.created_at).toLocaleDateString()}`, 14, y + 7)
      doc.setFont('helvetica', 'normal')
      doc.text(rec.description.slice(0, 90), 50, y + 7)
      doc.setTextColor(...GRAY)
      doc.text(`Severity: ${rec.severity}`, 14, y + 14)
      if (rec.repair_cost) {
        doc.setTextColor(...RED)
        doc.setFont('helvetica', 'bold')
        doc.text(`$${rec.repair_cost}`, 194, y + 7, { align: 'right' })
      }
      doc.setTextColor(rec.repair_status === 'completed' ? 25 : 220, rec.repair_status === 'completed' ? 135 : 53, rec.repair_status === 'completed' ? 84 : 69)
      doc.setFontSize(8)
      doc.text(rec.repair_status.toUpperCase(), 194, y + 14, { align: 'right' })
      y += 22
    })
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i, pageCount)
  }

  return doc.output('blob')
}
