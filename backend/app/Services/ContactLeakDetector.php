<?php

namespace App\Services;

/**
 * Anti-bypass guard: detects contact details (phone numbers, emails,
 * WhatsApp links) shared in user generated content (FIT-CHAT-04, FIT-JOB-08).
 */
class ContactLeakDetector
{
    /** @var array<string, string> */
    private const PATTERNS = [
        'phone' => '/(?:\+?237|\+?[0-9]{1,3})?[\s.-]?(?:\(?\d{2,3}\)?[\s.-]?)?\d{2,3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/',
        'email' => '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/',
        'whatsapp' => '/(?:wa\.me|whatsapp\.com|api\.whatsapp)\/?[^\s]*/i',
        'telegram' => '/(?:t\.me|telegram\.me)\/?[^\s]*/i',
        'social_handle' => '/(?:appelle[sz]?[- ]moi|call me|contact me)\s+(?:au|on|at)\s+\S+/iu',
    ];

    /**
     * @return list<string> The kinds of contact details detected (empty when clean).
     */
    public function detect(?string $text): array
    {
        if (blank($text)) {
            return [];
        }

        $found = [];

        foreach (self::PATTERNS as $kind => $pattern) {
            if ($kind === 'phone') {
                // Only flag digit sequences long enough to be real phone numbers.
                if (preg_match('/(?:\+?\d[\s.\-]?){8,}/', $text)) {
                    $found[] = $kind;
                }

                continue;
            }

            if (preg_match($pattern, $text)) {
                $found[] = $kind;
            }
        }

        return $found;
    }

    public function isClean(?string $text): bool
    {
        return $this->detect($text) === [];
    }
}
