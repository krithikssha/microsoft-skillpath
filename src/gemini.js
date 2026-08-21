const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const MODEL = "gemini-3.6-flash"

const FALLBACK_MESSAGE =
  "This is your recommended next step because it builds on the skills you have already completed and moves you closer to your chosen career goal."

export async function getAIExplanation(
  nextItem,
  completedItems = [],
  remainingItems = [],
  domain = ""
) {
  // --------------------------------------------------
  // FALLBACK
  // If there is no API key, don't break the website.
  // --------------------------------------------------

  if (!API_KEY) {
    console.warn(
      "Gemini API key is missing. Showing fallback recommendation."
    )

    return FALLBACK_MESSAGE
  }

  // --------------------------------------------------
  // BUILD THE PROMPT
  // --------------------------------------------------

  const completedText =
    completedItems.length > 0
      ? completedItems.join(", ")
      : "None yet"

  const remainingText =
    remainingItems.length > 0
      ? remainingItems.join(", ")
      : "None"

  const prompt = `
You are an AI career-learning assistant inside a Microsoft learning roadmap.

The learner has chosen this career domain:
${domain}

The learner has already completed:
${completedText}

The recommended next step is:
${nextItem}

The remaining roadmap items are:
${remainingText}

Explain in 1 or 2 short sentences why this next step is useful for the learner.

Keep it:
- clear
- encouraging
- personalized
- beginner-friendly
- directly related to the learner's progress

Do not use headings.
Do not use bullet points.
Do not mention that you are an AI.
Do not use emojis.
Return only the recommendation text.
`

  // --------------------------------------------------
  // TRY GEMINI
  // --------------------------------------------------

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    )

    // ------------------------------------------------
    // HANDLE API ERRORS
    // ------------------------------------------------

    if (!response.ok) {
      let errorData = null

      try {
        errorData = await response.json()
      } catch {
        errorData = null
      }

      console.error(
        `Gemini API request failed: ${response.status}`,
        errorData
      )

      // 429 = quota/rate limit
      // We deliberately don't retry here because repeatedly
      // retrying can make the quota problem worse.
      if (response.status === 429) {
        console.warn(
          "Gemini quota exceeded. Showing fallback recommendation."
        )
      }

      return FALLBACK_MESSAGE
    }

    // ------------------------------------------------
    // READ RESPONSE
    // ------------------------------------------------

    const data = await response.json()

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    // ------------------------------------------------
    // EMPTY RESPONSE SAFETY
    // ------------------------------------------------

    if (
      !generatedText ||
      typeof generatedText !== "string" ||
      generatedText.trim() === ""
    ) {
      console.warn(
        "Gemini returned an empty response. Showing fallback recommendation."
      )

      return FALLBACK_MESSAGE
    }

    // ------------------------------------------------
    // CLEAN RESPONSE
    // ------------------------------------------------

    return generatedText.trim()
  } catch (error) {
    // ------------------------------------------------
    // NETWORK / UNEXPECTED ERROR
    // ------------------------------------------------

    console.error(
      "AI explanation error:",
      error
    )

    return FALLBACK_MESSAGE
  }
}