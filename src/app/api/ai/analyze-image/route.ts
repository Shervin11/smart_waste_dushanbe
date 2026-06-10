import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const containerId = formData.get('containerId') as string | null;
    const fallbackPreset = formData.get('fallbackPreset') as string | null; // empty, full

    if (!containerId) {
      return NextResponse.json({ error: 'Missing containerId' }, { status: 400 });
    }

    // Check if container exists
    const container = await prisma.container.findUnique({
      where: { id: containerId },
    });

    if (!container) {
      return NextResponse.json({ error: `Container ${containerId} not found` }, { status: 404 });
    }

    let fillLevel = 15;
    let overflow = false;
    let detections = [{ class: 'waste_container', confidence: 0.98 }];
    let isMock = false;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !file || file.size === 0) {
      // Fallback Simulator mode if no API key or no file
      isMock = true;
      console.log('Running AI analysis in simulation mode (GEMINI_API_KEY missing or empty file)');

      if (fallbackPreset === 'empty') {
        fillLevel = 10;
        detections = [{ class: 'waste_container', confidence: 0.97 }];
      } else {
        // Default to overflow/full
        fillLevel = 98;
        overflow = true;
        detections = [
          { class: 'waste_container', confidence: 0.96 },
          { class: 'overflow_trash', confidence: 0.89 },
        ];
      }
    } else {
      // Real Gemini AI Mode
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        // Convert file to base64
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const base64Data = fileBuffer.toString('base64');

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        };

        const prompt = `
          Analyze this photo of a trash dump or container waste site.
          Strictly identify:
          1. The fill level of the container as a percentage integer (0 to 100).
          2. Whether there is an overflow of trash outside/around the container (true/false).
          3. List classes detected. Choose classes from: 'waste_container', 'overflow_trash', 'plastic_bottle'.
          
          You MUST respond in this JSON format strictly:
          {
            "fill_level": number,
            "overflow": boolean,
            "detections": [
              { "class": "waste_container" | "overflow_trash" | "plastic_bottle", "confidence": number }
            ]
          }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const aiOutput = JSON.parse(responseText);

        fillLevel = typeof aiOutput.fill_level === 'number' ? aiOutput.fill_level : fillLevel;
        overflow = typeof aiOutput.overflow === 'boolean' ? aiOutput.overflow : overflow;
        detections = Array.isArray(aiOutput.detections) ? aiOutput.detections : detections;
      } catch (e: unknown) {
        console.error('Gemini API call failed, falling back to mock:', e);
        isMock = true;
        // Fallback mock logic if API fails
        fillLevel = 90;
        overflow = true;
      }
    }

    // Update the database
    await prisma.container.update({
      where: { id: containerId },
      data: {
        fillLevel,
        overflow,
        lastUpdated: new Date(),
      },
    });

    // Auto-create Task if critical
    const isCritical = fillLevel >= 80 || overflow;
    let createdTask = null;

    if (isCritical) {
      const existingTask = await prisma.task.findFirst({
        where: {
          containerId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existingTask) {
        let priority = 'MEDIUM';
        if (overflow || fillLevel >= 95) {
          priority = 'HIGH';
        }

        createdTask = await prisma.task.create({
          data: {
            containerId,
            status: 'PENDING',
            priority,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      container_id: containerId,
      fill_level: fillLevel,
      overflow,
      timestamp: new Date().toISOString(),
      model: isMock ? 'YOLOv11-Waste-Dushanbe (Simulation)' : 'Gemini-2.5-Flash (Real AI)',
      confidence: isMock ? 0.94 : 0.97,
      detections,
      api_mode: isMock ? 'simulation' : 'real_gemini',
      task_created: !!createdTask,
      task: createdTask,
      notice: isMock ? 'GEMINI_API_KEY is missing. Running in simulator fallback mode.' : undefined,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analyze image error:', error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
