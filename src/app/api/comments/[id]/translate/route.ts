import { NextResponse } from "next/server";

type TranslateRequest = {
  text?: string;
  targetLanguage?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment ID is required",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as TranslateRequest;

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const targetLanguage =
      typeof body.targetLanguage === "string"
        ? body.targetLanguage.trim().toLowerCase()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Text is required",
        },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        {
          success: false,
          message: "Target language is required",
        },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Text cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    const supportedLanguages = [
      "en",
      "hi",
      "kn",
      "te",
      "ta",
      "ml",
      "mr",
      "bn",
      "gu",
      "pa",
      "ur",
    ];

    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported target language",
        },
        { status: 400 }
      );
    }

    const translationUrl =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx` +
      `&sl=auto` +
      `&tl=${encodeURIComponent(targetLanguage)}` +
      `&dt=t` +
      `&q=${encodeURIComponent(text)}`;

    const response = await fetch(translationUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Translation service returned ${response.status}`
      );
    }

    const data = await response.json();

    let translatedText = "";

    if (Array.isArray(data) && Array.isArray(data[0])) {
      translatedText = data[0]
        .filter(
          (item: unknown) =>
            Array.isArray(item) &&
            typeof item[0] === "string"
        )
        .map((item: string[]) => item[0])
        .join("");
    }

    if (!translatedText) {
      return NextResponse.json(
        {
          success: false,
          message: "Translation could not be generated",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commentId: id,
      originalText: text,
      translatedText,
      targetLanguage,
    });
  } catch (error) {
    console.error("Comment translation API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to translate comment",
      },
      { status: 500 }
    );
  }
}