import { findUserByEmail } from '../models/users.model.js'
import AppError from '../errors/AppError.js'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

const loginUser = async (email: string, password: string) => {
  const u = await findUserByEmail(email)
  if (!u) {
    throw new AppError('Identifiants invalides', 401)
  }

  const isMatch = await bcrypt.compare(password, u.password)
  
  if (!isMatch) {
    throw new AppError('Identifiants invalides', 401)
  }

  const token = jsonwebtoken.sign(
    { userId: u.id, role: u.role },
    process.env.JWT_SECRET || '',
    { expiresIn: '24h' }
  )
  if (!token) throw new AppError('Impossible de signer le token')
  return token
}

export { loginUser }
