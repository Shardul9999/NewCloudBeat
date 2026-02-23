import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('../backend/.env', 'utf-8')
const urlMatch = envFile.match(/SUPABASE_URL=(.*)/)
const keyMatch = envFile.match(/SUPABASE_KEY=(.*)/)

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1])
  supabase.storage.getBucket('images').then(({ data, error }) => {
    if (error && error.message.includes('Bucket not found')) {
      console.log('Creating bucket images...')
      supabase.storage.createBucket('images', { public: true }).then(console.log).catch(console.error)
    } else {
      console.log('Bucket already exists or accessible:', data)
      if (data && !data.public) {
          console.log('Making bucket public...')
          supabase.storage.updateBucket('images', { public: true }).then(console.log)
      }
    }
  })
}
