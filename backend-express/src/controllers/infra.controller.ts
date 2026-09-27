import type { Request, Response, NextFunction } from 'express'
import * as infraService from '../services/infra.service.js'

export const getTelemetry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const telemetry = await infraService.getTelemetry()
    res.status(200).json(telemetry)
  } catch (error) {
    next(error)
  }
}

export const getServicesHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await infraService.getServicesHealth()
    res.status(200).json(health)
  } catch (error) {
    next(error)
  }
}
