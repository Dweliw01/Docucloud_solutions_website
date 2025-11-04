// Database Connection Test Script
require('dotenv').config();
const supabase = require('./src/config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Check configuration
    console.log('✓ Configuration loaded');
    console.log('  Supabase URL:', process.env.SUPABASE_URL);
    console.log('  API Key:', process.env.SUPABASE_KEY ? 'Present ✓' : 'Missing ✗');
    console.log('');

    // Test 2: List all tables
    console.log('📋 Checking database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('inquiries')
      .select('*')
      .limit(0);

    if (tablesError) {
      console.log('❌ Error accessing tables:', tablesError.message);
      console.log('   This might mean the schema hasn\'t been created yet.');
    } else {
      console.log('✓ Successfully connected to "inquiries" table');
    }
    console.log('');

    // Test 3: Check visitor_sessions table
    console.log('📋 Checking visitor_sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .limit(0);

    if (sessionsError) {
      console.log('❌ Error accessing visitor_sessions:', sessionsError.message);
    } else {
      console.log('✓ Successfully connected to "visitor_sessions" table');
    }
    console.log('');

    // Test 4: Count records
    console.log('📊 Checking data...');
    const { count: inquiryCount, error: countError } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error counting inquiries:', countError.message);
    } else {
      console.log('✓ Total inquiries in database:', inquiryCount || 0);
    }

    const { count: sessionCount, error: sessionCountError } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true });

    if (sessionCountError) {
      console.log('❌ Error counting sessions:', sessionCountError.message);
    } else {
      console.log('✓ Total sessions in database:', sessionCount || 0);
    }
    console.log('');

    // Test 5: Test insert (optional - we'll skip to avoid test data)
    console.log('🎯 Connection Summary:');
    if (!tablesError && !sessionsError) {
      console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
      console.log('   All tables are accessible and ready to use.');
    } else {
      console.log('⚠️  DATABASE PARTIALLY CONNECTED');
      console.log('   Some tables may be missing. Make sure you ran schema-fixed.sql');
    }

  } catch (error) {
    console.log('❌ FATAL ERROR:', error.message);
    console.log('\nPlease check:');
    console.log('1. .env file has correct SUPABASE_URL and SUPABASE_KEY');
    console.log('2. You ran the schema-fixed.sql in Supabase SQL Editor');
    console.log('3. Your Supabase project is active');
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
