/**
 * Background Removal Service
 * Handles multiple API providers with automatic fallback
 */

export interface BackgroundRemovalResult {
    success: boolean
    imageUrl?: string
    provider?: string
    error?: string
}

interface APIProvider {
    name: string
    apiKey: string
    removeBackground: (imageBlob: Blob) => Promise<Blob>
}

class BackgroundRemovalService {
    private providers: APIProvider[] = []
    private currentProviderIndex = 0

    constructor() {
        this.initializeProviders()
    }

    private initializeProviders() {
        // Clipdrop API Keys
        const clipdropKey1 = process.env.NEXT_PUBLIC_CLIPDROP_API_KEY_1
        const clipdropKey2 = process.env.NEXT_PUBLIC_CLIPDROP_API_KEY_2

        // Remove.bg API Keys
        const removebgKey1 = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY_1
        const removebgKey2 = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY_2

        // Add Clipdrop providers
        if (clipdropKey1) {
            this.providers.push({
                name: 'Clipdrop API #1',
                apiKey: clipdropKey1,
                removeBackground: this.clipdropRemoveBackground.bind(this, clipdropKey1),
            })
        }

        if (clipdropKey2) {
            this.providers.push({
                name: 'Clipdrop API #2',
                apiKey: clipdropKey2,
                removeBackground: this.clipdropRemoveBackground.bind(this, clipdropKey2),
            })
        }

        // Add Remove.bg providers
        if (removebgKey1) {
            this.providers.push({
                name: 'Remove.bg API #1',
                apiKey: removebgKey1,
                removeBackground: this.removebgRemoveBackground.bind(this, removebgKey1),
            })
        }

        if (removebgKey2) {
            this.providers.push({
                name: 'Remove.bg API #2',
                apiKey: removebgKey2,
                removeBackground: this.removebgRemoveBackground.bind(this, removebgKey2),
            })
        }

        if (this.providers.length === 0) {
            console.warn('No API keys configured for background removal')
        }
    }

    /**
     * Clipdrop API implementation
     */
    private async clipdropRemoveBackground(apiKey: string, imageBlob: Blob): Promise<Blob> {
        const formData = new FormData()
        formData.append('image_file', imageBlob)

        const response = await fetch('https://clipdrop.co/api/remove-background/v1', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Clipdrop API error: ${response.status} - ${errorText}`)
        }

        return await response.blob()
    }

    /**
     * Remove.bg API implementation
     */
    private async removebgRemoveBackground(apiKey: string, imageBlob: Blob): Promise<Blob> {
        const formData = new FormData()
        formData.append('image_file', imageBlob)
        formData.append('size', 'auto')

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`)
        }

        return await response.blob()
    }

    /**
     * Main method to remove background with automatic fallback
     */
    async removeBackground(
        imageUrl: string,
        onProgress?: (message: string, provider: string) => void
    ): Promise<BackgroundRemovalResult> {
        if (this.providers.length === 0) {
            return {
                success: false,
                error: 'No API providers configured. Please check your environment variables.',
            }
        }

        // Convert image URL to blob
        let imageBlob: Blob
        try {
            const response = await fetch(imageUrl)
            if (!response.ok) {
                throw new Error('Failed to fetch image')
            }
            imageBlob = await response.blob()
        } catch (error: any) {
            return {
                success: false,
                error: `Failed to load image: ${error.message}`,
            }
        }

        // Try each provider in sequence
        const errors: string[] = []

        for (let i = 0; i < this.providers.length; i++) {
            const providerIndex = (this.currentProviderIndex + i) % this.providers.length
            const provider = this.providers[providerIndex]

            try {
                onProgress?.(`Trying ${provider.name}...`, provider.name)

                const resultBlob = await provider.removeBackground(imageBlob)

                // Convert blob to data URL
                const dataUrl = await this.blobToDataUrl(resultBlob)

                // Success! Update current provider index for next time
                this.currentProviderIndex = providerIndex

                return {
                    success: true,
                    imageUrl: dataUrl,
                    provider: provider.name,
                }
            } catch (error: any) {
                const errorMessage = error.message || 'Unknown error'
                errors.push(`${provider.name}: ${errorMessage}`)
                console.warn(`${provider.name} failed:`, errorMessage)

                // Check if it's a credit/quota error
                if (
                    errorMessage.includes('402') || // Payment required
                    errorMessage.includes('429') || // Rate limit
                    errorMessage.includes('quota') ||
                    errorMessage.includes('credits')
                ) {
                    console.log(`${provider.name} credits exhausted, trying next provider...`)
                    // Continue to next provider
                    continue
                }

                // For other errors, still try next provider but log differently
                console.log(`${provider.name} encountered error, trying next provider...`)
            }
        }

        // All providers failed
        return {
            success: false,
            error: `All API providers failed:\n${errors.join('\n')}`,
        }
    }

    /**
     * Convert blob to data URL
     */
    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                if (result) {
                    resolve(result)
                } else {
                    reject(new Error('Failed to convert blob to data URL'))
                }
            }
            reader.onerror = () => reject(new Error('FileReader error'))
            reader.readAsDataURL(blob)
        })
    }

    /**
     * Get list of available providers
     */
    getAvailableProviders(): string[] {
        return this.providers.map((p) => p.name)
    }

    /**
     * Get current provider name
     */
    getCurrentProvider(): string | null {
        if (this.providers.length === 0) return null
        return this.providers[this.currentProviderIndex].name
    }
}

// Export singleton instance
export const backgroundRemovalService = new BackgroundRemovalService()
