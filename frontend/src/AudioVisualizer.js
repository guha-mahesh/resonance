import React from 'react';
import Sketch from 'react-p5';

const AudioVisualizer = ({ sentiment, emotion, intensity, keywords }) => {
    const setup = (p5, canvasParentRef) => {
        const width = window.innerWidth || p5.windowWidth;
        const height = window.innerHeight || p5.windowHeight;

        const canvas = p5.createCanvas(width, height);
        canvas.parent(canvasParentRef);
        canvas.style('position', 'fixed');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '0');
        p5.colorMode(p5.RGB);
    };

    const draw = (p5) => {
        p5.background(20, 20, 30, 50);

        const numBars = 120;
        const centerX = p5.width / 2;
        const centerY = p5.height / 2;
        const baseRadius = 150;
        const time = p5.frameCount * 0.01;

        const colorMap = {
            happy: { r: 255, g: 180, b: 162 },
            excited: { r: 255, g: 20, b: 147 },
            calm: { r: 111, g: 168, b: 165 },
            sad: { r: 90, g: 106, b: 140 },
            angry: { r: 220, g: 20, b: 60 },
            anxious: { r: 184, g: 196, b: 107 },
            neutral: { r: 112, g: 128, b: 144 }
        };

        const colors = colorMap[emotion] || colorMap.neutral;

        for (let i = 0; i < numBars; i++) {
            const angle = (i / numBars) * p5.TWO_PI;
            const noiseVal = p5.noise(i * 0.1, time);

            let barHeight = noiseVal * intensity * 250;

            if (emotion === 'excited') {
                barHeight *= (1.5 + intensity * 0.5);
                barHeight += p5.random(-30 * intensity, 30 * intensity);
            } else if (emotion === 'calm') {
                barHeight *= (0.7 - intensity * 0.15);
            } else if (emotion === 'angry') {
                barHeight *= (1.3 + intensity * 0.4);
                barHeight += p5.sin(time * (10 + intensity * 15) + i) * (40 * intensity);
            } else if (emotion === 'anxious') {
                barHeight += p5.random(-50 * intensity, 50 * intensity);
            } else if (emotion === 'sad') {
                barHeight *= (0.8 - intensity * 0.2);
            } else if (emotion === 'happy') {
                barHeight *= (1.2 + intensity * 0.3);
            }

            const x1 = centerX + p5.cos(angle) * baseRadius;
            const y1 = centerY + p5.sin(angle) * baseRadius;
            const x2 = centerX + p5.cos(angle) * (baseRadius + barHeight);
            const y2 = centerY + p5.sin(angle) * (baseRadius + barHeight);

            const alpha = p5.map(noiseVal, 0, 1, 100, 255);
            p5.stroke(colors.r, colors.g, colors.b, alpha);
            p5.strokeWeight(3);
            p5.line(x1, y1, x2, y2);
        }

        p5.fill(colors.r, colors.g, colors.b, 30);
        p5.noStroke();
        p5.circle(centerX, centerY, baseRadius * 2);
    };

    const windowResized = (p5) => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };

    return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default AudioVisualizer;