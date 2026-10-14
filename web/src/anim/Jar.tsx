import { useEffect, useRef } from 'react'

type Props = { total: number; goal: number; celebrationKey: number }

type Particle = { x: number; y: number; vx: number; vy: number; r: number; spin: number; angle: number; color: string; kind: 'coin' | 'confetti' }

export default function Jar({ total, goal, celebrationKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const totalRef = useRef(total)
  const goalRef = useRef(goal)
  const eventRef = useRef(celebrationKey)
  useEffect(() => { totalRef.current = total }, [total])
  useEffect(() => { goalRef.current = goal }, [goal])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = 0
    let level = 0
    let velocity = 0
    let time = 0
    let previousTotal = totalRef.current
    let particles: Particle[] = []
    let width = 320
    let height = 360
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width || 320
      height = rect.height || 360
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const spawn = (count: number, confetti = false) => {
      for (let i = 0; i < Math.min(count, 80); i++) {
        particles.push({
          x: width * (0.34 + Math.random() * 0.32), y: height * 0.2,
          vx: (Math.random() - 0.5) * (confetti ? 7 : 2.5),
          vy: confetti ? -2 - Math.random() * 5 : 1 + Math.random() * 2,
          r: confetti ? 3 + Math.random() * 4 : 5 + Math.random() * 4,
          spin: (Math.random() - 0.5) * 0.16, angle: Math.random() * Math.PI,
          color: confetti ? ['#f5b942', '#f07b61', '#7bb8a4', '#8e9ce6'][i % 4] : '#e8b44d',
          kind: confetti ? 'confetti' : 'coin',
        })
      }
    }
    const draw = (dt: number) => {
      time += dt
      const target = goalRef.current > 0 ? Math.min(totalRef.current / goalRef.current, 1) : 0
      velocity += (target - level) * 28 * dt
      velocity *= Math.pow(0.82, dt * 60)
      level += velocity * dt
      if (reducedMotion) level = target
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const jarW = Math.min(width * 0.66, 210)
      const jarH = Math.min(height * 0.66, 245)
      const left = cx - jarW / 2
      const top = height * 0.18
      const bottom = top + jarH
      const neckW = jarW * 0.42
      const neckH = jarH * 0.13
      const jarPath = new Path2D()
      jarPath.moveTo(cx - neckW / 2, top)
      jarPath.lineTo(cx - neckW / 2, top + neckH)
      jarPath.bezierCurveTo(left, top + neckH, left, top + neckH, left, top + neckH + jarH * 0.18)
      jarPath.lineTo(left, bottom - jarH * 0.18)
      jarPath.quadraticCurveTo(left, bottom, cx, bottom)
      jarPath.quadraticCurveTo(left + jarW, bottom, left + jarW, bottom - jarH * 0.18)
      jarPath.lineTo(left + jarW, top + neckH + jarH * 0.18)
      jarPath.bezierCurveTo(left + jarW, top + neckH, left + jarW, top + neckH, cx + neckW / 2, top + neckH)
      jarPath.lineTo(cx + neckW / 2, top)
      jarPath.closePath()

      ctx.save()
      ctx.clip(jarPath)
      const surface = bottom - jarH * 0.08 - Math.max(0, Math.min(1, level)) * jarH * 0.78
      const liquid = ctx.createLinearGradient(0, surface, 0, bottom)
      liquid.addColorStop(0, level > 0.65 ? '#f5c45e' : '#86c9d2')
      liquid.addColorStop(1, level > 0.65 ? '#e99457' : '#528fae')
      ctx.fillStyle = liquid
      ctx.beginPath()
      ctx.moveTo(left, bottom)
      ctx.lineTo(left, surface)
      for (let x = left; x <= left + jarW + 2; x += 4) {
        const y = surface + (reducedMotion ? 0 : Math.sin(x * 0.035 + time * 2.2) * 3 + Math.sin(x * 0.071 - time * 1.4) * 1.5)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(left + jarW, bottom)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.kind === 'confetti' ? 0.08 : 0.16
        p.angle += p.spin
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        if (p.kind === 'coin') {
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.7, 0, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = '#fff0b4'; ctx.lineWidth = 1; ctx.stroke()
        } else {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.7)
        }
        ctx.restore()
      }
      particles = particles.filter(p => p.y < height + 20 && p.x > -20 && p.x < width + 20)

      ctx.strokeStyle = 'rgba(62, 91, 100, 0.65)'
      ctx.lineWidth = 2
      ctx.stroke(jarPath)
      const shine = ctx.createLinearGradient(left, 0, left + jarW * 0.24, 0)
      shine.addColorStop(0, 'rgba(255,255,255,0.45)')
      shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = shine
      ctx.save(); ctx.clip(jarPath); ctx.fillRect(left, top, jarW * 0.24, jarH); ctx.restore()
      ctx.fillStyle = '#3e5961'
      ctx.font = '600 13px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.min(100, Math.round(target * 100))}%`, cx, bottom + 28)
    }
    const frame = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 0.04)
      last = now
      if (totalRef.current > previousTotal) {
        const amount = totalRef.current - previousTotal
        spawn(Math.max(3, Math.min(24, Math.ceil(Math.log10(amount / 1e6 + 1) * 12))))
        previousTotal = totalRef.current
      }
      if (eventRef.current !== celebrationKey) {
        eventRef.current = celebrationKey
        spawn(50, true)
      }
      draw(dt)
      raf = requestAnimationFrame(frame)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [celebrationKey])

  return <canvas ref={canvasRef} className="jar-canvas" role="img" aria-label="Animated tip jar showing progress toward the goal" />
}
