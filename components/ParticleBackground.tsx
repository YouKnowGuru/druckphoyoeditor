'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    speed: number
    size: number
    opacity: number
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
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

        // Initialize particles
        const initParticles = () => {
            const particles: Particle[] = []
            const particleCount = Math.floor((canvas.width * canvas.height) / 20000)

            for (let i = 0; i < particleCount; i++) {
                particles.push(createParticle())
            }
            particlesRef.current = particles
            console.log(`White glowing particles initialized: ${particles.length} particles`)
        }

        const createParticle = (): Particle => {
            return {
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 100,
                speed: Math.random() * 0.5 + 0.3,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
            }
        }

        initParticles()

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current.forEach((particle, index) => {
                // Move particle upward
                particle.y -= particle.speed

                // Reset particle when it goes off screen
                if (particle.y < -10) {
                    particlesRef.current[index] = createParticle()
                    return
                }

                // Draw particle with glow
                ctx.save()

                // Outer glow
                ctx.shadowBlur = 8
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'

                // Create radial gradient for soft glow
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                )
                gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity})`)
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${particle.opacity * 0.5})`)
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

                ctx.fillStyle = gradient
                ctx.globalAlpha = particle.opacity

                // Draw circle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
                ctx.fill()

                // Draw bright center
                ctx.shadowBlur = 4
                ctx.fillStyle = 'rgba(255, 255, 255, 1)'
                ctx.globalAlpha = particle.opacity * 0.8
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()

                ctx.restore()
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ opacity: 0.6, zIndex: 0 }}
        />
    )
}
