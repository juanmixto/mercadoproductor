import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import { authRouter } from './routes/auth.routes'
import { vendorRouter } from './routes/vendor.routes'
import { productRouter } from './routes/product.routes'
import { cartRouter } from './routes/cart.routes'
import { orderRouter } from './routes/order.routes'
import { incidentRouter } from './routes/incident.routes'
import { settlementRouter } from './routes/settlement.routes'
import { adminRouter } from './routes/admin.routes'
import { errorHandler } from './middlewares/error.middleware'
import { notFoundHandler } from './middlewares/notFound.middleware'

const app = express()
const PORT = process.env.API_PORT ?? 4000

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: [
    process.env.WEB_URL ?? 'http://localhost:3000',
    process.env.ADMIN_URL ?? 'http://localhost:3001',
    process.env.VENDOR_URL ?? 'http://localhost:3002',
  ],
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}))

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Routes ──────────────────────────────────────────────────────────────────
const v1 = '/api/v1'

app.use(`${v1}/auth`, authRouter)
app.use(`${v1}/vendors`, vendorRouter)
app.use(`${v1}/products`, productRouter)
app.use(`${v1}/cart`, cartRouter)
app.use(`${v1}/orders`, orderRouter)
app.use(`${v1}/incidents`, incidentRouter)
app.use(`${v1}/settlements`, settlementRouter)
app.use(`${v1}/admin`, adminRouter)

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})

export default app
