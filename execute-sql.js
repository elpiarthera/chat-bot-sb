// Script to directly execute SQL using HTTP requests to Supabase
const fs = require('fs')
const path = require('path')
const https = require('https')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

// Read the SQL from the migration file
const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20240617000000_add_workspace_active_models.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

console.log(`Loaded SQL from ${sqlPath}`)
console.log(`Connecting to Supabase at ${supabaseUrl}`)

// Function to execute a single SQL statement
function executeSQLStatement(statement) {
  return new Promise((resolve, reject) => {
    // Extract the hostname from the Supabase URL
    const urlObj = new URL(supabaseUrl)
    
    const options = {
      hostname: urlObj.hostname,
      path: '/rest/v1/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(`HTTP error ${res.statusCode}: ${data}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.write(JSON.stringify({ query: statement }))
    req.end()
  })
}

// Execute the SQL directly
async function executeSQL() {
  try {
    console.log('Executing SQL...')
    
    // Split SQL into statements (simple approach)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    // Execute each statement separately
    for (const statement of statements) {
      try {
        console.log(`Executing statement: ${statement.trim().substring(0, 50)}...`)
        await executeSQLStatement(statement.trim())
        console.log('Statement executed successfully')
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`)
        
        if (error.message.includes('relation "workspace_active_models" already exists')) {
          console.log('Table already exists, continuing...')
          continue
        }
        
        if (error.message.includes('must be owner of table workspace_active_models')) {
          console.log('Permission issues - please execute the SQL through the Supabase dashboard SQL Editor')
          process.exit(1)
        }
        
        throw error
      }
    }
    
    console.log('SQL executed successfully!')
  } catch (error) {
    console.error('Error:', error.message)
    console.log('Please try executing the SQL directly through the Supabase dashboard SQL Editor')
    process.exit(1)
  }
}

executeSQL()