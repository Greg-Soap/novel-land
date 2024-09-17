console.log('Script started')
import { fileURLToPath } from 'node:url'
import { dirname, join, extname, basename } from 'node:path'
import { promises as fs } from 'node:fs'
import EPub from 'epub'
import { promisify } from 'node:util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const novelsDir = join(__dirname, '..', '..', 'public', 'novels')
const imagesDir = join(novelsDir, 'images')

async function extractMetadata(filePath) {
  console.log(`Extracting metadata from: ${filePath}`)
  return new Promise((resolve) => {
    const epub = new EPub(filePath)
    epub.parse()
    epub.on('end', () => {
      resolve({
        title: epub.metadata.title || basename(filePath, '.epub'),
        author: epub.metadata.creator || 'Unknown',
        description: epub.metadata.description || 'No description available.',
      })
    })
    epub.on('error', (err) => {
      console.error(`Error extracting metadata from ${filePath}:`, err)
      resolve({
        title: basename(filePath, '.epub'),
        author: 'Unknown',
        description: 'No description available.',
      })
    })
  })
}

async function generateNovelList() {
  try {
    console.log('Script started')
    console.log(`Checking novels directory: ${novelsDir}`)
    await fs.access(novelsDir)

    console.log('Reading directory contents')
    const files = await fs.readdir(novelsDir)
    console.log(`Found ${files.length} files in the directory`)

    const epubFiles = files.filter((file) => extname(file).toLowerCase() === '.epub')
    console.log(`Found ${epubFiles.length} EPUB files`)

    if (epubFiles.length === 0) {
      console.log('No EPUB files found in the directory')
      return
    }

    const novels = await Promise.all(
      epubFiles.map(async (file, index) => {
        const filePath = join(novelsDir, file)
        console.log(`Processing file: ${file}`)
        let metadata
        try {
          metadata = await extractMetadata(filePath)
        } catch (error) {
          console.error(`Error processing ${file}:`, error)
          metadata = {
            title: basename(file, '.epub'),
            author: 'Unknown',
            description: 'No description available.',
          }
        }
        const imageName = `${basename(file, '.epub')}.png`
        const imagePath = join('novels', 'images', imageName)

        let image = ''
        try {
          await fs.access(join(imagesDir, imageName))
          image = imagePath
          console.log(`Image found for ${file}`)
        } catch (error) {
          console.log(`No image found for ${file}`)
        }

        return {
          id: index + 1,
          title: metadata.title,
          author: metadata.author,
          filename: file,
          image,
          description: metadata.description,
        }
      }),
    )

    console.log('Novels:', novels)

    const novelListCode = `export const novels = ${JSON.stringify(novels, null, 2)};`

    const outputPath = join(__dirname, '..', 'novel-list.ts')
    await fs.writeFile(outputPath, novelListCode)
    console.log(`Novel list generated successfully! Output: ${outputPath}`)
  } catch (error) {
    console.error('Error generating novel list:', error)
  }
}

generateNovelList()
