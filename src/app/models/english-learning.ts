import { SafeAny } from '../common';

export enum EnglishPartsofSpeechEnum {
    Nouns = 'n.',
    Pronouns = 'pron.',
    Adjectives = 'a.',
    Numerals = 'num.',
    Article = 'art.',
    Verb = 'v.',
    Adverb = 'ad.',
    Prepositoin = 'prep.',
    Conjunction = 'conj.',
    Interjection = 'int.',
    TransitiveVerb = 'vt.',
    IntransitiveVerb = 'vi.',
}

export class EnglishWordExplaination {
    expidx = -1;
    partsOfSpeech = EnglishPartsofSpeechEnum.Nouns;
    explain = '';
}

export class EnglishWord {
    id = -1;
    word = '';
    isPhase = false;
    explains: EnglishWordExplaination[] = [];    
}

export class EnglishSentence {
    id = -1;
    sentence = '';
    explain = '';

    words: EnglishWord[] = [];

    parseData(val: string) {
        let cursor = val.indexOf('## Sentence');
        if (cursor === -1) {
            return;
        }

        // Sentence
        cursor = val.indexOf(`<h1>`, cursor);
        if (cursor === -1) {
            return;
        }
        let cursor2 = val.indexOf(`</h1>`, cursor);
        if (cursor2 === -1) {
            return;
        }

        this.sentence = val.substring(cursor + 4, cursor2);

        cursor = val.indexOf(`## Translation`, cursor2);
        if (cursor === -1) {
            return;
        }
        cursor = val.indexOf(`<h2>`, cursor);
        if (cursor === -1) {
            return;
        }
        cursor2 = val.indexOf(`</h2>`, cursor);
        if (cursor2 === -1) {
            return;
        }

        this.explain = val.substring(cursor + 4, cursor2);
    }
}

export class EnglishLearningContext {
    private words: EnglishWord[] = [];
    private sentences: EnglishSentence[] = [];

    public addSentence(sent: EnglishSentence) {
        this.sentences.push(sent);

        sent.words.forEach(val => {
            this.words.push(val);
        });
    }
}
