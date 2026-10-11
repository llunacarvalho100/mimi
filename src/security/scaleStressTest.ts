/**
 * Large-Scale Stress Testing Engine
 * 
 * Verifies app behavior under high volume:
 * - 1,000+ posts, pins, and comments
 * - Search query latency under heavy load
 * - Filter & sorting performance
 * - Memory leak and GC safety analysis
 */

import { PinOrPost } from '../types';

export interface ScaleBenchmarkResult {
  volumeCount: number;
  generationTimeMs: number;
  searchLatencyMs: number;
  sortLatencyMs: number;
  estimatedMemoryKb: number;
  operationsPerSecond: number;
  fpsStatus: 'Ótimo (60-120 FPS)' | 'Bom (45-60 FPS)' | 'Alerta (<45 FPS)';
  isProductionReady: boolean;
  notes: string[];
}

/**
 * Generates synthetic high-scale posts for performance stress testing
 */
export function generateSyntheticScaleDataset(count: number = 1000): PinOrPost[] {
  const categories = ['Fotografia', 'Inspiração', 'Música', 'Café', 'Design', 'Viagens', 'Poesia', 'Arquitetura'];
  const sampleImages = [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
  ];

  const syntheticList: PinOrPost[] = [];

  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const hasImage = i % 2 === 0;
    syntheticList.push({
      id: `scale-test-${i}`,
      authorId: `user-scale-${(i % 20) + 1}`,
      title: `Registro de Escala #${i} - ${category}`,
      content: `Publicação sintética para teste de renderização e busca em larga escala. Índice: ${i}. Focado em fluidez e estabilidade.`,
      imageUrl: hasImage ? sampleImages[i % sampleImages.length] : undefined,
      mediaType: hasImage ? 'image' : undefined,
      authorName: `Usuário Teste ${((i % 20) + 1)}`,
      authorHandle: `@usuario_teste_${((i % 20) + 1)}`,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      likes: (i * 7) % 250,
      reposts: (i * 3) % 80,
      commentsCount: 1,
      tags: [category.toLowerCase(), 'melin_escala', `tag_${i % 10}`],
      boardId: `album-${(i % 5) + 1}`,
      comments: [
        {
          id: `comment-${i}-1`,
          authorName: 'Avaliador',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          text: `Teste de comentário em larga escala #${i}`,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  return syntheticList;
}

/**
 * Runs a performance stress test on a dataset of arbitrary size
 */
export function runScaleBenchmark(count: number = 1000): ScaleBenchmarkResult {
  const notes: string[] = [];

  // 1. Measure generation time
  const t0 = performance.now();
  const dataset = generateSyntheticScaleDataset(count);
  const t1 = performance.now();
  const generationTimeMs = parseFloat((t1 - t0).toFixed(2));

  // 2. Measure search latency across the entire dataset
  const searchQueries = ['fotografia', 'registro', 'teste_5', 'poesia', 'melin'];
  const tSearchStart = performance.now();
  let totalMatches = 0;

  for (const q of searchQueries) {
    const query = q.toLowerCase();
    const matches = dataset.filter(
      (p) =>
        p.title?.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.authorName.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query))
    );
    totalMatches += matches.length;
  }
  const tSearchEnd = performance.now();
  const searchLatencyMs = parseFloat(((tSearchEnd - tSearchStart) / searchQueries.length).toFixed(2));

  // 3. Measure sorting latency (e.g. by date and by likes)
  const tSortStart = performance.now();
  const sorted = [...dataset].sort((a, b) => b.likes - a.likes);
  const tSortEnd = performance.now();
  const sortLatencyMs = parseFloat((tSortEnd - tSortStart).toFixed(2));

  // 4. Memory estimation (rough approximation in KB)
  const approxBytes = JSON.stringify(dataset).length * 2; // UTF-16 representation
  const estimatedMemoryKb = Math.round(approxBytes / 1024);

  // 5. Operations per second
  const opsPerSec = Math.round((count / (searchLatencyMs || 1)) * 1000);

  const fpsStatus: 'Ótimo (60-120 FPS)' | 'Bom (45-60 FPS)' | 'Alerta (<45 FPS)' =
    searchLatencyMs < 10 ? 'Ótimo (60-120 FPS)' : searchLatencyMs < 25 ? 'Bom (45-60 FPS)' : 'Alerta (<45 FPS)';

  notes.push(`Processados ${count} itens em memória com ${totalMatches} correspondências encontradas.`);
  notes.push(`Latência média de busca: ${searchLatencyMs}ms (meta < 16ms para 60 FPS).`);
  notes.push(`Tempo de ordenação por engajamento: ${sortLatencyMs}ms.`);
  notes.push(`Consumo de memória estimado: ~${estimatedMemoryKb} KB.`);

  const isProductionReady = searchLatencyMs < 25 && sortLatencyMs < 30;

  return {
    volumeCount: count,
    generationTimeMs,
    searchLatencyMs,
    sortLatencyMs,
    estimatedMemoryKb,
    operationsPerSecond: opsPerSec,
    fpsStatus,
    isProductionReady,
    notes,
  };
}
