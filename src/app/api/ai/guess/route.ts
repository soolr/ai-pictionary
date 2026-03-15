import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.POLLINATIONS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    console.log("Received image length:", image?.length);
    console.log("Image prefix:", image?.substring(0, 50));

    if (!image) {
      return NextResponse.json(
        { error: "请提供图片数据" },
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
      model: "openai",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "请用一句话简短中文描述这张图片画的是什么。返回一个JSON格式：{\"text\":\"描述内容\",\"confidence\":0.8}，confidence表示识别可信度，0-1之间，越确定数值越高。" },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${image}`,
                detail: "high"
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
    console.log("Full API Response:", JSON.stringify(data, null, 2));
    
    // 如果 content 为空，返回友好提示而不是错误
    let content = data.choices?.[0]?.message?.content;
    
    // 检查是否有其他格式的响应
    if (!content && data.choices?.[0]?.message?.content === "") {
      // content 为空字符串，尝试其他字段
      content = data.choices?.[0]?.text || data.text || "";
    }
    // 如果 content 为空，返回友好提示而不是错误
    if (!content || content.trim() === "") {
      return NextResponse.json({
        text: "未能识别到绘画内容，请尝试画更清晰的图案",
        confidence: 0.2,
        timestamp: Date.now(),
      });
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

    // 如果解析失败或内容为空，返回默认值
    if (!text || text.trim() === "") {
      return NextResponse.json({
        text: "未识别到绘画内容，请尝试画出更清晰的图案",
        confidence: 0.3,
        timestamp: Date.now(),
      });
    }

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
