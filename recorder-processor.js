// AudioWorklet Processor for efficient audio recording
// This runs in a separate thread to avoid glitches

class RecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffers = [[], []]; // Left and right channels
        this.isRecording = false;
        
        this.port.onmessage = (event) => {
            if (event.data.command === 'start') {
                this.buffers = [[], []];
                this.isRecording = true;
            } else if (event.data.command === 'stop') {
                this.isRecording = false;
                // Send collected buffers back to main thread
                this.port.postMessage({
                    command: 'buffers',
                    buffers: this.buffers,
                    sampleRate: sampleRate
                });
                this.buffers = [[], []];
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        
        if (this.isRecording && input && input.length > 0) {
            // Copy input samples to our buffers
            for (let channel = 0; channel < Math.min(input.length, 2); channel++) {
                const channelData = input[channel];
                if (channelData) {
                    // Store Float32Array chunks directly for efficiency
                    this.buffers[channel].push(new Float32Array(channelData));
                }
            }
        }
        
        // Pass through audio unchanged
        for (let channel = 0; channel < outputs[0].length; channel++) {
            const inputChannel = input[channel];
            const outputChannel = outputs[0][channel];
            if (inputChannel && outputChannel) {
                outputChannel.set(inputChannel);
            }
        }
        
        return true; // Keep processor alive
    }
}

registerProcessor('recorder-processor', RecorderProcessor);
