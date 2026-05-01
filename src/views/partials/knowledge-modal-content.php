<?php
$knowledgeDir = __DIR__ . '/../../knowledge';
$knowledgeFiles = [];

if (is_dir($knowledgeDir)) {
    foreach (scandir($knowledgeDir) as $fileName) {
        if ($fileName === '.' || $fileName === '..') {
            continue;
        }
        $filePath = $knowledgeDir . '/' . $fileName;
        if (is_file($filePath) && strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === 'md') {
            $knowledgeFiles[] = $filePath;
        }
    }
}

natsort($knowledgeFiles);
$knowledgeFiles = array_values($knowledgeFiles);

if (!function_exists('knowledge_md_safe_url')) {
    function knowledge_md_safe_url($url)
    {
        $url = trim($url);
        if ($url === '') {
            return '#';
        }

        $isHttp = preg_match('#^https?://[^\s]+$#', $url) === 1;
        $isLocal = preg_match('#^(/|\./|\.\./)?[A-Za-z0-9_./\-%+]+$#', $url) === 1;
        $allowed = $isHttp || $isLocal;
        return $allowed ? $url : '#';
    }
}

if (!function_exists('knowledge_md_inline')) {
    function knowledge_md_inline($text)
    {
        $safe = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

        $safe = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $safe);
        $safe = preg_replace('/`([^`]+)`/', '<code class="px-1 py-0.5 rounded bg-slate-100 text-slate-700">$1</code>', $safe);

        $safe = preg_replace_callback(
            '/\[([^\]]+)\]\(([^\)]+)\)/',
            static function ($matches) {
                $label = $matches[1];
                $url = knowledge_md_safe_url($matches[2]);
                return '<a href="' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline">' . $label . '</a>';
            },
            $safe
        );

        return $safe;
    }
}

if (!function_exists('knowledge_md_to_html')) {
    function knowledge_md_to_html($markdown)
    {
        $lines = preg_split('/\r\n|\r|\n/', $markdown);
        $html = [];
        $inUl = false;
        $inOl = false;

        $closeLists = static function () use (&$html, &$inUl, &$inOl) {
            if ($inUl) {
                $html[] = '</ul>';
                $inUl = false;
            }
            if ($inOl) {
                $html[] = '</ol>';
                $inOl = false;
            }
        };

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '') {
                $closeLists();
                continue;
            }

            if (preg_match('/^---+$/', $trimmed) === 1) {
                $closeLists();
                $html[] = '<hr class="my-3 border-slate-200">';
                continue;
            }

            if (preg_match('/^###\s+(.+)$/', $trimmed, $matches) === 1) {
                $closeLists();
                $html[] = '<h5 class="mt-3 mb-1 text-xs font-extrabold text-slate-800">' . knowledge_md_inline($matches[1]) . '</h5>';
                continue;
            }

            if (preg_match('/^##\s+(.+)$/', $trimmed, $matches) === 1) {
                $closeLists();
                $html[] = '<h4 class="mt-3 mb-1 text-sm font-black text-slate-800">' . knowledge_md_inline($matches[1]) . '</h4>';
                continue;
            }

            if (preg_match('/^#\s+(.+)$/', $trimmed, $matches) === 1) {
                $closeLists();
                $html[] = '<h3 class="mt-3 mb-1 text-sm font-black text-slate-800">' . knowledge_md_inline($matches[1]) . '</h3>';
                continue;
            }

            if (preg_match('/^!\[([^\]]*)\]\(([^\)]+)\)$/', $trimmed, $matches) === 1) {
                $closeLists();
                $imgAlt = htmlspecialchars($matches[1], ENT_QUOTES, 'UTF-8');
                $imgSrc = htmlspecialchars(knowledge_md_safe_url($matches[2]), ENT_QUOTES, 'UTF-8');
                $html[] = '<img src="' . $imgSrc . '" alt="' . $imgAlt . '" class="w-full mt-2 rounded border border-slate-200">';
                continue;
            }

            if (preg_match('/^[-*]\s+(.+)$/', $trimmed, $matches) === 1) {
                if ($inOl) {
                    $html[] = '</ol>';
                    $inOl = false;
                }
                if (!$inUl) {
                    $html[] = '<ul class="list-disc pl-4 my-1">';
                    $inUl = true;
                }
                $html[] = '<li>' . knowledge_md_inline($matches[1]) . '</li>';
                continue;
            }

            if (preg_match('/^\d+\.\s+(.+)$/', $trimmed, $matches) === 1) {
                if ($inUl) {
                    $html[] = '</ul>';
                    $inUl = false;
                }
                if (!$inOl) {
                    $html[] = '<ol class="list-decimal pl-4 my-1">';
                    $inOl = true;
                }
                $html[] = '<li>' . knowledge_md_inline($matches[1]) . '</li>';
                continue;
            }

            $closeLists();
            $html[] = '<p>' . knowledge_md_inline($trimmed) . '</p>';
        }

        $closeLists();

        return implode("\n", $html);
    }
}

$knowledgeArticles = [];
$phaseMarkdown = '';

foreach ($knowledgeFiles as $filePath) {
    $markdown = @file_get_contents($filePath);
    if (!is_string($markdown) || trim($markdown) === '') {
        continue;
    }

    $summary = preg_replace('/^\d+[-_]?/', '', basename($filePath, '.md'));
    $summary = str_replace(['-', '_'], ' ', $summary);
    $summary = ucwords(trim($summary));

    if (preg_match('/^#\s+(.+)$/m', $markdown, $headingMatch) === 1) {
        $summary = trim($headingMatch[1]);
        $markdown = preg_replace('/^#\s+(.+)$(\r\n|\r|\n)?/', '', $markdown, 1);
    }

    $baseName = strtolower(basename($filePath));
    if ($phaseMarkdown === '' && (strpos($baseName, '01-') === 0 || strpos($baseName, 'phasen') !== false)) {
        $phaseMarkdown = $markdown;
    }

    $knowledgeArticles[] = [
        'file_name' => basename($filePath),
        'summary' => $summary,
        'html' => knowledge_md_to_html($markdown),
    ];
}

$phaseDetailMap = [
    'startphase' => '',
    'haupttrocknung' => '',
    'endtrocknung' => '',
    'lagerung' => '',
];

if ($phaseMarkdown !== '') {
    $lines = preg_split('/\r\n|\r|\n/', $phaseMarkdown);
    $sectionMap = [
        'startphase' => ['title' => 'Startphase', 'lines' => []],
        'haupttrocknung' => ['title' => 'Haupttrocknung', 'lines' => []],
        'endtrocknung' => ['title' => 'Endtrocknung', 'lines' => []],
        'lagerung' => ['title' => 'Lagerung', 'lines' => []],
    ];
    $currentKey = null;

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if (preg_match('/^##\s+(.+)$/', $trimmed, $matches) === 1) {
            $heading = strtolower($matches[1]);
            $currentKey = null;
            if (strpos($heading, 'startphase') !== false) {
                $currentKey = 'startphase';
            } elseif (strpos($heading, 'haupttrocknung') !== false) {
                $currentKey = 'haupttrocknung';
            } elseif (strpos($heading, 'endtrocknung') !== false) {
                $currentKey = 'endtrocknung';
            } elseif (strpos($heading, 'lagerung') !== false) {
                $currentKey = 'lagerung';
            }
            continue;
        }

        if ($currentKey !== null) {
            $sectionMap[$currentKey]['lines'][] = $line;
        }
    }

    foreach ($sectionMap as $key => $section) {
        $bodyMd = trim(implode("\n", $section['lines']));
        if ($bodyMd === '') {
            continue;
        }
        $phaseDetailMap[$key] = '<h5 class="font-bold text-slate-800 mb-1">' . htmlspecialchars($section['title'], ENT_QUOTES, 'UTF-8') . '</h5>' . knowledge_md_to_html($bodyMd);
    }
}

if (count($knowledgeArticles) === 0) {
    echo '<div class="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Keine Wissensdaten vorhanden.</div>';
} else {
    foreach ($knowledgeArticles as $article) {
        $openAttr = (strpos(strtolower($article['file_name']), 'merkbla') !== false) ? ' open' : '';
        $articleId = 'knowledge-' . strtolower(preg_replace('/[^a-z0-9]+/i', '-', basename($article['file_name'], '.md')));
        echo '<details class="knowledge-article" id="' . htmlspecialchars($articleId, ENT_QUOTES, 'UTF-8') . '"' . $openAttr . '>';
        echo '<summary>' . htmlspecialchars($article['summary'], ENT_QUOTES, 'UTF-8') . '</summary>';
        echo '<div class="details-content knowledge-md">' . $article['html'] . '</div>';
        echo '</details>';
    }
}

echo '<script id="knowledge-phase-details" type="application/json">' . json_encode($phaseDetailMap, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
