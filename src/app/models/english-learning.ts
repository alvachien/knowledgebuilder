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
    gammar = ''; 

    words: EnglishWord[] = [];

    parseData(val: string) {
        let lines = val.split(/\r?\n/);;

        let sentidx = -1, expidx = -1, gammaridx = -1, wordidx = -1;
        for(let i = 0; i < lines.length; i ++) {
            let strline = lines[i];
            strline = strline.trim();
            if (strline.startsWith('## Sentence')) {
                sentidx = i;
            } else if(strline.startsWith('## Translation')) {
                expidx = i;
            } else if(strline.startsWith('## Gramma')) {
                gammaridx = i;
            } else if(strline.startsWith('## Vocabulary')) {
                wordidx = i;
            }
        }
        if (sentidx === -1 || expidx === -1) {
            return;
        }

        let arsent = lines.filter((val: string, index: number) => {
            return index > sentidx && index < expidx;
        });
        let strsent = arsent.join('');
        strsent = strsent.trim();
        strsent = strsent.replace('<h1>', '');
        strsent = strsent.replace('</h1>', '');
        this.sentence = strsent;

        let arexp = lines.filter((val: string, index: number) => {
            if (gammaridx === -1) {
                return index > expidx && index < wordidx;
            }
            return index > expidx && index < gammaridx;
        });
        let strexp = arexp.join('');
        strexp = strexp.trim();
        strexp = strexp.replace('<h2>', '');
        strexp = strexp.replace('</h2>', '');
        this.explain = strexp;

        if (gammaridx !== -1) {
            let argam = lines.filter((val: string, index: number) => {
                return index > gammaridx && index < wordidx;
            });
            let strgam = argam.join('');
            strgam = strgam.trim();
            this.gammar = strgam;
        }

        // // let = lines.some()

        // // Sentence
        // let cursor = val.indexOf('## Sentence');
        // let cursor2 = cursor;
        // if (cursor !== -1) {
        //     cursor = val.indexOf(`<h1>`, cursor);
        //     if (cursor === -1) {
        //         return;
        //     }
        //     cursor2 = val.indexOf(`</h1>`, cursor);
        //     if (cursor2 === -1) {
        //         return;
        //     }

        //     this.sentence = val.substring(cursor + 4, cursor2);
        // }

        // // Explain
        // cursor = val.indexOf(`## Translation`, cursor2);
        // if (cursor !== -1) {
        //     cursor = val.indexOf(`<h2>`, cursor);
        //     if (cursor === -1) {
        //         return;
        //     }
        //     cursor2 = val.indexOf(`</h2>`, cursor);
        //     if (cursor2 === -1) {
        //         return;
        //     }
    
        //     this.explain = val.substring(cursor + 4, cursor2);
        // }

        // Gammar
        // cursor = val.indexOf(`## Gramma`, cursor2);
        // if (cursor !== -1) {
        //     cursor = val.indexOf(`<h2>`, cursor);
        //     if (cursor === -1) {
        //         return;
        //     }
        //     cursor2 = val.indexOf(`</h2>`, cursor);
        //     if (cursor2 === -1) {
        //         return;
        //     }
    
        //     this.explain = val.substring(cursor + 4, cursor2);
        // }

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
