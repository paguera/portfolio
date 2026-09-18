import { colorize } from '../utils/Colorize.js'

class AppError extends Error {
  status: number
  constructor (message: string, status: number = 500) {
    super(message)
    this.status = status
    this.name = 'AppError'
  }
}

export default AppError
