const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ktveoyeomjgvavyqipbq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dmVveWVvbWpndmF2eXFpcGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NDgwNjAsImV4cCI6MjA0ODUyNDA2MH0.DjNTZgSFSqU1-fD8j8eLLGjMkL5kF8LKE1pQdYj9xVw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllProjects() {
  try {
    console.log('Clearing all projects from database...');
    
    // Delete all projects
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .neq('id', 'never-match'); // This will match all records
    
    if (error) {
      console.error('Error clearing projects:', error);
      return;
    }
    
    console.log('✅ All projects cleared successfully!');
    console.log(`Removed projects from database.`);
    
    // Verify deletion
    const { data: remainingProjects, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking remaining projects:', countError);
    } else {
      console.log(`Remaining projects in database: ${remainingProjects?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

clearAllProjects(); 