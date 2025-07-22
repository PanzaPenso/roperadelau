import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { productName, productType, productColor, productDescription, productImageUrl } = await req.json();
  const prompt = `Eres un asistente de moda. Elabora exactamente 2 o 3 sugerencias de conjuntos de moda que incluyan obligatoriamente la prenda mostrada (nombre: ${productName}). No recomiendes reemplazarla ni uses otra prenda principal. El cliente está viendo la imagen de la prenda en la siguiente URL: ${productImageUrl}. Cada sugerencia debe ser una sola frase clara, comenzando con un número y un punto. No incluyas títulos ni listas secundarias.\n\nPrenda: ${productName}\nTipo: ${productType}\nColor: ${productColor}\nDescripción: ${productDescription || ''}`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Eres un asistente de moda útil y creativo.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await response.json();
  const aiText = data.choices?.[0]?.message?.content || 'No hay sugerencia disponible.';
  return NextResponse.json({ suggestion: aiText });
} 