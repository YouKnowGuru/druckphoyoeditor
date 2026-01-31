'use client'

import { useEffect, useRef } from 'react'

export default function ParticleTest() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Draw a simple test circle to verify canvas is working
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(100, 100, 50, 0, Math.PI * 2)
        ctx.fill()

        console.log('Test canvas rendered at', canvas.width, 'x', canvas.height)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 9999, border: '2px solid red' }}
        />
    )
}
