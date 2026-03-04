interface TiptapNode {
    type?: string;
    text?: string;
    attrs?: {
        src?: string;
    };
    content?: TiptapNode[];
}

function parseTiptapContent(content: string): TiptapNode | null {
    try {
        const parsed = JSON.parse(content) as TiptapNode;
        if (!parsed || typeof parsed !== "object") return null;
        return parsed;
    } catch {
        return null;
    }
}

function walkNodes(node: TiptapNode, fn: (current: TiptapNode) => void) {
    fn(node);
    if (Array.isArray(node.content)) {
        for (const child of node.content) {
            if (child && typeof child === "object") {
                walkNodes(child, fn);
            }
        }
    }
}

export function hasLifelogContent(content: string) {
    const doc = parseTiptapContent(content);
    if (!doc) return content.trim().length > 0;

    let hasContent = false;
    walkNodes(doc, (node) => {
        if (hasContent) return;
        if (node.type === "image" && node.attrs?.src) {
            hasContent = true;
            return;
        }
        if (typeof node.text === "string" && node.text.trim().length > 0) {
            hasContent = true;
        }
    });
    return hasContent;
}

export function getLifelogPreview(content: string) {
    const doc = parseTiptapContent(content);
    if (!doc) return content;

    let firstText = "";
    let hasImage = false;
    walkNodes(doc, (node) => {
        if (!firstText && typeof node.text === "string" && node.text.trim()) {
            firstText = node.text.trim();
        }
        if (node.type === "image" && node.attrs?.src) {
            hasImage = true;
        }
    });

    if (firstText) return firstText;
    if (hasImage) return "[사진]";
    return "";
}

export function getLifelogFirstImage(content: string) {
    const doc = parseTiptapContent(content);
    if (!doc) return null;

    let firstImage: string | null = null;
    walkNodes(doc, (node) => {
        if (firstImage) return;
        if (node.type === "image" && typeof node.attrs?.src === "string") {
            firstImage = node.attrs.src;
        }
    });

    return firstImage;
}

