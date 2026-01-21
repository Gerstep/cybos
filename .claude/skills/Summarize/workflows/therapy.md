# Therapy Session Summarization Workflow

Summarize therapy session transcripts into structured Russian-language notes for personal reflection and tracking progress.

## Input

- Therapy session transcript (text file, markdown, or raw text)
- Session date (extracted from filename or content, or prompted)

## Output

- Structured summary saved to: `~/CybosVault/private/context/my-life/therapy/YYYY-MM-DD-summary.md`

## Workflow Steps

### 1. PARSE INPUT

Extract from command:
- Transcript file path (@-prefixed) OR raw transcript text
- Session date (from filename pattern YYYY-MM-DD or MMDD, or ask user)

If file path provided:
```
Read file content using Read tool
```

If date cannot be determined:
```
Ask user: "What is the session date? (YYYY-MM-DD)"
```

### 2. ANALYZE TRANSCRIPT

Read through the entire transcript and identify:

1. **Main topic/request** (ключевая тема)
   - What issue or question was the focus?
   - What brought this up now?

2. **Emotional markers**
   - Note emotional language used
   - Identify shifts in emotional state
   - Estimate before/after emotional state (1-10 scale)

3. **Key insights** (инсайты)
   - New realizations or "aha" moments
   - Connections made during session
   - Therapist observations that resonated

4. **Patterns identified** (паттерны)
   - Recurring emotional reactions
   - Behavioral patterns discussed
   - Relationship dynamics mentioned

5. **Significant quotes** (ключевые цитаты)
   - Direct quotes from client expressing core emotions
   - Therapist phrases that were impactful
   - Keep in original language from transcript

6. **Past connections** (связь с прошлым)
   - Childhood or past experiences mentioned
   - Root memories that surfaced
   - Family dynamics discussed

7. **Homework/practices** (домашнее задание)
   - Specific exercises assigned
   - Things to notice or track
   - Reading or reflection tasks

8. **Progress notes** (прогресс)
   - Changes since last session
   - Improvements noticed
   - Areas still needing work

### 3. GENERATE SUMMARY

Write summary in Russian using this exact structure:

```markdown
# Терапевтическая сессия: YYYY-MM-DD

## Дата и ключевая тема

[Краткое описание основного запроса сессии - 1-2 предложения]

## Эмоциональное состояние

- **До сессии**: X/10 - [краткое описание]
- **После сессии**: Y/10 - [краткое описание]

## Основные инсайты и открытия

1. [Первый ключевой вывод]
2. [Второй ключевой вывод]
3. [Третий ключевой вывод, если есть]

## Повторяющиеся паттерны и динамики

- [Паттерн 1]
- [Паттерн 2]

## Ключевые цитаты и важные фразы

> "[Цитата 1]"

> "[Цитата 2]"

## Связь с прошлыми ситуациями

[Описание связей с прошлым опытом, детством, значимыми событиями]

## Домашнее задание

- [ ] [Задание 1]
- [ ] [Задание 2]

## Прогресс и изменения

[Заметки о прогрессе с предыдущих сессий, изменения в состоянии или поведении]

---

*Создано: [timestamp]*
*Источник: [filename or "transcript"]*
```

### 4. QUALITY CHECK

Before saving, verify:
- [ ] Summary is in Russian
- [ ] All 8 sections are filled (even if brief)
- [ ] Emotional scores are reasonable (1-10)
- [ ] At least 2 key insights identified
- [ ] At least 1 quote preserved from transcript
- [ ] Homework section has actionable items (if any were given)
- [ ] Date format is correct (YYYY-MM-DD)

### 5. SAVE FILE

Determine output path:
```
~/CybosVault/private/context/my-life/therapy/YYYY-MM-DD-summary.md
```

If file already exists:
```
Ask user: "Summary for this date already exists. Overwrite? (y/n)"
- If "y" → Overwrite
- If "n" → Add suffix: YYYY-MM-DD-summary-2.md
```

Write file using Write tool.

### 6. CONFIRM TO USER

Display:
```
Therapy session summarized

Date: YYYY-MM-DD
Topic: [brief topic description]
Emotional shift: X/10 → Y/10
Key insights: [count]
Homework items: [count]

Saved to: ~/CybosVault/private/context/my-life/therapy/YYYY-MM-DD-summary.md
```

## Language Notes

- Summary MUST be written in Russian
- Preserve original language for direct quotes from transcript
- Use professional but warm tone
- Be specific, avoid vague generalizations

## Privacy Notes

- This is highly sensitive personal data
- Never include in logs or external outputs
- Do not share file contents in responses unless explicitly asked
- Transcript content should not be quoted extensively in conversation

## Error Handling

### Transcript too short
```
Warning: Transcript appears very short ([X] words).
This may result in an incomplete summary.
Continue anyway? (y/n)
```

### Cannot identify session content
```
Error: Cannot identify therapy session content in file.
Expected: Dialogue or transcript format with therapist/client exchanges.
Please check the file and try again.
```

### Date parsing failed
```
Could not determine session date from filename.
Please enter the session date (YYYY-MM-DD):
```

## Example Input/Output

### Input (excerpt)
```
Therapist: How are you feeling today?
Client: I've been anxious about work again. The same pattern keeps repeating...
Therapist: Tell me more about this pattern you're noticing.
Client: Every time there's a deadline, I freeze. I know I can do the work, but something stops me.
...
```

### Output (excerpt)
```markdown
# Терапевтическая сессия: 2026-01-15

## Дата и ключевая тема

Обсуждение рабочей тревоги и паттерна прокрастинации перед дедлайнами.

## Эмоциональное состояние

- **До сессии**: 4/10 - тревожность, напряжение
- **После сессии**: 6/10 - больше ясности, но работа еще предстоит

## Основные инсайты и открытия

1. Прокрастинация связана со страхом несоответствия ожиданиям
2. Паттерн "заморозки" появился еще в школьные годы
...
```

## Integration

This workflow can be triggered by:
- `/cyber-summarize therapy @file.md`
- Direct request: "summarize this therapy session"
- Detecting therapy transcript in provided file
