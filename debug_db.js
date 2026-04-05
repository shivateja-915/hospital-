const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase.from('doctors').select('*')
  console.log('Doctors Data:', data)
  console.log('Error:', error)
  
  const { data: users } = await supabase.from('users').select('*')
  console.log('Users Data:', users)
}

test()
