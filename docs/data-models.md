## Data Models

`src/app/interfaces/` defines the data model. 

Each content category maps to a concrete data model loaded by `LearningContentService` (see [Content Data](#content-data) for the full category → method → storage-subfolder table). `LearningContent` is the common file-list record the API returns for every category; the per-category content models are:

| Cat ID | Category | Content data model | Interface file |
|---|---|---|---|
| 1 | Vocabulary | `LearnEnglishWordFileItem` | `learnenglish.ts` |
| 2 | Sentences | `LearnEnglishSentFileItem` (`TranslateQueue extends` it) | `learnenglish.ts` / `translate-data.ts` |
| 3 | Listening | `EnglishListeningLesson` → `EnglishListeningSection` → `EnglishListeningExercise` → `EnglishListeningExerciseItem` | `english-listening.ts` |
| 4 | Chinese | `LearnChineseFileItem` | `learnchinese.ts` |
| 5 | Formula | `FormulaReciteContent` | `formula-recite-queue.ts` |
| 6 | Knowledge Bank | `KnowledgeExerciseFileContent` → `QuestionBankItemBase` via `convertToQuestionBankItem()` | `questionbank-base.ts` |


- **QuestionBank** (`interfaces/questionbank.ts`) — Enums for question types (`QuestionBankTypeEnum`), content formats, option keys, and item levels.
- **QuestionBankItemBase** (`interfaces/questionbank-base.ts`) — Abstract base class for all question types. Concrete implementations: `QuestionBankItemSingleChoice`, `QuestionBankItemMultipleChoice`, `QuestionBankItemFillInTheBlank`, `QuestionBankItemDictation`, `QuestionBankItemShortAnswer`, `QuestionBankItemEssay`, `QuestionBankItemReadingComprehension`, `QuestionBankItemListeningComprehension`, `QuestionBankItemCloze`, `QuestionBankItemTrueFalse`.
- **convertToQuestionBankItem()** — Converts `QuestionBankItemCombinedInterface` (raw JSON) to concrete `QuestionBankItemBase` instances.

The diagram shows the core `QuestionBankItemBase` hierarchy, the raw-JSON `QuestionBankItemCombinedInterface` that `convertToQuestionBankItem()` turns into concrete items, the content-record types loaded by `LearningContentService`, and the option/queue interfaces.

```mermaid
classDiagram
  direction LR

  class QuestionBankItemBase~T~ {
    <<abstract>>
    +id: string
    +order: number
    +itemType: QuestionBankTypeEnum
    +answer: T
    +answers: T[]
    +hintofanswer: T
    +tags: string[]
  }
  class QuestionBankItemSingleChoice
  class QuestionBankItemMultipleChoice
  class QuestionBankItemTrueFalse
  class QuestionBankItemFillInTheBlank
  class QuestionBankItemDictation
  class QuestionBankItemShortAnswer
  class QuestionBankItemEssay
  class QuestionBankItemReadingComprehension
  class QuestionBankItemListeningComprehension
  class QuestionBankItemCloze
  QuestionBankItemBase <|-- QuestionBankItemSingleChoice
  QuestionBankItemBase <|-- QuestionBankItemMultipleChoice
  QuestionBankItemBase <|-- QuestionBankItemTrueFalse
  QuestionBankItemBase <|-- QuestionBankItemFillInTheBlank
  QuestionBankItemBase <|-- QuestionBankItemDictation
  QuestionBankItemBase <|-- QuestionBankItemShortAnswer
  QuestionBankItemBase <|-- QuestionBankItemEssay
  QuestionBankItemBase <|-- QuestionBankItemReadingComprehension
  QuestionBankItemBase <|-- QuestionBankItemListeningComprehension
  QuestionBankItemBase <|-- QuestionBankItemCloze
  QuestionBankItemReadingComprehension "1" o--> "*" QuestionBankItemBase : items
  QuestionBankItemListeningComprehension "1" o--> "*" QuestionBankItemBase : items
  QuestionBankItemCloze "1" o--> "*" QuestionBankItemBase : items

  class QuestionBankItemCombinedInterface {
    +id: string
    +itemType: QuestionBankTypeEnum
    +question: string
    +options: QuestionBankItemOption
    +items: QuestionBankItemCombinedInterface[]
  }
  class KnowledgeExerciseFileContent {
    +itemTypeString: string
    +hasAnswer: boolean
  }
  QuestionBankItemCombinedInterface <|-- KnowledgeExerciseFileContent
  QuestionBankItemCombinedInterface ..> QuestionBankItemBase : convertToQuestionBankItem()
```


### Listening

```mermaid
classDiagram
  direction LR
  class EnglishListeningLesson {
    +title: string
    +audioFile: string
  }
  class EnglishListeningSection {
    +title: string
    +vocabulary: string[]
  }
  class EnglishListeningExercise {
    +title: string
    +scripts: string[]
  }
  EnglishListeningLesson "1" *--> "*" EnglishListeningSection : sections
  EnglishListeningSection "1" *--> "*" EnglishListeningExercise : exercises
  EnglishListeningExercise "1" o--> "1" EnglishListeningExerciseItem : item

  class EnglishListeningExerciseItem {
    +exerciseType: 'listening'
  }
  QuestionBankItemCombinedInterface <|-- EnglishListeningExerciseItem
  QuestionBankItemCombinedInterface ..> QuestionBankItemBase : convertToQuestionBankItem()
```

### Mapping with API Structure

```mermaid
classDiagram
  direction LR

  class LearningContent {
    +id: number
    +categoryId: number
    +nameChinese: string
    +nameEnglish: string
    +fileUrl: string
    +version: number
    +includeLatex: boolean
    +translationDisabled: boolean
  }
  class LearnEnglishWordFileItem {
    +id: number
    +enword: string
    +cnword: string
  }
  class LearnEnglishSentFileItem {
    +id: string
    +ensent: string
    +cnsent: string
    +enwords: string[]
  }
  class LearnChineseFileItem {
    +id: number
    +subject: string
    +author: string
    +content: string
  }
  class FormulaReciteContent {
    +name: string
    +value: string
    +math: boolean
    +source: string
  }
  class TranslateQueue {
    +completed: boolean
    +inputted: string
  }
  LearnEnglishSentFileItem <|-- TranslateQueue

  class StudyQueueItem {
    +enword: string
    +cnword: string
    +rating: number
    +itemId: number
  }

  class UserLearningRating {
    +contentId: number
    +itemId: number
    +rating: number
  }
  class UserAuthInfo {
    +id: string
    +name: string
  }
  LearningContent "1" --> "*" UserLearningRating : ratings
```

### Vocabulary Options

```mermaid
classDiagram
  direction LR
  class VocabularyOptionCore {
    +excludePart: VocabularyExcludedPartEnum
    +countOfItems: number
  }
  class VocabularyPrintOption
  class VocabularyTypingOption
  class VocabularyStudyOption
  VocabularyOptionCore <|-- VocabularyPrintOption
  VocabularyOptionCore <|-- VocabularyTypingOption
  VocabularyOptionCore <|-- VocabularyStudyOption
```

### Chinese Options

```mermaid
classDiagram
  direction LR
  class ChineseRecitetOptionAbstract {
    +selectedLevel: QuestionBankItemLevelEnum
    +countOfItems: number
  }
  class ChineseRecitePrintOption
  class ChineseReciteOption
  ChineseRecitetOptionAbstract <|-- ChineseRecitePrintOption
  ChineseRecitetOptionAbstract <|-- ChineseReciteOption
```

Enums (`QuestionBankTypeEnum`, `QuestionBankContentFormatEnum`, `QuestionBankItemLevelEnum`, `SelectionModeEnum`, `RatingOperatorEnum`, `PrintExecDateEnum`, `ChineseReciteStatusEnum`, `EnglishListeningStatusEnum`, `TranslateDirectionEnum`, `VocabularyExcludedPartEnum`, `FormulaReciteAIModeEnum`, `TranslationAIModeEnum`, etc.) and the status/queue interfaces (`VocabularyTypingQueue`, `VocabularyTypingQueueResult`, `VocabularyWordLetter`, `TranslateExerciseUIStatus`, `ChineseReciteStatus`, `EnglishListeningUIStatus`) are omitted from the diagram for readability.
