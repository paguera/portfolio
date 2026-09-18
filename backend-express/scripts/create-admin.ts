import db from '../src/config/database.js';
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  console.log('--- CRÉATION D\'UN COMPTE ADMINISTRATEUR ---');
  
  try {
    let email = process.argv[2];
    let password = process.argv[3];

    // If arguments are not provided, ask for them interactively
    if (!email || !password) {
      email = await question('Email de l\'administrateur : ');
      
      // Basic email validation
      if (!email.includes('@')) {
        console.error('❌ Erreur : Format d\'email invalide.');
        process.exit(1);
      }

      password = await question('Mot de passe : ');
    }
    
    if (password.length < 8) {
      console.error('❌ Erreur : Le mot de passe doit faire au moins 8 caractères.');
      process.exit(1);
    }

    console.log('⏳ Hachage du mot de passe en cours...');
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (email, password, role) 
      VALUES ($1, $2, 'admin') 
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
    `;
    
    await db.pool.query(sql, [email, hashedPassword]);
    
    console.log(`✅ Succès : Le compte admin [${email}] a été créé (ou mis à jour).`);
  } catch (error) {
    console.error('❌ Erreur critique lors de la création :', error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

createAdmin();

