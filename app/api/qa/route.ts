import { searchPostChunks } from "@/lib/rag";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const ANSWER_MODEL = "gpt-4o-mini";
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

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

function buildContext(
    chunks: Array<{ content: string; postId: number; post: { title: string } }>,
) {
    if (!chunks.length) return "";
    return chunks
        .map((chunk, index) => {
            const title = chunk.post?.title ?? "제목 없음";
            return `[P${index + 1}] ${title}\n${chunk.content}`;
        })
        .join("\n\n");
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session.id) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }

        const body = (await request.json()) as { query?: string };
        const query = body.query?.trim();
        if (!query) {
            return NextResponse.json(
                { error: "query is required" },
                { status: 400 },
            );
        }

        const chunks = await searchPostChunks(query, 5);
        const context = buildContext(chunks);

        const systemPrompt = [
            "너는 우리 서비스의 Q&A 도우미야.",
            "가능하면 제공된 포스트 근거를 우선 사용하고, 부족하면 일반 지식을 보완해.",
            "추측은 '일반적으로' 같은 표현으로 완화해.",
            "필요하면 마지막에 '공식 기관 안내 확인'을 권장해.",
        ].join("\n");

        const userPrompt = [
            `질문: ${query}`,
            context ? `\n포스트 근거:\n${context}` : "",
        ].join("\n");

        const tools = VECTOR_STORE_ID
            ? [
                  {
                      type: "file_search",
                      vector_store_ids: [VECTOR_STORE_ID],
                  },
              ]
            : [];

        const response = await openaiRequest<{
            output_text?: string;
            output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
        }>("/responses", {
            model: ANSWER_MODEL,
            input: [
                {
                    role: "system",
                    content: [{ type: "input_text", text: systemPrompt }],
                },
                {
                    role: "user",
                    content: [{ type: "input_text", text: userPrompt }],
                },
            ],
            tools,
        });

        const answer =
            response.output_text ??
            response.output
                ?.flatMap((item) => item.content ?? [])
                .find((c) => c.type === "output_text")?.text ??
            "";

        return NextResponse.json({
            answer,
            sources: chunks.map((chunk) => ({
                postId: chunk.postId,
                title: chunk.post?.title ?? "제목 없음",
                snippet: chunk.content,
            })),
            ...(answer
                ? {}
                : {
                      debug: {
                          output_text: response.output_text ?? null,
                          output: response.output ?? null,
                      },
                  }),
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
