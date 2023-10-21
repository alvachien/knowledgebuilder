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
    partsOfSpeeches: EnglishPartsofSpeechEnum[] = [];
    explain = '';

    parseData(expstr: string, isphase = false) {
        if (!isphase) {
            let spidx = expstr.indexOf(' ');
            if (spidx !== -1) {
                let spstr = expstr.substring(0, spidx);
                let sptes = spstr.split('/');
    
                sptes.forEach(spstr => {
                    if (spstr === 'n.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Nouns);
                    } else if(spstr === 'pron.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Pronouns);
                    } else if(spstr === 'num.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Numerals);
                    } else if(spstr === 'art.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Article);
                    } else if(spstr === 'prep.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Prepositoin);
                    } else if(spstr === 'conj.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Conjunction);
                    } else if(spstr === 'int.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Interjection);
                    } else if(spstr === 'v.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Verb);
                    } else if(spstr === 'a.' || spstr === 'adj.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Adjectives);
                    } else if(spstr === 'ad.' || spstr === 'adv.') {
                        this.partsOfSpeeches.push(EnglishPartsofSpeechEnum.Adverb);
                    }
                });
            }    
            this.explain = expstr.substring(spidx + 1);
        } else {
            this.explain = expstr;
        }
    }
}

export class EnglishWord {
    id = -1;
    word = '';
    isPhase = false;
    explains: EnglishWordExplaination[] = [];
    
    parseData(wordstrs: string[]) {
        // Word
        let wdbgn = wordstrs[0].indexOf('. **');
        let wdend = wordstrs[0].indexOf('**');
        this.word = wordstrs[0].substring(wdbgn + 3, wdend);
        this.isPhase = (this.word.indexOf(' ') !== -1);

        // Explains
        for(let i = 1; i < wordstrs.length; i ++) {
            let exp = new EnglishWordExplaination();
            exp.parseData(wordstrs[i], this.isPhase);
            this.explains.push(exp);
        }
    }
}

export class EnglishSentence {
    id = -1;
    sentence = '';
    explain = '';
    grammar = ''; 

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

        // Sentence
        let arsent = lines.filter((val: string, index: number) => {
            return index > sentidx && index < expidx;
        });
        let strsent = arsent.join('');
        strsent = strsent.trim();
        strsent = strsent.replace('<h1>', '');
        strsent = strsent.replace('</h1>', '');
        this.sentence = strsent;

        // Explain
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

        // Grammar
        if (gammaridx !== -1) {
            let argam = lines.filter((val: string, index: number) => {
                return index > gammaridx && index < wordidx;
            });
            let strgam = argam.join('');
            strgam = strgam.trim();
            this.grammar = strgam;
        }

        // Words
        if (wordidx !== -1) {
            let arwords = lines.filter((val: string, index: number) => {
                return index > wordidx;
            });

            let wordcursor = -1;
            for(let idx = 0; idx < arwords.length; idx ++) {
                let wordline = arwords[idx].trim();
                if (wordline.length === 0) {
                    if (wordcursor !== -1) {
                        let wordstrs = arwords.filter((val: string, index: number) => {
                            return index > wordcursor && index < idx;
                        });

                        let objword = new EnglishWord();
                        objword.parseData(wordstrs);
                        this.words.push(objword);

                        wordcursor = -1;
                    }
                } else {
                    if (wordcursor === -1) {
                        wordcursor = idx;
                    }
                }
            }
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

    get SentenceCount(): number {
        return this.sentences.length;
    }
    public getSentence(idx: number): EnglishSentence | null {
        if (idx >= this.sentences.length || idx < 0) {
            return null;
        }
        return this.sentences[idx];
    }

    public addSentence(sent: EnglishSentence) {
        this.sentences.push(sent);

        sent.words.forEach(val => {
            this.words.push(val);
        });
    }
}
