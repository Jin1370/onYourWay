import db from "@/lib/db";
import { getLifelogText } from "@/lib/post-content";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const EMBEDDING_MODEL = "text-embedding-3-small";

function normalizeWhitespace(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

export function chunkText(text: string, maxChars = 800, overlap = 100) {
    const paragraphs = text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);

    const chunks: string[] = [];
    let buffer = "";

    for (const paragraph of paragraphs) {
        const next = buffer ? `${buffer} ${paragraph}` : paragraph;
        if (next.length <= maxChars) {
            buffer = next;
            continue;
        }

        if (buffer) {
            chunks.push(buffer);
        }
        buffer = paragraph;
    }

    if (buffer) {
        chunks.push(buffer);
    }

    if (overlap > 0 && chunks.length > 1) {
        return chunks.map((chunk, index) => {
            if (index === 0) return chunk;
            const prev = chunks[index - 1];
            const tail = prev.slice(Math.max(0, prev.length - overlap));
            return `${tail} ${chunk}`.trim();
        });
    }

    return chunks;
}

async function openaiRequest<T>(path: string, body: unknown): Promise<T> {
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
    }
    const response = await fetch(`${OPENAI_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI request failed: ${errorText}`);
    }
    return (await response.json()) as T;
}

export async function createEmbedding(input: string) {
    const payload = {
        model: EMBEDDING_MODEL,
        input,
    };
    const result = await openaiRequest<{
        data: Array<{ embedding: number[] }>;
    }>("/embeddings", payload);

    return result.data[0]?.embedding ?? [];
}

export async function indexPostChunks(postId: number, title: string, content: string) {
    const rawText = `${title}\n${getLifelogText(content)}`;
    const text = normalizeWhitespace(rawText);
    if (!text) return;

    const chunks = chunkText(text);
    await db.postChunk.deleteMany({ where: { postId } });

    for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk);
        await db.postChunk.create({
            data: {
                postId,
                content: chunk,
                embedding,
            },
        });
    }
}

function cosineSimilarity(a: number[], b: number[]) {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchPostChunks(query: string, limit = 5) {
    const queryEmbedding = await createEmbedding(query);
    const chunks = await db.postChunk.findMany({
        select: {
            id: true,
            postId: true,
            content: true,
            embedding: true,
            post: {
                select: {
                    title: true,
                },
            },
        },
    });

    const scored = chunks
        .map((chunk) => {
            const embedding = chunk.embedding as number[];
            const score = cosineSimilarity(queryEmbedding, embedding);
            return { ...chunk, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored;
}
