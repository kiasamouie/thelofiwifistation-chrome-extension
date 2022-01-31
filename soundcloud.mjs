import { Client } from 'soundcloud-scraper'
const client = new Client()
import fs from 'fs'

import { writeJsonFile } from 'write-json-file'
import { loadJsonFile } from 'load-json-file'
import each from 'foreach-array'

// await writeJsonFile('foo.json', { foo: true })

const tracks = await loadJsonFile('Popular songs lofi remixed.json')

function getSongInfo () {
  client
    .getSongInfo(tracks[i].permalink_url)
    .then(async song => {
      const stream = await song.downloadProgressive()
      const writer = stream.pipe(
        fs.createWriteStream(`./playlist/${song.title}.mp3`)
      )
      writer.on('finish', () => {
        console.log('Finished writing playlist!')
        process.exit(1)
      })
    })
    .catch(console.error)
}

getSongInfo()
