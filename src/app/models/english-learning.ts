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
}

