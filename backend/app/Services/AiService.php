<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AiService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = env('LLM_API_KEY', '');
        $this->model   = env('LLM_MODEL', 'gpt-4o-mini');
        $this->baseUrl = rtrim(env('LLM_BASE_URL', 'https://api.openai.com/v1'), '/');
    }

    /**
     * Validate an uploaded document using AI.
     * Returns structured JSON result.
     */
    public function validateDocument(Document $doc, array $requiredDocs, string $documentType): array
    {
        $isImage = in_array($doc->mime_type, ['image/jpeg', 'image/png', 'image/jpg']);
        $isPdf   = $doc->mime_type === 'application/pdf';

        $prompt = $this->buildValidationPrompt($documentType, $requiredDocs, $doc->original_filename);

        $messages = [
            [
                'role'    => 'system',
                'content' => 'You are an expert document validator for a Philippine non-life insurance company. You analyze uploaded documents and check if they are valid, complete, and appropriate for the stated document type. Always respond with valid JSON only.',
            ],
        ];

        // Include image content if available
        if ($isImage && $this->apiKey) {
            $imageData = base64_encode(Storage::disk('private')->get($doc->file_path));
            $messages[] = [
                'role'    => 'user',
                'content' => [
                    [
                        'type'      => 'image_url',
                        'image_url' => [
                            'url' => 'data:' . $doc->mime_type . ';base64,' . $imageData,
                        ],
                    ],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ];
        } else {
            $messages[] = [
                'role'    => 'user',
                'content' => $prompt . "\n\nNote: This is a " . ($isPdf ? 'PDF' : 'document') . " file named: " . $doc->original_filename,
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post($this->baseUrl . '/chat/completions', [
            'model'       => $this->model,
            'messages'    => $messages,
            'max_tokens'  => 500,
            'temperature' => 0.1,
        ]);

        if ($response->failed()) {
            throw new \Exception('AI API error: ' . $response->status());
        }

        $content = $response->json('choices.0.message.content', '{}');

        // Strip markdown fences if present
        $content = preg_replace('/```json\s*|\s*```/', '', $content);

        $result = json_decode($content, true);

        // If the AI response could not be parsed as JSON, do not invent a passing
        // score. Flag the document for manual review with a neutral, honest result.
        if (!is_array($result) || !isset($result['score'])) {
            return [
                'is_valid'     => false,
                'score'        => 0,
                'issues'       => ['The automated check could not be completed for this upload.'],
                'suggestions'  => ['Please ensure the file is a clear image of the correct document, or wait for manual review by branch staff.'],
                'summary'      => 'Automated validation was inconclusive. This document requires manual review.',
            ];
        }

        return $result;
    }

    /**
     * Answer an FAQ query using AI with context.
     */
    public function answerFaq(string $question, array $faqContext): string
    {
        $faqText = collect($faqContext)->map(fn($f) => "Q: {$f['question']}\nA: {$f['answer']}")->implode("\n\n");

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post($this->baseUrl . '/chat/completions', [
            'model'      => $this->model,
            'messages'   => [
                [
                    'role'    => 'system',
                    'content' => "You are a helpful assistant for Bethel General Insurance and Surety Corporation – Legazpi Branch. Answer client questions based on the FAQ context provided. Be concise, professional, and friendly. If the answer is not in the FAQ, say so politely and suggest contacting the branch directly.\n\nFAQ Context:\n{$faqText}",
                ],
                ['role' => 'user', 'content' => $question],
            ],
            'max_tokens'  => 300,
            'temperature' => 0.3,
        ]);

        if ($response->failed()) {
            return "I'm sorry, I couldn't process your question right now. Please try again or contact our branch directly.";
        }

        return $response->json('choices.0.message.content', 'I could not find an answer. Please contact our branch directly.');
    }

    private function buildValidationPrompt(string $documentType, array $requiredDocs, string $filename): string
    {
        $requiredList = implode(', ', $requiredDocs);

        return <<<PROMPT
You are validating a document uploaded for a non-life insurance application in the Philippines.

Document Type Declared: {$documentType}
Filename: {$filename}
Required Documents for this application: {$requiredList}

Carefully examine the actual content of the image. Determine whether it genuinely shows the declared document type "{$documentType}". Look at what the image actually depicts, not the filename.

Return ONLY a JSON object with this exact structure:
{
  "is_valid": true/false,
  "score": 0-100,
  "document_type_match": true/false,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1"],
  "summary": "Brief 1-2 sentence summary of findings"
}

Scoring rules (be strict and honest):
- If the image clearly does NOT show the declared document type (for example, it is a selfie, a random photo, a screenshot, or an unrelated picture), set document_type_match to false, is_valid to false, and score between 0 and 25.
- If the image appears to be the correct document type but is blurry, incomplete, cropped, or hard to read, set is_valid to true, document_type_match to true, and score between 40 and 70, and list the specific problems in issues.
- If the image clearly shows a complete, legible, correct document of the declared type, set is_valid to true, document_type_match to true, and score between 80 and 100.
- Base the score on what you actually see in the image. Do not give a default or middle score. Different images must produce different scores.
- summary = a brief, specific assessment that mentions what the image actually appears to show.

For PDF files where the content cannot be seen, state in the summary that the content could not be inspected and that manual review is required, and use a neutral score of 60.
PROMPT;
    }
}
