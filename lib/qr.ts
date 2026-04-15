import QRCode from 'qrcode'

export async function generateVehicleQR(vehicleId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fleetproof.io'
  const url = `${appUrl}/dashboard/checkout/${vehicleId}`
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#2D5016', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })
}
