import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('Starting invoice upload...')
    const data = await request.json()
    
    if (!data.file || !data.orderId) {
      console.error('Missing file or orderId')
      return NextResponse.json(
        { error: 'Missing file or orderId' },
        { status: 400 }
      )
    }

    // Check if it's a valid PDF base64
    if (!data.file.startsWith('data:application/pdf;base64,')) {
      console.error('Invalid file type')
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'factures')
    console.log('Upload directory:', uploadDir)
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
      console.log('Directory created/exists')
    } catch (error) {
      console.error('Error creating directory:', error)
      if (error.code !== 'EEXIST') {
        throw error
      }
    }

    // Remove the data:application/pdf;base64, part
    const base64Data = data.file.replace(/^data:application\/pdf;base64,/, '')

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Data, 'base64')
    console.log('File buffer created')

    const filename = `facture-${data.orderId}.pdf`
    const filePath = join(uploadDir, filename)
    console.log('Writing file to:', filePath)

    // Write the file
    await writeFile(filePath, fileBuffer)
    console.log('File written successfully')

    return NextResponse.json({ message: 'File uploaded successfully' })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json(
      { error: `Error uploading file: ${error.message}` },
      { status: 500 }
    )
  }
}