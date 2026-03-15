import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.POLLINATIONS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "请提供图片数据" },
        { status: 400 }
      );
    }

    // 简单检查图片是否为空（全白）
    // 如果 base64 长度太短，可能是空画布
    // 注意：即使是空白画布，base64 也可能包含大量数据（背景色）
    // 所以我们主要依赖后端 AI 的返回结果，这里暂时移除长度检查，避免误判
    if (image.length < 50) {
      return NextResponse.json(
        { error: "请确保画布上有绘画内容" },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "请配置 POLLINATIONS_API_KEY 环境变量" },
        { status: 500 }
      );
    }

    const payload = {
      model: "claude-airforce",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "用一句话简短中文描述这张图片画的是什么，并以 JSON 格式返回：{\"text\": \"描述内容\", \"confidence\": 0.8}" },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/png;base64,${image}`,
                detail: "low" 
              } 
            }
          ]
        }
      ],
      max_tokens: 500,
      seed: Math.floor(Math.random() * 1000000)
    };

    const response = await fetch("https://gen.pollinations.ai/v1/chat/completions?seed=" + Math.random(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Pollinations API Error:", error);
      return NextResponse.json(
        { error: `API请求失败: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    // 检查 API 返回结构
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid API response structure:", data);
      return NextResponse.json(
        { error: "API 返回格式异常，请稍后重试" },
        { status: 500 }
      );
    }

    const content = data.choices[0]?.message?.content;
    if (!content || content.trim() === "") {
      console.error("Empty content from API:", data);
      return NextResponse.json(
        { error: "无法识别：请确保画布上有清晰的绘画内容" },
        { status: 400 }
      );
    }

    let text = "";
    let confidence = 0.5; // 默认置信度
    
    try {
      // 尝试解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        text = parsed.text || content;
        confidence = parsed.confidence ?? 0.5;
      } else {
        text = content;
      }
    } catch {
      text = content;
    }

    // 清理文本
    text = text.replace(/[*#]/g, "").trim();

    return NextResponse.json({
      text: text,
      confidence: confidence,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "识别失败" },
      { status: 400 }
    );
  }
}
