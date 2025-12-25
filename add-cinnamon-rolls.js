#!/usr/bin/env node

/**
 * Script to add the Gluten-Free Cinnamon Rolls recipe to the database
 * Run with: node add-cinnamon-rolls.js
 */

const fs = require('fs');
const path = require('path');

async function addRecipe() {
  try {
    // Read the recipe JSON
    const recipeData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'gluten-free-cinnamon-rolls.json'), 'utf8')
    );

    console.log('📋 Recipe loaded:', recipeData.title);
    console.log('🔄 Adding recipe to database...\n');

    // Make API request to add recipe
    const response = await fetch('http://localhost:3001/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error || response.statusText}`);
    }

    const result = await response.json();

    console.log('✅ Recipe added successfully!');
    console.log('📝 Recipe ID:', result.id);
    console.log('🔗 View at: http://localhost:3001/app/recipes/' + result.id);
    console.log('\n🥐 Your gluten-free cinnamon rolls recipe is ready!');

  } catch (error) {
    console.error('❌ Error adding recipe:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Your Next.js dev server is running (npm run dev)');
    console.error('   2. You are logged in to the application');
    console.error('   3. The API endpoint is accessible at http://localhost:3001/api/recipes');
    process.exit(1);
  }
}

addRecipe();
