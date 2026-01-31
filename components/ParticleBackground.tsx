'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    color: string
    shape: 'circle' | 'square' | 'triangle' | 'hexagon'
    rotation: number
    rotationSpeed: number
    pulsePhase: number
    pulseSpeed: number
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const animationFrameRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Color palette based on your Bhutan theme - more vibrant
        const colors = [
            'rgba(255, 153, 51, 0.8)',   // Saffron
            'rgba(220, 20, 60, 0.8)',     // Royal Red
            'rgba(255, 215, 0, 0.8)',     // Gold
            'rgba(70, 130, 180, 0.8)',    // Mountain Blue
            'rgba(255, 105, 180, 0.8)',   // Hot Pink accent
            'rgba(138, 43, 226, 0.8)',    // Blue Violet accent
        ]

        // Initialize particles
        const initParticles = () => {
            const particles: Particle[] = []
            const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80)

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 8 + 4,
                    opacity: Math.random() * 0.3 + 0.6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: ['circle', 'square', 'triangle', 'hexagon'][Math.floor(Math.random() * 4)] as Particle['shape'],
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    pulsePhase: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.01,
                })
            }
            particlesRef.current = particles
        }

        initParticles()
        console.log(`Particles initialized: ${particlesRef.current.length} particles created`)

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Draw shape functions
        const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fill()
        }

        const drawSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.fillRect(x - size, y - size, size * 2, size * 2)
        }

        const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.beginPath()
            ctx.moveTo(x, y - size)
            ctx.lineTo(x + size, y + size)
            ctx.lineTo(x - size, y + size)
            ctx.closePath()
            ctx.fill()
        }

        const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i
                const hx = x + size * Math.cos(angle)
                const hy = y + size * Math.sin(angle)
                if (i === 0) ctx.moveTo(hx, hy)
                else ctx.lineTo(hx, hy)
            }
            ctx.closePath()
            ctx.fill()
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Wrap around edges
                if (particle.x < -20) particle.x = canvas.width + 20
                if (particle.x > canvas.width + 20) particle.x = -20
                if (particle.y < -20) particle.y = canvas.height + 20
                if (particle.y > canvas.height + 20) particle.y = -20

                // Mouse interaction
                const dx = mouseRef.current.x - particle.x
                const dy = mouseRef.current.y - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const maxDistance = 150

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance
                    particle.x -= (dx / distance) * force * 2
                    particle.y -= (dy / distance) * force * 2
                }

                // Update rotation and pulse
                particle.rotation += particle.rotationSpeed
                particle.pulsePhase += particle.pulseSpeed
                const pulse = Math.sin(particle.pulsePhase) * 0.3 + 1

                // Draw particle
                ctx.save()
                ctx.translate(particle.x, particle.y)
                ctx.rotate(particle.rotation)

                // Create gradient for particle
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * pulse * 2)
                gradient.addColorStop(0, particle.color)
                gradient.addColorStop(1, particle.color.replace(/[\d.]+\)$/g, '0)'))

                ctx.fillStyle = gradient
                ctx.globalAlpha = particle.opacity * (0.7 + Math.sin(particle.pulsePhase) * 0.3)

                // Draw shape
                const size = particle.size * pulse
                switch (particle.shape) {
                    case 'circle':
                        drawCircle(ctx, 0, 0, size)
                        break
                    case 'square':
                        drawSquare(ctx, 0, 0, size)
                        break
                    case 'triangle':
                        drawTriangle(ctx, 0, 0, size)
                        break
                    case 'hexagon':
                        drawHexagon(ctx, 0, 0, size)
                        break
                }

                ctx.restore()

                // Draw connections
                particlesRef.current.slice(index + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(otherParticle.x, otherParticle.y)

                        const gradient = ctx.createLinearGradient(
                            particle.x, particle.y,
                            otherParticle.x, otherParticle.y
                        )
                        gradient.addColorStop(0, particle.color)
                        gradient.addColorStop(1, otherParticle.color)

                        ctx.strokeStyle = gradient
                        ctx.globalAlpha = (1 - distance / 120) * 0.2
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                })
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ opacity: 0.7, zIndex: 0 }}
        />
    )
}
