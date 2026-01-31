// Web Worker for background removal processing
// This runs in a separate thread to keep the UI responsive

self.addEventListener('message', async (e) => {
  const { type, imageData, imageUrl } = e.data;

  if (type === 'REMOVE_BACKGROUND') {
    try {
      // Report progress
      self.postMessage({ type: 'PROGRESS', progress: 10, message: 'Loading image...' });

      // Try to use @imgly/background-removal library
      try {
        self.postMessage({ type: 'PROGRESS', progress: 20, message: 'Initializing AI model...' });

        // Import the library dynamically
        const bgRemovalModule = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.3/+esm');

        self.postMessage({ type: 'PROGRESS', progress: 40, message: 'Processing image...' });

        let removeBackgroundFn = bgRemovalModule.removeBackground;
        if (!removeBackgroundFn && bgRemovalModule.default) {
          removeBackgroundFn = typeof bgRemovalModule.default === 'function'
            ? bgRemovalModule.default
            : bgRemovalModule.default.removeBackground;
        }

        if (removeBackgroundFn && typeof removeBackgroundFn === 'function') {
          // Fetch the image
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch image');
          }

          const blob = await response.blob();

          self.postMessage({ type: 'PROGRESS', progress: 60, message: 'Removing background...' });

          // Process with the library using proper configuration
          let resultBlob;
          try {
            resultBlob = await removeBackgroundFn(blob, {
              model: 'isnet', // Use the default high-quality model
              output: {
                format: 'image/png',
                quality: 1.0 // Maximum quality
              },
              progress: (key, current, total) => {
                const progressPercent = 60 + Math.floor((current / total) * 30);
                self.postMessage({
                  type: 'PROGRESS',
                  progress: progressPercent,
                  message: `Removing background... (${key})`
                });
              }
            });
          } catch (optionsError) {
            console.warn('Trying without options:', optionsError);
            resultBlob = await removeBackgroundFn(blob);
          }

          self.postMessage({ type: 'PROGRESS', progress: 95, message: 'Finalizing...' });

          // Convert blob to data URL
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result) {
              self.postMessage({
                type: 'SUCCESS',
                imageUrl: result,
                progress: 100,
                message: 'Complete!'
              });
            }
          };
          reader.onerror = () => {
            throw new Error('Failed to read result');
          };
          reader.readAsDataURL(resultBlob);
          return;
        }
      } catch (libError) {
        console.warn('Library-based background removal failed, using fallback:', libError);
        self.postMessage({ type: 'PROGRESS', progress: 30, message: 'Using fallback method...' });
      }

      // Fallback: Canvas-based background removal
      self.postMessage({ type: 'PROGRESS', progress: 50, message: 'Processing with fallback...' });

      // Create an OffscreenCanvas for processing
      const img = await createImageBitmap(await (await fetch(imageUrl)).blob());
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      self.postMessage({ type: 'PROGRESS', progress: 70, message: 'Analyzing image...' });

      // Sample corner pixels (likely background)
      const edgeThreshold = 30;
      const cornerPixels = [];
      const corners = [
        [0, 0], [canvas.width - 1, 0],
        [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
      ];

      corners.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        cornerPixels.push(data[idx], data[idx + 1], data[idx + 2]);
      });

      // Calculate average corner color (background color)
      const avgR = cornerPixels.filter((_, i) => i % 3 === 0).reduce((a, b) => a + b, 0) / 4;
      const avgG = cornerPixels.filter((_, i) => i % 3 === 1).reduce((a, b) => a + b, 0) / 4;
      const avgB = cornerPixels.filter((_, i) => i % 3 === 2).reduce((a, b) => a + b, 0) / 4;

      self.postMessage({ type: 'PROGRESS', progress: 80, message: 'Removing background...' });

      // Make background transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(r - avgR, 2) +
          Math.pow(g - avgG, 2) +
          Math.pow(b - avgB, 2)
        );

        // If pixel is similar to background, make it transparent
        if (distance < edgeThreshold) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageDataObj, 0, 0);

      self.postMessage({ type: 'PROGRESS', progress: 95, message: 'Finalizing...' });

      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const reader = new FileReader();
      reader.onloadend = () => {
        self.postMessage({
          type: 'SUCCESS',
          imageUrl: reader.result,
          progress: 100,
          message: 'Complete!'
        });
      };
      reader.readAsDataURL(blob);

    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error.message || 'Unknown error occurred'
      });
    }
  }
});
