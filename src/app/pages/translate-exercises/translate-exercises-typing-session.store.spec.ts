import { TestBed } from '@angular/core/testing';

import type { TranslateQueue } from '../../interfaces';
import { TranslateDirectionEnum } from '../../interfaces';

import { TranslateTypingSessionStore } from './translate-exercises-typing-session.store';

const mockItems: TranslateQueue[] = [
  { ensent: 'Hello world', cnsent: '你好世界', enwords: ['hello'], completed: false, inputted: '' },
  { ensent: 'Good morning', cnsent: '早上好', enwords: ['good'], completed: false, inputted: '' },
];

describe('TranslateTypingSessionStore', () => {
  let store: TranslateTypingSessionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslateTypingSessionStore],
    });
    store = TestBed.inject(TranslateTypingSessionStore);
  });

  it('should refuse to start an empty queue', () => {
    expect(store.start([], TranslateDirectionEnum.EnglishToChinese)).toBe(false);
    expect(store.queue().length).toBe(0);
    expect(store.queueIndex()).toBe(-1);
  });

  it('should initialize the queue on start', () => {
    expect(store.start(mockItems, TranslateDirectionEnum.EnglishToChinese)).toBe(true);

    expect(store.queue().length).toBe(2);
    expect(store.queueIndex()).toBe(0);
    expect(store.inputted()).toBe('');
    expect(store.queue().every(item => !item.completed)).toBe(true);
  });

  it('should show the EN sentence as prompt in EnglishToChinese direction', () => {
    store.start(mockItems, TranslateDirectionEnum.EnglishToChinese);

    expect(store.currentPrompt()).toBe('Hello world');
  });

  it('should show the CN sentence as prompt in ChineseToEnglish direction', () => {
    store.start(mockItems, TranslateDirectionEnum.ChineseToEnglish);

    expect(store.currentPrompt()).toBe('你好世界');
  });

  it('should record a correct result for an exact answer', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.EnglishToChinese);
    store.setInput('你好世界');

    store.submitAndNext();

    expect(store.results().length).toBe(1);
    expect(store.results()[0].correct).toBe(true);
  });

  it('should normalize case, punctuation and whitespace when grading', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.ChineseToEnglish);
    store.setInput('  HELLO World! ');

    store.submitAndNext();

    expect(store.results()[0].correct).toBe(true);
  });

  it('should record an incorrect result for a wrong answer', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.EnglishToChinese);
    store.setInput('随便什么');

    store.submitAndNext();

    expect(store.results()[0].correct).toBe(false);
    expect(store.incorrectCount()).toBe(1);
  });

  it('should keep the original input in the result', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.EnglishToChinese);
    store.setInput('  你好世界! ');

    store.submitAndNext();

    expect(store.results()[0].inputted).toBe('  你好世界! ');
  });

  it('should advance the cursor and clear the input on submit', () => {
    store.start(mockItems, TranslateDirectionEnum.EnglishToChinese);
    store.setInput('你好世界');

    store.submitAndNext();

    expect(store.queueIndex()).toBe(1);
    expect(store.inputted()).toBe('');
    expect(store.queue()[0].completed).toBe(true);
    expect(store.currentPrompt()).toBe('Good morning');
  });

  it('should complete the session after the last sentence', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.EnglishToChinese);
    store.setInput('你好世界');

    store.submitAndNext();

    expect(store.isComplete()).toBe(true);
    expect(store.timeCostSeconds()).toBeGreaterThanOrEqual(0);
    expect(store.progress()).toBe(100);
  });

  it('should ignore submits after completion', () => {
    store.start([mockItems[0]], TranslateDirectionEnum.EnglishToChinese);
    store.setInput('你好世界');
    store.submitAndNext();

    store.submitAndNext();

    expect(store.results().length).toBe(1);
  });

  it('should reset all state', () => {
    store.start(mockItems, TranslateDirectionEnum.EnglishToChinese);
    store.setInput('hello');

    store.reset();

    expect(store.queue().length).toBe(0);
    expect(store.queueIndex()).toBe(-1);
    expect(store.inputted()).toBe('');
    expect(store.results().length).toBe(0);
    expect(store.isComplete()).toBe(false);
    expect(store.timeCostSeconds()).toBe(0);
  });
});
