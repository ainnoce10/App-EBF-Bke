import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* eslint-disable @typescript-eslint/no-require-imports */

export async function GET(request: NextRequest) {
  try {
    // Tester la connexion à la base de données
    console.log('🏥 Health check: Testing database connection...');
    
    // Simple requête pour tester la base de données
    const customerCount = await db.customer.count();
    
    // Tester le système de fichiers avec fs.promises
    const fs = require('fs').promises;
    const path = require('path');
    
    // Vérifier les répertoires d'upload
    const uploadDirs = [
      '/app/public/uploads',
      '/app/public/uploads/audio',
      '/app/public/uploads/photos'
    ];
    
    for (const dir of uploadDirs) {
      try {
        await fs.access(dir);
        console.log(`✅ Directory accessible: ${dir}`);
      } catch (error) {
        console.log(`⚠️ Directory not accessible: ${dir}`);
        // Essayer de créer le répertoire
        try {
          await fs.mkdir(dir, { recursive: true });
          console.log(`✅ Directory created: ${dir}`);
        } catch (createError) {
          console.error(`❌ Failed to create directory: ${dir}`, createError);
        }
      }
    }
    
    // Vérifier la base de données
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/app/data/custom.db';
    try {
      await fs.access(dbPath);
      console.log(`✅ Database file accessible: ${dbPath}`);
    } catch (error) {
      console.log(`⚠️ Database file not accessible: ${dbPath}`);
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        customerCount: customerCount
      },
      filesystem: {
        uploadDirs: uploadDirs,
        databasePath: dbPath
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}